"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Album } from "@/components/types/album"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (album: Album) => void
  album: Album | null
}

export function AlbumModal({ isOpen, onClose, onSave, album }: Props) {
  const [title, setTitle] = useState(album?.title || "")
  const [description, setDescription] = useState(album?.description || "")
  const [location, setLocation] = useState(album?.location || "")
  const [photos, setPhotos] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("location", location)
    if (photos) Array.from(photos).forEach((file) => formData.append("photos", file))

    const method = album ? "PUT" : "POST"
    const url = album ? `/api/albums/${album._id}` : "/api/albums"

    const res = await fetch(url, { method, body: formData })
    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      onSave(data)
      onClose()
    } else {
      alert("Error al guardar álbum: " + data.error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{album ? "Editar Álbum" : "Nuevo Álbum"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Título del álbum"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="Ubicación"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setPhotos(e.target.files)}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando..." : album ? "Guardar Cambios" : "Crear Álbum"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
