import mongoose from "mongoose";

const ReservaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  tour_title: { type: String, required: true },
  tipo: { type: String, enum: ['ticket', 'tour'], required: true },
  estado: { type: String, default: 'pendiente' }, // pendiente, confirmado, rechazado
  fecha: { type: Date, default: Date.now }
});

export default mongoose.models.Reserva || mongoose.model("Reserva", ReservaSchema);