
import { connectDB } from "@/lib/mongodb"
import { v2 as cloudinary } from "cloudinary"
import Album from "@/models/Album"
import { requireAdmin } from "@/lib/admin-auth"

import mongoose from "mongoose"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })

// --------------------------------------------------
// SUBIR IMAGEN A CLOUDINARY
// --------------------------------------------------

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error)
            return
          }

          if (!result) {
            reject(new Error("Cloudinary no devolvió un resultado."))
            return
          }

          resolve(result)
        }
      )
      .end(buffer)
  })
}

// --------------------------------------------------
// PUT → ACTUALIZAR ÁLBUM
// --------------------------------------------------

export async function PUT(req, { params }) {
  const authError = requireAdmin(req)
  if (authError) return authError

  const { id } = await params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return json({ error: "ID de álbum inválido." }, 400)
  }

  const uploadedPublicIds = []

  try {
    await connectDB()

    const contentType = req.headers.get("content-type") || ""

    if (!contentType.includes("multipart/form-data")) {
      return json(
        { error: "Content-Type debe ser multipart/form-data." },
        400
      )
    }

    const album = await Album.findById(id)

    if (!album) {
      return json({ error: "Álbum no encontrado." }, 404)
    }

    const form = await req.formData()

    const title = form.get("title")
    const description = form.get("description")
    const location = form.get("location")
    const files = form.getAll("photos")

    // Validar campos de texto
    if (
      (title !== null && typeof title !== "string") ||
      (description !== null && typeof description !== "string") ||
      (location !== null && typeof location !== "string")
    ) {
      return json({ error: "Los datos enviados no son válidos." }, 400)
    }

    const updatedTitle =
      typeof title === "string" ? title.trim() : album.title

    if (!updatedTitle) {
      return json({ error: "El título del álbum es obligatorio." }, 400)
    }

    // Actualizar campos.
    // Se permiten cadenas vacías para poder borrar descripción o ubicación.
    album.title = updatedTitle

    if (typeof description === "string") {
      album.description = description.trim()
    }

    if (typeof location === "string") {
      album.location = location.trim()
    }

    // Subir fotografías nuevas
    const newPhotos = []

    const folderName = updatedTitle
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "album"

    for (const file of files) {
      // Ignorar archivos vacíos
      if (
        !file ||
        typeof file.arrayBuffer !== "function" ||
        !file.name ||
        file.size === 0
      ) {
        continue
      }

      if (!file.type?.startsWith("image/")) {
        throw new Error(`El archivo ${file.name} no es una imagen válida.`)
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const result = await uploadToCloudinary(
        buffer,
        `albums/${folderName}`
      )

      uploadedPublicIds.push(result.public_id)

      newPhotos.push({
        src: result.secure_url,
        alt: updatedTitle || "Foto del álbum",
        public_id: result.public_id,
      });
    }

    // Conservar las fotografías anteriores
    if (newPhotos.length > 0) {
      album.photos.push(...newPhotos)
    }

    await album.save()

    return json({
      ...album.toObject(),
    })
  } catch (error) {
    console.error("Error actualizando álbum:", error)

    // Limpiar las imágenes subidas si la operación falla
    if (uploadedPublicIds.length > 0) {
      await Promise.allSettled(
        uploadedPublicIds.map((publicId) =>
          cloudinary.uploader.destroy(publicId)
        )
      )
    }

    return json(
      {
        error: "No se pudo actualizar el álbum.",
      },
      500
    )
  }
}

// --------------------------------------------------
// DELETE → ELIMINAR ÁLBUM
// --------------------------------------------------

export async function DELETE(req, { params }) {
  const authError = requireAdmin(req)
  if (authError) return authError

  const { id } = await params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return json({ error: "ID de álbum inválido." }, 400)
  }

  try {
    await connectDB()

    const album = await Album.findById(id)

    if (!album) {
      return json({ error: "Álbum no encontrado." }, 404)
    }

    await Album.deleteOne({ _id: id })

    return json({
      message: "Álbum eliminado correctamente.",
    })
  } catch (error) {
    console.error("Error eliminando álbum:", error)

    return json(
      {
        error: "No se pudo eliminar el álbum.",
      },
      500
    )
  }
}
