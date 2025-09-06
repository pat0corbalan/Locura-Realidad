// app/api/products/route.js

import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import Product from "@/models/Product";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  await connectDB();

  try {
    const products = await Product.find();
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new Response(
      JSON.stringify({ error: "Content-Type debe ser multipart/form-data" }),
      { status: 400 }
    );
  }

  const form = await req.formData();
  const file = form.get("image");
  const name = form.get("name");
  const description = form.get("description");
  const price = parseFloat(form.get("price"));
  const originalPrice = parseFloat(form.get("originalPrice") || 0);
  const costPrice = parseFloat(form.get("costPrice"));
  const category = form.get("category");
  const rating = parseFloat(form.get("rating") || 5);
  const inStock = form.get("inStock") === "true";
  const sizes = form.getAll("sizes"); // esperar múltiples valores

  if (!file || !file.name) {
    return new Response(JSON.stringify({ error: "Imagen inválida" }), { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `products/${name}` },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(buffer);
    });

    const newProduct = await Product.create({
      name,
      description,
      price,
      originalPrice,
      costPrice,
      image: result.secure_url,
      imagePublicId: result.public_id,
      category,
      rating,
      inStock,
      sizes,
    });

    return new Response(JSON.stringify(newProduct), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error al crear producto", detalle: err.message }), {
      status: 500,
    });
  }
}
