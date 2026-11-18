// app/admin/productos/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Star, Package, AlertCircle } from "lucide-react";
import { ProductModal } from "@/components/admin/product-modal";
import { toast } from "sonner";
import { Product } from "@/components/types/product"; // Importar la interfaz compartida

const categories = ["Todas", "Ropa", "Accesorios", "Hogar", "Deportes", "Tecnología"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [stockFilter, setStockFilter] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      } else {
        toast.error(data.error || "Error al cargar los productos");
      }
    } catch (error) {
      toast.error("Error al cargar los productos");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "Todas" || product.category === selectedCategory;
    const matchesStock =
      stockFilter === "Todos" ||
      (stockFilter === "En Stock" && product.inStock) ||
      (stockFilter === "Sin Stock" && !product.inStock);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(products.filter((product) => product._id !== productId));
        toast.success("Producto eliminado");
      } else {
        toast.error(data.error || "Error al eliminar el producto");
      }
    } catch (error) {
      toast.error("Error al eliminar el producto");
    }
  };

  const handleSaveProduct = (productData: Product) => {
    setProducts((prev) =>
      editingProduct
        ? prev.map((product) =>
            product._id === productData._id ? { ...productData } : product,
          )
        : [...prev, { ...productData }],
    );
    toast.success(editingProduct ? "Producto actualizado" : "Producto creado");
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="space-y-6 p-4">
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <Card
            key={product._id}
            className="bg-card border-border overflow-hidden group hover:ring-2 hover:ring-accent/50 transition-all duration-200"
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
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
                  onClick={() => handleDeleteProduct(product._id!)}
                  className="bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

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

                <div className="flex items-center gap-1">
                  {renderStars(product.rating)}
                  <span className="text-xs text-muted-foreground ml-1">({product.rating})</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-accent">${product.price.toFixed(2)}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Costo: ${product.costPrice.toFixed(2)}</span>
                    <span>Margen: {Math.round(((product.price - product.costPrice) / product.price) * 100)}%</span>
                  </div>
                </div>

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

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  );
}