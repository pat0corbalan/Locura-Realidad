export interface Tour {
  id: string
  title: string
  description: string
  price: number
  duration: string
  location: string
  image_url?: string
  max_participants: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  stock_quantity: number
  rating: number
  is_on_sale: boolean
  sale_price?: number
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id?: string
  tour_id: string
  full_name: string
  email: string
  phone: string
  participants: number
  total_amount: number
  booking_date: string
  status: "pending" | "confirmed" | "cancelled"
  created_at: string
  updated_at: string
  tours?: Tour
}

export interface Order {
  id: string
  user_id?: string
  customer_email: string
  customer_name: string
  customer_phone?: string
  total_amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shipping_address?: any
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  products?: Product
}

export interface CartItem {
  productId: string
  name: string
  price: number
  salePrice?: number
  isOnSale: boolean
  quantity: number
  image: string
}
