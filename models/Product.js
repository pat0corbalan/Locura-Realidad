import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },         // Precio de venta
    originalPrice: { type: Number },                 // Precio sin descuento (opcional)
    costPrice: { type: Number, required: true },     // 💰 Precio de costo (nuevo campo)
    image: { type: String, required: true },
    category: { type: String, required: true },
    rating: { type: Number, required: true },
    inStock: { type: Boolean, required: true },
    sizes: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
