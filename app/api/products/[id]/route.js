
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

  if (value === null || value === undefined || String(value).trim() === "") {
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
            return reject(new Error("No se recibió respuesta de Cloudinary."));
          }

          resolve(result);
        }
      )
      .end(Buffer.from(bytes));
  });
}

/* ------------------------------------------------------------------ */
/* PUT: actualizar producto                                           */
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
      throw new HttpError(400, "Content-Type debe ser multipart/form-data.");
    }

    const form = await req.formData();

    const product = await Product.findById(id);

    if (!product) {
      throw new HttpError(404, "Producto no encontrado.");
    }

    // Datos generales
    const name = getText(form.get("name"), 120);
    const description = getText(form.get("description"), 4000);
    const category = getText(form.get("category"), 60);

    if (!name) {
      throw new HttpError(400, "El nombre es obligatorio.");
    }

    if (!category) {
      throw new HttpError(400, "La categoría es obligatoria.");
    }

    // Precios
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

    // Rating
    const rating = getNumber(form.get("rating"), "El rating", {
      min: 0,
      max: 5,
    });

    // Stock
    const stockValue = form.get("inStock");

    if (stockValue !== "true" && stockValue !== "false") {
      throw new HttpError(400, "El estado del stock no es válido.");
    }

    const inStock = stockValue === "true";

    // Tallas
    const sizes = [
      ...new Set(
        form
          .getAll("sizes")
          .map((size) => getText(size, 20))
          .filter(Boolean)
      ),
    ];

    // Imagen anterior
    const oldPublicId = product.imagePublicId;

    let image = product.image;
    let imagePublicId = product.imagePublicId;

    // Imagen nueva opcional
    const file = form.get("image");

    if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
      assertImage(file);

      const result = await uploadImage(file, `products/${slug(name)}`);

      image = result.secure_url;
      imagePublicId = result.public_id;
      uploadedPublicId = result.public_id;
    }

    // Actualizar producto
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

    await product.save();

    // Eliminar imagen anterior solamente después de guardar correctamente
    if (
      uploadedPublicId &&
      oldPublicId &&
      oldPublicId !== uploadedPublicId
    ) {
      await cloudinary.uploader.destroy(oldPublicId).catch((error) => {
        console.error("No se pudo eliminar la imagen anterior:", error);
      });
    }

    return json(product.toObject());
  } catch (error) {
    // Si falla la actualización, eliminar la imagen nueva subida
    if (uploadedPublicId) {
      await cloudinary.uploader.destroy(uploadedPublicId).catch((cleanupError) => {
        console.error("Error limpiando imagen nueva:", cleanupError);
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

    // Guardar referencias antes de eliminar el documento
    const publicIds = [
      product.imagePublicId,
      ...(product.variants || []).map((variant) => variant.imagePublicId),
    ].filter(Boolean);

    await Product.deleteOne({ _id: id });

    // Limpiar imágenes de Cloudinary
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
