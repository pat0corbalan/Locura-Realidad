// app/api/products/route.js

import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import Product from "@/models/Product";
import { isAdmin } from "@/lib/admin-auth";

// Evita que Next guarde la respuesta en caché al compilar (productos "viejos")
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB por foto
const MAX_EXTRA_IMAGES = 6;
const MAX_VARIANTS = 40;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

/* ------------------------------------------------------------------ */
/* GET: catálogo público (sin costos) o completo para el admin         */
/* ------------------------------------------------------------------ */

export async function GET(req) {
  try {
    await connectDB();
    const admin = isAdmin(req);

    const query = Product.find().sort({ _id: -1 }).lean(); // más nuevos primero
    if (!admin) query.select("-costPrice -imagePublicId -__v");
    const products = await query;

    return json(
      products,
      200,
      admin
        ? { "Cache-Control": "no-store" }
        : { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" }
    );
  } catch (err) {
    console.error("GET /api/products:", err);
    return json({ error: "No se pudieron obtener los productos." }, 500);
  }
}

/* ------------------------------------------------------------------ */
/* Helpers de validación                                               */
/* ------------------------------------------------------------------ */

// "" / null → null (no enviado). Texto no numérico → NaN
function toNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function text(value, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "producto";

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

function parseVariants(raw) {
  if (!raw) return [];
  let list;
  try {
    list = JSON.parse(raw);
  } catch {
    throw new HttpError(400, "variants no es un JSON válido.");
  }
  if (!Array.isArray(list) || list.length > MAX_VARIANTS) {
    throw new HttpError(400, `variants debe ser una lista de hasta ${MAX_VARIANTS} elementos.`);
  }

  return list.map((v, i) => {
    const label = text(v?.label, 100);
    if (!label) throw new HttpError(400, `La variante ${i + 1} no tiene "label".`);

    const price = toNumber(v?.price);
    if (Number.isNaN(price) || (price !== null && price < 0)) {
      throw new HttpError(400, `Precio inválido en la variante "${label}".`);
    }

    return {
      label,
      group: text(v?.group, 150) || undefined,
      price: price ?? undefined,
      inStock: v?.inStock !== false,
      note: text(v?.note, 200) || undefined,
      // 0 = foto principal, 1 = primera foto extra, etc.
      imageIndex: Number.isInteger(v?.imageIndex) ? v.imageIndex : undefined,
    };
  });
}

function uploadImage(file, folder) {
  return file.arrayBuffer().then(
    (bytes) =>
      new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder, resource_type: "image" }, (err, result) =>
            err ? reject(err) : resolve(result)
          )
          .end(Buffer.from(bytes));
      })
  );
}

/* ------------------------------------------------------------------ */
/* POST: crear producto (solo admin)                                   */
/* ------------------------------------------------------------------ */

export async function POST(req) {
  if (!isAdmin(req)) return json({ error: "No autorizado." }, 401);

  const uploaded = []; // para borrar de Cloudinary si algo falla después

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      throw new HttpError(400, "Content-Type debe ser multipart/form-data");
    }

    const form = await req.formData();

    // --- Campos de texto
    const name = text(form.get("name"), 120);
    if (!name) throw new HttpError(400, "El nombre es obligatorio.");
    const category = text(form.get("category"), 60);
    if (!category) throw new HttpError(400, "La categoría es obligatoria.");

    const description = text(form.get("description"), 4000);
    const groupLabel = text(form.get("groupLabel"), 40) || undefined;
    const optionLabel = text(form.get("optionLabel"), 40) || undefined;

    // --- Opciones
    const sizes = form.getAll("sizes").map((s) => text(s, 20)).filter(Boolean);
    const variants = parseVariants(form.get("variants"));

    // --- Números
    let price = toNumber(form.get("price"));
    if (price === null) {
      // Con variantes con precio, el precio base es el más bajo
      const prices = variants.map((v) => v.price).filter((p) => p !== undefined);
      if (prices.length) price = Math.min(...prices);
    }
    if (price === null || Number.isNaN(price) || price <= 0) {
      throw new HttpError(400, "El precio es obligatorio y debe ser mayor a 0.");
    }

    const originalPrice = toNumber(form.get("originalPrice"));
    const costPrice = toNumber(form.get("costPrice"));
    const ratingRaw = toNumber(form.get("rating"));
    if ([originalPrice, costPrice, ratingRaw].some(Number.isNaN)) {
      throw new HttpError(400, "Hay un número inválido (precio original, costo o rating).");
    }
    const rating = Math.min(5, Math.max(0, ratingRaw ?? 5));
    const inStock = form.get("inStock") === "true";

    // --- Imágenes
    const mainFile = form.get("image");
    assertImage(mainFile, "Imagen principal");
    const extraFiles = form.getAll("images").filter((f) => f && f.size);
    if (extraFiles.length > MAX_EXTRA_IMAGES) {
      throw new HttpError(400, `Máximo ${MAX_EXTRA_IMAGES} fotos extra.`);
    }
    extraFiles.forEach((f, i) => assertImage(f, `Foto extra ${i + 1}`));

    // --- Subida a Cloudinary (carpeta sin caracteres raros)
    const folder = `products/${slug(name)}`;
    const results = [];
    for (const file of [mainFile, ...extraFiles]) {
      const result = await uploadImage(file, folder);
      uploaded.push(result.public_id);
      results.push(result);
    }
    const urls = results.map((r) => r.secure_url);

    const product = await Product.create({
      name,
      description,
      price,
      originalPrice: originalPrice > 0 ? originalPrice : undefined,
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
      variants: variants.map(({ imageIndex, ...v }) => ({
        ...v,
        image: imageIndex !== undefined ? urls[imageIndex] : undefined,
      })),
    });

    return json(product, 201, { "Cache-Control": "no-store" });
  } catch (err) {
    // Si algo falló después de subir fotos, no dejar fotos huérfanas
    await Promise.allSettled(uploaded.map((id) => cloudinary.uploader.destroy(id)));

    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    if (err?.name === "ValidationError") {
      return json({ error: "Datos inválidos.", detalle: err.message }, 400);
    }
    console.error("POST /api/products:", err);
    return json({ error: "Error al crear el producto." }, 500);
  }
}