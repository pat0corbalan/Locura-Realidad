// app/api/products/[id]/route.js

import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import Product from "@/models/Product";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(req, { params }) {
  const { id } = params;
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
  const sizes = form.getAll("sizes");

  try {
    const product = await Product.findById(id);
    if (!product) {
      return new Response(JSON.stringify({ error: "Producto no encontrado" }), { status: 404 });
    }

    let image = product.image;
    let imagePublicId = product.imagePublicId;

    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Subir nueva imagen
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: `products/${name}` },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      // Borrar imagen anterior
      if (imagePublicId) {
        await cloudinary.uploader.destroy(imagePublicId);
      }

      image = result.secure_url;
      imagePublicId = result.public_id;
    }

    // Actualizar campos
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.originalPrice = originalPrice || product.originalPrice;
    product.costPrice = costPrice || product.costPrice;
    product.category = category || product.category;
    product.rating = rating || product.rating;
    product.inStock = typeof inStock === "boolean" ? inStock : product.inStock;
    product.sizes = sizes.length ? sizes : product.sizes;
    product.image = image;
    product.imagePublicId = imagePublicId;

    await product.save();

    return new Response(JSON.stringify(product), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error al actualizar producto", detalle: err.message }),
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  await connectDB();

  try {
    const product = await Product.findById(id);
    if (!product) {
      return new Response(JSON.stringify({ error: "Producto no encontrado" }), { status: 404 });
    }

    // Borrar imagen de Cloudinary
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    await Product.deleteOne({ _id: id });

    return new Response(JSON.stringify({ message: "Producto eliminado" }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error al eliminar producto", detalle: err.message }),
      { status: 500 }
    );
  }
}
