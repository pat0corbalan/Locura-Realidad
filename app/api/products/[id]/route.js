
import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VARIANTS = 40;
const STOCK_MODES = ["legacy", "simple", "sizes", "variants"];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getText(value, maxLength = 4000) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function getNumber(value, fieldName, options = {}) {
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

function parseStockMode(value, fallback = "legacy") {
  const mode = getText(value, 20) || fallback;

  if (!STOCK_MODES.includes(mode)) {
    throw new HttpError(400, "El modo de inventario no es válido.");
  }

  return mode;
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
    const label = getText(variant?.label, 100);

    if (!label) {
      throw new HttpError(
        400,
        `La variante ${index + 1} no tiene una etiqueta válida.`
      );
    }

    const price = getNumber(
      variant?.price,
      `Precio de la variante "${label}"`,
      { optional: true, min: 0 }
    );

    const stockQuantity = getNumber(
      variant?.stockQuantity,
      `Stock de la variante "${label}"`,
      { optional: !requireStock, min: 0 }
    );

    const minStock = getNumber(
      variant?.minStock,
      `Stock mínimo de la variante "${label}"`,
      { optional: true, min: 0 }
    );

    return {
      label,
      group: getText(variant?.group, 150) || undefined,
      price: price ?? undefined,
      inStock:
        stockQuantity !== null
          ? stockQuantity > 0
          : variant?.inStock !== false,
      note: getText(variant?.note, 200) || undefined,
      image: getText(variant?.image, 1000) || undefined,
      stockQuantity,
      minStock: minStock ?? 0,
    };
  });
}

function parseSizeStock(raw, sizes) {
  const list = parseJson(raw, "sizeStock");

  if (!Array.isArray(list)) {
    throw new HttpError(400, "El inventario por talle debe ser una lista.");
  }

  const seen = new Set();

  const parsed = list.map((item, index) => {
    const size = getText(item?.size, 20);

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
      stockQuantity: getNumber(
        item?.stockQuantity,
        `Stock del talle "${size}"`,
        { min: 0 }
      ),
      minStock:
        getNumber(
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

function assertImage(file) {
  if (!file || typeof file.arrayBuffer !== "function" || !file.size) {
    throw new HttpError(400, "La imagen seleccionada no es válida.");
  }

  if (!String(file.type).startsWith("image/")) {
    throw new HttpError(400, "El archivo debe ser una imagen.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new HttpError(400, "La imagen no puede superar los 5 MB.");
  }
}

function slug(value) {
  return getText(value, 120)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "producto";
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
              new Error("No se recibió respuesta de Cloudinary.")
            );
          }

          resolve(result);
        }
      )
      .end(Buffer.from(bytes));
  });
}

/* ------------------------------------------------------------------ */
/* PUT: actualizar producto e inventario                              */
/* ------------------------------------------------------------------ */

export async function PUT(req, { params }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  let uploadedPublicId = null;

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "ID de producto inválido.");
    }

    await connectDB();

    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      throw new HttpError(
        400,
        "Content-Type debe ser multipart/form-data."
      );
    }

    const form = await req.formData();

    const product = await Product.findById(id);

    if (!product) {
      throw new HttpError(404, "Producto no encontrado.");
    }

    const name = getText(form.get("name"), 120);
    const description = getText(form.get("description"), 4000);
    const category = getText(form.get("category"), 60);

    if (!name) {
      throw new HttpError(400, "El nombre es obligatorio.");
    }

    if (!category) {
      throw new HttpError(400, "La categoría es obligatoria.");
    }

    const price = getNumber(form.get("price"), "El precio", {
      min: 0.01,
    });

    const originalPrice = getNumber(
      form.get("originalPrice"),
      "El precio original",
      { optional: true, min: 0 }
    );

    const costPrice = getNumber(
      form.get("costPrice"),
      "El precio de costo",
      { optional: true, min: 0 }
    );

    const rating = getNumber(form.get("rating"), "El rating", {
      min: 0,
      max: 5,
    });

    const stockMode = parseStockMode(
      form.get("stockMode"),
      product.stockMode || "legacy"
    );

    const stockQuantity = getNumber(
      form.get("stockQuantity"),
      "El stock general",
      { optional: true, min: 0 }
    );

    const minStock =
      getNumber(
        form.get("minStock"),
        "El stock mínimo",
        { optional: true, min: 0 }
      ) ?? 0;

    const stockValue = form.get("inStock");

    if (
      stockMode === "legacy" &&
      stockValue !== "true" &&
      stockValue !== "false"
    ) {
      throw new HttpError(400, "El estado del stock no es válido.");
    }

    const requestedInStock =
      stockValue === "true"
        ? true
        : stockValue === "false"
          ? false
          : product.inStock;

    const sizes = [
      ...new Set(
        form
          .getAll("sizes")
          .map((size) => getText(size, 20))
          .filter(Boolean)
      ),
    ];

    const sizeStock =
      stockMode === "sizes"
        ? parseSizeStock(form.get("sizeStock"), sizes)
        : [];

    let variants;

    if (form.has("variants")) {
      variants = parseVariants(form.get("variants"), {
        requireStock: stockMode === "variants",
      });
    } else {
      variants = (product.variants || []).map((variant) =>
        typeof variant.toObject === "function"
          ? variant.toObject()
          : { ...variant }
      );

      if (
        stockMode === "variants" &&
        variants.some((variant) => variant.stockQuantity == null)
      ) {
        throw new HttpError(
          400,
          "Configurá el stock de todas las variantes antes de activar este modo."
        );
      }
    }

    const inStock = validateInventory({
      stockMode,
      stockQuantity,
      sizeStock,
      variants,
      inStock: requestedInStock,
    });

    const oldPublicId = product.imagePublicId;

    let image = product.image;
    let imagePublicId = product.imagePublicId;

    const file = form.get("image");

    if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
      assertImage(file);

      const result = await uploadImage(file, `products/${slug(name)}`);

      image = result.secure_url;
      imagePublicId = result.public_id;
      uploadedPublicId = result.public_id;
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.originalPrice = originalPrice ?? undefined;
    product.costPrice = costPrice ?? undefined;
    product.category = category;
    product.rating = rating;
    product.inStock = inStock;
    product.sizes = sizes;
    product.image = image;
    product.imagePublicId = imagePublicId;

    product.stockMode = stockMode;
    product.stockQuantity =
      stockMode === "simple" ? stockQuantity : null;
    product.minStock =
      stockMode === "simple" ? minStock : 0;
    product.sizeStock =
      stockMode === "sizes" ? sizeStock : [];

    product.variants = variants.map((variant) => ({
      ...variant,
      inStock:
        stockMode === "variants" && variant.stockQuantity !== null
          ? variant.stockQuantity > 0
          : variant.inStock !== false,
    }));

    if (form.has("groupLabel")) {
      product.groupLabel =
        getText(form.get("groupLabel"), 40) || undefined;
    }

    if (form.has("optionLabel")) {
      product.optionLabel =
        getText(form.get("optionLabel"), 40) || undefined;
    }

    await product.save();

    if (
      uploadedPublicId &&
      oldPublicId &&
      oldPublicId !== uploadedPublicId
    ) {
      await cloudinary.uploader.destroy(oldPublicId).catch((error) => {
        console.error(
          "No se pudo eliminar la imagen anterior:",
          error
        );
      });
    }

    return json(product.toObject());
  } catch (error) {
    if (uploadedPublicId) {
      await cloudinary.uploader
        .destroy(uploadedPublicId)
        .catch((cleanupError) => {
          console.error(
            "Error limpiando imagen nueva:",
            cleanupError
          );
        });
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

    console.error("PUT /api/products/[id]:", error);

    return json(
      { error: "No se pudo actualizar el producto." },
      500
    );
  }
}

/* ------------------------------------------------------------------ */
/* DELETE: eliminar producto                                          */
/* ------------------------------------------------------------------ */

export async function DELETE(req, { params }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "ID de producto inválido.");
    }

    await connectDB();

    const product = await Product.findById(id);

    if (!product) {
      throw new HttpError(404, "Producto no encontrado.");
    }

    const publicIds = [
      product.imagePublicId,
      ...(product.variants || []).map(
        (variant) => variant.imagePublicId
      ),
    ].filter(Boolean);

    await Product.deleteOne({ _id: id });

    await Promise.allSettled(
      [...new Set(publicIds)].map((publicId) =>
        cloudinary.uploader.destroy(publicId)
      )
    );

    return json({
      message: "Producto eliminado correctamente.",
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: error.message }, error.status);
    }

    console.error("DELETE /api/products/[id]:", error);

    return json(
      { error: "No se pudo eliminar el producto." },
      500
    );
  }
}
