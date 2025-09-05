// app/api/photos/save/route.ts
import { connectDB } from "@/lib/mongodb"
import Photo from "@/models/Photo"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    await connectDB()

    const body = await req.json()
    const { src, alt, title, location } = body

    if (!src || !alt || !title || !location) {
      return NextResponse.json(
        {
          message: "Error uploading photo",
          error: "Faltan campos requeridos: src, alt, title, location",
        },
        { status: 400 }
      )
    }

    const photo = await Photo.create({ src, alt, title, location })

    return NextResponse.json(photo, { status: 201 })
  } catch (error: any) {
    console.error("Error guardando la foto:", error)
    return NextResponse.json(
      { message: "Error al guardar en la base de datos", error: error.message },
      { status: 500 }
    )
  }
}
