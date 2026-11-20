
import mongoose from "mongoose";

const SizeStockSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    minStock: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const VariantSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    group: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    note: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    stockQuantity: {
      type: Number,
      min: 0,
      default: null,
    },
    minStock: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    costPrice: {
      type: Number,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 5,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    sizes: {
      type: [String],
      default: [],
    },
    variants: {
      type: [VariantSchema],
      default: [],
    },
    groupLabel: {
      type: String,
      trim: true,
    },
    optionLabel: {
      type: String,
      trim: true,
    },

    // Configuración del inventario
    // "legacy" mantiene el comportamiento de productos anteriores.
    stockMode: {
      type: String,
      enum: ["legacy", "simple", "sizes", "variants"],
      default: "legacy",
    },

    // Stock general para productos simples.
    stockQuantity: {
      type: Number,
      min: 0,
      default: null,
    },

    // Cantidad mínima para alertar sobre stock bajo.
    minStock: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Stock individual para cada talle.
    sizeStock: {
      type: [SizeStockSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
