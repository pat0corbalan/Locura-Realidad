"use client"

import { useEffect, useState, memo } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { X, Images, MapPin, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { optimizeCloudinaryImage } from "@/utils/optimizeCloudinary"

export interface AlbumPhoto {
  src: string
  alt?: string
}

export interface Album {
  _id: string
  title: string
  description?: string
  location?: string
  photos: AlbumPhoto[]
}

/* ------------------------------------------------------------------ */
/* Componente: Tarjeta de Álbum                                      */
/* ------------------------------------------------------------------ */
interface AlbumCardProps {
  album: Album
  onSelect: (album: Album) => void
}

const AlbumCard = memo(({ album, onSelect }: AlbumCardProps) => {
  const photoCount = album.photos.length
  const coverImage = album.photos[0]?.src

  return (
    <div
      onClick={() => onSelect(album)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(album)}
      aria-label={`Ver álbum ${album.title}, con ${photoCount} ${photoCount === 1 ? "foto" : "fotos"}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/60 shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Contenedor de la Imagen: Usamos object-contain y un fondo sutil para CERO recortes */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950/90 flex items-center justify-center">
        {coverImage ? (
          <img
            src={optimizeCloudinaryImage(coverImage, { width: 800 })}
            alt={album.title}
            className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <Images className="h-10 w-10 opacity-40" />
          </div>
        )}

        {/* Gradiente Inferior para que el texto resalte siempre */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

        {/* Badge de Fotos Flotante */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/10 shadow-lg">
          <Images className="h-3.5 w-3.5 text-primary-foreground" aria-hidden="true" />
          <span>{photoCount}</span>
        </div>

        {/* Información del Álbum (Ubicación y Título) */}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white flex flex-col justify-end z-10">
          {album.location && (
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-white/80 tracking-wide">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate">{album.location}</span>
            </div>
          )}
          <h3 className="text-lg font-bold tracking-tight line-clamp-1 group-hover:text-primary-foreground transition-colors">
            {album.title}
          </h3>
          {album.description && (
            <p className="mt-0.5 text-xs text-white/70 line-clamp-1 font-normal">
              {album.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
})

AlbumCard.displayName = "AlbumCard"

/* ------------------------------------------------------------------ */
/* Componente: Visor Lightbox Inmersivo                                */
/* ------------------------------------------------------------------ */
interface AlbumViewerProps {
  album: Album
  onClose: () => void
}

function AlbumViewer({ album, onClose }: AlbumViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const photos = album.photos
  const totalPhotos = photos.length

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPhotos - 1))
      if (e.key === "ArrowRight") setCurrentIndex((prev) => (prev < totalPhotos - 1 ? prev + 1 : 0))
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [totalPhotos, onClose])

  const nextPhoto = () => setCurrentIndex((prev) => (prev < totalPhotos - 1 ? prev + 1 : 0))
  const prevPhoto = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPhotos - 1))

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-black/95 backdrop-blur-md animate-in fade-in-0 duration-300" />
        <Dialog.Content className="fixed inset-0 z-[9999] flex flex-col justify-between p-4 sm:p-6 outline-none">
          
          {/* Header del Lightbox */}
          <div className="flex items-center justify-between gap-4 z-10 bg-black/50 p-4 rounded-2xl backdrop-blur-xl border border-white/10 max-w-6xl mx-auto w-full shadow-xl">
            <div>
              <Dialog.Title className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {album.title}
              </Dialog.Title>
              <Dialog.Description className="text-xs sm:text-sm text-white/70">
                {[album.location, album.description].filter(Boolean).join(" · ") || "Álbum fotográfico"}
              </Dialog.Description>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-white/90 border border-white/10">
                {currentIndex + 1} / {totalPhotos}
              </span>
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white transition-all"
                  aria-label="Cerrar visor"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Dialog.Close>
            </div>
          </div>

          {/* Visor de Imagen Central */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden my-4 px-2">
            {totalPhotos > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={prevPhoto}
                className="absolute left-2 sm:left-8 z-20 h-12 w-12 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white border border-white/10 transition-transform active:scale-95 shadow-lg"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            <div className="relative max-h-[72vh] max-w-5xl flex items-center justify-center">
              <img
                src={optimizeCloudinaryImage(photos[currentIndex].src, { width: 1400 })}
                alt={photos[currentIndex].alt || `${album.title} - Foto ${currentIndex + 1}`}
                className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl select-none"
                decoding="async"
              />
            </div>

            {totalPhotos > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={nextPhoto}
                className="absolute right-2 sm:right-8 z-20 h-12 w-12 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white border border-white/10 transition-transform active:scale-95 shadow-lg"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>

          {/* Tira de Miniaturas Inferiores */}
          {totalPhotos > 1 && (
            <div className="hidden sm:flex items-center justify-center gap-2 overflow-x-auto py-2 max-w-4xl mx-auto w-full">
              {photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${
                    currentIndex === idx ? "ring-2 ring-primary scale-105 opacity-100 shadow-lg" : "opacity-40 hover:opacity-80"
                  }`}
                >
                  <img src={optimizeCloudinaryImage(photo.src, { width: 150 })} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ------------------------------------------------------------------ */
/* Componente Principal: PhotoGallery                                  */
/* ------------------------------------------------------------------ */
export function PhotoGallery() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchAlbums() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/albums", { signal: controller.signal })
        if (!res.ok) throw new Error("Error al cargar álbumes")
        const data: unknown = await res.json()
        
        setAlbums(
          Array.isArray(data)
            ? (data as Album[]).filter((a) => a.photos?.length > 0)
            : []
        )
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        console.error("Error al cargar álbumes:", err)
        setError("No pudimos cargar la galería en este momento. Por favor, intentá de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
    return () => controller.abort()
  }, [reloadKey])

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center justify-center py-20 text-center">
        <p className="mb-4 text-sm text-destructive font-medium">{error}</p>
        <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)}>
          Reintentar conexión
        </Button>
      </div>
    )
  }

  if (!loading && albums.length === 0) {
    return (
      <div role="status" className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-full bg-muted p-4 mb-3">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Todavía no hay álbumes publicados. ¡Pronto subiremos nuevas historias!
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Cargando álbumes">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3 p-4 rounded-2xl border border-border/60 bg-card shadow-sm">
              <Skeleton className="h-48 w-full rounded-xl bg-muted" />
              <Skeleton className="h-5 w-3/4 bg-muted" />
              <Skeleton className="h-4 w-1/2 bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <AlbumCard key={album._id} album={album} onSelect={setSelectedAlbum} />
          ))}
        </div>
      )}

      {selectedAlbum && (
        <AlbumViewer album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />
      )}
    </div>
  )
}