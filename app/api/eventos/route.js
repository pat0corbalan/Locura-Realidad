
import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Evento from "@/models/Evento"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(req) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const admin = searchParams.get("admin") === "1"

    if (admin) {
      const authError = requireAdmin(req)
      if (authError) return authError

      const eventos = await Evento.find({})
        .sort({ fecha: 1 })
        .lean()

      return NextResponse.json(eventos)
    }

    const eventos = await Evento.find({ activo: true })
      .sort({ fecha: 1 })
      .lean()

    return NextResponse.json(eventos)
  } catch (error) {
    console.error("Error obteniendo eventos:", error)

    return NextResponse.json(
      { error: "No se pudieron obtener los eventos." },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    await connectDB()

    const body = await req.json()

    const titulo = typeof body.titulo === "string"
      ? body.titulo.trim()
      : ""

    const lugar = typeof body.lugar === "string"
      ? body.lugar.trim()
      : ""

    const precio = Number(body.precio)
    const fecha = new Date(body.fecha)

    if (!titulo || !lugar || !body.fecha || !Number.isFinite(fecha.getTime())) {
      return NextResponse.json(
        { error: "Título, lugar y fecha válida son obligatorios." },
        { status: 400 }
      )
    }

    if (!Number.isFinite(precio) || precio < 0) {
      return NextResponse.json(
        { error: "El precio debe ser un número válido y no negativo." },
        { status: 400 }
      )
    }

    const nuevoEvento = await Evento.create({
      titulo,
      lugar,
      precio,
      fecha,
      descripcion: body.descripcion || "",
      imagenUrl: body.imagenUrl || "",
      activo: body.activo !== false,
    })

    return NextResponse.json(nuevoEvento, { status: 201 })
  } catch (error) {
    console.error("Error creando evento:", error)

    return NextResponse.json(
      { error: "No se pudo crear el evento." },
      { status: 500 }
    )
  }
}
