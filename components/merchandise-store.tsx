"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
  sizes?: string[];   
  selectedSize?: string; 
}

interface MerchandiseStoreProps {
  onAddToCart: (product: Product) => void;
}

export function MerchandiseStore({ onAddToCart }: MerchandiseStoreProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({}); // Guardar talla seleccionada por producto

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    selectedCategory === "Todos" ? products : products.filter((p) => p.category === selectedCategory);

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="bg-transparent"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <Card
            key={product._id}
            className="bg-card border-border hover:border-primary/50 transition-all duration-300 group"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.originalPrice && (
                  <Badge variant="destructive" className="bg-primary text-primary-foreground">
                    OFERTA
                  </Badge>
                )}
                {!product.inStock && (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    AGOTADO
                  </Badge>
                )}
              </div>

              {/* Rating */}
              <div className="absolute top-4 right-4">
                <div className="bg-black/70 rounded-full px-2 py-1 flex items-center gap-1">
                  <Star className="h-3 w-3 text-secondary fill-secondary" />
                  <span className="text-white text-xs font-medium">{product.rating}</span>
                </div>
              </div>
            </div>

            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-card-foreground">{product.name}</CardTitle>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {product.category}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-muted-foreground text-sm">{product.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                  )}
                </div>
              </div>

              {/* Selector de talla */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSizes[product._id] === size ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedSizes((prev) => ({
                          ...prev,
                          [product._id]: size,
                        }))
                      }
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              )}

              {/* Botón de Agregar al Carrito */}
              <Button
                className="w-full"
                disabled={!product.inStock}
                onClick={() => {
                  const selectedSize = selectedSizes[product._id];

                  if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                    alert("Por favor selecciona una talla.");
                    return;
                  }

                  onAddToCart({ ...product, selectedSize });
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? "Agregar al Carrito" : "Agotado"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
