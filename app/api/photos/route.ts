import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import {connectDB} from "@/lib/mongodb";
import Photo from "@/models/Photo"; // Asumo que tienes un modelo llamado 'Photo'

export async function POST(req: Request) {
  try {
    // 1. Conectar a la base de datos
    await connectDB();

    // 2. Obtener los datos del formulario (archivo y metadatos)
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // 3. Obtener metadatos desde el FormData
    const alt = formData.get("alt");
    const title = formData.get("title");
    const location = formData.get("location");

    // 4. Validar que todos los campos requeridos estén presentes
    if (!alt || !title || !location) {
      return NextResponse.json(
        { message: "Faltan campos requeridos: alt, title y location." },
        { status: 400 }
      );
    }

    let src = "";

    // 5. Verificar si se proporcionó un archivo para subir a Cloudinary
    if (file) {
      // Convertir archivo a buffer para Cloudinary
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Subir a Cloudinary usando stream
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "locura-realidad" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
      src = result.secure_url;
    } else {
      // Si no hay archivo, intentar obtener la URL de la imagen existente
      // Si la URL tampoco está, significa que falta la imagen.
      // Aquí se debería manejar la lógica de actualización en un endpoint PUT/PATCH.
      // Por ahora, asumimos que se está creando una foto y el archivo es obligatorio.
      return NextResponse.json(
        { message: "No se proporcionó un archivo de imagen." },
        { status: 400 }
      );
    }
    
    // 6. Crear el nuevo documento de foto con los datos completos
    const newPhoto = new Photo({
      src,
      alt,
      title,
      location,
    });

    // 7. Guardar el documento en MongoDB
    await newPhoto.save();

    // 8. Retornar la respuesta exitosa
    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error: any) {
    console.error("Error al subir la imagen:", error);
    // Devolver un error con los detalles si es un error de validación
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: "Error de validación de foto", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Error al subir la foto", error: error.message },
      { status: 500 }
    );
  }
}
