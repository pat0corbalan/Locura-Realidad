"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton"; 
import {optimizeCloudinaryImage} from "@/utils/optimizeCloudinary"
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
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Error al obtener productos.");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const categories = ["Todos", ...new Set(products.map((p) => p.category))];
  const filteredProducts =
    selectedCategory === "Todos"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div>
      {/* Filtro de Categorías */}
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

      {/* Carrusel de Productos */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
        <p className="text-sm text-muted-foreground text-center mb-4 md:hidden animate-pulse">
          Desliza para ver más productos →
        </p>

        <Carousel className="w-full cursor-grab active:cursor-grabbing">
          <CarouselContent className="-mx-2">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <CarouselItem
                    key={`skeleton-${i}`}
                    className="md:basis-1/2 lg:basis-1/3 px-2"
                  >
                    <Card className="bg-transparent p-4 border border-border shadow rounded-md animate-pulse flex flex-col h-full justify-between">
                      <div className="relative overflow-hidden rounded-md mb-4">
                        <Skeleton className="w-full h-64 rounded-md bg-muted" />
                      </div>

                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
                        <Skeleton className="h-4 w-1/2 mb-2 bg-muted" />
                        <Skeleton className="h-4 w-full bg-muted" />
                      </CardHeader>

                      <CardContent className="space-y-3 mt-auto">
                        <Skeleton className="h-6 w-1/3 bg-muted" />
                        <Skeleton className="h-10 w-full bg-muted" />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))
              : filteredProducts.map((product) => (
                  <CarouselItem
                    key={product._id}
                    className="md:basis-1/2 lg:basis-1/3 px-2"
                  >
                    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 group h-full flex flex-col justify-between">
                      {/* Imagen + Etiquetas */}
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          loading="lazy"
                          src={optimizeCloudinaryImage(product.image, {
                            width: 800,         // o el ancho real del contenedor
                            quality: "auto:good",
                            crop: "scale",
                            format: "auto",     
                          })}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {product.originalPrice && (
                            <Badge className="bg-green-600 text-white">
                              En Stock
                            </Badge>
                          )}
                          {!product.inStock && (
                            <Badge variant="secondary" className="bg-muted text-muted-foreground">
                              AGOTADO
                            </Badge>
                          )}
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="bg-black/70 rounded-full px-2 py-1 flex items-center gap-1">
                            <Star className="h-3 w-3 text-secondary fill-secondary" />
                            <span className="text-white text-xs font-medium">{product.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Info del producto */}
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-card-foreground">
                              {product.name}
                            </CardTitle>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {product.category}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="text-muted-foreground text-sm">
                          {product.description}
                        </CardDescription>
                      </CardHeader>

                      {/* Precios + Tallas + Botón */}
                      <CardContent className="space-y-4 mt-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-foreground">
                            ${product.price}
                          </span>
                          {/* {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.originalPrice}
                            </span>
                          )} */}
                        </div>

                        {/* Tallas */}
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                              <Button
                                key={size}
                                variant={
                                  selectedSizes[product._id] === size
                                    ? "default"
                                    : "outline"
                                }
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

                        {/* Botón Agregar al carrito */}
                        <Button
                          className="w-full"
                          disabled={!product.inStock}
                          onClick={() => {
                            const selectedSize = selectedSizes[product._id];

                            if (product.sizes?.length && !selectedSize) {
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
                  </CarouselItem>
                ))}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
