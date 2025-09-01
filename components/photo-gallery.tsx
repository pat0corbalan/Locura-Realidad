"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface Photo {
  id: number
  src: string
  alt: string
  title: string
  location: string
}

const photos: Photo[] = [
  {
    id: 1,
    src: "/gallery-rock-concert-crowd-energy.png",
    alt: "Multitud en concierto de rock",
    title: "Energía Pura",
    location: "Londres, Reino Unido",
  },
  {
    id: 2,
    src: "/gallery-vintage-guitar-collection-studio.png",
    alt: "Colección de guitarras vintage",
    title: "Guitarras Legendarias",
    location: "Abbey Road Studios",
  },
  {
    id: 3,
    src: "/gallery-rock-fans-tour-group-happy.png",
    alt: "Grupo de fans en tour",
    title: "Momentos Únicos",
    location: "Berlín, Alemania",
  },
  {
    id: 4,
    src: "/gallery-historic-rock-venue-stage.png",
    alt: "Escenario histórico de rock",
    title: "Escenarios Míticos",
    location: "The Cavern Club",
  },
  {
    id: 5,
    src: "/gallery-vinyl-records-collection-wall.png",
    alt: "Colección de vinilos en pared",
    title: "Tesoros Musicales",
    location: "Seattle, Estados Unidos",
  },
  {
    id: 6,
    src: "/gallery-rock-memorabilia-museum-display.png",
    alt: "Memorabilia de rock en museo",
    title: "Historia del Rock",
    location: "Rock and Roll Hall of Fame",
  },
]

export function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openModal = (photo: Photo) => {
    setSelectedPhoto(photo)
    setCurrentIndex(photos.findIndex((p) => p.id === photo.id))
  }

  const closeModal = () => {
    setSelectedPhoto(null)
  }

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
            key={photo.id}
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
