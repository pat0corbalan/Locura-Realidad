"use client"

import { useEffect, useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Images } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import { optimizeCloudinaryImage } from "@/utils/optimizeCloudinary"

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

/* ------------------------------------------------------------------ */
/* Cantidad de álbumes por slide según el ancho de pantalla            */
/* 1 en celular, 4 (2x2) en tablet, 6 (3x2) en escritorio              */
/* ------------------------------------------------------------------ */

function useItemsPerSlide() {
  const [items, setItems] = useState(6)

  useEffect(() => {
    const small = window.matchMedia("(max-width: 639px)")
    const medium = window.matchMedia("(max-width: 1023px)")
    const update = () => setItems(small.matches ? 1 : medium.matches ? 4 : 6)

    update()
    small.addEventListener("change", update)
    medium.addEventListener("change", update)
    return () => {
      small.removeEventListener("change", update)
      medium.removeEventListener("change", update)
    }
  }, [])

  return items
}

function chunk<T>(list: T[], size: number): T[][] {
  const groups: T[][] = []
  for (let i = 0; i < list.length; i += size) groups.push(list.slice(i, i + size))
  return groups
}

/* ------------------------------------------------------------------ */
/* Visor de fotos de un álbum                                          */
/* ------------------------------------------------------------------ */

function AlbumViewer({ album, onClose }: { album: Album; onClose: () => void }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(1)
  const [count, setCount] = useState(album.photos.length)

  // Contador "3 / 12"
  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
    const onSelect = () => setCurrent(api.selectedScrollSnap() + 1)
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  // Flechas del teclado funcionan aunque el foco esté en otro botón
  useEffect(() => {
    if (!api) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") api.scrollPrev()
      if (e.key === "ArrowRight") api.scrollNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [api])

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-black/90" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[9999] w-[95vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 outline-none">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-white sm:text-2xl">
                {album.title}
              </Dialog.Title>
              <Dialog.Description className="text-white/80">
                {[album.location, album.description].filter(Boolean).join(" · ") ||
                  "Fotos del álbum"}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 bg-black/50 text-white hover:bg-black/70 hover:text-white"
                aria-label="Cerrar galería"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          <Carousel
            className="w-full"
            opts={{ loop: true }}
            setApi={setApi}
            aria-label={`Fotos de ${album.title}`}
          >
            <CarouselContent>
              {album.photos.map((photo, idx) => (
                <CarouselItem key={idx} className="flex items-center justify-center">
                  <img
                    src={optimizeCloudinaryImage(photo.src, { width: 1200 })}
                    alt={photo.alt || `${album.title}, foto ${idx + 1}`}
                    className="max-h-[75dvh] max-w-full object-contain"
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious
              aria-label="Foto anterior"
              className="left-2 z-10 border-white/30 bg-black/50 text-white hover:bg-black/70 hover:text-white"
            />
            <CarouselNext
              aria-label="Foto siguiente"
              className="right-2 z-10 border-white/30 bg-black/50 text-white hover:bg-black/70 hover:text-white"
            />
          </Carousel>

          <p
            className="mt-3 text-center text-sm text-white/80"
            aria-live="polite"
          >
            {current} / {count}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ------------------------------------------------------------------ */
/* Galería                                                             */
/* ------------------------------------------------------------------ */

export function PhotoGallery() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const itemsPerSlide = useItemsPerSlide()

  useEffect(() => {
    const controller = new AbortController()

    async function fetchAlbums() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/albums", { signal: controller.signal })
        if (!res.ok) throw new Error("Error al cargar álbumes")
        const data: unknown = await res.json()
        // Solo álbumes con al menos una foto (antes uno vacío rompía la portada)
        setAlbums(
          Array.isArray(data)
            ? (data as Album[]).filter((a) => a.photos?.length > 0)
            : []
        )
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        console.error("Error al cargar álbumes:", err)
        setError("No pudimos cargar la galería. Intentá de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
    return () => controller.abort()
  }, [reloadKey])

  const groups = useMemo(
    () => chunk<Album | null>(albums, itemsPerSlide),
    [albums, itemsPerSlide]
  )

  const gridCols =
    itemsPerSlide === 1 ? "grid-cols-1" : itemsPerSlide === 4 ? "grid-cols-2" : "grid-cols-3"

  if (error) {
    return (
      <div role="alert" className="py-10 text-center">
        <p className="mb-4 text-destructive">{error}</p>
        <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (!loading && albums.length === 0) {
    return (
      <p role="status" className="py-10 text-center text-muted-foreground">
        Todavía no hay álbumes. ¡Pronto vamos a subir fotos de nuestros viajes!
      </p>
    )
  }

  return (
    <>
      <p className="mb-4 text-center text-sm text-muted-foreground motion-safe:animate-pulse md:hidden">
        Deslizá para ver más álbumes →
      </p>

      <Carousel className="w-full cursor-grab active:cursor-grabbing" aria-label="Álbumes de fotos">
        <CarouselContent>
          {loading ? (
            <CarouselItem className="px-1 md:px-2">
              <div className={`grid gap-4 ${gridCols}`} role="status" aria-label="Cargando álbumes">
                {Array.from({ length: itemsPerSlide }).map((_, i) => (
                  <Card
                    key={i}
                    className="border-border bg-card p-4 motion-safe:animate-pulse"
                  >
                    <Skeleton className="mb-2 h-48 w-full rounded-md bg-muted" />
                    <Skeleton className="mb-1 h-5 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                  </Card>
                ))}
              </div>
            </CarouselItem>
          ) : (
            groups.map((group, groupIndex) => (
              <CarouselItem key={groupIndex} className="px-1 md:px-2">
                <div className={`grid gap-4 ${gridCols}`}>
                  {group.map(
                    (album) =>
                      album && (
                        <Card
                          key={album._id}
                          className="group overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/50"
                        >
                          {/* Un <button> real: se puede usar con teclado */}
                          <button
                            type="button"
                            onClick={() => setSelectedAlbum(album)}
                            aria-label={`Ver álbum ${album.title}, ${album.photos.length} ${
                              album.photos.length === 1 ? "foto" : "fotos"
                            }`}
                            className="relative block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                          >
                            <img
                              src={optimizeCloudinaryImage(album.photos[0].src, {
                                width: 600,
                              })}
                              alt=""
                              className="h-48 w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                              loading="lazy"
                              decoding="async"
                            />
                            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white">
                              <Images className="h-3 w-3" aria-hidden="true" />
                              {album.photos.length}
                            </span>
                            <span className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-black/80 to-transparent p-4">
                              <span className="block text-lg font-semibold text-white">
                                {album.title}
                              </span>
                              {album.location && (
                                <span className="block text-sm text-white/80">
                                  {album.location}
                                </span>
                              )}
                            </span>
                          </button>
                        </Card>
                      )
                  )}
                </div>
              </CarouselItem>
            ))
          )}
        </CarouselContent>
        <CarouselPrevious aria-label="Álbumes anteriores" />
        <CarouselNext aria-label="Álbumes siguientes" />
      </Carousel>

      {selectedAlbum && (
        <AlbumViewer album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />
      )}
    </>
  )
}