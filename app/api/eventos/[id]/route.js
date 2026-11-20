
import { NextResponse } from "next/server"
import mongoose from "mongoose"

import { connectDB } from "@/lib/mongodb"
import Evento from "@/models/Evento"
import { requireAdmin } from "@/lib/admin-auth"

export async function PATCH(req, { params }) {
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de evento inválido." },
        { status: 400 }
      )
    }

    await connectDB()

    const body = await req.json()

    const updates = {}

    if (body.titulo !== undefined) {
      if (typeof body.titulo !== "string" || !body.titulo.trim()) {
        return NextResponse.json(
          { error: "El título no puede estar vacío." },
          { status: 400 }
        )
      }

      updates.titulo = body.titulo.trim()
    }

    if (body.lugar !== undefined) {
      if (typeof body.lugar !== "string" || !body.lugar.trim()) {
        return NextResponse.json(
          { error: "El lugar no puede estar vacío." },
          { status: 400 }
        )
      }

      updates.lugar = body.lugar.trim()
    }

    if (body.precio !== undefined) {
      const precio = Number(body.precio)

      if (!Number.isFinite(precio) || precio < 0) {
        return NextResponse.json(
          { error: "El precio no es válido." },
          { status: 400 }
        )
      }

      updates.precio = precio
    }

    if (body.fecha !== undefined) {
      const fecha = new Date(body.fecha)

      if (!body.fecha || !Number.isFinite(fecha.getTime())) {
        return NextResponse.json(
          { error: "La fecha no es válida." },
          { status: 400 }
        )
      }

      updates.fecha = fecha
    }

    if (body.descripcion !== undefined) {
      updates.descripcion = body.descripcion
    }

    if (body.imagenUrl !== undefined) {
      updates.imagenUrl = body.imagenUrl
    }

    if (body.activo !== undefined) {
      if (typeof body.activo !== "boolean") {
        return NextResponse.json(
          { error: "El estado del evento no es válido." },
          { status: 400 }
        )
      }

      updates.activo = body.activo
    }

    const evento = await Evento.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!evento) {
      return NextResponse.json(
        { error: "Evento no encontrado." },
        { status: 404 }
      )
    }

    return NextResponse.json(evento)
  } catch (error) {
    console.error("Error actualizando evento:", error)

    return NextResponse.json(
      { error: "No se pudo actualizar el evento." },
      { status: 500 }
    )
  }
}

export async function DELETE(req, { params }) {
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de evento inválido." },
        { status: 400 }
      )
    }

    await connectDB()

    const evento = await Evento.findByIdAndDelete(id)

    if (!evento) {
      return NextResponse.json(
        { error: "Evento no encontrado." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Evento eliminado correctamente.",
    })
  } catch (error) {
    console.error("Error eliminando evento:", error)

    return NextResponse.json(
      { error: "No se pudo eliminar el evento." },
      { status: 500 }
    )
  }
}
