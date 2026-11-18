// types/product.ts
export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  costPrice: number;
  image: string | null;
  category: string;
  rating: number;
  inStock: boolean;
  sizes: string[];
  createdAt?: Date;
}

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product?: Product | null;
}