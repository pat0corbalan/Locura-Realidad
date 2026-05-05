import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import mongoose from "mongoose"; // Importamos mongoose para validar el ID

export async function POST(req) { // Si usas JS, quita el ': Request'
  try {
    await connectDB();
    const { ticketId } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ error: "ID de ticket no proporcionado" }, { status: 400 });
    }

    // --- EL CAMBIO IMPORTANTE ---
    // Validamos que el ID sea un formato válido de MongoDB antes de buscarlo.
    // Esto evita el error 500 si el QR tiene cualquier otra cosa escrita.
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: "FORMATO DE TICKET INVÁLIDO" }, { status: 400 });
    }

    // 1. Buscar el ticket en la base de datos
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return NextResponse.json({ error: "TICKET INEXISTENTE" }, { status: 404 });
    }

    // 2. Verificar si ya fue utilizado
    if (ticket.usado) {
      // Formateamos la fecha para que el staff sepa CUÁNDO entró
      const fecha = new Date(ticket.fechaIngreso).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return NextResponse.json(
        { 
          error: `YA INGRESÓ A LAS ${fecha}`, 
          fechaIngreso: ticket.fechaIngreso 
        }, 
        { status: 403 }
      );
    }

    // 3. Si es válido y no se usó, marcarlo como usado ahora
    ticket.usado = true;
    ticket.fechaIngreso = new Date();
    await ticket.save();

    // 4. Retornar éxito con los datos del cliente
    return NextResponse.json({
      success: true,
      ticket: {
        nombreCliente: ticket.nombre,
        eventoNombre: ticket.eventoTitulo,
      }
    });

  } catch (error) {
    console.error("Error en la validación:", error);
    return NextResponse.json({ error: "Error de servidor al validar" }, { status: 500 });
  }
}