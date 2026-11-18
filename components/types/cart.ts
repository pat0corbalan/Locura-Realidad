// types/product.ts
export interface Product {
  _id: string; // string porque viene de la API
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

// types/cart.ts
export interface CartItem {
  id: string; // corresponde a _id del producto
  name: string;
  image: string | null;
  price: number;
  category: string;
  quantity: number;
}
