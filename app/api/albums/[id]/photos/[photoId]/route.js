
import { connectDB } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

import Album from "@/models/Album";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const json = (data, status = 200) =>
  Response.json(data, { status });

export async function DELETE(req, { params }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const { id, photoId } = await params;

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(photoId)
  ) {
    return json({ error: "El ID del álbum o de la fotografía no es válido." }, 400);
  }

  try {
    await connectDB();

    const album = await Album.findById(id);

    if (!album) {
      return json({ error: "Álbum no encontrado." }, 404);
    }

    const photo = album.photos.id(photoId);

    if (!photo) {
      return json({ error: "Fotografía no encontrada en este álbum." }, 404);
    }

    const publicId = photo.public_id;

    // Primero se elimina la referencia de la fotografía del álbum.
    photo.deleteOne();
    await album.save();

    // Las fotografías antiguas pueden no tener public_id.
    // En ese caso se elimina la referencia de MongoDB solamente.
    if (publicId) {
      try {
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });

        if (result.result !== "ok" && result.result !== "not found") {
          console.error(
            "Cloudinary no pudo eliminar la fotografía:",
            publicId,
            result
          );

          return json({
            message: "La fotografía se quitó del álbum, pero Cloudinary no confirmó su eliminación.",
            cloudinaryDeleted: false,
          });
        }
      } catch (cloudinaryError) {
        // La referencia ya se quitó de MongoDB.
        // No devolvemos un error que provoque un reintento accidental.
        console.error(
          "Error eliminando fotografía de Cloudinary:",
          cloudinaryError
        );

        return json({
          message: "La fotografía se quitó del álbum, pero no se pudo eliminar el archivo de Cloudinary.",
          cloudinaryDeleted: false,
        });
      }
    }

    return json({
      message: "Fotografía eliminada correctamente.",
      cloudinaryDeleted: Boolean(publicId),
    });
  } catch (error) {
    console.error("Error eliminando fotografía:", error);

    return json(
      { error: "No se pudo eliminar la fotografía." },
      500
    );
  }
}
