import { connectDB } from "@/lib/mongodb"
import { v2 as cloudinary } from "cloudinary"
import Album from "@/models/Album"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * PUT → Actualiza un álbum existente
 * Permite modificar título, descripción, ubicación
 * y agregar nuevas fotos a Cloudinary.
 */
export async function PUT(req, { params }) {
  const { id } = params
  await connectDB()

  const contentType = req.headers.get("content-type") || ""
  if (!contentType.includes("multipart/form-data")) {
    return new Response(
      JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
      { status: 400 }
    )
  }

  const form = await req.formData()
  const title = form.get("title")
  const description = form.get("description")
  const location = form.get("location")
  const files = form.getAll("photos") // puede haber varios archivos

  try {
    const album = await Album.findById(id)
    if (!album) {
      return new Response(JSON.stringify({ error: "Álbum no encontrado" }), {
        status: 404,
      })
    }

    // Subir nuevas fotos si las hay
    let newPhotos = []
    if (files && files.length > 0) {
      for (const file of files) {
        if (file && file.name) {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ folder: `albums/${title || album.title}` }, (err, res) => {
                if (err) reject(err)
                else resolve(res)
              })
              .end(buffer)
          })

          newPhotos.push({
            src: result.secure_url,
            alt: title || album.title || "Foto del álbum",
          })
        }
      }
    }

    // Actualizar datos
    album.title = title || album.title
    album.description = description || album.description
    album.location = location || album.location

    if (newPhotos.length > 0) {
      album.photos.push(...newPhotos)
    }

    await album.save()

    return new Response(JSON.stringify(album), { status: 200 })
  } catch (err) {
    console.error("Error actualizando álbum:", err)
    return new Response(
      JSON.stringify({ error: "Error al actualizar álbum", detalle: err.message }),
      { status: 500 }
    )
  }
}

/**
 * DELETE → Elimina un álbum completo de MongoDB.
 * Si quisieras borrar también las imágenes de Cloudinary,
 * necesitarías guardar los `public_id` de cada foto.
 */
export async function DELETE(req, { params }) {
  const { id } = params
  await connectDB()

  try {
    const album = await Album.findById(id)
    if (!album) {
      return new Response(JSON.stringify({ error: "Álbum no encontrado" }), {
        status: 404,
      })
    }

    await Album.deleteOne({ _id: id })

    // ⚠️ Opcional: eliminar también de Cloudinary si guardas `public_id`
    // for (const photo of album.photos) {
    //   await cloudinary.uploader.destroy(photo.public_id)
    // }

    return new Response(JSON.stringify({ message: "Álbum eliminado correctamente" }), {
      status: 200,
    })
  } catch (err) {
    console.error("Error eliminando álbum:", err)
    return new Response(
      JSON.stringify({ error: "Error al eliminar álbum", detalle: err.message }),
      { status: 500 }
    )
  }
}
