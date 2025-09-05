import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import Tour from "@/models/Tour";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    await connectDB();
    const tours = await Tour.find();
    return Response.json(tours);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response("Content-Type must be multipart/form-data", { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("image");
    const title = form.get("title")?.toString() || "";
    const description = form.get("description")?.toString() || "";
    const destination = form.get("destination")?.toString() || "";
    const dates = form.get("dates")?.toString() ? JSON.parse(form.get("dates").toString()) : [];
    const price = parseFloat(form.get("price")?.toString() || "0");
    const grupo = form.get("grupo")?.toString() || undefined;

    if (!title || !description || !destination || !dates.length || !price || !file) {
      return new Response("Faltan campos requeridos", { status: 400 });
    }

    if (typeof file.arrayBuffer !== "function") {
      return new Response("Imagen no válida", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "tours" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }).end(buffer);
    });

    const nuevoTour = await Tour.create({
      title,
      description,
      destination,
      dates,
      price,
      grupo,
      image: uploadResult.secure_url,
    });

    return Response.json(nuevoTour);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}