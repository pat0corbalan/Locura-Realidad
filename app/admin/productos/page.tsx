
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Edit,
  Filter,
  Loader2,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { ProductModal } from "@/components/admin/product-modal";
import type { Product } from "@/components/types/product";

const categories = [
  "Todas",
  "Ropa",
  "Accesorios",
  "Hogar",
  "Deportes",
  "Tecnología",
];

type StockFilter = "all" | "available" | "unavailable";

const formatPrice = (value: number | undefined | null) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/products", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los productos");
      }

      const data = await response.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando productos:", error);
      toast.error("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name?.toLowerCase().includes(normalizedSearch) ||
        product.description?.toLowerCase().includes(normalizedSearch) ||
        product.category?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        category === "Todas" || product.category === category;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "available" && product.inStock) ||
        (stockFilter === "unavailable" && !product.inStock);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, category, stockFilter]);

  const stats = useMemo(() => {
    const available = products.filter((product) => product.inStock).length;
    const unavailable = products.length - available;

    const totalValue = products.reduce(
      (total, product) => total + (Number(product.price) || 0),
      0
    );

    const averagePrice =
      products.length > 0 ? totalValue / products.length : 0;

    return {
      total: products.length,
      available,
      unavailable,
      averagePrice,
    };
  }, [products]);

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // El modal ya guarda en la API.
  // Acá solamente sincronizamos el listado local.
  const handleSaveProduct = (savedProduct: Product) => {
    setProducts((current) => {
      const existingIndex = current.findIndex(
        (product) => product._id === savedProduct._id
      );

      if (existingIndex === -1) {
        return [savedProduct, ...current];
      }

      return current.map((product) =>
        product._id === savedProduct._id ? savedProduct : product
      );
    });

    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = async (product: Product) => {
    if (!product._id) {
      toast.error("No se pudo identificar el producto");
      return;
    }

    const confirmed = window.confirm(
      `¿Estás seguro de que querés eliminar "${product.name}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(product._id);

      const response = await fetch(`/api/products/${product._id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo eliminar el producto");
      }

      setProducts((current) =>
        current.filter((item) => item._id !== product._id)
      );

      toast.success("Producto eliminado correctamente");
    } catch (error) {
      console.error("Error eliminando producto:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al eliminar el producto"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("Todas");
    setStockFilter("all");
  };

  const hasActiveFilters =
    search.trim() !== "" || category !== "Todas" || stockFilter !== "all";

  return (
    <div className="min-h-screen space-y-8 bg-[#080808] p-4 text-white sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
              Administración
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Productos
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            Administrá tu catálogo, controlá el stock y mantené actualizada
            toda la información de tu tienda.
          </p>
        </div>

        <Button
          onClick={handleCreate}
          className="h-12 gap-2 rounded-xl bg-red-600 px-6 font-semibold text-white shadow-lg shadow-red-950/30 transition-all hover:bg-red-500"
        >
          <Plus className="h-5 w-5" />
          Nuevo producto
        </Button>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="overflow-hidden rounded-2xl border-white/[0.07] bg-[#111111]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06]">
                <Package className="h-5 w-5 text-zinc-300" />
              </div>
              <span className="text-xs font-medium text-zinc-500">
                Catálogo
              </span>
            </div>

            <div className="mt-5">
              <p className="text-3xl font-bold tabular-nums">
                {stats.total}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Productos registrados
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-white/[0.07] bg-[#111111]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                <ArrowUpRight className="h-5 w-5 text-emerald-400" />
              </div>
              <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
                Disponible
              </Badge>
            </div>

            <div className="mt-5">
              <p className="text-3xl font-bold tabular-nums">
                {stats.available}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Productos disponibles
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-white/[0.07] bg-[#111111]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                <ArrowDownRight className="h-5 w-5 text-red-400" />
              </div>
              <Badge className="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/10">
                Sin stock
              </Badge>
            </div>

            <div className="mt-5">
              <p className="text-3xl font-bold tabular-nums">
                {stats.unavailable}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Productos no disponibles
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-white/[0.07] bg-[#111111]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-zinc-500">
                Promedio
              </span>
            </div>

            <div className="mt-5">
              <p className="text-2xl font-bold tabular-nums">
                {formatPrice(stats.averagePrice)}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Precio promedio del catálogo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <Card className="rounded-2xl border-white/[0.07] bg-[#111111]">
        <CardContent className="space-y-5 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, descripción o categoría..."
                className="h-12 rounded-xl border-white/10 bg-[#090909] pl-11 text-white placeholder:text-zinc-600 focus-visible:ring-red-500/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 transition hover:text-white"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="hidden h-4 w-4 text-zinc-500 sm:block" />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#090909] px-3 text-sm text-zinc-200 outline-none transition focus:border-red-500/50 sm:min-w-[170px]"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === "Todas" ? "Todas las categorías" : item}
                  </option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(event) =>
                  setStockFilter(event.target.value as StockFilter)
                }
                className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#090909] px-3 text-sm text-zinc-200 outline-none transition focus:border-red-500/50 sm:min-w-[160px]"
              >
                <option value="all">Todo el stock</option>
                <option value="available">Disponible</option>
                <option value="unavailable">Sin stock</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
            <p className="text-sm text-zinc-500">
              Mostrando{" "}
              <span className="font-semibold text-white">
                {filteredProducts.length}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-white">
                {products.length}
              </span>{" "}
              productos
            </p>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-red-400 transition hover:text-red-300"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PRODUCT LIST */}
      <div>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Catálogo de productos</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Gestioná cada artículo de tu tienda.
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-zinc-500 sm:flex">
            <ShoppingBag className="h-4 w-4" />
            {filteredProducts.length} resultados
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#111111]">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-red-500" />
            <p className="text-sm text-zinc-400">
              Cargando productos...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#111111] px-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
              {products.length === 0 ? (
                <Package className="h-8 w-8 text-zinc-500" />
              ) : (
                <Search className="h-8 w-8 text-zinc-500" />
              )}
            </div>

            <h3 className="text-lg font-semibold">
              {products.length === 0
                ? "Todavía no hay productos"
                : "No encontramos resultados"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
              {products.length === 0
                ? "Comenzá agregando tu primer producto para construir el catálogo de tu tienda."
                : "Probá cambiar la búsqueda o los filtros para encontrar lo que estás buscando."}
            </p>

            {products.length === 0 ? (
              <Button
                onClick={handleCreate}
                className="mt-6 gap-2 rounded-xl bg-red-600 text-white hover:bg-red-500"
              >
                <Plus className="h-4 w-4" />
                Crear primer producto
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-6 rounded-xl border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.07] hover:text-white"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const margin =
                Number(product.price) - Number(product.costPrice);

              const marginPercentage =
                Number(product.price) > 0
                  ? (margin / Number(product.price)) * 100
                  : 0;

              const isDeleting = deletingId === product._id;

              return (
                <Card
                  key={product._id || product.name}
                  className="group overflow-hidden rounded-2xl border-white/[0.07] bg-[#111111] transition-all duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:shadow-xl hover:shadow-black/30"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#191919]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-12 w-12 text-zinc-700" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3">
                      <Badge
                        className={
                          product.inStock
                            ? "border border-emerald-500/20 bg-emerald-500/15 text-emerald-400 backdrop-blur-md hover:bg-emerald-500/15"
                            : "border border-red-500/20 bg-red-500/15 text-red-400 backdrop-blur-md hover:bg-red-500/15"
                        }
                      >
                        {product.inStock ? "Disponible" : "Sin stock"}
                      </Badge>
                    </div>

                    <div className="absolute right-3 top-3">
                      <Badge className="border border-white/10 bg-black/60 text-zinc-200 backdrop-blur-md hover:bg-black/60">
                        {product.category}
                      </Badge>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                          Precio de venta
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      {Number(product.originalPrice) > Number(product.price) && (
                        <p className="pb-1 text-sm text-zinc-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <CardContent className="space-y-4 p-4">
                    <div>
                      <h3 className="line-clamp-1 text-base font-bold text-white">
                        {product.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 min-h-[40px] text-xs leading-relaxed text-zinc-500">
                        {product.description || "Sin descripción"}
                      </p>
                    </div>

                    {/* RATING */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-3.5 w-3.5 ${
                            index < Math.round(Number(product.rating) || 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-700"
                          }`}
                        />
                      ))}

                      <span className="ml-1 text-xs text-zinc-500">
                        {Number(product.rating || 0).toFixed(1)} / 5
                      </span>
                    </div>

                    {/* COSTS */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                          Costo
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-300">
                          {formatPrice(product.costPrice)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-3">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-500/70">
                          Ganancia
                        </p>
                        <p
                          className={`mt-1 text-sm font-semibold ${
                            margin >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {formatPrice(margin)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">
                        Margen estimado
                      </span>
                      <span className="font-semibold text-zinc-300">
                        {marginPercentage.toFixed(1)}%
                      </span>
                    </div>

                    {/* SIZES */}
                    <div className="border-t border-white/[0.06] pt-3">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        Talles / opciones
                      </p>

                      <div className="flex min-h-7 flex-wrap gap-1.5">
                        {product.sizes?.length ? (
                          product.sizes.map((size, index) => (
                            <span
                              key={`${size}-${index}`}
                              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-zinc-300"
                            >
                              {size}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-600">
                            Sin opciones
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3">
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        disabled={isDeleting}
                        className="h-10 gap-2 rounded-xl border-white/10 bg-white/[0.03] text-zinc-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleDelete(product)}
                        disabled={isDeleting}
                        className="h-10 gap-2 rounded-xl border-red-500/20 bg-red-500/[0.04] text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        {isDeleting ? "Eliminando" : "Eliminar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isModalOpen) return;
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        product={selectedProduct}
      />
    </div>
  );
}
