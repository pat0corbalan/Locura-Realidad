import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import Admin from "@/models/User"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  try {
    // 1. Leer datos del request
    const { usuario, password } = await req.json()
    console.log('Login:', { usuario, password });

    // 2. Validar campos
    if (!usuario || !password) {
      return NextResponse.json(
        { message: "Usuario y contraseña son requeridos." },
        { status: 400 }
      )
    }

    // 3. Conectar a la base de datos
    await connectDB()

    // 4. Buscar usuario en la base de datos
    const admin = await Admin.findOne({ usuario })
    if (!admin) {
      return NextResponse.json(
        { message: "Usuario no encontrado." },
        { status: 404 }
      )
    }

    // 5. Comparar contraseñas (hash vs texto plano)
    const passwordMatch = await bcrypt.compare(password, admin.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Contraseña incorrecta." },
        { status: 401 }
      )
    }

    // 6. Verificar que el secreto esté definido
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error("JWT_SECRET no está definido en variables de entorno.")
      return NextResponse.json(
        { message: "Error interno de configuración." },
        { status: 500 }
      )
    }

    // 7. Crear token JWT
    const token = jwt.sign(
      {
        sub: admin._id.toString(),
        role: admin.role,
      },
      secret,
      { expiresIn: "1h" }
    )

    // 8. Crear respuesta y setear cookie HTTP-only
    const response = NextResponse.json(
      { message: "Login exitoso." },
      { status: 200 }
    )

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hora
      sameSite: "lax",
    })

    return response

  } catch (error) {
    console.error("Error en login admin:", error)
    return NextResponse.json(
      { message: "Error en el servidor." },
      { status: 500 }
    )
  }
}
