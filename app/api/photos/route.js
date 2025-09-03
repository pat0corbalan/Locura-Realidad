// api/photos/route.js
import { connectDB } from "@/lib/mongodb"
import Photo from "@/models/Photo"
import { NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"
import { writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import fs from "fs"

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request) {
  try {
    await connectDB()

    const formData = await request.formData()

    const file = formData.get("file")
    const title = formData.get("title")
    const alt = formData.get("alt")
    const location = formData.get("location")

    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    // Buffer de la imagen
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tmpPath = path.join("/tmp", `${randomUUID()}-${file.name}`)

    await writeFile(tmpPath, buffer)

    // Subir a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(tmpPath, {
      folder: "locura-y-realidad",
    })

    // Eliminar el archivo temporal
    fs.unlinkSync(tmpPath)

    // Guardar en MongoDB
    const photo = new Photo({
      src: uploadResult.secure_url, // URL de Cloudinary
      alt,
      title,
      location,
    })

    const newPhoto = await photo.save()

    return NextResponse.json(newPhoto, { status: 201 })
  } catch (error) {
    console.error("Error uploading photo:", error)
    return NextResponse.json({ message: "Error uploading photo" }, { status: 500 })
  }
}
