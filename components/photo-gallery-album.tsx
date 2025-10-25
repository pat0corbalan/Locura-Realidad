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

// Estructuras de datos nuevas
interface AlbumPhoto {
  src: string
  alt?: string
}

interface Album {
  _id: string
  title: string
  description?: string
  location?: string
  photos: AlbumPhoto[]
}

export function PhotoGallery() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlbumIndex, setSelectedAlbumIndex] = useState<number | null>(null)
  const [itemsPerSlide, setItemsPerSlide] = useState(6) // escritorio por defecto

  // Responsivo
  useEffect(() => {
    const updateItemsPerSlide = () => {
      const width = window.innerWidth
      setItemsPerSlide(width < 640 ? 1 : 6)
    }

    updateItemsPerSlide()
    window.addEventListener("resize", updateItemsPerSlide)
    return () => window.removeEventListener("resize", updateItemsPerSlide)
  }, [])

  // Cargar álbumes desde la API
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await fetch("/api/albums")
        if (!res.ok) throw new Error("Error al cargar álbumes")
        const data: Album[] = await res.json()
        setAlbums(data)
      } catch (error) {
        console.error("Error al cargar álbumes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
  }, [])

  // Bloquear scroll al abrir modal
  useEffect(() => {
    if (selectedAlbumIndex !== null) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [selectedAlbumIndex])

  // Agrupar álbumes por slide
  const groupAlbums = (albums: (Album | null)[], size: number) => {
    const groups = []
    for (let i = 0; i < albums.length; i += size) {
      groups.push(albums.slice(i, i + size))
    }
    return groups
  }

  const displayedAlbums = loading
    ? Array.from({ length: itemsPerSlide * 2 }).map(() => null)
    : albums

  const albumGroups = groupAlbums(displayedAlbums, itemsPerSlide)

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground text-center md:hidden animate-pulse">
          Desliza para ver más álbumes →
        </p>
      </div>

      {/* Carrusel principal de álbumes */}
      <Carousel className="w-full cursor-grab active:cursor-grabbing">
        <CarouselContent>
          {albumGroups.map((group, index) => (
            <CarouselItem key={index} className="px-1 md:px-2">
              <div
                className={`grid gap-4 ${
                  itemsPerSlide === 1 ? "grid-cols-1" : "grid-cols-3 grid-rows-2"
                }`}
              >
                {group.map((album, idx) =>
                  album ? (
                    <Card
                      key={album._id}
                      className="group cursor-pointer overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300"
                      onClick={() => setSelectedAlbumIndex(index * itemsPerSlide + idx)}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={
                            optimizeCloudinaryImage(album.photos[0]?.src, { width: 600 }) ||
                            "/placeholder.svg"
                          }
                          alt={album.photos[0]?.alt || album.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <h4 className="text-white font-semibold text-lg">
                            {album.title}
                          </h4>
                          {album.location && (
                            <p className="text-white/80 text-sm">{album.location}</p>
                          )}
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

      {/* Modal: fotos del álbum seleccionado */}
      {selectedAlbumIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedAlbumIndex(null)}
              aria-label="Cerrar modal"
            >
              <X className="h-6 w-6" />
            </Button>

            <Carousel className="w-full" opts={{ loop: true }}>
              <CarouselContent>
                {albums[selectedAlbumIndex]?.photos.map((photo, idx) => (
                  <CarouselItem
                    key={idx}
                    className="flex justify-center items-center"
                  >
                    <div className="flex flex-col items-center max-w-full max-h-[80vh]">
                      <img
                        src={
                          optimizeCloudinaryImage(photo.src, { width: 1200 }) ||
                          "/placeholder.svg"
                        }
                        alt={photo.alt || albums[selectedAlbumIndex]?.title}
                        className="max-w-full max-h-[80vh] object-contain"
                      />
                      <div className="text-center mt-4">
                        <h3 className="text-white text-2xl font-bold">
                          {albums[selectedAlbumIndex]?.title}
                        </h3>
                        {albums[selectedAlbumIndex]?.location && (
                          <p className="text-white/80 text-lg">
                            {albums[selectedAlbumIndex]?.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white" />
            </Carousel>
          </div>
        </div>
      )}
    </>
  )
}
