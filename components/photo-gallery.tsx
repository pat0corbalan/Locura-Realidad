"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface Photo {
  _id: string
  src: string
  alt: string
  title: string
  location: string
}

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Cargar fotos del backend
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch("/api/photos")
        const data = await res.json()
        setPhotos(data)
      } catch (error) {
        console.error("Error al cargar fotos:", error)
      }
    }

    fetchPhotos()
  }, [])

  const openModal = (photo: Photo) => {
    setSelectedPhoto(photo)
    setCurrentIndex(photos.findIndex((p) => p._id === photo._id))
  }

  const closeModal = () => setSelectedPhoto(null)

  const nextPhoto = () => {
    const nextIndex = (currentIndex + 1) % photos.length
    setCurrentIndex(nextIndex)
    setSelectedPhoto(photos[nextIndex])
  }

  const prevPhoto = () => {
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length
    setCurrentIndex(prevIndex)
    setSelectedPhoto(photos[prevIndex])
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <Card
            key={photo._id}
            className="group cursor-pointer overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300"
            onClick={() => openModal(photo)}
          >
            <div className="relative overflow-hidden">
              <img
                src={photo.src || "/placeholder.svg"}
                alt={photo.alt}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h4 className="text-white font-semibold text-lg">{photo.title}</h4>
                <p className="text-white/80 text-sm">{photo.location}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={closeModal}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={prevPhoto}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={nextPhoto}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            <img
              src={selectedPhoto.src || "/placeholder.svg"}
              alt={selectedPhoto.alt}
              className="max-w-full max-h-full object-contain"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-white text-2xl font-bold mb-2">{selectedPhoto.title}</h3>
              <p className="text-white/80 text-lg">{selectedPhoto.location}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
