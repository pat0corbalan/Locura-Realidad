
import { connectDB } from "@/lib/mongodb";
import Reserva from "@/models/Reserva";
import Ticket from "@/models/Ticket";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

export async function PATCH(req, { params }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de reserva inválido" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { estado } = body;

    const estadosPermitidos = ["pendiente", "confirmado", "rechazado"];

    if (!estadosPermitidos.includes(estado)) {
      return NextResponse.json(
        { error: "Estado de reserva inválido" },
        { status: 400 }
      );
    }

    const reserva = await Reserva.findById(id);

    if (!reserva) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    let ticket = null;
    let ticketCreado = false;

    // Si se confirma, primero verificamos o creamos el ticket.
    // Así evitamos dejar una reserva confirmada sin entrada.
    if (estado === "confirmado") {
      if (!reserva.tour_id) {
        return NextResponse.json(
          {
            error:
              "Esta reserva no tiene un evento asociado (tour_id). No se puede generar el ticket.",
          },
          { status: 400 }
        );
      }

      // Un ticket por reserva: evita duplicados al volver a guardar.
      ticket = await Ticket.findOne({ reservaId: reserva._id });

      if (!ticket) {
        try {
          ticket = await Ticket.create({
            reservaId: reserva._id,
            eventoId: reserva.tour_id,
            eventoTitulo: reserva.tour_title || "Evento",
            nombre: reserva.nombre || "Invitado",
            email: reserva.email || "",
            dni: reserva.dni || "No especificado",
            monto: Number(reserva.total) || 0,
            pagado: true,
            usado: false,
          });

          ticketCreado = true;
        } catch (error) {
          // Si dos solicitudes intentan confirmar al mismo tiempo,
          // el índice único de reservaId evita que se creen dos tickets.
          if (error.code === 11000) {
            ticket = await Ticket.findOne({ reservaId: reserva._id });
          } else {
            throw error;
          }
        }
      }
    }

    reserva.estado = estado;
    await reserva.save();

    // Enviamos el correo solamente cuando se acaba de crear el ticket.
    // Un error de Gmail no elimina ni invalida el ticket guardado.
    let emailEnviado = false;

    if (
      estado === "confirmado" &&
      ticketCreado &&
      reserva.email &&
      process.env.GMAIL_USER &&
      process.env.GMAIL_PASS
    ) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          },
        });

        const qrBuffer = await QRCode.toBuffer(
          ticket._id.toString(),
          {
            type: "png",
            width: 400,
            margin: 2,
            errorCorrectionLevel: "H",
          }
        );

        const nombre = escapeHTML(reserva.nombre || "Invitado");
        const evento = escapeHTML(reserva.tour_title || "Evento");
        const ticketId = ticket._id.toString();

        await transporter.sendMail({
          from: `"Locura & Realidad" <${process.env.GMAIL_USER}>`,
          to: reserva.email,
          subject: `Tu entrada está confirmada - ${evento}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:30px auto;padding:28px;background:#111;color:#fff;border-radius:16px;text-align:center;">
              <h1 style="color:#e63946;margin-bottom:8px;">¡Tu entrada está lista!</h1>
              <p style="color:#ccc;">Hola <strong>${nombre}</strong>, tu reserva para <strong>${evento}</strong> fue confirmada.</p>

              <div style="background:#fff;border-radius:12px;padding:20px;margin:24px auto;display:inline-block;">
                <img src="cid:ticketqr" alt="Código QR de tu entrada" width="220" height="220" style="display:block;" />
              </div>

              <p style="color:#ccc;font-size:13px;">Presentá este código QR al ingresar al evento.</p>
              <p style="color:#999;font-size:11px;word-break:break-all;">Ticket: ${ticketId}</p>
              <p style="color:#777;font-size:12px;margin-top:24px;">Locura & Realidad</p>
            </div>
          `,
          attachments: [
            {
              filename: "entrada-qr.png",
              content: qrBuffer,
              contentType: "image/png",
              cid: "ticketqr",
            },
          ],
        });

        emailEnviado = true;
      } catch (emailError) {
        console.error("El ticket se creó, pero no se pudo enviar el correo:", emailError);
      }
    }

    return NextResponse.json(
      {
        ...reserva.toObject(),
        ticketId: ticket?._id?.toString() || null,
        emailEnviado,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar la reserva:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar la reserva" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de reserva inválido" },
        { status: 400 }
      );
    }

    const reservaEliminada = await Reserva.findByIdAndDelete(id);

    if (!reservaEliminada) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // No eliminamos automáticamente el ticket:
    // puede haber sido emitido y utilizado como comprobante de ingreso.
    return NextResponse.json(
      { message: "Reserva eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar la reserva:", error);

    return NextResponse.json(
      { error: "No se pudo eliminar la reserva" },
      { status: 500 }
    );
  }
}
