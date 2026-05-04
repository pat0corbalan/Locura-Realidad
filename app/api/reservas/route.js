import { connectDB } from "@/lib/mongodb";
import Reserva from "@/models/Reserva";
import { NextResponse } from "next/server";

// GET: Obtener todas las reservas (para tu panel de admin)
export async function GET() {
  try {
    await connectDB();
    const reservas = await Reserva.find().sort({ createdAt: -1 });
    return NextResponse.json(reservas, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Crear una nueva reserva (desde el modal del cliente)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Aseguramos que el estado inicial siempre sea pendiente
    const nuevaReserva = await Reserva.create({
      ...body,
      estado: body.estado || "pendiente"
    });

    return NextResponse.json(nuevaReserva, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}