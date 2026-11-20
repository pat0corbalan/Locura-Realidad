
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
  Boxes,
  Ruler,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Product,
  ProductModalProps,
  ProductStockMode,
  ProductVariant,
  SizeStock,
} from "@/components/types/product";

const categories = ["Ropa", "Accesorios"];

interface Errors {
  [key: string]: string;
}

interface FormProduct extends Omit<Product, "image"> {
  image: File | string | null;
  variants: ProductVariant[];
  sizeStock: SizeStock[];
  stockMode: ProductStockMode;
  stockQuantity: number | null;
  minStock: number;
  groupLabel: string;
  optionLabel: string;
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
  variants: [],
  sizeStock: [],
  stockMode: "simple",
  stockQuantity: 0,
  minStock: 0,
  groupLabel: "",
  optionLabel: "",
};

const numberValue = (value: string) => {
  if (value.trim() === "") return 0;
  return Number(value.replace(",", ".")) || 0;
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

  const clearObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    clearObjectUrl();

    if (product) {
      setFormData({
        ...initialFormData,
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
        variants: Array.isArray(product.variants)
          ? product.variants.map((variant) => ({ ...variant }))
          : [],
        sizeStock: Array.isArray(product.sizeStock)
          ? product.sizeStock.map((item) => ({ ...item }))
          : [],
        stockMode: product.stockMode || "legacy",
        stockQuantity: product.stockQuantity ?? null,
        minStock: product.minStock ?? 0,
        groupLabel: product.groupLabel || "",
        optionLabel: product.optionLabel || "",
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

  useEffect(() => {
    return () => {
      clearObjectUrl();
    };
  }, []);

  const handleInputChange = (
    field: keyof FormProduct,
    value: string | number | boolean | File | null | string[] | ProductVariant[] | SizeStock[]
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

  const changeStockMode = (mode: ProductStockMode) => {
    setFormData((prev) => {
      let sizeStock = prev.sizeStock;
      let variants = prev.variants;

      if (mode === "sizes") {
        sizeStock = prev.sizes.map((size) => {
          const existing = prev.sizeStock.find(
            (item) => item.size.toLowerCase() === size.toLowerCase()
          );

          return existing || {
            size,
            stockQuantity: 0,
            minStock: 0,
          };
        });
      }

      if (mode === "variants" && variants.length === 0) {
        variants = [
          {
            label: "",
            group: "",
            price: undefined,
            inStock: true,
            note: "",
            stockQuantity: 0,
            minStock: 0,
          },
        ];
      }

      return {
        ...prev,
        stockMode: mode,
        sizeStock,
        variants,
      };
    });

    setErrors((prev) => ({
      ...prev,
      stockMode: "",
      stockQuantity: "",
      sizeStock: "",
      variants: "",
    }));
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
      newErrors.costPrice = "El costo debe ser menor al precio de venta.";
    }

    if (
      !Number.isFinite(formData.rating) ||
      formData.rating < 0 ||
      formData.rating > 5
    ) {
      newErrors.rating = "El rating debe estar entre 0 y 5.";
    }

    if (formData.stockMode === "simple") {
      if (
        formData.stockQuantity === null ||
        !Number.isFinite(formData.stockQuantity) ||
        formData.stockQuantity < 0
      ) {
        newErrors.stockQuantity = "Ingresá una cantidad válida.";
      }

      if (formData.minStock < 0) {
        newErrors.minStock = "El mínimo no puede ser negativo.";
      }
    }

    if (formData.stockMode === "sizes") {
      if (formData.sizes.length === 0) {
        newErrors.sizes = "Agregá al menos un talle.";
      }

      for (const size of formData.sizes) {
        const item = formData.sizeStock.find(
          (entry) => entry.size.toLowerCase() === size.toLowerCase()
        );

        if (
          !item ||
          !Number.isFinite(item.stockQuantity) ||
          item.stockQuantity < 0
        ) {
          newErrors.sizeStock = `Configurá el stock del talle ${size}.`;
          break;
        }
      }
    }

    if (formData.stockMode === "variants") {
      if (formData.variants.length === 0) {
        newErrors.variants = "Agregá al menos una variante.";
      }

      const invalidVariant = formData.variants.find(
        (variant) =>
          !variant.label.trim() ||
          variant.stockQuantity == null ||
          !Number.isFinite(variant.stockQuantity) ||
          variant.stockQuantity < 0
      );

      if (invalidVariant) {
        newErrors.variants =
          "Cada variante necesita una etiqueta y una cantidad válida.";
      }
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

    if (
      formData.sizes.some(
        (existing) => existing.toLowerCase() === size.toLowerCase()
      )
    ) {
      toast.error("Esa talla o tamaño ya fue agregado.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, size],
      sizeStock:
        prev.stockMode === "sizes"
          ? [
              ...prev.sizeStock,
              { size, stockQuantity: 0, minStock: 0 },
            ]
          : prev.sizeStock,
    }));

    setNewSize("");

    setErrors((prev) => ({
      ...prev,
      sizes: "",
      sizeStock: "",
    }));
  };

  const removeSize = (sizeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((size) => size !== sizeToRemove),
      sizeStock: prev.sizeStock.filter(
        (item) => item.size.toLowerCase() !== sizeToRemove.toLowerCase()
      ),
    }));
  };

  const updateSizeStock = (
    size: string,
    field: "stockQuantity" | "minStock",
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      sizeStock: prev.sizeStock.map((item) =>
        item.size === size ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addVariant = () => {
    if (formData.variants.length >= 40) {
      toast.error("Podés agregar hasta 40 variantes.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          label: "",
          group: "",
          price: undefined,
          inStock: true,
          note: "",
          stockQuantity: 0,
          minStock: 0,
        },
      ],
    }));
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | number | boolean | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting || !validateForm()) return;

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

    form.append("stockMode", formData.stockMode);
    form.append(
      "stockQuantity",
      formData.stockQuantity == null ? "" : String(formData.stockQuantity)
    );
    form.append("minStock", String(formData.minStock));

    form.append("sizeStock", JSON.stringify(
      formData.stockMode === "sizes" ? formData.sizeStock : []
    ));

    form.append("variants", JSON.stringify(formData.variants));
    form.append("groupLabel", formData.groupLabel);
    form.append("optionLabel", formData.optionLabel);

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
        throw new Error(data.error || "No se pudo guardar el producto.");
      }

      const savedProduct: Product = {
        ...formData,
        ...data,
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

  const availableStock = (() => {
    if (formData.stockMode === "simple") {
      return formData.stockQuantity ?? 0;
    }

    if (formData.stockMode === "sizes") {
      return formData.sizeStock.reduce(
        (total, item) => total + item.stockQuantity,
        0
      );
    }

    if (formData.stockMode === "variants") {
      return formData.variants.reduce(
        (total, item) => total + (item.stockQuantity ?? 0),
        0
      );
    }

    return null;
  })();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-white/10 bg-[#0b0b0d] p-0 text-white shadow-2xl">
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
                Administrá los datos, precios e inventario de tu catálogo.
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
                <Label htmlFor="product-image" className="text-sm text-zinc-300">
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
                    ? "Si no seleccionás otra imagen, se conservará la actual."
                    : "La imagen se subirá automáticamente a Cloudinary."}
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
                  className="border-white/10 bg-white/[0.03] text-white placeholder:text-zinc-600"
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
                  <p className="text-xs text-red-400">{errors.category}</p>
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
                className="resize-none border-white/10 bg-white/[0.03] text-white placeholder:text-zinc-600"
              />
              {errors.description && (
                <p className="text-xs text-red-400">{errors.description}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-zinc-300">Etiqueta del grupo</Label>
                <Input
                  value={formData.groupLabel}
                  onChange={(event) =>
                    handleInputChange("groupLabel", event.target.value)
                  }
                  placeholder="Ej: Color"
                  disabled={isSubmitting}
                  className="border-white/10 bg-white/[0.03] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Etiqueta de opción</Label>
                <Input
                  value={formData.optionLabel}
                  onChange={(event) =>
                    handleInputChange("optionLabel", event.target.value)
                  }
                  placeholder="Ej: Modelo"
                  disabled={isSubmitting}
                  className="border-white/10 bg-white/[0.03] text-white"
                />
              </div>
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
              {[
                { key: "price", label: "Precio de venta *" },
                { key: "originalPrice", label: "Precio original *" },
                { key: "costPrice", label: "Precio de costo *" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-zinc-300">
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData[key as "price" | "originalPrice" | "costPrice"]}
                    onChange={(event) =>
                      handleInputChange(
                        key as "price" | "originalPrice" | "costPrice",
                        numberValue(event.target.value)
                      )
                    }
                    disabled={isSubmitting}
                    className="border-white/10 bg-white/[0.03] text-white"
                  />
                  {errors[key] && (
                    <p className="text-xs text-red-400">{errors[key]}</p>
                  )}
                </div>
              ))}
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
                      numberValue(event.target.value)
                    )
                  }
                  disabled={isSubmitting}
                  className="border-white/10 bg-white/[0.03] text-white"
                />
                {errors.rating && (
                  <p className="text-xs text-red-400">{errors.rating}</p>
                )}
              </div>

              {formData.stockMode === "legacy" && (
                <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Disponibilidad manual
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
              )}
            </div>
          </section>

          <div className="h-px bg-white/[0.07]" />

          {/* INVENTARIO */}
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-red-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Gestión de inventario
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Elegí cómo querés controlar las unidades disponibles.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  value: "simple",
                  title: "Stock general",
                  description: "Una cantidad total para todo el producto.",
                  icon: Package,
                },
                {
                  value: "sizes",
                  title: "Stock por talle",
                  description: "Una cantidad independiente para cada talle.",
                  icon: Ruler,
                },
                {
                  value: "variants",
                  title: "Stock por variante",
                  description: "Una cantidad para cada opción o modelo.",
                  icon: Layers,
                },
                {
                  value: "legacy",
                  title: "Disponibilidad manual",
                  description: "Sin cantidades. Conserva el sistema anterior.",
                  icon: Tag,
                },
              ].map((mode) => {
                const Icon = mode.icon;
                const selected = formData.stockMode === mode.value;

                return (
                  <button
                    key={mode.value}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      changeStockMode(mode.value as ProductStockMode)
                    }
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-red-500/50 bg-red-500/[0.08]"
                        : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        selected
                          ? "bg-red-500/15 text-red-400"
                          : "bg-white/[0.05] text-zinc-500"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        {mode.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                        {mode.description}
                      </p>
                    </div>
                    <span
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full border ${
                        selected
                          ? "border-red-400 bg-red-500"
                          : "border-zinc-600"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {formData.stockMode === "simple" && (
              <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Inventario general
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Controlá cuántas unidades tenés disponibles.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">
                      Cantidad disponible *
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.stockQuantity ?? ""}
                      onChange={(event) =>
                        handleInputChange(
                          "stockQuantity",
                          event.target.value === ""
                            ? null
                            : numberValue(event.target.value)
                        )
                      }
                      disabled={isSubmitting}
                      className="border-white/10 bg-white/[0.03] text-white"
                    />
                    {errors.stockQuantity && (
                      <p className="text-xs text-red-400">
                        {errors.stockQuantity}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">
                      Avisar cuando queden
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.minStock}
                      onChange={(event) =>
                        handleInputChange(
                          "minStock",
                          numberValue(event.target.value)
                        )
                      }
                      disabled={isSubmitting}
                      className="border-white/10 bg-white/[0.03] text-white"
                    />
                    <p className="text-xs text-zinc-600">
                      Umbral para identificar stock bajo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.stockMode === "sizes" && (
              <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Inventario por talle
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Cada talle tiene su propia cantidad y alerta de stock.
                  </p>
                </div>

                {formData.sizes.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/10 p-5 text-center">
                    <Ruler className="mx-auto mb-2 h-6 w-6 text-zinc-600" />
                    <p className="text-sm text-zinc-400">
                      Primero agregá los talles del producto.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.sizes.map((size) => {
                      const item = formData.sizeStock.find(
                        (entry) =>
                          entry.size.toLowerCase() === size.toLowerCase()
                      );

                      return (
                        <div
                          key={size}
                          className="grid gap-3 rounded-lg border border-white/[0.07] bg-black/20 p-3 sm:grid-cols-[80px_1fr_1fr]"
                        >
                          <div className="flex items-center">
                            <Badge className="border border-red-500/20 bg-red-500/10 text-red-300">
                              {size}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs text-zinc-400">
                              Unidades
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={item?.stockQuantity ?? 0}
                              onChange={(event) =>
                                updateSizeStock(
                                  size,
                                  "stockQuantity",
                                  numberValue(event.target.value)
                                )
                              }
                              disabled={isSubmitting}
                              className="h-9 border-white/10 bg-white/[0.03] text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs text-zinc-400">
                              Alerta de stock bajo
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={item?.minStock ?? 0}
                              onChange={(event) =>
                                updateSizeStock(
                                  size,
                                  "minStock",
                                  numberValue(event.target.value)
                                )
                              }
                              disabled={isSubmitting}
                              className="h-9 border-white/10 bg-white/[0.03] text-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {errors.sizeStock && (
                  <p className="text-xs text-red-400">{errors.sizeStock}</p>
                )}
                {errors.sizes && (
                  <p className="text-xs text-red-400">{errors.sizes}</p>
                )}
              </div>
            )}

            {formData.stockMode === "variants" && (
              <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Inventario por variante
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Configurá cada opción y su cantidad disponible.
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addVariant}
                    disabled={isSubmitting || formData.variants.length >= 40}
                    className="shrink-0 border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar
                  </Button>
                </div>

                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="space-y-3 rounded-lg border border-white/[0.08] bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Variante {index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        disabled={isSubmitting}
                        className="rounded-md p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Eliminar variante ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">
                          Nombre de la variante *
                        </Label>
                        <Input
                          value={variant.label}
                          onChange={(event) =>
                            updateVariant(index, "label", event.target.value)
                          }
                          placeholder="Ej: Negro, Rojo, Edición especial"
                          disabled={isSubmitting}
                          className="border-white/10 bg-white/[0.03] text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">
                          Grupo u opción
                        </Label>
                        <Input
                          value={variant.group || ""}
                          onChange={(event) =>
                            updateVariant(index, "group", event.target.value)
                          }
                          placeholder="Ej: Color"
                          disabled={isSubmitting}
                          className="border-white/10 bg-white/[0.03] text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">
                          Precio particular (opcional)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price ?? ""}
                          onChange={(event) =>
                            updateVariant(
                              index,
                              "price",
                              event.target.value === ""
                                ? null
                                : numberValue(event.target.value)
                            )
                          }
                          disabled={isSubmitting}
                          className="border-white/10 bg-white/[0.03] text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">
                          Unidades disponibles *
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={variant.stockQuantity ?? ""}
                          onChange={(event) =>
                            updateVariant(
                              index,
                              "stockQuantity",
                              event.target.value === ""
                                ? null
                                : numberValue(event.target.value)
                            )
                          }
                          disabled={isSubmitting}
                          className="border-white/10 bg-white/[0.03] text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">
                          Avisar cuando queden
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={variant.minStock ?? 0}
                          onChange={(event) =>
                            updateVariant(
                              index,
                              "minStock",
                              numberValue(event.target.value)
                            )
                          }
                          disabled={isSubmitting}
                          className="border-white/10 bg-white/[0.03] text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">
                          Nota (opcional)
                        </Label>
                        <Input
                          value={variant.note || ""}
                          onChange={(event) =>
                            updateVariant(index, "note", event.target.value)
                          }
                          placeholder="Detalle adicional"
                          disabled={isSubmitting}
                          className="border-white/10 bg-white/[0.03] text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {errors.variants && (
                  <p className="text-xs text-red-400">{errors.variants}</p>
                )}
              </div>
            )}

            {formData.stockMode !== "legacy" && (
              <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div>
                  <p className="text-xs text-zinc-500">
                    Unidades totales configuradas
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {availableStock}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Estado calculado</p>
                  <Badge
                    className={
                      (availableStock ?? 0) > 0
                        ? "mt-1 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "mt-1 border border-red-500/20 bg-red-500/10 text-red-400"
                    }
                  >
                    {(availableStock ?? 0) > 0 ? "Disponible" : "Agotado"}
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg border border-amber-500/15 bg-amber-500/[0.04] p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-xs leading-relaxed text-zinc-400">
                El inventario registra las cantidades disponibles. El stock
                todavía no se descuenta automáticamente por ventas: eso requiere
                conectarlo al proceso de compra.
              </p>
            </div>
          </section>

          {/* TALLAS */}
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Tallas y tamaños
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Definí las opciones del producto. Si elegís inventario por
                talle, cada opción tendrá su propio stock.
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
