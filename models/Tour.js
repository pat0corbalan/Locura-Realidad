import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    destination: { type: String, required: true },
    dates: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Tour || mongoose.model("Tour", tourSchema);