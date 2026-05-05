import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import mongoose from "mongoose";

export async function POST(req) { 
  try {
    await connectDB();
    const { ticketId } = await req.json(); // Aquí recibimos el ID que viene del QR (ID de reserva)

    if (!ticketId) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
    }

    // Validamos formato de MongoDB
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: "FORMATO INVÁLIDO" }, { status: 400 });
    }

    // 1. Buscamos el ticket donde el campo 'eventoId' coincida con el ID del QR
    // Usamos findOne porque buscamos por un campo que no es el _id
    const ticket = await Ticket.findOne({ eventoId: ticketId });

    if (!ticket) {
      return NextResponse.json({ error: "TICKET NO ENCONTRADO EN SISTEMA" }, { status: 404 });
    }

    // 2. Verificar si ya fue utilizado
    if (ticket.usado) {
      const fecha = new Date(ticket.fechaIngreso).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return NextResponse.json(
        { 
          error: `ACCESO DENEGADO: YA INGRESÓ A LAS ${fecha}`, 
          fechaIngreso: ticket.fechaIngreso 
        }, 
        { status: 403 }
      );
    }

    // 3. Marcar como usado
    ticket.usado = true;
    ticket.fechaIngreso = new Date();
    await ticket.save();

    // 4. Retornar éxito
    return NextResponse.json({
      success: true,
      ticket: {
        nombreCliente: ticket.nombre,
        eventoNombre: ticket.eventoTitulo,
      }
    });

  } catch (error) {
    console.error("Error en la validación:", error);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}