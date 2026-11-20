
import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import Tour from "@/models/Tour";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function parseDates(value) {
  if (Array.isArray(value)) return value;

  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function serializeTour(tour) {
  const data = tour.toObject ? tour.toObject() : tour;

  return {
    ...data,
    dates: parseDates(data.dates),
    price: Number(data.price) || 0,
  };
}

function validateTourFields({ title, description, destination, dates, price }) {
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    typeof destination !== "string" ||
    !destination.trim()
  ) {
    return "Completá el título, la descripción y el destino.";
  }

  if (!Array.isArray(dates) || dates.length === 0) {
    return "El tour debe tener al menos una fecha disponible.";
  }

  const validDates = dates.every((date) => {
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false;
    }

    const parsed = new Date(`${date}T00:00:00`);
    return !Number.isNaN(parsed.getTime());
  });

  if (!validDates) {
    return "Una o más fechas no tienen un formato válido.";
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "El precio debe ser un número mayor a cero.";
  }

  return null;
}

async function uploadImage(file, folder) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("La imagen enviada no es válida.");
  }

  if (!file.type?.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("La imagen no puede superar los 10 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url || !result?.public_id) {
          reject(new Error("Cloudinary no devolvió una imagen válida."));
          return;
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

// PUT: actualizar tour.
export async function PUT(req, { params }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  let uploadedImage = null;

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de tour inválido." },
        { status: 400 }
      );
    }

    await connectDB();

    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "El formulario debe enviarse como multipart/form-data." },
        { status: 400 }
      );
    }

    const tour = await Tour.findById(id);

    if (!tour) {
      return NextResponse.json(
        { error: "Tour no encontrado." },
        { status: 404 }
      );
    }

    const form = await req.formData();

    const title = form.get("title");
    const description = form.get("description");
    const destination = form.get("destination");
    const datesValue = form.get("dates");
    const price = form.get("price");
    const grupo = form.get("grupo") ?? "";
    const file = form.get("image");

    let dates;

    try {
      dates = JSON.parse(String(datesValue || ""));
    } catch {
      dates = null;
    }

    const validationError = validateTourFields({
      title,
      description,
      destination,
      dates,
      price,
    });

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const oldImagePublicId = tour.imagePublicId;

    // Si se seleccionó una imagen nueva, la subimos primero.
    if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
      uploadedImage = await uploadImage(
        file,
        `tours/${String(title).trim()}`
      );
    }

    tour.title = title.trim();
    tour.description = description.trim();
    tour.destination = destination.trim();
    tour.dates = JSON.stringify(dates);
    tour.price = String(Number(price));
    tour.grupo = String(grupo).trim();

    if (uploadedImage) {
      tour.image = uploadedImage.secure_url;
      tour.imagePublicId = uploadedImage.public_id;
    }

    await tour.save();

    // La imagen anterior se elimina solamente después de guardar el tour.
    if (
      uploadedImage &&
      oldImagePublicId &&
      oldImagePublicId !== uploadedImage.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(oldImagePublicId);
      } catch (cloudinaryError) {
        console.error(
          "No se pudo eliminar la imagen anterior de Cloudinary:",
          cloudinaryError
        );
      }
    }

    return NextResponse.json(serializeTour(tour), {
      status: 200,
    });
  } catch (error) {
    // Si falló la actualización después de subir una imagen,
    // limpiamos el recurso nuevo para evitar imágenes huérfanas.
    if (uploadedImage?.public_id) {
      await cloudinary.uploader
        .destroy(uploadedImage.public_id)
        .catch((cleanupError) => {
          console.error("No se pudo limpiar la imagen nueva:", cleanupError);
        });
    }

    console.error("Error al actualizar tour:", error);

    return NextResponse.json(
      { error: error.message || "No se pudo actualizar el tour." },
      { status: 500 }
    );
  }
}

// DELETE: eliminar tour.
export async function DELETE(req, { params }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de tour inválido." },
        { status: 400 }
      );
    }

    await connectDB();

    const tour = await Tour.findById(id);

    if (!tour) {
      return NextResponse.json(
        { error: "Tour no encontrado." },
        { status: 404 }
      );
    }

    const imagePublicId = tour.imagePublicId;

    await Tour.deleteOne({ _id: id });

    // Los tours antiguos pueden no tener imagePublicId.
    if (imagePublicId) {
      try {
        await cloudinary.uploader.destroy(imagePublicId);
      } catch (cloudinaryError) {
        console.error(
          "El tour se eliminó, pero no se pudo eliminar su imagen:",
          cloudinaryError
        );
      }
    }

    return NextResponse.json(
      { message: "Tour eliminado correctamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar tour:", error);

    return NextResponse.json(
      { error: "No se pudo eliminar el tour." },
      { status: 500 }
    );
  }
}
