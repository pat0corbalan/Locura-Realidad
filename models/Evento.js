import mongoose from "mongoose";

const EventoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  lugar: { type: String, required: true },
  precio: { type: Number, required: true },
  fecha: { type: Date, required: true },
  descripcion: String,
  imagenUrl: String, // Por si quieres subir un poster
  activo: { type: Boolean, default: true }
});

export default mongoose.models.Evento || mongoose.model("Evento", EventoSchema);