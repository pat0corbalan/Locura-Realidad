
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Save,
  X,
  Plus,
  Trash2,
  ImagePlus,
  Loader2,
  Star,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import {
  Product,
  ProductModalProps,
} from "@/components/types/product";

const categories = [
  "Ropa",
  "Accesorios",
];

interface Errors {
  [key: string]: string;
}

interface FormProduct extends Omit<Product, "image"> {
  image: File | string | null;
}

const initialFormData: FormProduct = {
  name: "",
  description: "",
  price: 0,
  originalPrice: 0,
  costPrice: 0,
  image: null,
  category: "",
  rating: 5,
  inStock: true,
  sizes: [],
};

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  product,
}: ProductModalProps) {
  const [formData, setFormData] = useState<FormProduct>({
    ...initialFormData,
  });

  const [newSize, setNewSize] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const objectUrlRef = useRef<string | null>(null);

  // Liberar URLs temporales de imágenes.
  const clearObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  // Inicializar formulario al abrir o cambiar de producto.
  useEffect(() => {
    if (!isOpen) return;

    clearObjectUrl();

    if (product) {
      setFormData({
        _id: product._id,
        name: product.name || "",
        description: product.description || "",
        price: product.price ?? 0,
        originalPrice: product.originalPrice ?? 0,
        costPrice: product.costPrice ?? 0,
        image: product.image || null,
        category: product.category || "",
        rating: product.rating ?? 5,
        inStock: product.inStock ?? true,
        sizes: Array.isArray(product.sizes) ? [...product.sizes] : [],
      });

      setImagePreview(product.image || null);
    } else {
      setFormData({ ...initialFormData });
      setImagePreview(null);
    }

    setErrors({});
    setNewSize("");
    setIsSubmitting(false);

    return () => {
      clearObjectUrl();
    };
  }, [product, isOpen]);

  // Liberar cualquier URL temporal al desmontar.
  useEffect(() => {
    return () => {
      clearObjectUrl();
    };
  }, []);

  const handleInputChange = (
    field: keyof FormProduct,
    value: string | number | boolean | File | null | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del producto es obligatorio.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria.";
    }

    if (!formData.category) {
      newErrors.category = "Seleccioná una categoría.";
    }

    if (!Number.isFinite(formData.price) || formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a cero.";
    }

    if (
      !Number.isFinite(formData.originalPrice) ||
      formData.originalPrice <= 0
    ) {
      newErrors.originalPrice = "Ingresá un precio original válido.";
    }

    if (
      !Number.isFinite(formData.costPrice) ||
      formData.costPrice <= 0
    ) {
      newErrors.costPrice = "Ingresá un precio de costo válido.";
    } else if (formData.costPrice >= formData.price) {
      newErrors.costPrice =
        "El costo debe ser menor al precio de venta.";
    }

    if (
      !Number.isFinite(formData.rating) ||
      formData.rating < 0 ||
      formData.rating > 5
    ) {
      newErrors.rating = "El rating debe estar entre 0 y 5.";
    }

    if (!formData.sizes.length) {
      newErrors.sizes = "Agregá al menos una talla o tamaño.";
    }

    if (!product && !formData.image) {
      newErrors.image = "La imagen es obligatoria para nuevos productos.";
    }

    if (formData.image instanceof File) {
      if (!formData.image.type.startsWith("image/")) {
        newErrors.image = "El archivo seleccionado no es una imagen.";
      } else if (formData.image.size > 5 * 1024 * 1024) {
        newErrors.image = "La imagen no puede superar los 5 MB.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Seleccioná un archivo de imagen válido.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 5 MB.");
      event.target.value = "";
      return;
    }

    clearObjectUrl();

    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setImagePreview(previewUrl);

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const addSize = () => {
    const size = newSize.trim();

    if (!size) return;

    if (formData.sizes.includes(size)) {
      toast.error("Esa talla o tamaño ya fue agregado.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, size],
    }));

    setNewSize("");

    setErrors((prev) => ({
      ...prev,
      sizes: "",
    }));
  };

  const removeSize = (sizeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((size) => size !== sizeToRemove),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    const form = new FormData();

    form.append("name", formData.name.trim());
    form.append("description", formData.description.trim());
    form.append("price", String(formData.price));
    form.append("originalPrice", String(formData.originalPrice));
    form.append("costPrice", String(formData.costPrice));
    form.append("category", formData.category);
    form.append("rating", String(formData.rating));
    form.append("inStock", String(formData.inStock));

    formData.sizes.forEach((size) => {
      form.append("sizes", size);
    });

    if (formData.image instanceof File) {
      form.append("image", formData.image);
    }

    try {
      const url = product?._id
        ? `/api/products/${product._id}`
        : "/api/products";

      const method = product?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: form,
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo guardar el producto."
        );
      }

      const savedProduct: Product = {
        ...formData,
        _id: data._id || product?._id,
        image:
          data.image ||
          (typeof formData.image === "string"
            ? formData.image
            : product?.image || null),
        createdAt: data.createdAt
          ? new Date(data.createdAt)
          : product?.createdAt,
      };

      onSave(savedProduct);

      toast.success(
        product
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente."
      );
    } catch (error) {
      console.error("Error al guardar producto:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar el producto."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }).format(value || 0);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto border-white/10 bg-[#0b0b0d] p-0 text-white shadow-2xl">
        <DialogHeader className="border-b border-white/[0.07] bg-gradient-to-r from-red-950/30 via-[#101013] to-[#101013] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
              <Package className="h-5 w-5 text-red-400" />
            </div>

            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-white">
                {product ? "Editar producto" : "Nuevo producto"}
              </DialogTitle>

              <p className="mt-1 text-xs text-zinc-500">
                {product
                  ? "Actualizá la información de tu producto."
                  : "Completá los datos para agregar un producto al catálogo."}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-7 p-6">
          {/* IMAGEN */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Imagen del producto
                </h3>
                <p className="text-xs text-zinc-500">
                  JPG, PNG o WEBP. Máximo 5 MB.
                </p>
              </div>

              <Badge className="border border-white/10 bg-white/[0.05] text-zinc-400">
                Imagen principal
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#141418]">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={formData.name || "Vista previa del producto"}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.opacity = "0";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-600">
                    <ImagePlus className="h-9 w-9" />
                    <span className="text-xs">Sin imagen</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center gap-3">
                <Label
                  htmlFor="product-image"
                  className="text-sm font-medium text-zinc-300"
                >
                  Seleccionar fotografía
                </Label>

                <Input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="cursor-pointer border-white/10 bg-white/[0.03] text-zinc-300 file:mr-4 file:rounded-md file:border-0 file:bg-red-500/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-red-400 hover:file:bg-red-500/20"
                />

                <p className="text-xs leading-relaxed text-zinc-500">
                  {product
                    ? "Si no seleccionás una nueva imagen, se conservará la fotografía actual."
                    : "La imagen se subirá automáticamente a Cloudinary al guardar el producto."}
                </p>

                {errors.image && (
                  <p className="text-xs text-red-400">{errors.image}</p>
                )}
              </div>
            </div>
          </section>

          <div className="h-px bg-white/[0.07]" />

          {/* INFORMACIÓN GENERAL */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-semibold text-white">
                Información general
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">
                  Nombre del producto *
                </Label>

                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) =>
                    handleInputChange("name", event.target.value)
                  }
                  placeholder="Ej: Camiseta Vintage Rock"
                  disabled={isSubmitting}
                  className="border-white/10 bg-white/[0.03] text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
                />

                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Categoría *</Label>

                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                    <SelectValue placeholder="Seleccioná una categoría" />
                  </SelectTrigger>

                  <SelectContent className="border-white/10 bg-[#17171b] text-white">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.category && (
                  <p className="text-xs text-red-400">
                    {errors.category}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-300">
                Descripción *
              </Label>

              <Textarea
                id="description"
                value={formData.description}
                onChange={(event) =>
                  handleInputChange("description", event.target.value)
                }
                placeholder="Describí las características del producto..."
                rows={4}
                disabled={isSubmitting}
                className="resize-none border-white/10 bg-white/[0.03] text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
              />

              {errors.description && (
                <p className="text-xs text-red-400">
                  {errors.description}
                </p>
              )}
            </div>
          </section>

          <div className="h-px bg-white/[0.07]" />

          {/* PRECIOS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-red-400">$</span>
              <h3 className="text-sm font-semibold text-white">
                Precios y rentabilidad
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-zinc-300">
                  Precio de venta *
                </Label>

                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(event) =>
                    handleInputChange(
                      "price",
                      Number.parseFloat(event.target.value) || 0
                    )
                  }
                  disabled={isSubmitting}
                  className="border-white/10 bg-white/[0.03] text-white"
                />

                {errors.price && (
                  <p className="text-xs text-red-400">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice" className="text-zinc-300">
                  Precio original *
                </Label>

                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(event) =>
                    handleInputChange(
                      "originalPrice",
                      Number.parseFloat(event.target.value) || 0
                    )
                  }
                  disabled={isSubmitting}
                  className="border-white/10 bg-white/[0.03] text-white"
                />

                {errors.originalPrice && (
                  <p className="text-xs text-red-400">
                    {errors.originalPrice}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPrice" className="text-zinc-300">
                  Precio de costo *
                </Label>

                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={(event) =>
                    handleInputChange(
                      "costPrice",
                      Number.parseFloat(event.target.value) || 0
                    )
                  }
                  disabled={isSubmitting}
                  className="border-white/10 bg-white/[0.03] text-white"
                />

                {errors.costPrice && (
                  <p className="text-xs text-red-400">
                    {errors.costPrice}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Resumen de rentabilidad
              </p>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-zinc-500">Venta</p>
                  <p className="mt-1 font-semibold text-white">
                    {formatPrice(formData.price)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500">Costo</p>
                  <p className="mt-1 font-semibold text-zinc-300">
                    {formatPrice(formData.costPrice)}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-zinc-500">Ganancia estimada</p>
                  <p
                    className={`mt-1 font-semibold ${
                      formData.price > formData.costPrice
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatPrice(formData.price - formData.costPrice)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-white/[0.07]" />

          {/* CONFIGURACIÓN */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-semibold text-white">
                Configuración del producto
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rating" className="text-zinc-300">
                  Calificación (0 a 5)
                </Label>

                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(event) =>
                    handleInputChange(
                      "rating",
                      Number.parseFloat(event.target.value) || 0
                    )
                  }
                  disabled={isSubmitting}
                  className="border-white/10 bg-white/[0.03] text-white"
                />

                {errors.rating && (
                  <p className="text-xs text-red-400">{errors.rating}</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    Disponibilidad
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formData.inStock
                      ? "El producto está disponible."
                      : "El producto está agotado."}
                  </p>
                </div>

                <Switch
                  checked={formData.inStock}
                  onCheckedChange={(checked) =>
                    handleInputChange("inStock", checked)
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </section>

          <div className="h-px bg-white/[0.07]" />

          {/* TALLAS */}
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Tallas y tamaños
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Agregá las opciones disponibles para este producto.
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                value={newSize}
                onChange={(event) => setNewSize(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSize();
                  }
                }}
                placeholder="Ej: S, M, L, XL o Único"
                disabled={isSubmitting}
                className="border-white/10 bg-white/[0.03] text-white placeholder:text-zinc-600"
              />

              <Button
                type="button"
                onClick={addSize}
                disabled={isSubmitting || !newSize.trim()}
                variant="outline"
                className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex min-h-12 flex-wrap gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              {formData.sizes.length > 0 ? (
                formData.sizes.map((size) => (
                  <Badge
                    key={size}
                    className="gap-2 border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-red-300"
                  >
                    {size}

                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      disabled={isSubmitting}
                      className="text-red-300/60 transition hover:text-red-300"
                      aria-label={`Eliminar talla ${size}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="self-center text-xs text-zinc-600">
                  Todavía no agregaste tallas o tamaños.
                </p>
              )}
            </div>

            {errors.sizes && (
              <p className="text-xs text-red-400">{errors.sizes}</p>
            )}
          </section>

          {/* ACCIONES */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/[0.05] hover:text-white"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 text-white shadow-lg shadow-red-950/30 hover:bg-red-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {product ? "Guardar cambios" : "Crear producto"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
