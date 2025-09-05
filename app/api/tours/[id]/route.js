import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import Tour from "@/models/Tour";

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

  const file = form.get("image");
  const title = form.get("title");
  const description = form.get("description");
  const destination = form.get("destination");
  const dates = form.get("dates");
  const price = form.get("price");
  const grupo = form.get("grupo");

  try {
    const tour = await Tour.findById(id);
    if (!tour) {
      return new Response(JSON.stringify({ error: "Tour no encontrado" }), { status: 404 });
    }

    let image = tour.image; // URL actual

    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: `tours/${title || tour.title}` },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      image = result.secure_url;
    }

    tour.title = title || tour.title;
    tour.description = description || tour.description;
    tour.destination = destination || tour.destination;
    tour.dates = dates || tour.dates;
    tour.price = price || tour.price;
    tour.grupo = grupo || tour.grupo;
    tour.image = image;

    await tour.save();

    return new Response(JSON.stringify(tour), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error al actualizar tour", detalle: err.message }),
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  await connectDB();

  try {
    const tour = await Tour.findById(id);
    if (!tour) {
      return new Response(JSON.stringify({ error: "Tour no encontrado" }), { status: 404 });
    }

    await Tour.deleteOne({ _id: id });

    // Opcional: eliminar imagen de Cloudinary (requiere guardar public_id)

    return new Response(JSON.stringify({ message: "Tour eliminado" }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error al eliminar tour", detalle: err.message }),
      { status: 500 }
    );
  }
}
