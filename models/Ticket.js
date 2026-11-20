
import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    // Relación con la reserva: un ticket por reserva.
    reservaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reserva",
      unique: true,
      sparse: true,
    },

    // Relación con el evento.
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evento",
      required: true,
      index: true,
    },

    // Información del evento.
    eventoTitulo: {
      type: String,
      required: true,
      trim: true,
    },

    // Datos del comprador.
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    dni: {
      type: String,
      required: true,
      trim: true,
    },

    whatsapp: {
      type: String,
      default: "",
      trim: true,
    },

    // Control de pago.
    pagado: {
      type: Boolean,
      default: false,
    },

    metodoPago: {
      type: String,
      default: "",
      trim: true,
    },

    monto: {
      type: Number,
      required: true,
      min: 0,
    },

    // Control de acceso mediante QR.
    usado: {
      type: Boolean,
      default: false,
      index: true,
    },

    fechaIngreso: {
      type: Date,
      default: null,
    },

    // Metadatos.
    fechaCompra: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas y validación.
TicketSchema.index({ reservaId: 1 }, { unique: true, sparse: true });
TicketSchema.index({ eventoId: 1, usado: 1 });
TicketSchema.index({ email: 1 });

// Evita recompilar el modelo durante el hot reload de Next.js.
export default mongoose.models.Ticket ||
  mongoose.model("Ticket", TicketSchema);
