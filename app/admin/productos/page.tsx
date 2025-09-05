"use client"

import { useState } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Star, Package, AlertCircle } from "lucide-react"
import { ProductModal } from "@/components/admin/product-modal"

// Mock data for products
const mockProducts = [
  {
    id: 1,
    name: "Camiseta Vintage Rock",
    description: "Camiseta de algodón 100% con diseño vintage de bandas de rock clásico",
    price: 29.99,
    originalPrice: 39.99,
    costPrice: 15.0,
    image: "/vintage-rock-tshirt.jpg",
    category: "Ropa",
    rating: 4.5,
    inStock: true,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 2,
    name: "Mochila de Aventura",
    description: "Mochila resistente al agua perfecta para excursiones y aventuras al aire libre",
    price: 89.99,
    originalPrice: 120.0,
    costPrice: 45.0,
    image: "/adventure-backpack.jpg",
    category: "Accesorios",
    rating: 4.8,
    inStock: true,
    sizes: ["Única"],
  },
  {
    id: 3,
    name: "Gafas de Sol Polarizadas",
    description: "Gafas de sol con lentes polarizadas y protección UV400",
    price: 45.99,
    originalPrice: 65.0,
    costPrice: 22.0,
    image: "/polarized-sunglasses.jpg",
    category: "Accesorios",
    rating: 4.2,
    inStock: false,
    sizes: ["Única"],
  },
  {
    id: 4,
    name: "Sudadera Urbana",
    description: "Sudadera con capucha de estilo urbano, perfecta para el día a día",
    price: 54.99,
    originalPrice: 69.99,
    costPrice: 28.0,
    image: "/urban-hoodie.jpg",
    category: "Ropa",
    rating: 4.6,
    inStock: true,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: 5,
    name: "Botella Térmica",
    description: "Botella térmica de acero inoxidable que mantiene la temperatura por 12 horas",
    price: 24.99,
    originalPrice: 34.99,
    costPrice: 12.0,
    image: "/thermal-bottle.jpg",
    category: "Hogar",
    rating: 4.7,
    inStock: true,
    sizes: ["500ml", "750ml", "1L"],
  },
]

const categories = ["Todas", "Ropa", "Accesorios", "Hogar", "Deportes", "Tecnología"]

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [stockFilter, setStockFilter] = useState("Todos")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "Todas" || product.category === selectedCategory
    const matchesStock =
      stockFilter === "Todos" ||
      (stockFilter === "En Stock" && product.inStock) ||
      (stockFilter === "Sin Stock" && !product.inStock)

    return matchesSearch && matchesCategory && matchesStock
  })

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter((product) => product.id !== productId))
  }

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      setProducts(
        products.map((product) =>
          product.id === editingProduct.id ? { ...productData, id: editingProduct.id } : product,
        ),
      )
    } else {
      const newProduct = { ...productData, id: Date.now() }
      setProducts([...products, newProduct])
    }
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Productos</h1>
          <p className="text-muted-foreground mt-2">Administra el catálogo de productos</p>
        </div>
        <Button onClick={handleAddProduct} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground"
          />
        </div>

        <div className="flex gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 bg-input border-border">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="text-popover-foreground">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-32 bg-input border-border">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="Todos" className="text-popover-foreground">
                Todos
              </SelectItem>
              <SelectItem value="En Stock" className="text-popover-foreground">
                En Stock
              </SelectItem>
              <SelectItem value="Sin Stock" className="text-popover-foreground">
                Sin Stock
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Badge variant="secondary" className="bg-muted text-muted-foreground self-start lg:self-center">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="bg-card border-border overflow-hidden group hover:ring-2 hover:ring-accent/50 transition-all duration-200"
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEditProduct(product)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteProduct(product.id)}
                  className="bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Stock Badge */}
              <div className="absolute top-2 right-2">
                {product.inStock ? (
                  <Badge className="bg-green-600 text-white">En Stock</Badge>
                ) : (
                  <Badge variant="destructive" className="bg-destructive text-destructive-foreground">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Sin Stock
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-card-foreground text-balance leading-tight">{product.name}</h3>
                  <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                    {product.category}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {renderStars(product.rating)}
                  <span className="text-xs text-muted-foreground ml-1">({product.rating})</span>
                </div>

                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-accent">${product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Costo: ${product.costPrice}</span>
                    <span>Margen: {Math.round(((product.price - product.costPrice) / product.price) * 100)}%</span>
                  </div>
                </div>

                {/* Sizes */}
                <div className="flex flex-wrap gap-1">
                  {product.sizes.map((size) => (
                    <Badge key={size} variant="secondary" className="text-xs bg-muted text-muted-foreground">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron productos</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== "Todas" || stockFilter !== "Todos"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza agregando tu primer producto"}
          </p>
          {!searchTerm && selectedCategory === "Todas" && stockFilter === "Todos" && (
            <Button onClick={handleAddProduct} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Producto
            </Button>
          )}
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  )
}
