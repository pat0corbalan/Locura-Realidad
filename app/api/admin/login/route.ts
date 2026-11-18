import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/User";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE,
  createAdminToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const usuario = typeof body?.usuario === "string" ? body.usuario.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!usuario || !password || usuario.length > 120 || password.length > 200) {
      return NextResponse.json({ message: "Usuario o contraseña incorrectos." }, { status: 401 });
    }

    await connectDB();
    const admin = await Admin.findOne({ usuario }).select("+password");

    // Mensaje genérico para no revelar si el usuario existe.
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ message: "Usuario o contraseña incorrectos." }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: "Usuario o contraseña incorrectos." }, { status: 401 });
    }

    const token = createAdminToken(admin);
    const response = NextResponse.json({ message: "Sesión iniciada correctamente." }, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Error en login administrativo:", error);
    return NextResponse.json({ message: "No se pudo iniciar sesión." }, { status: 500 });
  }
}
