"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, MapPin, Eye, Images } from "lucide-react"
import { AlbumModal } from "@/components/admin/album-modal"
import { Album } from "@/components/types/album"

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar álbumes desde la API
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await fetch("/api/albums")
        const data = await res.json()
        setAlbums(data)
      } catch (error) {
        console.error("Error fetching albums:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
  }, [])

  // Filtrar álbumes por búsqueda
  const filteredAlbums = albums.filter(
    (album) =>
      album.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddAlbum = () => {
    setEditingAlbum(null)
    setIsModalOpen(true)
  }

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album)
    setIsModalOpen(true)
  }

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      await fetch(`/api/albums/${albumId}`, { method: "DELETE" })
      setAlbums((prev) => prev.filter((a) => a._id !== albumId))
    } catch (error) {
      console.error("Error deleting album:", error)
    }
  }

  const handleAlbumSaved = (savedAlbum: Album) => {
    setAlbums((prev) => {
      const exists = prev.some((a) => a._id === savedAlbum._id)
      return exists
        ? prev.map((a) => (a._id === savedAlbum._id ? savedAlbum : a))
        : [...prev, savedAlbum]
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Álbumes</h1>
          <p className="text-muted-foreground mt-2">
            Administra los álbumes de fotos subidos a la galería
          </p>
        </div>
        <Button
          onClick={handleAddAlbum}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Álbum
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar álbumes por título, ubicación o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground"
          />
        </div>
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          {filteredAlbums.length} álbum
          {filteredAlbums.length !== 1 ? "es" : ""} encontrado
          {filteredAlbums.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Álbumes Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAlbums.map((album) => (
          <Card
            key={album._id}
            className="bg-card border-border overflow-hidden group hover:ring-2 hover:ring-accent/50 transition-all duration-200"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={album.photos?.[0]?.src || "/placeholder.svg"}
                alt={album.title || "Álbum sin descripción"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEditAlbum(album)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => album._id && handleDeleteAlbum(album._id)}
                  className="bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-card-foreground text-balance mb-2">
                {album.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {album.description || "Sin descripción"}
              </p>
              {album.location && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1 text-accent" />
                  <span className="truncate">{album.location}</span>
                </div>
              )}
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <Images className="w-3 h-3 mr-1" />
                {album.photos?.length || 0} foto
                {album.photos?.length !== 1 ? "s" : ""}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredAlbums.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No se encontraron álbumes
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Comienza agregando tu primer álbum"}
          </p>
          {!searchTerm && (
            <Button
              onClick={handleAddAlbum}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Álbum
            </Button>
          )}
        </div>
      )}

      {/* Modal de creación / edición */}
      <AlbumModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAlbum(null)
        }}
        onSave={handleAlbumSaved}
        album={editingAlbum}
      />
    </div>
  )
}
