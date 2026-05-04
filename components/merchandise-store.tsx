"use client";

import { useState, useEffect, useMemo, memo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Search } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { optimizeCloudinaryImage } from "@/utils/optimizeCloudinary";


// INTERFACES

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


// HOOK: useDebounce

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}


// COMPONENTE: ExpandableDescription

interface ExpandableDescriptionProps {
  description: string;
  maxChars?: number;
}

export const ExpandableDescription: React.FC<ExpandableDescriptionProps> = ({ description, maxChars = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > maxChars;
  if (!shouldTruncate) return (
    <CardDescription className="text-muted-foreground text-sm">{description}</CardDescription>
  );
  const truncated = description.slice(0, maxChars).replace(/\s+\S*$/, "").trim();
  const displayContent = isExpanded ? description : truncated + "...";
  return (
    <div className="relative">
      <CardDescription className={`text-muted-foreground text-sm transition-all duration-300 ${!isExpanded ? "max-h-12 overflow-hidden" : ""}`}>
        {displayContent}
      </CardDescription>
      {!isExpanded && <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent pointer-events-none" />}
      <Button
        variant="link"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-0 h-auto text-xs font-semibold mt-1 text-primary hover:text-primary/80"
      >
        {isExpanded ? "Ver menos" : "Ver más"}
      </Button>
    </div>
  );
};


// COMPONENTE: ProductSkeleton

const ProductSkeleton = () => (
  <CarouselItem className="md:basis-1/2 lg:basis-1/3 px-2">
    <Card className="bg-transparent border border-border shadow rounded-xl animate-pulse flex flex-col h-full justify-between p-4">
      <Skeleton className="w-full h-64 rounded-xl mb-4 bg-muted" />
      <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
      <Skeleton className="h-4 w-1/2 mb-2 bg-muted" />
      <Skeleton className="h-4 w-full mb-4 bg-muted" />
      <Skeleton className="h-6 w-1/3 mb-2 bg-muted" />
      <Skeleton className="h-10 w-full bg-muted" />
    </Card>
  </CarouselItem>
);


// COMPONENTE: ProductCard

interface ProductCardProps {
  product: Product;
  selectedSize?: string;
  onSelectSize: (size: string) => void;
  onAddToCart: (product: Product) => void;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({ product, selectedSize, onSelectSize, onAddToCart }) => {
  return (
    <CarouselItem className="md:basis-1/2 lg:basis-1/3 px-2">
      <Card className="bg-card border border-border rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group h-full flex flex-col justify-between overflow-hidden">
        <div className="relative w-full h-64 overflow-hidden rounded-t-xl">
          <Image
            src={optimizeCloudinaryImage(product.image, { width: 800, quality: "auto:good", crop: "scale", format: "auto" })}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.inStock ? (
              <Badge className="bg-green-600 text-white px-3 py-1 rounded-full shadow-md">En Stock</Badge>
            ) : (
              <Badge variant="secondary" className="bg-muted text-muted-foreground px-3 py-1 rounded-full shadow-md">AGOTADO</Badge>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <div className="bg-black/70 rounded-full px-2 py-1 flex items-center gap-1">
              <Star className="h-3 w-3 text-secondary fill-secondary" />
              <span className="text-white text-xs font-medium">{product.rating}</span>
            </div>
          </div>
        </div>

        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-lg font-semibold text-card-foreground">{product.name}</CardTitle>
          <Badge variant="outline" className="mt-1 text-xs">{product.category}</Badge>
          <ExpandableDescription description={product.description} maxChars={100} />
        </CardHeader>

        <CardContent className="px-4 pb-4 space-y-4 mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelectSize(size)}
                  className={selectedSize === size ? "bg-primary text-white" : ""}
                >
                  {size}
                </Button>
              ))}
            </div>
          )}

          <Button
            className="w-full flex items-center justify-center gap-2"
            disabled={!product.inStock}
            onClick={() => onAddToCart({ ...product, selectedSize })}
          >
            <ShoppingCart className="h-4 w-4" />
            {product.inStock ? "Agregar al Carrito" : "Agotado"}
          </Button>
        </CardContent>
      </Card>
    </CarouselItem>
  );
};

const ProductCard = memo(ProductCardComponent);


// COMPONENTE: SearchBar + CategoryFilter

interface SearchAndFilterProps {
  value: string;
  onSearchChange: (val: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = memo(
  ({ value, onSearchChange, categories, selectedCategory, onSelectCategory }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">

      {/* Buscador elegante neumorphism */}
      <div className="relative flex-1 max-w-md mx-auto md:mx-0">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={value}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl py-2 pl-10 pr-4 text-sm bg-background shadow-neumorphism placeholder:text-gray-400 focus:outline-none focus:shadow-neumorphism-focus transition-all duration-300"
          aria-label="Buscar productos"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>

      {/* Filtro de categorías elegante */}
      <div className="flex flex-wrap gap-2 justify-start md:justify-end">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            className="text-xs px-3 py-1 transition-all duration-200 hover:bg-primary/10"
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

    </div>
  )
);


// COMPONENTE: MerchandiseStore

export function MerchandiseStore({ onAddToCart }: MerchandiseStoreProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [searchInput, setSearchInput] = useState("");
  const debouncedQuery = useDebounce(searchInput, 400);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Error al obtener productos.");
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const categories = useMemo(
    () => ["Todos", ...new Set(products.map((p) => p.category))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = debouncedQuery.toLowerCase();
    return products.filter((p) => {
      const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
      const matchesQuery = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, debouncedQuery]);

  return (
    <div className="px-4 md:px-8">
      <SearchAndFilter
        value={searchInput}
        onSearchChange={setSearchInput}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
        <p className="text-sm text-muted-foreground text-center mb-4 md:hidden animate-pulse">
          Desliza para ver más productos →
        </p>

        <Carousel className="w-full cursor-grab active:cursor-grabbing">
          <CarouselContent className="-mx-2">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <ProductSkeleton key={i} />)
              : filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    selectedSize={selectedSizes[product._id]}
                    onSelectSize={(size) =>
                      setSelectedSizes((prev) => ({ ...prev, [product._id]: size }))
                    }
                    onAddToCart={onAddToCart}
                  />
                ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
