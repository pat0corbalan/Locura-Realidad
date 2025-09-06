// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  costPrice: { type: Number, required: true },
  image: { type: String, required: true },
  imagePublicId: { type: String }, // Nuevo campo
  category: { type: String, required: true },
  rating: { type: Number, default: 5 },
  inStock: { type: Boolean, default: true },
  sizes: [{ type: String }],
});

export default mongoose.models.Product || mongoose.model("Product", productSchema);