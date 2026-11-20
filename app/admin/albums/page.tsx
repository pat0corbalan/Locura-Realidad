
"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  MapPin,
  Images,
  ArrowUpRight,
  Image as ImageIcon,
  X,
  FolderOpen,
  Camera,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlbumModal } from "@/components/admin/album-modal"
import { Album } from "@/components/types/album"

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // --------------------------------------------------
  // CARGAR ÁLBUMES
  // --------------------------------------------------

  const fetchAlbums = async () => {
    try {
      setError("")

      const res = await fetch("/api/albums", {
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error("No se pudieron cargar los álbumes.")
      }

      const data = await res.json()

      if (!Array.isArray(data)) {
        throw new Error("La respuesta de la API no es válida.")
      }

      setAlbums(data)
    } catch (err) {
      console.error("Error fetching albums:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cargar los álbumes."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlbums()
  }, [])

  // --------------------------------------------------
  // FILTRADO
  // --------------------------------------------------

  const filteredAlbums = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) return albums

    return albums.filter((album) => {
      const title = album.title?.toLowerCase() || ""
      const location = album.location?.toLowerCase() || ""
      const description = album.description?.toLowerCase() || ""

      return (
        title.includes(term) ||
        location.includes(term) ||
        description.includes(term)
      )
    })
  }, [albums, searchTerm])

  // --------------------------------------------------
  // ESTADÍSTICAS
  // --------------------------------------------------

  const totalPhotos = albums.reduce(
    (total, album) => total + (album.photos?.length || 0),
    0
  )

  const totalLocations = new Set(
    albums
      .map((album) => album.location?.trim().toLowerCase())
      .filter(Boolean)
  ).size

  // --------------------------------------------------
  // CREAR / EDITAR
  // --------------------------------------------------

  const handleAddAlbum = () => {
    setEditingAlbum(null)
    setIsModalOpen(true)
  }

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album)
    setIsModalOpen(true)
  }

  const handleAlbumSaved = (savedAlbum: Album) => {
    setAlbums((prev) => {
      const exists = prev.some(
        (album) => album._id === savedAlbum._id
      )

      if (exists) {
        return prev.map((album) =>
          album._id === savedAlbum._id ? savedAlbum : album
        )
      }

      return [savedAlbum, ...prev]
    })

    setIsModalOpen(false)
    setEditingAlbum(null)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAlbum(null)
  }

  // --------------------------------------------------
  // ELIMINAR
  // --------------------------------------------------

  const handleDeleteAlbum = async (album: Album) => {
    if (!album._id) return

    const confirmed = window.confirm(
      `¿Estás seguro de que querés eliminar el álbum "${album.title}"? Esta acción no se puede deshacer.`
    )

    if (!confirmed) return

    const albumId = String(album._id)

    try {
      setDeletingId(albumId)
      setError("")

      const res = await fetch(`/api/albums/${albumId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)

        throw new Error(
          data?.error || "No se pudo eliminar el álbum."
        )
      }

      setAlbums((prev) =>
        prev.filter((item) => String(item._id) !== albumId)
      )
    } catch (err) {
      console.error("Error deleting album:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al eliminar el álbum."
      )
    } finally {
      setDeletingId(null)
    }
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="min-h-full space-y-8 pb-12 text-white">

      {/* HEADER */}

      <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#101010]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-40 h-[420px] w-[420px] rounded-full bg-red-600/[0.10] blur-[110px]" />
          <div className="absolute -bottom-48 left-1/3 h-[300px] w-[300px] rounded-full bg-red-900/[0.08] blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_35%,rgba(255,255,255,0.025)_100%)]" />
        </div>

        <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.08] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                Administración de contenido
              </span>
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl lg:text-[58px]">
              Tus <span className="text-red-500">álbumes.</span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-white/45 sm:text-base">
              Gestioná tus historias visuales, organizá tus fotografías
              y mantené tu galería siempre actualizada.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleAddAlbum}
              className="h-12 rounded-xl bg-red-600 px-6 font-semibold text-white shadow-[0_8px_30px_rgba(220,38,38,0.20)] transition-all hover:bg-red-500 hover:shadow-[0_8px_35px_rgba(220,38,38,0.30)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear álbum
            </Button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 border-t border-white/[0.07] bg-black/20">
          <div className="border-r border-white/[0.07] px-5 py-5 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/35">
              Álbumes
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {albums.length}
              </span>
              <FolderOpen className="h-4 w-4 text-red-500/80" />
            </div>
          </div>

          <div className="border-r border-white/[0.07] px-5 py-5 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/35">
              Fotografías
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {totalPhotos}
              </span>
              <Camera className="h-4 w-4 text-red-500/80" />
            </div>
          </div>

          <div className="px-5 py-5 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/35">
              Ubicaciones
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {totalLocations}
              </span>
              <MapPin className="h-4 w-4 text-red-500/80" />
            </div>
          </div>
        </div>
      </section>

      {/* TOOLBAR */}

      <section className="space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-red-500" />
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Biblioteca de álbumes
              </h2>
            </div>

            <p className="mt-1 text-sm text-white/40">
              Explorá y administrá todo tu contenido fotográfico.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar álbumes..."
                className="h-11 rounded-xl border-white/[0.09] bg-[#111111] pl-11 pr-10 text-sm text-white placeholder:text-white/30 focus-visible:border-red-500/50 focus-visible:ring-red-500/10"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/35 transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={fetchAlbums}
              disabled={loading}
              className="h-11 rounded-xl border-white/[0.09] bg-white/[0.03] px-4 text-white/70 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Images className="h-4 w-4" />
            <span>
              Mostrando{" "}
              <strong className="font-semibold text-white">
                {filteredAlbums.length}
              </strong>{" "}
              de{" "}
              <strong className="font-semibold text-white">
                {albums.length}
              </strong>{" "}
              álbumes
            </span>
          </div>

          {searchTerm && (
            <span className="rounded-full border border-red-500/20 bg-red-500/[0.07] px-3 py-1 text-[10px] font-semibold text-red-400">
              Búsqueda activa
            </span>
          )}
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <X className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-red-300">
                Ocurrió un problema
              </p>
              <p className="mt-1 text-xs text-red-300/60">{error}</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={fetchAlbums}
            className="h-9 rounded-lg border-red-500/20 bg-transparent text-xs text-red-300 hover:bg-red-500/10"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111111]"
            >
              <div className="aspect-[4/3] animate-pulse bg-white/[0.05]" />

              <div className="space-y-3 p-5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.07]" />
                <div className="h-3 w-full animate-pulse rounded bg-white/[0.05]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ALBUM GRID */}

      {!loading && filteredAlbums.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAlbums.map((album, index) => {
            const albumId = album._id ? String(album._id) : ""
            const cover = album.photos?.[0]?.src

            return (
              <article
                key={albumId || index}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111] transition-all duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:shadow-[0_18px_50px_rgba(0,0,0,0.30)]"
              >
                {/* IMAGE */}

                <div className="relative aspect-[4/3] overflow-hidden bg-[#191919]">
                  {cover ? (
                    <img
                      src={cover}
                      alt={album.title || "Portada del álbum"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/20">
                      <ImageIcon className="h-10 w-10" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                        Sin portada
                      </span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10" />

                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 backdrop-blur-md">
                    <Images className="h-3 w-3 text-red-400" />
                    <span className="text-[10px] font-semibold text-white">
                      {album.photos?.length || 0}{" "}
                      {(album.photos?.length || 0) === 1 ? "foto" : "fotos"}
                    </span>
                  </div>

                  {/* ACTIONS */}

                  <div className="absolute right-3 top-3 flex translate-y-1 gap-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleEditAlbum(album)}
                      aria-label={`Editar ${album.title || "álbum"}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-white backdrop-blur-md transition-all hover:border-white/30 hover:bg-white hover:text-black"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAlbum(album)}
                      disabled={!albumId || deletingId === albumId}
                      aria-label={`Eliminar ${album.title || "álbum"}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/80 text-white backdrop-blur-md transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === albumId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* BOTTOM TITLE */}

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="line-clamp-1 text-lg font-semibold tracking-tight text-white">
                      {album.title || "Álbum sin título"}
                    </p>

                    {album.location && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-white/65">
                        <MapPin className="h-3 w-3 shrink-0 text-red-400" />
                        <span className="truncate">{album.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CONTENT */}

                <div className="p-4">
                  <p className="min-h-[42px] line-clamp-2 text-xs leading-5 text-white/40">
                    {album.description || "Este álbum todavía no tiene una descripción."}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
                    <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/30">
                      Álbum fotográfico
                    </span>

                    <button
                      type="button"
                      onClick={() => handleEditAlbum(album)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 transition-colors hover:text-red-300"
                    >
                      Administrar
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* EMPTY STATE */}

      {!loading && filteredAlbums.length === 0 && (
        <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/[0.10] bg-white/[0.015] px-6 py-12 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
            {searchTerm ? (
              <Search className="h-7 w-7 text-white/35" />
            ) : (
              <FolderOpen className="h-7 w-7 text-white/35" />
            )}
          </div>

          <h3 className="text-xl font-semibold tracking-tight text-white">
            {searchTerm
              ? "No encontramos resultados"
              : "Tu biblioteca está vacía"}
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-white/40">
            {searchTerm
              ? "Probá con otro título, ubicación o descripción para encontrar el álbum que buscás."
              : "Todavía no creaste ningún álbum. Empezá organizando tus fotografías en una nueva colección."}
          </p>

          {searchTerm ? (
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="mt-6 h-11 rounded-xl border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar búsqueda
            </Button>
          ) : (
            <Button
              onClick={handleAddAlbum}
              className="mt-6 h-11 rounded-xl bg-red-600 px-6 font-semibold text-white hover:bg-red-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear primer álbum
            </Button>
          )}
        </div>
      )}

      {/* MODAL */}

      <AlbumModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleAlbumSaved}
        album={editingAlbum}
      />
    </div>
  )
}
