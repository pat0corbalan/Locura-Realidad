import { connectDB } from "@/lib/mongodb";
import Tour from "@/models/Tour";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const tour = await Tour.findById(id);
    if (!tour) {
      return new Response("Tour no encontrado", { status: 404 });
    }
    return Response.json(tour);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

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
    const imageUrl = form.get("imageUrl")?.toString() || undefined;

    if (!title || !description || !destination || !dates.length || !price) {
      return new Response("Faltan campos requeridos", { status: 400 });
    }

    let updateData = {
      title,
      description,
      destination,
      dates,
      price,
      grupo,
    };

    if (file && typeof file.arrayBuffer === "function") {
      // Si hay nueva imagen, subir a Cloudinary
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: "tours" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }).end(buffer);
      });
      updateData.image = uploadResult.secure_url;
    } else if (imageUrl) {
      // Mantener la imagen existente
      updateData.image = imageUrl;
    } else {
      return new Response("Se requiere una imagen", { status: 400 });
    }

    const updatedTour = await Tour.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedTour) {
      return new Response("Tour no encontrado", { status: 404 });
    }

    return Response.json(updatedTour);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const deletedTour = await Tour.findByIdAndDelete(id);
    if (!deletedTour) {
      return new Response("Tour no encontrado", { status: 404 });
    }
    // Opcional: Eliminar la imagen de Cloudinary
    if (deletedTour.image) {
      const publicId = deletedTour.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`tours/${publicId}`);
    }
    return new Response("Tour eliminado correctamente", { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}