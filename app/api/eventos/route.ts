import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Evento from "@/models/Evento";

export async function GET() {
  await connectDB();
  const eventos = await Evento.find({ activo: true }).sort({ fecha: 1 });
  return NextResponse.json(eventos);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const nuevoEvento = await Evento.create(body);
  return NextResponse.json(nuevoEvento);
}