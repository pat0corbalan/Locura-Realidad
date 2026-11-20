
import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import Product from "@/models/Product";
import { isAdmin, requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_EXTRA_IMAGES = 6;
const MAX_VARIANTS = 40;
const STOCK_MODES = ["legacy", "simple", "sizes", "variants"];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

function text(value, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

function toNumber(value, fieldName, options = {}) {
  const { optional = false, min = 0, max = Infinity } = options;

  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    if (optional) return null;
    throw new HttpError(400, `${fieldName} es obligatorio.`);
  }

  const number = Number(String(value).replace(",", "."));

  if (!Number.isFinite(number)) {
    throw new HttpError(400, `${fieldName} debe ser un número válido.`);
  }

  if (number < min || number > max) {
    throw new HttpError(400, `${fieldName} está fuera del rango permitido.`);
  }

  return number;
}

function parseJson(raw, fieldName, fallback = []) {
  if (raw === null || raw === undefined || raw === "") {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, `${fieldName} no contiene un JSON válido.`);
  }
}

function parseStockMode(value) {
  const mode = text(value, 20) || "legacy";

  if (!STOCK_MODES.includes(mode)) {
    throw new HttpError(400, "El modo de inventario no es válido.");
  }

  return mode;
}

function parseSizes(form) {
  return [
    ...new Set(
      form
        .getAll("sizes")
        .map((size) => text(size, 20))
        .filter(Boolean)
    ),
  ];
}

function parseSizeStock(raw, sizes) {
  const list = parseJson(raw, "sizeStock");

  if (!Array.isArray(list)) {
    throw new HttpError(400, "El inventario por talle debe ser una lista.");
  }

  if (list.length > 100) {
    throw new HttpError(400, "Hay demasiados registros de stock por talle.");
  }

  const seen = new Set();

  const parsed = list.map((item, index) => {
    const size = text(item?.size, 20);

    if (!size) {
      throw new HttpError(
        400,
        `El registro de stock ${index + 1} no tiene un talle válido.`
      );
    }

    const key = size.toLowerCase();

    if (seen.has(key)) {
      throw new HttpError(400, `El talle "${size}" está duplicado.`);
    }

    seen.add(key);

    return {
      size,
      stockQuantity: toNumber(
        item?.stockQuantity,
        `Stock del talle "${size}"`,
        { min: 0 }
      ),
      minStock: toNumber(
        item?.minStock,
        `Stock mínimo del talle "${size}"`,
        { optional: true, min: 0 }
      ) ?? 0,
    };
  });

  if (sizes.length === 0) {
    throw new HttpError(
      400,
      "Agregá al menos un talle para usar inventario por talle."
    );
  }

  const sizeNames = new Set(sizes.map((size) => size.toLowerCase()));

  for (const item of parsed) {
    if (!sizeNames.has(item.size.toLowerCase())) {
      throw new HttpError(
        400,
        `El talle "${item.size}" no está incluido en la lista de talles.`
      );
    }
  }

  for (const size of sizes) {
    if (!seen.has(size.toLowerCase())) {
      throw new HttpError(
        400,
        `Falta configurar el stock del talle "${size}".`
      );
    }
  }

  return parsed;
}

function parseVariants(raw, { requireStock = false } = {}) {
  const list = parseJson(raw, "variants");

  if (!Array.isArray(list) || list.length > MAX_VARIANTS) {
    throw new HttpError(
      400,
      `variants debe ser una lista de hasta ${MAX_VARIANTS} elementos.`
    );
  }

  return list.map((variant, index) => {
    const label = text(variant?.label, 100);

    if (!label) {
      throw new HttpError(
        400,
        `La variante ${index + 1} no tiene una etiqueta válida.`
      );
    }

    const price = toNumber(
      variant?.price,
      `Precio de la variante "${label}"`,
      { optional: true, min: 0 }
    );

    const stockQuantity = toNumber(
      variant?.stockQuantity,
      `Stock de la variante "${label}"`,
      { optional: !requireStock, min: 0 }
    );

    const minStock = toNumber(
      variant?.minStock,
      `Stock mínimo de la variante "${label}"`,
      { optional: true, min: 0 }
    );

    const imageIndex =
      Number.isInteger(variant?.imageIndex) &&
      variant.imageIndex >= 0
        ? variant.imageIndex
        : undefined;

    return {
      label,
      group: text(variant?.group, 150) || undefined,
      price: price ?? undefined,
      inStock:
        stockQuantity !== null
          ? stockQuantity > 0
          : variant?.inStock !== false,
      note: text(variant?.note, 200) || undefined,
      image: text(variant?.image, 1000) || undefined,
      imageIndex,
      stockQuantity,
      minStock: minStock ?? 0,
    };
  });
}

function calculateAvailability({
  stockMode,
  inStock,
  stockQuantity,
  sizeStock,
  variants,
}) {
  if (stockMode === "simple") {
    return stockQuantity > 0;
  }

  if (stockMode === "sizes") {
    return sizeStock.some((item) => item.stockQuantity > 0);
  }

  if (stockMode === "variants") {
    return variants.some((item) => item.stockQuantity > 0);
  }

  return inStock;
}

function validateInventory({
  stockMode,
  stockQuantity,
  sizeStock,
  variants,
  inStock,
}) {
  if (stockMode === "simple" && stockQuantity === null) {
    throw new HttpError(
      400,
      "Ingresá la cantidad disponible del producto."
    );
  }

  if (stockMode === "sizes" && sizeStock.length === 0) {
    throw new HttpError(
      400,
      "Configurá el inventario de cada talle."
    );
  }

  if (stockMode === "variants") {
    if (variants.length === 0) {
      throw new HttpError(
        400,
        "Agregá al menos una variante para configurar su inventario."
      );
    }

    if (variants.some((variant) => variant.stockQuantity === null)) {
      throw new HttpError(
        400,
        "Todas las variantes deben tener una cantidad de stock."
      );
    }
  }

  return calculateAvailability({
    stockMode,
    inStock,
    stockQuantity,
    sizeStock,
    variants,
  });
}

function slug(value) {
  return text(value, 120)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "producto";
}

function assertImage(file, label) {
  if (!file || typeof file.arrayBuffer !== "function" || !file.size) {
    throw new HttpError(400, `${label}: archivo inválido.`);
  }

  if (!String(file.type).startsWith("image/")) {
    throw new HttpError(400, `${label}: solo se permiten imágenes.`);
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new HttpError(400, `${label}: supera los 5 MB.`);
  }
}

async function uploadImage(file, folder) {
  const bytes = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);

          if (!result) {
            return reject(
              new Error("Cloudinary no devolvió un resultado.")
            );
          }

          resolve(result);
        }
      )
      .end(Buffer.from(bytes));
  });
}

/* ------------------------------------------------------------------ */
/* GET: catálogo público o información completa para administrador    */
/* ------------------------------------------------------------------ */

export async function GET(req) {
  try {
    await connectDB();

    const admin = isAdmin(req);

    const query = Product.find()
      .sort({ _id: -1 })
      .lean();

    if (!admin) {
      query.select(
        [
          "-costPrice",
          "-imagePublicId",
          "-stockQuantity",
          "-minStock",
          "-sizeStock.stockQuantity",
          "-sizeStock.minStock",
          "-variants.stockQuantity",
          "-variants.minStock",
          "-__v",
        ].join(" ")
      );
    }

    const products = await query;

    return json(
      products,
      200,
      admin
        ? { "Cache-Control": "no-store" }
        : {
            "Cache-Control":
              "public, s-maxage=30, stale-while-revalidate=120",
          }
    );
  } catch (error) {
    console.error("GET /api/products:", error);

    return json(
      { error: "No se pudieron obtener los productos." },
      500
    );
  }
}

/* ------------------------------------------------------------------ */
/* POST: crear producto (solo administrador)                          */
/* ------------------------------------------------------------------ */

export async function POST(req) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const uploadedPublicIds = [];

  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      throw new HttpError(
        400,
        "Content-Type debe ser multipart/form-data."
      );
    }

    await connectDB();

    const form = await req.formData();

    const name = text(form.get("name"), 120);
    const description = text(form.get("description"), 4000);
    const category = text(form.get("category"), 60);

    if (!name) {
      throw new HttpError(400, "El nombre es obligatorio.");
    }

    if (!category) {
      throw new HttpError(400, "La categoría es obligatoria.");
    }

    const groupLabel = text(form.get("groupLabel"), 40) || undefined;
    const optionLabel = text(form.get("optionLabel"), 40) || undefined;

    const sizes = parseSizes(form);

    const stockMode = parseStockMode(form.get("stockMode"));

    const stockQuantity = toNumber(
      form.get("stockQuantity"),
      "El stock general",
      { optional: true, min: 0 }
    );

    const minStock = toNumber(
      form.get("minStock"),
      "El stock mínimo",
      { optional: true, min: 0 }
    ) ?? 0;

    const sizeStock =
      stockMode === "sizes"
        ? parseSizeStock(form.get("sizeStock"), sizes)
        : [];

    let variants = parseVariants(form.get("variants"), {
      requireStock: stockMode === "variants",
    });

    let price = toNumber(form.get("price"), "El precio", {
      optional: true,
      min: 0.01,
    });

    if (price === null) {
      const variantPrices = variants
        .map((variant) => variant.price)
        .filter((value) => value !== undefined);

      if (variantPrices.length > 0) {
        price = Math.min(...variantPrices);
      }
    }

    if (price === null) {
      throw new HttpError(
        400,
        "El precio es obligatorio y debe ser mayor a 0."
      );
    }

    const originalPrice = toNumber(
      form.get("originalPrice"),
      "El precio original",
      { optional: true, min: 0 }
    );

    const costPrice = toNumber(
      form.get("costPrice"),
      "El precio de costo",
      { optional: true, min: 0 }
    );

    const ratingRaw = toNumber(
      form.get("rating"),
      "El rating",
      { optional: true, min: 0, max: 5 }
    );

    const rating = ratingRaw ?? 5;

    const stockValue = form.get("inStock");

    if (stockValue !== "true" && stockValue !== "false") {
      throw new HttpError(400, "El estado del stock no es válido.");
    }

    const requestedInStock = stockValue === "true";

    const inStock = validateInventory({
      stockMode,
      stockQuantity,
      sizeStock,
      variants,
      inStock: requestedInStock,
    });

    const mainFile = form.get("image");
    assertImage(mainFile, "Imagen principal");

    const extraFiles = form
      .getAll("images")
      .filter((file) => file && file.size > 0);

    if (extraFiles.length > MAX_EXTRA_IMAGES) {
      throw new HttpError(
        400,
        `Se permiten hasta ${MAX_EXTRA_IMAGES} imágenes adicionales.`
      );
    }

    extraFiles.forEach((file, index) => {
      assertImage(file, `Imagen adicional ${index + 1}`);
    });

    for (const variant of variants) {
      if (
        variant.imageIndex !== undefined &&
        variant.imageIndex > extraFiles.length
      ) {
        throw new HttpError(
          400,
          `La imagen indicada para la variante "${variant.label}" no existe.`
        );
      }
    }

    const folder = `products/${slug(name)}`;
    const results = [];

    for (const file of [mainFile, ...extraFiles]) {
      const result = await uploadImage(file, folder);

      uploadedPublicIds.push(result.public_id);
      results.push(result);
    }

    const urls = results.map((result) => result.secure_url);

    variants = variants.map(({ imageIndex, ...variant }) => ({
      ...variant,
      image:
        imageIndex !== undefined
          ? urls[imageIndex]
          : variant.image,
    }));

    const product = await Product.create({
      name,
      description,
      price,
      originalPrice: originalPrice ?? undefined,
      costPrice: costPrice ?? undefined,
      image: urls[0],
      imagePublicId: results[0].public_id,
      images: urls.slice(1),
      category,
      rating,
      inStock,
      sizes,
      groupLabel,
      optionLabel,
      variants,
      stockMode,
      stockQuantity:
        stockMode === "simple" ? stockQuantity : null,
      minStock:
        stockMode === "simple" ? minStock : 0,
      sizeStock:
        stockMode === "sizes" ? sizeStock : [],
    });

    return json(product.toObject(), 201, {
      "Cache-Control": "no-store",
    });
  } catch (error) {
    if (uploadedPublicIds.length > 0) {
      await Promise.allSettled(
        uploadedPublicIds.map((publicId) =>
          cloudinary.uploader.destroy(publicId)
        )
      );
    }

    if (error instanceof HttpError) {
      return json({ error: error.message }, error.status);
    }

    if (error?.name === "ValidationError") {
      return json(
        {
          error: "Los datos del producto no son válidos.",
          detalle: error.message,
        },
        400
      );
    }

    console.error("POST /api/products:", error);

    return json(
      { error: "No se pudo crear el producto." },
      500
    );
  }
}
