import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import Photo from "@/models/Photo";

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
      JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
      { status: 400 }
    );
  }

  const form = await req.formData();
  const file = form.get("src");
  const title = form.get("title");
  const alt = form.get("alt");
  const location = form.get("location");

  try {
    const photo = await Photo.findById(id);
    if (!photo) {
      return new Response(JSON.stringify({ error: "Foto no encontrada" }), { status: 404 });
    }

    let src = photo.src; // URL actual

    // Si hay archivo nuevo, subirlo y actualizar src
    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: `photos/${title}` },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      src = result.secure_url;
    }

    // Actualizar campos en MongoDB
    photo.src = src;
    photo.title = title || photo.title;
    photo.alt = alt || photo.alt;
    photo.location = location || photo.location;

    await photo.save();

    return new Response(JSON.stringify(photo), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error al actualizar foto", detalle: err.message }),
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  await connectDB();

  try {
    const photo = await Photo.findById(id);
    if (!photo) {
      return new Response(JSON.stringify({ error: "Foto no encontrada" }), { status: 404 });
    }

    await Photo.deleteOne({ _id: id });

    // Opcional: eliminar imagen de Cloudinary (requiere guardar public_id)
    // Si guardas el public_id de Cloudinary en el modelo Photo, podrías borrarla aquí

    return new Response(JSON.stringify({ message: "Foto eliminada" }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error al eliminar foto", detalle: err.message }),
      { status: 500 }
    );
  }
}
