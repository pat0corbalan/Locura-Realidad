import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Admin from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const { usuario, password, role } = await req.json()

    if (!usuario || !password) {
      return NextResponse.json(
        { message: "Usuario y contraseña son requeridos." },
        { status: 400 }
      )
    }

    await connectDB()

    // Verificar si el usuario ya existe
    const existingUser = await Admin.findOne({ usuario })
    if (existingUser) {
      return NextResponse.json(
        { message: "El usuario ya existe." },
        { status: 409 }
      )
    }

    // ❌ No hashear aquí → lo hará el modelo automáticamente
    const newUser = new Admin({
      usuario,
      password, // ← texto plano, será hasheado por el middleware
      role: role || "admin",
    })

    await newUser.save()

    return NextResponse.json({ message: "Usuario creado con éxito." }, { status: 201 })

  } catch (error) {
    console.error("Error creando usuario admin:", error)
    return NextResponse.json(
      { message: "Error en el servidor." },
      { status: 500 }
    )
  }
}
