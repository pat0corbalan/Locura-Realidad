
import mongoose from "mongoose"

const EventoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    lugar: {
      type: String,
      required: true,
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    fecha: {
      type: Date,
      required: true,
    },
    descripcion: {
      type: String,
      default: "",
    },
    imagenUrl: {
      type: String,
      default: "",
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Evento ||
  mongoose.model("Evento", EventoSchema)
