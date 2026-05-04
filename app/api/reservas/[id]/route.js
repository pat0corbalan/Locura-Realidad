import { connectDB } from "@/lib/mongodb";
import Reserva from "@/models/Reserva";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import QRCode from "qrcode";

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { estado } = body;

    const reservaActualizada = await Reserva.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    );

    if (!reservaActualizada) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    // SI EL ESTADO ES CONFIRMADO, ENVIAMOS EL QR POR GMAIL
    if (estado === "confirmado") {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(id);

        // Configuramos el transporte de Gmail
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          },
        });

        const mailOptions = {
          from: `"Locura y Realidad" <${process.env.GMAIL_USER}>`,
          to: reservaActualizada.email,
          subject: `✅ Reserva Confirmada - ${reservaActualizada.tour_title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px; text-align: center;">
              <h2 style="color: #16a34a;">¡Pago Verificado!</h2>
              <p style="text-align: left;">Hola <strong>${reservaActualizada.nombre}</strong>,</p>
              <p style="text-align: left;">Tu lugar para <strong>${reservaActualizada.tour_title}</strong> ha sido confirmado exitosamente.</p>
              
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="font-weight: bold; margin-bottom: 10px; color: #374151;">TU ENTRADA DIGITAL</p>
                <img src="${qrCodeDataUrl}" alt="QR" style="width: 180px; height: 180px; border: 5px solid white;" />
                <p style="font-size: 10px; color: #9ca3af; margin-top: 10px;">Referencia: ${id}</p>
              </div>

              <p style="font-size: 13px; color: #4b5563; text-align: left;">
                <strong>Importante:</strong> Presenta este código QR al subir al transporte o ingresar al evento.
              </p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 11px; color: #9ca3af;">Locura y Realidad - Santiago del Estero</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      } catch (mailError) {
        console.error("Error enviando mail con Gmail:", mailError);
      }
    }

    return NextResponse.json(reservaActualizada, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const reservaEliminada = await Reserva.findByIdAndDelete(id);
    if (!reservaEliminada) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ message: "Eliminado con éxito" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}