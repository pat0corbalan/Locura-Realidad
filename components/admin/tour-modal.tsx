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
  id?: number
  title: string
  description: string
  destination: string
  dates: string[]
  price: number
  image: string
  grupo?: string
}

interface TourModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tour: Tour) => void
  tour?: Tour | null
}

export function TourModal({ isOpen, onClose, onSave, tour }: TourModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    dates: [],
    price: 0,
    image: "",
    grupo: "",
  })

  const [newDate, setNewDate] = useState("")
  const [errors, setErrors] = useState({})

  useEffect(() => {
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
  }, [tour, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida"
    }

    if (!formData.destination.trim()) {
      newErrors.destination = "El destino es requerido"
    }

    if (formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0"
    }

    if (formData.dates.length === 0) {
      newErrors.dates = "Debe agregar al menos una fecha"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      // Remove empty grupo if not provided
      const tourData = { ...formData }
      if (!tourData.grupo.trim()) {
        delete tourData.grupo
      }
      onSave(tourData)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addDate = () => {
    if (newDate && !formData.dates.includes(newDate)) {
      const sortedDates = [...formData.dates, newDate].sort()
      setFormData((prev) => ({ ...prev, dates: sortedDates }))
      setNewDate("")
      if (errors.dates) {
        setErrors((prev) => ({ ...prev, dates: "" }))
      }
    }
  }

  const removeDate = (dateToRemove) => {
    setFormData((prev) => ({
      ...prev,
      dates: prev.dates.filter((date) => date !== dateToRemove),
    }))
  }

  const formatDateForDisplay = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Preview */}
          {formData.image && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted max-w-2xl">
              <img
                src={formData.image || "/placeholder.svg"}
                alt={formData.title || "Vista previa"}
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
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Título del Tour *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Aventura en los Andes"
                  className={`bg-input border-border ${errors.title ? "border-destructive" : ""}`}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
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
                  placeholder="Describe la experiencia del tour..."
                  rows={4}
                  className={`bg-input border-border resize-none ${errors.description ? "border-destructive" : ""}`}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination" className="text-sm font-medium">
                  Destino *
                </Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  placeholder="Ej: Cordillera de los Andes"
                  className={`bg-input border-border ${errors.destination ? "border-destructive" : ""}`}
                />
                {errors.destination && <p className="text-sm text-destructive">{errors.destination}</p>}
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
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Precio *
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

              {/* Group (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="grupo" className="text-sm font-medium">
                  Grupo (Opcional)
                </Label>
                <Input
                  id="grupo"
                  value={formData.grupo}
                  onChange={(e) => handleInputChange("grupo", e.target.value)}
                  placeholder="Ej: Aventura Extrema, Cultural, Relax & Spa"
                  className="bg-input border-border"
                />
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fechas Disponibles *</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="bg-input border-border"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <Button
                    type="button"
                    onClick={addDate}
                    size="sm"
                    variant="outline"
                    className="border-border bg-transparent"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                  {formData.dates.map((date) => (
                    <Badge key={date} variant="secondary" className="bg-muted text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDateForDisplay(date)}
                      <button type="button" onClick={() => removeDate(date)} className="ml-2 hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {errors.dates && <p className="text-sm text-destructive">{errors.dates}</p>}
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
              {tour ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
