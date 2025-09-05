import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import Tour from "@/models/Tour";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  await connectDB();

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new Response(
      JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
      { status: 400 }
    );
  }

  const form = await req.formData();

  const file = form.get("image");
  const title = form.get("title");
  const description = form.get("description");
  const destination = form.get("destination");
  const dates = form.get("dates");
  const price = form.get("price");
  const grupo = form.get("grupo");

  if (!file || !file.name) {
    return new Response(
      JSON.stringify({ error: "No se subió una imagen válida" }),
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `tours/${title}` },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(buffer);
    });

    const nuevoTour = await Tour.create({
      title,
      description,
      destination,
      dates,
      price,
      grupo,
      image: result.secure_url,
    });

    return new Response(JSON.stringify(nuevoTour), { status: 201 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error al subir imagen", detalle: err.message }),
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectDB();

  try {
    const tours = await Tour.find();
    return new Response(JSON.stringify(tours), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
