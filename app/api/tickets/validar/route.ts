import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";


export async function POST(req: Request) {
  try {
    await connectDB();
    const { ticketId } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ error: "ID de ticket no proporcionado" }, { status: 400 });
    }

    // 1. Buscar el ticket en la base de datos
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return NextResponse.json({ error: "TICKET INEXISTENTE" }, { status: 404 });
    }

    // 2. Verificar si ya fue utilizado
    if (ticket.usado) {
      return NextResponse.json(
        { 
          error: "TICKET YA UTILIZADO", 
          fechaIngreso: ticket.fechaIngreso 
        }, 
        { status: 403 }
      );
    }

    // 3. Si es válido y no se usó, marcarlo como usado ahora
    ticket.usado = true;
    ticket.fechaIngreso = new Date();
    await ticket.save();

    // 4. Retornar éxito con los datos del cliente para que el staff los vea
    return NextResponse.json({
      success: true,
      ticket: {
        nombreCliente: ticket.nombre,
        eventoNombre: ticket.eventoTitulo,
      }
    });

  } catch (error) {
    console.error("Error en la validación:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}