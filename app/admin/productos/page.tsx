
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
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
  Ruler,
  Layers,
  Warehouse,
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

type StockFilter = "all" | "available" | "unavailable" | "low";

type StockInfo = {
  mode: "legacy" | "simple" | "sizes" | "variants";
  quantity: number | null;
  lowStock: boolean;
  available: boolean;
  label: string;
  detail: string;
};

const formatPrice = (value: number | undefined | null) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const getStockInfo = (product: Product): StockInfo => {
  const mode = product.stockMode || "legacy";

  if (mode === "simple") {
    const quantity = Math.max(0, Number(product.stockQuantity) || 0);
    const minimum = Math.max(0, Number(product.minStock) || 0);

    return {
      mode,
      quantity,
      available: quantity > 0,
      lowStock: quantity > 0 && minimum > 0 && quantity <= minimum,
      label: "Stock general",
      detail: `${quantity} unidades`,
    };
  }

  if (mode === "sizes") {
    const items = Array.isArray(product.sizeStock)
      ? product.sizeStock
      : [];

    const quantity = items.reduce(
      (total, item) => total + Math.max(0, Number(item.stockQuantity) || 0),
      0
    );

    const lowStock = items.some((item) => {
      const stock = Math.max(0, Number(item.stockQuantity) || 0);
      const minimum = Math.max(0, Number(item.minStock) || 0);

      return stock > 0 && minimum > 0 && stock <= minimum;
    });

    return {
      mode,
      quantity,
      available: quantity > 0,
      lowStock,
      label: "Por talle",
      detail: `${items.length} talles · ${quantity} unidades`,
    };
  }

  if (mode === "variants") {
    const items = Array.isArray(product.variants)
      ? product.variants
      : [];

    const quantity = items.reduce(
      (total, item) =>
        total + Math.max(0, Number(item.stockQuantity) || 0),
      0
    );

    const lowStock = items.some((item) => {
      const stock = Math.max(0, Number(item.stockQuantity) || 0);
      const minimum = Math.max(0, Number(item.minStock) || 0);

      return stock > 0 && minimum > 0 && stock <= minimum;
    });

    return {
      mode,
      quantity,
      available: quantity > 0,
      lowStock,
      label: "Por variante",
      detail: `${items.length} variantes · ${quantity} unidades`,
    };
  }

  return {
    mode: "legacy",
    quantity: null,
    available: Boolean(product.inStock),
    lowStock: false,
    label: "Manual",
    detail: product.inStock ? "Disponible" : "Sin stock",
  };
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

  const stats = useMemo(() => {
    let available = 0;
    let unavailable = 0;
    let lowStock = 0;
    let totalUnits = 0;
    let trackedProducts = 0;

    let totalValue = 0;

    products.forEach((product) => {
      const stock = getStockInfo(product);

      if (stock.available) available++;
      else unavailable++;

      if (stock.lowStock) lowStock++;

      if (stock.quantity !== null) {
        totalUnits += stock.quantity;
        trackedProducts++;
      }

      totalValue += Number(product.price) || 0;
    });

    return {
      total: products.length,
      available,
      unavailable,
      lowStock,
      totalUnits,
      trackedProducts,
      averagePrice: products.length > 0
        ? totalValue / products.length
        : 0,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name?.toLowerCase().includes(normalizedSearch) ||
        product.description?.toLowerCase().includes(normalizedSearch) ||
        product.category?.toLowerCase().includes(normalizedSearch) ||
        product.variants?.some((variant) =>
          variant.label?.toLowerCase().includes(normalizedSearch)
        ) ||
        product.sizes?.some((size) =>
          size.toLowerCase().includes(normalizedSearch)
        );

      const matchesCategory =
        category === "Todas" || product.category === category;

      const stock = getStockInfo(product);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "available" && stock.available) ||
        (stockFilter === "unavailable" && !stock.available) ||
        (stockFilter === "low" && stock.lowStock);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, category, stockFilter]);

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

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
    search.trim() !== "" ||
    category !== "Todas" ||
    stockFilter !== "all";

  const closeModal = () => {
    if (selectedProduct || isModalOpen) {
      setIsModalOpen(false);
      setSelectedProduct(null);
    }
  };

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
            Administrá tu catálogo, controlá el inventario y supervisá la
            rentabilidad de tu tienda desde un solo lugar.
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
                Agotados
              </Badge>
            </div>

            <div className="mt-5">
              <p className="text-3xl font-bold tabular-nums">
                {stats.unavailable}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Productos sin disponibilidad
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

      {/* INVENTORY OVERVIEW */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-2xl border-white/[0.07] bg-[#111111]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-red-400" />
                  <h2 className="text-sm font-semibold text-white">
                    Resumen de inventario
                  </h2>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Cantidades de los productos con control numérico.
                </p>
              </div>

              <Boxes className="h-8 w-8 text-zinc-700" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold tabular-nums">
                  {stats.totalUnits.toLocaleString("es-AR")}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Unidades registradas
                </p>
              </div>

              <div>
                <p className="text-3xl font-bold tabular-nums">
                  {stats.trackedProducts}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Productos con stock numérico
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <button
          type="button"
          onClick={() => setStockFilter("low")}
          className="rounded-2xl text-left transition hover:-translate-y-0.5"
        >
          <Card className="h-full rounded-2xl border-amber-500/15 bg-gradient-to-br from-amber-500/[0.08] to-[#111111] transition hover:border-amber-500/30">
            <CardContent className="flex h-full items-center justify-between gap-4 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <p className="text-sm font-semibold text-white">
                    Stock bajo
                  </p>
                </div>

                <p className="mt-3 text-3xl font-bold tabular-nums text-amber-400">
                  {stats.lowStock}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Productos que necesitan reposición
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                <ArrowDownRight className="h-6 w-6 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </button>
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
                placeholder="Buscar por nombre, descripción, categoría o variante..."
                className="h-12 rounded-xl border-white/10 bg-[#090909] pl-11 text-white placeholder:text-zinc-600 focus-visible:ring-red-500/50"
              />

              {search && (
                <button
                  type="button"
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
                className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#090909] px-3 text-sm text-zinc-200 outline-none transition focus:border-red-500/50 sm:min-w-[170px]"
              >
                <option value="all">Todo el inventario</option>
                <option value="available">Disponible</option>
                <option value="unavailable">Sin stock</option>
                <option value="low">Stock bajo</option>
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
                type="button"
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
            <h2 className="text-lg font-bold">
              Catálogo de productos
            </h2>
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

              const stock = getStockInfo(product);
              const isDeleting = deletingId === product._id;

              const stockBadge = stock.lowStock
                ? "border-amber-500/20 bg-amber-500/15 text-amber-400"
                : stock.available
                  ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-400"
                  : "border-red-500/20 bg-red-500/15 text-red-400";

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
                      <Badge className={`${stockBadge} backdrop-blur-md`}>
                        {stock.lowStock
                          ? "Stock bajo"
                          : stock.available
                            ? "Disponible"
                            : "Agotado"}
                      </Badge>
                    </div>

                    <div className="absolute right-3 top-3">
                      <Badge className="border border-white/10 bg-black/60 text-zinc-200 backdrop-blur-md">
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

                    {/* STOCK */}
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {stock.mode === "sizes" ? (
                            <Ruler className="h-4 w-4 text-zinc-400" />
                          ) : stock.mode === "variants" ? (
                            <Layers className="h-4 w-4 text-zinc-400" />
                          ) : (
                            <Boxes className="h-4 w-4 text-zinc-400" />
                          )}

                          <span className="text-xs font-semibold text-zinc-300">
                            {stock.label}
                          </span>
                        </div>

                        {stock.quantity !== null && (
                          <span className="text-sm font-bold tabular-nums text-white">
                            {stock.quantity} u.
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[11px] text-zinc-500">
                        {stock.detail}
                      </p>

                      {stock.lowStock && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Requiere reposición
                        </div>
                      )}
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

                    {/* SIZES / VARIANTS */}
                    <div className="border-t border-white/[0.06] pt-3">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        Talles y opciones
                      </p>

                      <div className="flex min-h-7 flex-wrap gap-1.5">
                        {product.sizes?.length ? (
                          product.sizes.map((size, index) => {
                            const sizeItem = product.sizeStock?.find(
                              (item) => item.size === size
                            );

                            return (
                              <span
                                key={`${size}-${index}`}
                                className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-zinc-300"
                              >
                                {size}
                                {stock.mode === "sizes" && sizeItem
                                  ? ` · ${sizeItem.stockQuantity}`
                                  : ""}
                              </span>
                            );
                          })
                        ) : product.variants?.length ? (
                          product.variants.map((variant, index) => (
                            <span
                              key={`${variant.label}-${index}`}
                              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-zinc-300"
                            >
                              {variant.label}
                              {stock.mode === "variants" &&
                              variant.stockQuantity != null
                                ? ` · ${variant.stockQuantity}`
                                : ""}
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
        onClose={closeModal}
        onSave={handleSaveProduct}
        product={selectedProduct}
      />
    </div>
  );
}
