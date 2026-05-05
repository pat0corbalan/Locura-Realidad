import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  // Relación con el evento (usamos el ID del modelo Evento)
  eventoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Evento", 
    required: true 
  },
  // Guardamos el título por redundancia (útil para mostrar rápido en el scanner)
  eventoTitulo: { type: String, required: true },
  
  // Datos del comprador
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  dni: { type: String, required: true },
  whatsapp: { type: String },

  // Control de Pago
  pagado: { type: Boolean, default: false },
  metodoPago: { type: String }, // 'transferencia', 'mercadopago', etc.
  monto: { type: Number, required: true },

  // Control de Acceso (La clave del scanner)
  usado: { 
    type: Boolean, 
    default: false 
  },
  fechaIngreso: { 
    type: Date 
  },
  
  // Metadatos adicionales
  fechaCompra: { 
    type: Date, 
    default: Date.now 
  }
});

// Índice para búsquedas rápidas por ID (el que viene en el QR)
TicketSchema.index({ _id: 1 });

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);