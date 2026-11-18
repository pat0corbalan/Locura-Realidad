// models/Product.js
// OJO: no vi tu modelo actual. Si tiene campos o opciones extra (timestamps,
// índices, etc.), combiná este archivo con el tuyo en lugar de reemplazarlo.

import mongoose from "mongoose";

// Una opción comprable: talle, presentación, modelo...
const VariantSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    group: { type: String, trim: true }, // ej. el modelo de mate
    price: { type: Number, min: 0 }, // si falta, se usa el precio base
    inStock: { type: Boolean, default: true },
    note: { type: String, trim: true }, // ej. "2 en stock: negro y marrón"
    image: { type: String }, // URL de Cloudinary
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 }, // precio base / más bajo
    originalPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 }, // NUNCA se expone en el GET público
    image: { type: String, required: true },
    imagePublicId: { type: String },
    images: { type: [String], default: [] }, // fotos extra
    category: { type: String, required: true, trim: true },
    rating: { type: Number, min: 0, max: 5, default: 5 },
    inStock: { type: Boolean, default: true },
    sizes: { type: [String], default: [] }, // remeras: ["S", "M", "L"]
    variants: { type: [VariantSchema], default: [] },
    groupLabel: { type: String, trim: true }, // título del 1.er selector ("Modelo")
    optionLabel: { type: String, trim: true }, // título del 2.º selector ("Presentación")
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema); 