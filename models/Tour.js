
import mongoose from "mongoose";

const TourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },

    // Se conserva como JSON string para compatibilidad
    // con los tours que ya existen en MongoDB.
    dates: {
      type: String,
      required: true,
    },

    // Se conserva String para no alterar los registros actuales.
    price: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    // ID del recurso en Cloudinary.
    // Los tours antiguos pueden no tener este campo.
    imagePublicId: {
      type: String,
      default: "",
    },

    grupo: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Tour ||
  mongoose.model("Tour", TourSchema);
