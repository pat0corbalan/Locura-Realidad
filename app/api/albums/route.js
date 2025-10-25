import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import Album from "@/models/Album";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  await connectDB();

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new Response(JSON.stringify({ error: "Invalid Content-Type" }), { status: 400 });
  }

  const form = await req.formData();
  const title = form.get("title");
  const description = form.get("description");
  const location = form.get("location");

  const files = form.getAll("photos"); // varias fotos

  if (!files.length) {
    return new Response(JSON.stringify({ error: "No se subieron imágenes" }), { status: 400 });
  }

  try {
    // Subir todas las fotos en paralelo
    const uploadedPhotos = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: `albums/${title}` },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          ).end(buffer);
        });

        return { src: result.secure_url, alt: file.name };
      })
    );

    const newAlbum = await Album.create({
      title,
      description,
      location,
      photos: uploadedPhotos,
    });

    return new Response(JSON.stringify(newAlbum), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error al subir álbum", detalle: err.message }), {
      status: 500,
    });
  }
}

export async function GET() {
  await connectDB();

  try {
    const albums = await Album.find();
    return new Response(JSON.stringify(albums), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
