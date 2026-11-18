import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema({
  src: { type: String, required: true },
  alt: { type: String },
});

const AlbumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    photos: [PhotoSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Album || mongoose.model("Album", AlbumSchema);
