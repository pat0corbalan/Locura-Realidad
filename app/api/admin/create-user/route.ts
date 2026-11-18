import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// Endpoint de bootstrap: solo permite crear el primer administrador.
// Después de crear el primero queda cerrado permanentemente.
export async function POST(req: NextRequest) {
  try {
    const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    const suppliedSecret = req.headers.get("x-bootstrap-secret") || "";

    if (!expectedSecret || expectedSecret.length < 32 || !safeEqual(suppliedSecret, expectedSecret)) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const usuario = typeof body?.usuario === "string" ? body.usuario.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (usuario.length < 3 || usuario.length > 120 || password.length < 12 || password.length > 200) {
      return NextResponse.json({
        message: "El usuario debe tener al menos 3 caracteres y la contraseña al menos 12.",
      }, { status: 400 });
    }

    await connectDB();
    const existingAdmin = await Admin.findOne({ role: "admin" }).select("_id");
    if (existingAdmin) {
      return NextResponse.json({ message: "El administrador inicial ya fue creado." }, { status: 409 });
    }

    const existingUser = await Admin.findOne({ usuario }).select("_id");
    if (existingUser) {
      return NextResponse.json({ message: "Ese usuario ya existe." }, { status: 409 });
    }

    await Admin.create({ usuario, password, role: "admin" });
    return NextResponse.json({ message: "Administrador inicial creado. Eliminá ADMIN_BOOTSTRAP_SECRET de Vercel." }, { status: 201 });
  } catch (error) {
    console.error("Error en bootstrap administrativo:", error);
    return NextResponse.json({ message: "No se pudo crear el administrador." }, { status: 500 });
  }
}
