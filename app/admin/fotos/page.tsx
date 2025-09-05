"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, MapPin, Eye } from "lucide-react"
import { PhotoModal } from "@/components/admin/photo-modal"
import { Photo } from "@/components/types/photo"

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar fotos desde la API
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch("/api/photos")
        const data = await res.json()
        setPhotos(data)
      } catch (error) {
        console.error("Error fetching photos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  // Filtrar fotos por búsqueda
  const filteredPhotos = photos.filter(
    (photo) =>
      photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.alt?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddPhoto = () => {
    setEditingPhoto(null)
    setIsModalOpen(true)
  }

  const handleEditPhoto = (photo: Photo) => {
    setEditingPhoto(photo)
    setIsModalOpen(true)
  }


  const handleDeletePhoto = async (photoId: string) => {
    try {
      await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      })
      setPhotos((prev) => prev.filter((photo) => photo._id !== photoId))
    } catch (error) {
      console.error("Error deleting photo:", error)
    }
  }

const handleSavePhoto = async (photoData: Omit<Photo, "_id">) => {
  try {
    const res = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(photoData),
    })

    if (!res.ok) {
      throw new Error("Error al guardar la foto")
    }

    const newPhoto = await res.json()
    setPhotos((prev) => [...prev, newPhoto])
  } catch (error) {
    console.error("Error saving photo:", error)
  } finally {
    setIsModalOpen(false)
    setEditingPhoto(null)
  }
}



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Fotos</h1>
          <p className="text-muted-foreground mt-2">Administra la galería de imágenes</p>
        </div>
        <Button onClick={handleAddPhoto} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Foto
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar fotos por título, ubicación o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground"
          />
        </div>
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          {filteredPhotos.length} foto{filteredPhotos.length !== 1 ? "s" : ""} encontrada
          {filteredPhotos.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Photos Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPhotos.map((photo) => (
          <Card
            key={photo._id}
            className="bg-card border-border overflow-hidden group hover:ring-2 hover:ring-accent/50 transition-all duration-200"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={photo.src || "/placeholder.svg"}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEditPhoto(photo)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeletePhoto(photo._id)}
                  className="bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-card-foreground text-balance mb-2">{photo.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{photo.alt}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1 text-accent" />
                <span className="truncate">{photo.location}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredPhotos.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron fotos</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primera foto"}
          </p>
          {!searchTerm && (
            <Button onClick={handleAddPhoto} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Foto
            </Button>
          )}
        </div>
      )}

      {/* Photo Modal */}
      <PhotoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPhoto(null)
        }}
        onSave={handleSavePhoto}
        photo={editingPhoto}
      />
    </div>
  )
}
