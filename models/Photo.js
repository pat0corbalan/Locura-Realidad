import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Photo || mongoose.model("Photo", photoSchema);