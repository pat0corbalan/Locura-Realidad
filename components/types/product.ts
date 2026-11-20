
export type ProductStockMode = "legacy" | "simple" | "sizes" | "variants";

export interface SizeStock {
  size: string;
  stockQuantity: number;
  minStock: number;
}

export interface ProductVariant {
  label: string;
  group?: string;
  price?: number;
  inStock: boolean;
  note?: string;
  image?: string;

  // Inventario individual de la variante
  stockQuantity?: number | null;
  minStock?: number;
}

export interface Product {
  _id?: string;

  name: string;
  description: string;

  price: number;
  originalPrice: number;
  costPrice: number;

  image: string | null;
  images?: string[];

  category: string;
  rating: number;
  inStock: boolean;

  // Opciones del producto
  sizes: string[];
  variants?: ProductVariant[];

  groupLabel?: string;
  optionLabel?: string;

  // Configuración de inventario
  stockMode?: ProductStockMode;

  // Stock general
  stockQuantity?: number | null;
  minStock?: number;

  // Stock por talle
  sizeStock?: SizeStock[];

  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product?: Product | null;
}
