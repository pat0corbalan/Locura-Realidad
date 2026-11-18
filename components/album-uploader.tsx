"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function AlbumUploader() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [photos, setPhotos] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photos?.length) return alert("Selecciona al menos una foto")

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("location", location)

    Array.from(photos).forEach((file) => {
      formData.append("photos", file)
    })

    setUploading(true)
    const res = await fetch("/api/albums", {
      method: "POST",
      body: formData,
    })
    setUploading(false)

    if (res.ok) {
      alert("Álbum subido con éxito 🎉")
      setTitle("")
      setDescription("")
      setLocation("")
      setPhotos(null)
    } else {
      alert("Error al subir el álbum 😢")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
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
      <Button type="submit" disabled={uploading}>
        {uploading ? "Subiendo..." : "Subir Álbum"}
      </Button>
    </form>
  )
}
