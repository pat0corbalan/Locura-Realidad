import personal from "../../../models/personal";
import { connectDB } from "../../../utils/mongoose";
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import photo from "../../../models/Photo";
import tour from "../../../models/Tour";
import product from "../../../models/Product";
import fs from 'fs';
import path from 'path';
 export async function POST(req) {

   await connectDB();
   const data = await req.json();

   try {
     const nuevo = await personal.create(data);
     return Response.json(nuevo);
   } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
 }
   }


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

 export async function POST(req) {
   await connectDB();

   const form = await req.formData();

   const src = form.get('src');
   const alt = form.get('alt');
   const title = form.get('title');
   const location = form.get('location');

   let fotoUrl = '';

   if (src && src.name) {
     const bytes = await src.arrayBuffer();
     const buffer = Buffer.from(bytes);

     const folder = `personal/${title}`;  //Carpeta Personalizada

     try {
       const result = await new Promise((resolve, reject) => {
         cloudinary.uploader.upload_stream(
           { folder },
           (err, result) => {
             if (err) reject(err);
             else resolve(result);
           }
         ).end(buffer);
       });

       fotoUrl = result.secure_url;
     } catch (err) {
       return new Response(JSON.stringify({ error: 'Error al subir imagen a Cloudinary', detalle: err.message }), { status: 500 });
     }
   }

   try {
     const nuevo = await personal.create({
       nombre,
       apellido,
       dni,
       legajo,
       jerarquia,
       fecha_nacimiento,
       domicilio,
       telefono,
       email,
       fecha_ingreso,
       genero,
       fotoUrl
     });

     return Response.json(nuevo);
   } catch (error) {
     return new Response(JSON.stringify({ error: error.message }), { status: 400 });
   }
 }



export async function GET() {
  await connectDB();

  try {
    const personalList = await personal.find({});

    if (!personalList || personalList.length === 0) {
      return NextResponse.json({ error: "No se encontró personal" }, { status: 404 });
    }

    const personalConDetalles = await Promise.all(
      personalList.map(async (persona) => {
        const [InfoLaboral, RegistroMedico, licencias, sanciones] = await Promise.all([
          infoLaboral.find({ personal_id: persona._id }),
          registroMedico.find({ personal_id: persona._id }),
          licencia.find({ personal_id: persona._id }),
          sancion.find({ personal_id: persona._id }),
        ]);

        return {
          ...persona.toObject(),
          InfoLaboral,
          RegistroMedico,
          licencias,
          sanciones,
        };
      })
    );

    return NextResponse.json(personalConDetalles);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}