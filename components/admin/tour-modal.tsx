"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MapPin, Save, X, Plus, Trash2, Calendar } from "lucide-react"

interface Tour {
  id?: string;
  title: string;
  description: string;
  destination: string;
  dates: string[];
  price: number;
  image: string | File;
  grupo?: string;
}

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tour: Tour) => void;
  tour?: Tour;
}

export function TourModal({ isOpen, onClose, onSave, tour }: TourModalProps) {
  const [formData, setFormData] = useState<Tour>({
    title: "",
    description: "",
    destination: "",
    dates: [],
    price: 0,
    image: "",
    grupo: "",
  })

  const [newDate, setNewDate] = useState("")
  const [errors, setErrors] = useState<Partial<Record<keyof Tour, string>>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (tour) {
        setFormData({
          title: tour.title,
          description: tour.description,
          destination: tour.destination,
          dates: [...tour.dates],
          price: tour.price,
          image: tour.image,
          grupo: tour.grupo || "",
        })
      } else {
        setFormData({
          title: "",
          description: "",
          destination: "",
          dates: [],
          price: 0,
          image: "",
          grupo: "",
        })
      }
      setErrors({})
      setNewDate("")
      setApiError(null)
    }
  }, [isOpen, tour])

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Tour, string>> = {}

    if (!formData.title.trim()) newErrors.title = "El título es requerido"
    if (!formData.description.trim()) newErrors.description = "La descripción es requerida"
    if (!formData.destination.trim()) newErrors.destination = "El destino es requerido"
    if (formData.price <= 0) newErrors.price = "El precio debe ser mayor a 0"
    if (formData.dates.length === 0) newErrors.dates = "Debe agregar al menos una fecha"
    if (!formData.image) newErrors.image = "Debes seleccionar una imagen"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof Tour, value: string | number | File) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addDate = () => {
    if (newDate && !formData.dates.includes(newDate) && !isNaN(new Date(newDate).getTime())) {
      const sortedDates = [...formData.dates, newDate].sort()
      setFormData((prev) => ({ ...prev, dates: sortedDates }))
      setNewDate("")
      if (errors.dates) {
        setErrors((prev) => ({ ...prev, dates: "" }))
      }
    }
  }

  const removeDate = (dateToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      dates: prev.dates.filter((date) => date !== dateToRemove),
    }))
  }

  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
    setApiError(null)

    const form = new FormData()
    form.append("title", formData.title)
    form.append("description", formData.description)
    form.append("destination", formData.destination)
    form.append("price", Number(formData.price).toFixed(2))
    form.append("dates", JSON.stringify(formData.dates))
    if (formData.grupo) form.append("grupo", formData.grupo)

    if (formData.image instanceof File) {
      form.append("image", formData.image)
    } else if (typeof formData.image === "string" && formData.image) {
      form.append("imageUrl", formData.image)
    } else {
      setErrors((prev) => ({ ...prev, image: "Debes seleccionar una imagen" }))
      return
    }

    try {
      const res = await fetch("/api/tours", {
        method: tour ? "PUT" : "POST",
        body: form,
      })

      if (!res.ok) {
        const error = await res.json()
        setApiError(error?.error || res.statusText)
        return
      }

      const savedTour = await res.json()
      onSave(savedTour)
      onClose()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error en la petición"
      setApiError(errorMessage)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-card-foreground max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5 text-accent" />
            {tour ? "Editar Tour" : "Nuevo Tour"}
          </DialogTitle>
        </DialogHeader>

        {apiError && <p className="text-sm text-destructive">{apiError}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {formData.image && !(formData.image instanceof File) && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted max-w-2xl">
              <img
                src={formData.image || "/placeholder.svg"}
                alt={formData.title || "Vista previa"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                  e.currentTarget.alt = "Imagen no disponible"
                }}
              />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Columna Izquierda */}
            <div className="space-y-4">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título del Tour *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Aventura en los Andes"
                  className={`bg-input border-border ${errors.title ? "border-destructive" : ""}`}
                  aria-label="Título del tour"
                  aria-describedby={errors.title ? "title-error" : undefined}
                />
                {errors.title && (
                  <p id="title-error" className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe la experiencia del tour..."
                  rows={4}
                  className={`bg-input border-border resize-none ${errors.description ? "border-destructive" : ""}`}
                  aria-label="Descripción del tour"
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && (
                  <p id="description-error" className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              {/* Destino */}
              <div className="space-y-2">
                <Label htmlFor="destination">Destino *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  placeholder="Ej: Cordillera de los Andes"
                  className={`bg-input border-border ${errors.destination ? "border-destructive" : ""}`}
                  aria-label="Destino del tour"
                  aria-describedby={errors.destination ? "destination-error" : undefined}
                />
                {errors.destination && (
                  <p id="destination-error" className="text-sm text-destructive">{errors.destination}</p>
                )}
              </div>

              {/* Subida de Imagen */}
              <div className="space-y-2">
                <Label htmlFor="imageFile">Subir Imagen *</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    handleInputChange("image", file || "")
                  }}
                  className="bg-input border-border"
                  aria-label="Subir imagen del tour"
                  aria-describedby={errors.image ? "image-error" : undefined}
                />
                {errors.image && (
                  <p id="image-error" className="text-sm text-destructive">{errors.image}</p>
                )}
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              {/* Precio */}
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={`bg-input border-border ${errors.price ? "border-destructive" : ""}`}
                  aria-label="Precio del tour"
                  aria-describedby={errors.price ? "price-error" : undefined}
                />
                {errors.price && (
                  <p id="price-error" className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              {/* Grupo (opcional) */}
              <div className="space-y-2">
                <Label htmlFor="grupo">Grupo (Opcional)</Label>
                <Input
                  id="grupo"
                  value={formData.grupo}
                  onChange={(e) => handleInputChange("grupo", e.target.value)}
                  placeholder="Ej: Aventura, Relax, Cultural"
                  className="bg-input border-border"
                  aria-label="Grupo del tour"
                />
              </div>

              {/* Fechas */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fechas Disponibles *</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="bg-input border-border"
                    min={new Date().toISOString().split("T")[0]}
                    aria-label="Seleccionar fecha disponible"
                    aria-describedby={errors.dates ? "dates-error" : undefined}
                  />
                  <Button
                    type="button"
                    onClick={addDate}
                    size="sm"
                    variant="outline"
                    className="border-border bg-transparent"
                    aria-label="Agregar fecha"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                  {formData.dates.map((date) => (
                    <Badge key={date} variant="secondary" className="bg-muted text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDateForDisplay(date)}
                      <button
                        type="button"
                        onClick={() => removeDate(date)}
                        className="ml-2 hover:text-destructive"
                        aria-label={`Eliminar fecha ${formatDateForDisplay(date)}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {errors.dates && (
                  <p id="dates-error" className="text-sm text-destructive">{errors.dates}</p>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border bg-transparent"
              aria-label="Cancelar"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              aria-label={tour ? "Actualizar tour" : "Guardar tour"}
            >
              <Save className="w-4 h-4 mr-2" />
              {tour ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}