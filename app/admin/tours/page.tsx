"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Users,
  DollarSign,
} from "lucide-react"
import { TourModal } from "@/components/admin/tour-modal"
import { Tour } from "@/components/types/tour"

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDestination, setSelectedDestination] = useState("Todos")
  const [selectedGroup, setSelectedGroup] = useState("Todos")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false) // <-- Flag para hidratación

  const destinations = ["Todos", ...new Set(tours.map((tour) => tour.destination))]
  const grupos = ["Todos", ...new Set(tours.map((tour) => tour.grupo ?? ""))]

  useEffect(() => {
    setMounted(true) // <-- Marca que ya estamos en cliente
  }, [])

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/tours")
        if (!response.ok) {
          throw new Error("Error al obtener los tours")
        }
        const data: Tour[] = await response.json()

        // Parsear las fechas para cada tour
        const toursParsed = data.map(tour => ({
          ...tour,
          dates: JSON.parse(tour.dates as unknown as string) // parsea las fechas
        }))

        setTours(toursParsed)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }
    fetchTours()
  }, [])

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tour.grupo && tour.grupo.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDestination =
      selectedDestination === "Todos" || tour.destination === selectedDestination
    const matchesGroup =
      selectedGroup === "Todos" || tour.grupo === selectedGroup

    return matchesSearch && matchesDestination && matchesGroup
  })

  const handleAddTour = () => {
    setEditingTour(null)
    setIsModalOpen(true)
  }

  const handleEditTour = (tour: Tour) => {
    setEditingTour(tour)
    setIsModalOpen(true)
  }

  const handleDeleteTour = async (tourId: string) => {
    try {
      const response = await fetch(`/api/tours/${tourId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar el tour")
      }
      setTours(tours.filter((tour) => tour._id !== tourId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const handleSaveTour = async (tourData: Tour & { imageFile?: File }) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("title", tourData.title)
      formData.append("description", tourData.description)
      formData.append("destination", tourData.destination)
      formData.append("dates", JSON.stringify(tourData.dates))
      formData.append("price", tourData.price.toString())
      if (tourData.grupo) {
        formData.append("grupo", tourData.grupo)
      }
      // `imageFile` solo si existe
      if (tourData.imageFile) {
        formData.append("image", tourData.imageFile)
      }

      const url = editingTour ? `/api/tours/${editingTour._id}` : "/api/tours"
      const method = editingTour ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Error al ${editingTour ? "actualizar" : "crear"} el tour`)
      }

      const savedTour: Tour = await response.json()

      if (editingTour) {
        setTours(tours.map((tour) => (tour._id === savedTour._id ? savedTour : tour)))
      } else {
        setTours([...tours, savedTour])
      }

      setIsModalOpen(false)
      setEditingTour(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    if (!mounted) return dateString // <-- devuelve sin formatear mientras no esté montado para evitar mismatch
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

const getNextDate = (dates: string[]): string => {
  if (!dates || !Array.isArray(dates) || dates.length === 0) return "Sin fechas"
  const today = new Date()
  // Convierte fechas a objetos Date válidos
  const validDates = dates
    .map(date => new Date(date))
    .filter(dateObj => !isNaN(dateObj.getTime())) // solo fechas válidas
  if (validDates.length === 0) return "Sin fechas"

  // Filtra fechas >= hoy
  const futureDates = validDates.filter(dateObj => dateObj >= today)
  if (futureDates.length > 0) {
    // Ordena y toma la más próxima
    futureDates.sort((a, b) => a.getTime() - b.getTime())
    return futureDates[0].toISOString()
  }
  // Si no hay futuras, devuelve la última pasada
  validDates.sort((a, b) => a.getTime() - b.getTime())
  return validDates[validDates.length - 1].toISOString()
}


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Tours</h1>
          <p className="text-muted-foreground mt-2">
            Administra los tours y experiencias disponibles
          </p>
        </div>
        <Button
          onClick={handleAddTour}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Tour
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Filters */}
      {!loading && (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar tours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border text-foreground"
            />
          </div>

          <div className="flex gap-3">
            <Select value={selectedDestination} onValueChange={setSelectedDestination}>
              <SelectTrigger className="w-48 bg-input border-border">
                <SelectValue placeholder="Destino" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {destinations.map((destination) => (
                  <SelectItem key={destination} value={destination} className="text-popover-foreground">
                    {destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-40 bg-input border-border">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
              {grupos
                .filter((grupo) => grupo && grupo.trim() !== "")
                .map((grupo) => (
                  <SelectItem key={grupo} value={grupo} className="text-popover-foreground">
                    {grupo}
                  </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>

          <Badge variant="secondary" className="bg-muted text-muted-foreground self-start lg:self-center">
            {filteredTours.length} tour{filteredTours.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {/* Tours Grid */}
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredTours.map((tour) => (
            <Card key={tour._id} className="bg-card border-border overflow-hidden group hover:ring-2 hover:ring-accent/50 transition-all duration-200">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={tour.image || "/placeholder.svg"}
                  alt={tour.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditTour(tour)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    disabled={loading}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => tour._id && handleDeleteTour(tour._id)}
                    className="bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="absolute top-3 right-3">
                  <Badge className="bg-accent text-accent-foreground font-semibold">
                    <DollarSign className="w-3 h-3 mr-1" />${tour.price}
                  </Badge>
                </div>

                {tour.grupo && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                      <Users className="w-3 h-3 mr-1" />
                      {tour.grupo}
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="p-5">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-card-foreground leading-tight mb-2">
                      {tour.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {tour.description}
                    </p>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-accent" />
                    <span className="truncate">{tour.destination}</span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-accent" />
                    <span>Próxima salida: {formatDate(getNextDate(tour.dates))}</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Fechas disponibles:</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(tour.dates) && tour.dates.slice(0, 3).map((date, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-border text-muted-foreground">
                          {formatDate(date)}
                        </Badge>
                      ))}
                      {Array.isArray(tour.dates) && tour.dates.length > 3 && (
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                          +{tour.dates.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>

                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredTours.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron tours</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedDestination !== "Todos" || selectedGroup !== "Todos"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza agregando tu primer tour"}
          </p>
          {!searchTerm && selectedDestination === "Todos" && selectedGroup === "Todos" && (
            <Button
              onClick={handleAddTour}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Tour
            </Button>
          )}
        </div>
      )}

      <TourModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTour(null)
        }}
        onSave={handleSaveTour}
        tour={editingTour}
      />
    </div>
  )
}
