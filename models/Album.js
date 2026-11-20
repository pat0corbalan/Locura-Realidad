
import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: "",
  },
  // Identificador del recurso almacenado en Cloudinary.
  // Es opcional para mantener compatibilidad con fotos antiguas.
  public_id: {
    type: String,
    default: null,
  },
});

const AlbumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    photos: {
      type: [PhotoSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Album ||
  mongoose.model("Album", AlbumSchema);
