"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Package, Save, X, Plus, Trash2 } from "lucide-react"

interface Product {
  id?: number
  name: string
  description: string
  price: number
  originalPrice: number
  costPrice: number
  image: string
  category: string
  rating: number
  inStock: boolean
  sizes: string[]
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Product) => void
  product?: Product | null
}

const categories = ["Ropa", "Accesorios", "Hogar", "Deportes", "Tecnología"]

export function ProductModal({ isOpen, onClose, onSave, product }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    costPrice: 0,
    image: "",
    category: "",
    rating: 5,
    inStock: true,
    sizes: [],
  })

  const [newSize, setNewSize] = useState("")
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        costPrice: product.costPrice,
        image: product.image,
        category: product.category,
        rating: product.rating,
        inStock: product.inStock,
        sizes: [...product.sizes],
      })
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        originalPrice: 0,
        costPrice: 0,
        image: "",
        category: "",
        rating: 5,
        inStock: true,
        sizes: [],
      })
    }
    setErrors({})
    setNewSize("")
  }, [product, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida"
    }

    if (!formData.category) {
      newErrors.category = "La categoría es requerida"
    }

    if (formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0"
    }

    if (formData.originalPrice <= 0) {
      newErrors.originalPrice = "El precio original debe ser mayor a 0"
    }

    if (formData.costPrice <= 0) {
      newErrors.costPrice = "El precio de costo debe ser mayor a 0"
    }

    if (formData.costPrice >= formData.price) {
      newErrors.costPrice = "El precio de costo debe ser menor al precio de venta"
    }

    if (formData.sizes.length === 0) {
      newErrors.sizes = "Debe agregar al menos una talla"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, newSize.trim()] }))
      setNewSize("")
      if (errors.sizes) {
        setErrors((prev) => ({ ...prev, sizes: "" }))
      }
    }
  }

  const removeSize = (sizeToRemove) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((size) => size !== sizeToRemove),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-card-foreground max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-accent" />
            {product ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Preview */}
          {formData.image && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted max-w-md">
              <img
                src={formData.image || "/placeholder.svg"}
                alt={formData.name || "Vista previa"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none"
                }}
              />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre del Producto *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ej: Camiseta Vintage Rock"
                  className={`bg-input border-border ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripción *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe el producto..."
                  rows={4}
                  className={`bg-input border-border resize-none ${errors.description ? "border-destructive" : ""}`}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className={`bg-input border-border ${errors.category ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="text-popover-foreground">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-medium">
                  URL de la Imagen
                </Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange("image", e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="bg-input border-border"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Pricing */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Precio de Venta *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`bg-input border-border ${errors.price ? "border-destructive" : ""}`}
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice" className="text-sm font-medium">
                    Precio Original *
                  </Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange("originalPrice", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`bg-input border-border ${errors.originalPrice ? "border-destructive" : ""}`}
                  />
                  {errors.originalPrice && <p className="text-sm text-destructive">{errors.originalPrice}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costPrice" className="text-sm font-medium">
                    Precio de Costo *
                  </Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => handleInputChange("costPrice", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`bg-input border-border ${errors.costPrice ? "border-destructive" : ""}`}
                  />
                  {errors.costPrice && <p className="text-sm text-destructive">{errors.costPrice}</p>}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label htmlFor="rating" className="text-sm font-medium">
                  Rating (1-5)
                </Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => handleInputChange("rating", Number.parseFloat(e.target.value) || 5)}
                  className="bg-input border-border"
                />
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => handleInputChange("inStock", checked)}
                />
                <Label htmlFor="inStock" className="text-sm font-medium">
                  Producto en stock
                </Label>
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tallas/Tamaños *</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Ej: M, L, XL"
                    className="bg-input border-border"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addSize()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addSize}
                    size="sm"
                    variant="outline"
                    className="border-border bg-transparent"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.sizes.map((size) => (
                    <Badge key={size} variant="secondary" className="bg-muted text-muted-foreground">
                      {size}
                      <button type="button" onClick={() => removeSize(size)} className="ml-2 hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {errors.sizes && <p className="text-sm text-destructive">{errors.sizes}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="border-border bg-transparent">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Save className="w-4 h-4 mr-2" />
              {product ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
