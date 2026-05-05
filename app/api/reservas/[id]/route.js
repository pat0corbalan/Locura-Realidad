import { connectDB } from "@/lib/mongodb";
import Reserva from "@/models/Reserva";
import Ticket from "@/models/Ticket"; // Importado correctamente
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

    // SI EL ESTADO ES CONFIRMADO, GENERAMOS EL TICKET
    if (estado === "confirmado") {
      try {
        // 1. CREAR EL TICKET EN LA BASE DE DATOS
        // Esto permite que el scanner funcione aunque no se envíe el mail
        const nuevoTicket = await Ticket.create({
          eventoId: reservaActualizada.tour_id || id,
          eventoTitulo: reservaActualizada.tour_title,
          nombre: reservaActualizada.nombre,
          email: reservaActualizada.email,
          dni: reservaActualizada.dni || "No especificado",
          monto: reservaActualizada.total || 0,
          pagado: true,
          usado: false,
        });

        // 2. GENERAR EL QR (Lo necesitamos para el mail o para mostrarlo)
        const qrCodeDataUrl = await QRCode.toDataURL(nuevoTicket._id.toString());

        // 3. INTENTAR ENVIAR MAIL SOLO SI HAY CREDENCIALES
        if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
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
            subject: `✅ Ticket Confirmado - ${reservaActualizada.tour_title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px; text-align: center;">
                <h2 style="color: #16a34a;">¡Tu entrada está lista!</h2>
                <p style="text-align: left;">Hola <strong>${reservaActualizada.nombre}</strong>,</p>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <img src="${qrCodeDataUrl}" alt="QR" style="width: 200px; height: 200px;" />
                  <p style="font-size: 11px; color: #9ca3af;">ID Ticket: ${nuevoTicket._id}</p>
                </div>
              </div>
            `,
          };

          await transporter.sendMail(mailOptions);
        } else {
          console.log("⚠️ Credenciales de Gmail no configuradas. El ticket se creó pero no se envió mail.");
          console.log("ID para el QR de WhatsApp:", nuevoTicket._id.toString());
        }

      } catch (error) {
        // Logueamos el error pero no cortamos la ejecución para que la reserva quede como confirmada
        console.error("Error en el proceso de Ticket/Mail:", error);
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