"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Check, X, Star, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { optimizeCloudinaryImage } from "@/utils/optimizeCloudinary";

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

/**
 * Una opción comprable de un producto: un talle, una presentación, un modelo...
 * - `group`: agrupa opciones (ej. el modelo de mate; dentro, "Mate solo" / "Mate + bombilla")
 * - `price`: si falta, se usa el precio base del producto
 * - `note`: aviso para esa opción (ej. "2 en stock: negro y marrón")
 */
interface Variant {
  label: string;
  group?: string;
  price?: number;
  inStock?: boolean;
  note?: string;
  image?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number; // precio base / más bajo
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  rating?: number;
  inStock: boolean;
  sizes?: string[]; // forma simple para remeras: ["S","M","L"]
  variants?: Variant[]; // forma completa (mates, packs, colores...)
  groupLabel?: string; // título del primer selector. Por defecto "Modelo"
  optionLabel?: string; // título del selector de opciones. Por defecto "Talle" u "Opción"
  selectedSize?: string; // lo que se envía al carrito
}

interface MerchandiseStoreProps {
  onAddToCart: (product: Product) => void;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const NO_OPTION_LABEL = "Único"; // productos sin opciones (gorras, stickers...)

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});
const fmt = (n: number) => priceFormatter.format(n);

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function getVariants(p: Product): Variant[] {
  if (p.variants?.length) return p.variants;
  return (p.sizes ?? []).map((label) => ({ label }));
}

const variantPrice = (p: Product, v?: Variant) => v?.price ?? p.price;

function priceRange(p: Product) {
  const vs = getVariants(p);
  const prices = vs.length ? vs.map((v) => variantPrice(p, v)) : [p.price];
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

// Texto que se guarda en el carrito como "opción elegida"
function cartLabel(p: Product, v?: Variant): string {
  if (!v) return NO_OPTION_LABEL;
  if (p.variants?.length) return [v.group, v.label].filter(Boolean).join(" — ");
  return `${p.optionLabel ?? "Talle"} ${v.label}`;
}

// Quita del producto lo que el carrito no necesita guardar
function toCartProduct(p: Product, extra: Partial<Product>): Product {
  const { variants, sizes, images, ...rest } = p;
  return { ...rest, ...extra };
}

const isSoldOut = (p: Product) => {
  const vs = getVariants(p);
  return !p.inStock || (vs.length > 0 && vs.every((v) => v.inStock === false));
};

/* ------------------------------------------------------------------ */
/* ExpandableDescription (la usa TourList; se mantiene exportada)      */
/* ------------------------------------------------------------------ */

export function ExpandableDescription({
  description,
  maxChars = 100,
}: {
  description?: string;
  maxChars?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = description ?? "";

  if (!text) return null;

  if (text.length <= maxChars) {
    return (
      <CardDescription className="text-sm text-muted-foreground">
        {text}
      </CardDescription>
    );
  }

  const truncated = text.slice(0, maxChars).replace(/\s+\S*$/, "").trim();

  return (
    <div className="relative">
      <CardDescription
        className={`text-sm text-muted-foreground transition-all duration-300 ${
          !isExpanded ? "max-h-12 overflow-hidden" : ""
        }`}
      >
        {isExpanded ? text : `${truncated}...`}
      </CardDescription>
      {!isExpanded && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent" />
      )}
      <Button
        variant="link"
        size="sm"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((v) => !v)}
        className="mt-1 h-auto p-0 text-xs font-semibold text-primary hover:text-primary/80"
      >
        {isExpanded ? "Ver menos" : "Ver más"}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tarjeta de producto                                                 */
/* ------------------------------------------------------------------ */

interface ProductCardProps {
  product: Product;
  onOpen: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

const ProductCard = memo(function ProductCard({
  product,
  onOpen,
  onQuickAdd,
}: ProductCardProps) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  const hasOptions = getVariants(product).length > 0;
  const soldOut = isSoldOut(product);
  const { min, max } = priceRange(product);
  const hasDiscount =
    product.originalPrice !== undefined && product.originalPrice > product.price;
  const discount = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  return (
    <li className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_24px_rgba(220,38,38,0.25)]">
      <button
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`Ver detalle de ${product.name}`}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <Image
            src={optimizeCloudinaryImage(product.image, {
              width: 700,
              quality: "auto:good",
              crop: "fill",
              format: "auto",
            })}
            alt=""
            fill
            className={`object-cover transition-transform duration-500 motion-safe:group-hover:scale-105 ${
              soldOut ? "opacity-50 grayscale" : ""
            }`}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {soldOut && (
            <Badge
              variant="secondary"
              className="absolute left-2 top-2 rounded-full bg-black/80 px-3 py-1 text-white"
            >
              Agotado
            </Badge>
          )}
          {!soldOut && discount > 0 && (
            <Badge className="absolute left-2 top-2 rounded-full bg-primary px-3 py-1 font-bold text-primary-foreground">
              -{discount}%
            </Badge>
          )}
        </div>

        <div className="space-y-1 p-3 md:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            {product.category}
          </p>
          <h3 className="line-clamp-2 text-sm font-bold uppercase leading-snug text-card-foreground md:text-base">
            {product.name}
          </h3>
          <p className="flex flex-wrap items-baseline gap-x-2">
            {min !== max && (
              <span className="text-xs text-muted-foreground">Desde</span>
            )}
            <span className="text-lg font-black text-foreground">{fmt(min)}</span>
            {hasDiscount && min === max && (
              <del className="text-xs text-muted-foreground">
                {fmt(product.originalPrice!)}
              </del>
            )}
          </p>
        </div>
      </button>

      <div className="mt-auto p-3 pt-0 md:p-4 md:pt-0">
        {soldOut ? (
          <Button className="w-full" disabled>
            Agotado
          </Button>
        ) : hasOptions ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpen(product)}
          >
            Elegir opciones
          </Button>
        ) : (
          <Button
            className="flex w-full items-center justify-center gap-2"
            onClick={() => {
              onQuickAdd(product);
              setAdded(true);
            }}
          >
            {added ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            )}
            <span aria-live="polite">{added ? "¡Agregado!" : "Agregar"}</span>
          </Button>
        )}
      </div>
    </li>
  );
});

/* ------------------------------------------------------------------ */
/* Detalle del producto (diálogo)                                      */
/* ------------------------------------------------------------------ */

function ProductDialog({
  product,
  onClose,
  onAddToCart,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}) {
  const variants = useMemo(() => getVariants(product), [product]);
  const groups = useMemo(
    () => [
      ...new Set(
        variants.map((v) => v.group).filter((g): g is string => Boolean(g))
      ),
    ],
    [variants]
  );

  // Opciones (con su índice dentro de `variants`) de un grupo
  const pickIndexes = (g?: string) =>
    variants
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => (g ? v.group === g : true));

  const initialGroup = groups.length === 1 ? groups[0] : undefined;
  const [group, setGroup] = useState<string | undefined>(initialGroup);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(() => {
    if (groups.length > 1) return null;
    const list = pickIndexes(initialGroup);
    return list.length === 1 ? list[0].i : null;
  });
  const [activeImage, setActiveImage] = useState(product.image);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  const selected = selectedIdx !== null ? variants[selectedIdx] : undefined;
  const visible = groups.length ? (group ? pickIndexes(group) : []) : pickIndexes();

  const gallery = useMemo(
    () => [
      ...new Set(
        [product.image, ...(product.images ?? []), ...variants.map((v) => v.image)].filter(
          (s): s is string => Boolean(s)
        )
      ),
    ],
    [product, variants]
  );

  const chooseGroup = (g: string) => {
    setGroup(g);
    const list = pickIndexes(g);
    setSelectedIdx(list.length === 1 ? list[0].i : null);
    if (list.length === 1 && list[0].v.image) setActiveImage(list[0].v.image);
  };

  const chooseVariant = (i: number) => {
    setSelectedIdx(i);
    const img = variants[i].image;
    if (img) setActiveImage(img);
  };

  const { min, max } = priceRange(product);
  const price = selected ? variantPrice(product, selected) : undefined;
  const needsChoice = variants.length > 0 && !selected;
  const selectedSoldOut = selected?.inStock === false;
  const canAdd = product.inStock && !needsChoice && !selectedSoldOut;

  const handleAdd = () => {
    if (!canAdd) return;
    onAddToCart(
      toCartProduct(product, {
        price: price ?? product.price,
        image: selected?.image ?? product.image,
        selectedSize: cartLabel(product, selected),
      })
    );
    setAdded(true);
    // Cerrar el detalle enseguida para que se vea el aviso del carrito
    setTimeout(onClose, 700);
  };

  let buttonLabel = "Agregar al carrito";
  if (!product.inStock || selectedSoldOut) buttonLabel = "Agotado";
  else if (groups.length && !group)
    buttonLabel = `Elegí un ${(product.groupLabel ?? "modelo").toLowerCase()}`;
  else if (needsChoice) buttonLabel = "Elegí una opción";
  else if (added) buttonLabel = "¡Agregado!";

  const optionHeading =
    product.optionLabel ?? (product.variants?.length ? "Opción" : "Opciones:");

  const chip = (isSelected: boolean, soldOut = false) =>
    `rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40 ${
      isSelected
        ? "border-primary bg-primary/15 text-foreground"
        : "border-border bg-input text-muted-foreground hover:border-primary/60 hover:text-foreground"
    } ${soldOut ? "line-through" : ""}`;

  const [descOpen, setDescOpen] = useState(false);
  const description = product.description || "";
  const longDescription = description.length > 280;

  const mainSrc = optimizeCloudinaryImage(activeImage, {
    width: 1000,
    quality: "auto:good",
    crop: "scale",
    format: "auto",
  });
  // Versión mínima de la misma foto, solo para el fondo difuminado
  const backdropSrc = optimizeCloudinaryImage(activeImage, {
    width: 240,
    quality: "auto:eco",
    crop: "fill",
    format: "auto",
  });

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[1001] flex max-h-[92dvh] w-[94vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-t-4 border-border border-t-primary bg-card text-card-foreground shadow-2xl outline-none md:max-h-[88dvh] md:min-h-[480px] md:flex-row">
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-20 bg-black/50 text-white hover:bg-black/70 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </Dialog.Close>

          {/* Galería: ocupa siempre todo el alto, sin huecos */}
          <div className="relative h-56 shrink-0 overflow-hidden bg-black md:h-auto md:w-[46%]">
            {/* Fondo difuminado: rellena los costados sin recortar la foto */}
            <Image
              src={backdropSrc}
              alt=""
              aria-hidden="true"
              fill
              className="scale-125 object-cover opacity-40 blur-2xl"
              sizes="240px"
            />
            <Image
              src={mainSrc}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 94vw, 460px"
              priority
            />
            {gallery.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 [scrollbar-width:none]">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(src)}
                    aria-label={`Ver foto ${i + 1}`}
                    aria-pressed={activeImage === src}
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 md:h-14 md:w-14 ${
                      activeImage === src
                        ? "border-primary"
                        : "border-white/20 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={optimizeCloudinaryImage(src, {
                        width: 160,
                        quality: "auto:eco",
                        crop: "fill",
                        format: "auto",
                      })}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información: el contenido se desplaza, el botón queda siempre a la vista */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-5 md:p-6 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {product.category}
                </p>
                <Dialog.Title className="mt-1 pr-10 text-2xl font-black uppercase leading-tight">
                  {product.name}
                </Dialog.Title>
                {!!product.rating && product.rating > 0 && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Star
                      className="h-4 w-4 fill-secondary text-secondary"
                      aria-hidden="true"
                    />
                    {product.rating}
                  </p>
                )}
              </div>

              <p className="flex flex-wrap items-baseline gap-x-2">
                {price === undefined && min !== max && (
                  <span className="text-sm text-muted-foreground">Desde</span>
                )}
                <span className="text-3xl font-black">{fmt(price ?? min)}</span>
                {product.originalPrice !== undefined &&
                  product.originalPrice > product.price &&
                  min === max && (
                    <del className="text-sm text-muted-foreground">
                      {fmt(product.originalPrice)}
                    </del>
                  )}
              </p>

              {/* Primero lo que hay que elegir... */}
              {groups.length > 0 && (
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">
                    {product.groupLabel ?? "Modelo"}
                  </legend>
                  <div className="flex flex-col gap-2">
                    {groups.map((g) => (
                      <button
                        key={g}
                        type="button"
                        aria-pressed={group === g}
                        onClick={() => chooseGroup(g)}
                        className={chip(group === g)}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {variants.length > 0 && (groups.length === 0 || group) && (
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">
                    {optionHeading}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {visible.map(({ v, i }) => {
                      const out = v.inStock === false;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={out}
                          aria-pressed={selectedIdx === i}
                          onClick={() => chooseVariant(i)}
                          className={chip(selectedIdx === i, out)}
                        >
                          <span className="block font-semibold">{v.label}</span>
                          {v.price !== undefined && (
                            <span className="block text-xs">
                              {out ? "Agotado" : fmt(v.price)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {selected?.note && (
                <p className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
                  <Info
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {selected.note}
                </p>
              )}

              {/* ...y después el texto largo, resumido y expandible */}
              {description ? (
                <section className="border-t border-border pt-4">
                  <h3 className="mb-2 text-sm font-semibold">Detalles</h3>
                  <Dialog.Description
                    className={`whitespace-pre-line text-sm leading-relaxed text-muted-foreground ${
                      longDescription && !descOpen ? "line-clamp-6" : ""
                    }`}
                  >
                    {description}
                  </Dialog.Description>
                  {longDescription && (
                    <button
                      type="button"
                      aria-expanded={descOpen}
                      onClick={() => setDescOpen((v) => !v)}
                      className="mt-1 text-xs font-semibold text-primary hover:text-primary/80"
                    >
                      {descOpen ? "Ver menos" : "Ver descripción completa"}
                    </button>
                  )}
                </section>
              ) : (
                <Dialog.Description className="sr-only">
                  Detalle del producto
                </Dialog.Description>
              )}
            </div>

            {/* Botón siempre visible */}
            <div className="border-t border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Button
                size="lg"
                className="flex w-full items-center justify-center gap-2 py-6 text-base font-bold"
                disabled={!canAdd}
                onClick={handleAdd}
              >
                {added ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                )}
                <span aria-live="polite">
                  {buttonLabel}
                  {canAdd && !added && price !== undefined ? ` · ${fmt(price)}` : ""}
                </span>
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Tienda                                                              */
/* ------------------------------------------------------------------ */

type SortMode = "default" | "price-asc" | "price-desc";

const PAGE_SIZE = 12; // 12 encaja justo en 2, 3 y 4 columnas

export function MerchandiseStore({ onAddToCart }: MerchandiseStoreProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("default");
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/products", { signal: controller.signal });
        if (!res.ok) throw new Error("No pudimos cargar los productos.");
        setProducts(await res.json());
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error(err);
        setError("No pudimos cargar los productos. Intentá de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [reloadKey]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) =>
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
    );
    return [
      { name: "Todos", count: products.length },
      ...[...counts].map(([name, count]) => ({ name, count })),
    ];
  }, [products]);

  const visibleProducts = useMemo(() => {
    const q = normalize(search.trim());
    const list = products.filter((p) => {
      const okCategory = category === "Todos" || p.category === category;
      const okQuery =
        !q ||
        normalize(p.name).includes(q) ||
        normalize(p.description ?? "").includes(q);
      return okCategory && okQuery;
    });
    if (sort === "default") return list;
    const dir = sort === "price-asc" ? 1 : -1;
    return [...list].sort(
      (a, b) => (priceRange(a).min - priceRange(b).min) * dir
    );
  }, [products, category, search, sort]);

  const handleQuickAdd = useCallback(
    (p: Product) =>
      onAddToCart(toCartProduct(p, { selectedSize: NO_OPTION_LABEL })),
    [onAddToCart]
  );
  const handleOpen = useCallback((p: Product) => setOpenProduct(p), []);

  // Al cambiar búsqueda, categoría u orden, volver a la primera página
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, search, sort]);

  const shownProducts = visibleProducts.slice(0, visibleCount);
  const remaining = visibleProducts.length - shownProducts.length;

  const clearFilters = () => {
    setSearch("");
    setCategory("Todos");
  };

  return (
    <div className="px-4 md:px-8">
      {/* Barra de herramientas */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar remeras, mates, accesorios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar productos"
              className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/50"
            />
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            aria-label="Ordenar productos"
            className="rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [color-scheme:dark]"
          >
            <option value="default">Destacados</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
          </select>
        </div>

        {/* Categorías: una sola fila deslizable en celular */}
        <div
          role="group"
          aria-label="Categorías"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
        >
          {categories.map(({ name, count }) => (
            <Button
              key={name}
              variant={category === name ? "default" : "outline"}
              size="sm"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
              className="shrink-0 rounded-full px-4 text-xs font-semibold uppercase tracking-wide"
            >
              {name}
              <span className="ml-1.5 opacity-60">{count}</span>
            </Button>
          ))}
        </div>

        {!loading && !error && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1 ? "producto" : "productos"}
          </p>
        )}
      </div>

      {/* Contenido */}
      {error ? (
        <div role="alert" className="py-10 text-center">
          <p className="mb-4 text-destructive">{error}</p>
          <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
            Reintentar
          </Button>
        </div>
      ) : loading ? (
        <ul
          className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
          aria-busy="true"
          aria-label="Cargando productos"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <li
              key={i}
              className="overflow-hidden rounded-xl border border-border bg-card motion-safe:animate-pulse"
            >
              <Skeleton className="aspect-[4/5] w-full rounded-none bg-muted" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3 w-1/3 bg-muted" />
                <Skeleton className="h-5 w-4/5 bg-muted" />
                <Skeleton className="h-6 w-1/2 bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      ) : visibleProducts.length === 0 ? (
        <div role="status" className="py-12 text-center">
          <p className="mb-4 text-muted-foreground">
            {products.length === 0
              ? "Todavía no hay productos disponibles."
              : "No encontramos productos con ese filtro."}
          </p>
          {products.length > 0 && (
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {shownProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onOpen={handleOpen}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Mostrando {shownProducts.length} de {visibleProducts.length}
            </p>
            {remaining > 0 && (
              <Button
                variant="outline"
                size="lg"
                className="px-8"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Ver más productos
              </Button>
            )}
          </div>
        </>
      )}

      {openProduct && (
        <ProductDialog
          product={openProduct}
          onClose={() => setOpenProduct(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
}