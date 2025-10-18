"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import { optimizeCloudinaryImage } from "@/utils/optimizeCloudinary"

interface Photo {
  _id: string
  src: string
  alt: string
  title: string
  location: string
}

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [itemsPerSlide, setItemsPerSlide] = useState(6) // escritorio por defecto

  // Responsivo: ajusta cuántas fotos por slide
  useEffect(() => {
    const updateItemsPerSlide = () => {
      const width = window.innerWidth
      if (width < 640) {
        setItemsPerSlide(1) // móvil
      } else {
        setItemsPerSlide(6) // escritorio
      }
    }

    updateItemsPerSlide()
    window.addEventListener("resize", updateItemsPerSlide)
    return () => window.removeEventListener("resize", updateItemsPerSlide)
  }, [])

  // Cargar fotos desde API
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch("/api/photos")
        const data: Photo[] = await res.json()
        setPhotos(data)
      } catch (error) {
        console.error("Error al cargar fotos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  // Bloquear scroll al abrir modal
  useEffect(() => {
    if (selectedPhotoIndex !== null) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [selectedPhotoIndex])

  const groupPhotos = (photos: (Photo | null)[], size: number) => {
    const groups = []
    for (let i = 0; i < photos.length; i += size) {
      groups.push(photos.slice(i, i + size))
    }
    return groups
  }

  const displayedPhotos = loading
    ? Array.from({ length: itemsPerSlide * 2 }).map(() => null)
    : photos

  const photoGroups = groupPhotos(displayedPhotos, itemsPerSlide)

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground text-center md:hidden animate-pulse">
          Desliza para ver más fotos →
        </p>
      </div>

      {/* Galería principal */}
      <Carousel className="w-full cursor-grab active:cursor-grabbing">
        <CarouselContent>
          {photoGroups.map((group, index) => (
            <CarouselItem key={index} className="px-1 md:px-2">
              <div
                className={`grid gap-4 ${
                  itemsPerSlide === 1
                    ? "grid-cols-1"
                    : "grid-cols-3 grid-rows-2"
                }`}
              >
                {group.map((photo, idx) =>
                  photo ? (
                    <Card
                      key={photo._id}
                      className="group cursor-pointer overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300"
                      onClick={() =>
                        setSelectedPhotoIndex(index * itemsPerSlide + idx)
                      }
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={
                            optimizeCloudinaryImage(photo.src, { width: 600 }) ||
                            "/placeholder.svg"
                          }
                          alt={photo.alt}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <h4 className="text-white font-semibold text-lg">
                            {photo.title}
                          </h4>
                          <p className="text-white/80 text-sm">
                            {photo.location}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card
                      key={`skeleton-${idx}`}
                      className="p-4 animate-pulse bg-card border-border"
                    >
                      <Skeleton className="h-48 w-full rounded-md mb-2 bg-muted" />
                      <Skeleton className="h-5 w-3/4 mb-1 bg-muted" />
                      <Skeleton className="h-4 w-1/2 bg-muted" />
                    </Card>
                  )
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Modal fullscreen con swipe */}
      {selectedPhotoIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedPhotoIndex(null)}
              aria-label="Cerrar modal"
            >
              <X className="h-6 w-6" />
            </Button>

            <Carousel
              className="w-full"
              opts={{
                startIndex: selectedPhotoIndex,
                loop: true,
              }}
              setApi={(api) => {
                if (!api) return
                api.on("select", () => {
                  const idx = api.selectedScrollSnap()
                  setSelectedPhotoIndex(idx)
                })
              }}
            >
              <CarouselContent>
                {photos.map((photo) => (
                  <CarouselItem
                    key={photo._id}
                    className="flex justify-center items-center"
                  >
                    <div className="flex flex-col items-center max-w-full max-h-[80vh]">
                      <img
                        src={
                          optimizeCloudinaryImage(photo.src, { width: 1200 }) ||
                          "/placeholder.svg"
                        }
                        alt={photo.alt}
                        className="max-w-full max-h-[80vh] object-contain"
                      />
                      <div className="text-center mt-4">
                        <h3 className="text-white text-2xl font-bold">
                          {photo.title}
                        </h3>
                        <p className="text-white/80 text-lg">
                          {photo.location}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white"
              />
              <CarouselNext
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white"
              />
            </Carousel>
          </div>
        </div>
      )}
    </>
  )
}
