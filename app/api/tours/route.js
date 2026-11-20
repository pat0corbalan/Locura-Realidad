
import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import Tour from "@/models/Tour";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function parseDates(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

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
    return (
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      !Number.isNaN(new Date(`${date}T00:00:00`).getTime())
    );
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

// GET público: solamente tours con fechas vigentes.
// GET administrativo: todos los tours, incluyendo los pasados.
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "1";

    if (isAdmin) {
      const authError = requireAdmin(req);
      if (authError) return authError;
    }

    const tours = await Tour.find().sort({ createdAt: -1 }).lean();

    if (isAdmin) {
      return NextResponse.json(tours.map(serializeTour));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeTours = tours.filter((tour) => {
      const dates = parseDates(tour.dates);

      return dates.some((date) => {
        const parsedDate = new Date(`${date}T00:00:00`);

        return (
          !Number.isNaN(parsedDate.getTime()) &&
          parsedDate >= today
        );
      });
    });

    return NextResponse.json(activeTours.map(serializeTour));
  } catch (error) {
    console.error("Error al obtener tours:", error);

    return NextResponse.json(
      { error: "No se pudieron obtener los tours." },
      { status: 500 }
    );
  }
}

// POST: crear tour.
export async function POST(req) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "El formulario debe enviarse como multipart/form-data." },
        { status: 400 }
      );
    }

    const form = await req.formData();

    const title = form.get("title");
    const description = form.get("description");
    const destination = form.get("destination");
    const datesValue = form.get("dates");
    const price = form.get("price");
    const grupo = form.get("grupo") || "";
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

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "Tenés que seleccionar una imagen para el tour." },
        { status: 400 }
      );
    }

    const uploadedImage = await uploadImage(
      file,
      `tours/${String(title).trim()}`
    );

    try {
      const nuevoTour = await Tour.create({
        title: title.trim(),
        description: description.trim(),
        destination: destination.trim(),
        dates: JSON.stringify(dates),
        price: String(Number(price)),
        grupo: String(grupo).trim(),
        image: uploadedImage.secure_url,
        imagePublicId: uploadedImage.public_id,
      });

      return NextResponse.json(serializeTour(nuevoTour), {
        status: 201,
      });
    } catch (databaseError) {
      // Si falla MongoDB, intentamos limpiar la imagen recién subida.
      await cloudinary.uploader
        .destroy(uploadedImage.public_id)
        .catch((error) => {
          console.error("No se pudo limpiar la imagen:", error);
        });

      throw databaseError;
    }
  } catch (error) {
    console.error("Error al crear tour:", error);

    return NextResponse.json(
      { error: error.message || "No se pudo crear el tour." },
      { status: 500 }
    );
  }
}
