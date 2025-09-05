// import { connectDB } from "@/lib/mongodb";
// import Product from "@/models/Product";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     await connectDB();
//     const products = await Product.find();
//     return NextResponse.json(products);
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     return NextResponse.json({ message: "Error fetching products" }, { status: 500 });
//   }
// }

// export async function POST(request) {
//   try {
//     await connectDB();
//     const body = await request.json();
//     const product = new Product(body); 
//     const newProduct = await product.save();
//     return NextResponse.json(newProduct, { status: 201 });
//   } catch (error) {
//     console.error("Error creating product:", error);
//     return NextResponse.json({ message: "Error creating product" }, { status: 400 });
//   }
// }

import { connectDB } from "@/models/mongoDB";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import Product from "../../../models/Product";

export async function POST(req) {
  await connectDB();

  const form = await req.formData();

  const src = form.get("image");
  const name = form.get("name");
  const description = form.get("description");
  const price = parseFloat(form.get("price"));
  const originalPrice = parseFloat(form.get("originalPrice") || 0);
  const costPrice = parseFloat(form.get("costPrice"));
  const category = form.get("category");
  const rating = parseFloat(form.get("rating"));
  const inStock = form.get("inStock") === "true";
  const sizes = form.getAll("sizes");

  try {
    let uploadedImage;

    if (src && src.name) {
      uploadedImage = await uploadToCloudinary(src, `products/${name}`);
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      originalPrice,
      costPrice,
      category,
      rating,
      inStock,
      sizes,
      image: uploadedImage?.secure_url || "",
    });

    return new Response(JSON.stringify(newProduct), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
