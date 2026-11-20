
"use client"

import { useEffect, useRef, useState } from "react"
import {
  X,
  ImagePlus,
  Images,
  MapPin,
  FileText,
  FolderPlus,
  Loader2,
  Upload,
  Trash2,
  AlertCircle,
  Sparkles,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

export function AlbumModal({
  isOpen,
  onClose,
  onSave,
  album,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isEditing = Boolean(album)

  // --------------------------------------------------
  // SINCRONIZAR FORMULARIO
  // --------------------------------------------------

  useEffect(() => {
    if (!isOpen) return

    setTitle(album?.title || "")
    setDescription(album?.description || "")
    setLocation(album?.location || "")
    setPhotos([])
    setError("")
  }, [isOpen, album])

  // --------------------------------------------------
  // ARCHIVOS
  // --------------------------------------------------

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const selectedFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    )

    if (selectedFiles.length !== files.length) {
      setError("Algunos archivos fueron omitidos porque no son imágenes.")
    } else {
      setError("")
    }

    setPhotos((prev) => [...prev, ...selectedFiles])
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // --------------------------------------------------
  // ENVIAR FORMULARIO
  // --------------------------------------------------

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("El título del álbum es obligatorio.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const formData = new FormData()

      formData.append("title", title.trim())
      formData.append("description", description.trim())
      formData.append("location", location.trim())

      photos.forEach((file) => {
        formData.append("photos", file)
      })

      const method = album ? "PUT" : "POST"
      const url = album
        ? `/api/albums/${album._id}`
        : "/api/albums"

      const res = await fetch(url, {
        method,
        body: formData,
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(
          data?.error || "No se pudo guardar el álbum."
        )
      }

      onSave(data)
      onClose()
    } catch (err) {
      console.error("Error saving album:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado al guardar."
      )
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------
  // CERRAR
  // --------------------------------------------------

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[92vh] max-w-[650px] overflow-hidden border border-white/[0.09] bg-[#0d0d0d] p-0 text-white shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:rounded-[24px]"
      >
        <form onSubmit={handleSubmit} className="flex max-h-[92vh] flex-col">

          {/* HEADER */}

          <div className="relative shrink-0 overflow-hidden border-b border-white/[0.07] px-6 py-6 sm:px-8">
            <div className="pointer-events-none absolute -right-16 -top-28 h-64 w-64 rounded-full bg-red-600/[0.10] blur-[80px]" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/[0.09] text-red-400">
                  {isEditing ? (
                    <Images className="h-5 w-5" />
                  ) : (
                    <FolderPlus className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-400">
                      Biblioteca multimedia
                    </span>
                  </div>

                  <DialogHeader className="space-y-0 text-left">
                    <DialogTitle className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                      {isEditing ? "Editar álbum" : "Crear nuevo álbum"}
                    </DialogTitle>
                  </DialogHeader>

                  <p className="mt-1.5 text-xs leading-5 text-white/40">
                    {isEditing
                      ? "Actualizá los detalles y agregá fotografías a tu colección."
                      : "Creá una nueva colección para organizar tus fotografías."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                aria-label="Cerrar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* BODY */}

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">

            {/* ERROR */}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-3.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

                <p className="text-xs leading-5 text-red-300">
                  {error}
                </p>
              </div>
            )}

            {/* TITLE */}

            <div className="space-y-2">
              <label
                htmlFor="album-title"
                className="flex items-center gap-2 text-xs font-semibold text-white/75"
              >
                <FolderPlus className="h-3.5 w-3.5 text-red-400" />
                Nombre del álbum
                <span className="text-red-400">*</span>
              </label>

              <Input
                id="album-title"
                placeholder="Ej. Noches de fotografía..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                className="h-12 rounded-xl border-white/[0.09] bg-white/[0.025] px-4 text-sm text-white placeholder:text-white/25 focus-visible:border-red-500/50 focus-visible:ring-red-500/10"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="space-y-2">
              <label
                htmlFor="album-description"
                className="flex items-center gap-2 text-xs font-semibold text-white/75"
              >
                <FileText className="h-3.5 w-3.5 text-red-400" />
                Descripción
                <span className="font-normal text-white/30">
                  (Opcional)
                </span>
              </label>

              <Textarea
                id="album-description"
                placeholder="Contá brevemente la historia detrás de este álbum..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={4}
                className="min-h-[110px] resize-y rounded-xl border-white/[0.09] bg-white/[0.025] px-4 py-3 text-sm leading-6 text-white placeholder:text-white/25 focus-visible:border-red-500/50 focus-visible:ring-red-500/10"
              />

              <p className="text-right text-[10px] text-white/25">
                {description.length} caracteres
              </p>
            </div>

            {/* LOCATION */}

            <div className="space-y-2">
              <label
                htmlFor="album-location"
                className="flex items-center gap-2 text-xs font-semibold text-white/75"
              >
                <MapPin className="h-3.5 w-3.5 text-red-400" />
                Ubicación
                <span className="font-normal text-white/30">
                  (Opcional)
                </span>
              </label>

              <Input
                id="album-location"
                placeholder="Ej. Buenos Aires, Argentina"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
                className="h-12 rounded-xl border-white/[0.09] bg-white/[0.025] px-4 text-sm text-white placeholder:text-white/25 focus-visible:border-red-500/50 focus-visible:ring-red-500/10"
              />
            </div>

            {/* PHOTO UPLOAD */}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-white/75">
                  <ImagePlus className="h-3.5 w-3.5 text-red-400" />
                  Fotografías
                </label>

                <span className="text-[10px] text-white/35">
                  {photos.length} seleccionadas
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                disabled={loading}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="group flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.13] bg-white/[0.018] px-5 py-8 text-center transition-all hover:border-red-500/40 hover:bg-red-500/[0.035] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.04] text-white/45 transition-all group-hover:border-red-500/20 group-hover:bg-red-500/10 group-hover:text-red-400">
                  <Upload className="h-5 w-5" />
                </div>

                <p className="text-sm font-semibold text-white/80">
                  Seleccioná tus fotografías
                </p>

                <p className="mt-1.5 text-[11px] text-white/35">
                  Podés seleccionar varias imágenes a la vez
                </p>

                <span className="mt-4 rounded-lg border border-white/[0.09] bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold text-white/55 transition-colors group-hover:text-white">
                  Explorar archivos
                </span>
              </button>

              {/* SELECTED FILES */}

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {photos.map((photo, index) => (
                    <div
                      key={`${photo.name}-${photo.lastModified}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]"
                    >
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={photo.name}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        disabled={loading}
                        aria-label={`Quitar ${photo.name}`}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/75 text-white opacity-100 backdrop-blur-sm transition-colors hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/90 to-transparent px-2 pb-2 pt-5 text-[9px] text-white/75">
                        {photo.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isEditing && (
                <p className="text-[10px] leading-5 text-white/35">
                  Las fotografías existentes se mantienen. Las nuevas
                  imágenes seleccionadas se enviarán al guardar los cambios.
                </p>
              )}
            </div>

            {/* NOTE */}

            <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-red-400/70" />
              <p className="text-[11px] leading-5 text-white/40">
                Organizá tus fotografías con un título y una ubicación
                claros para facilitar su administración y visualización
                en la galería.
              </p>
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-white/[0.07] bg-black/20 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-xl px-5 text-xs font-semibold text-white/50 hover:bg-white/[0.05] hover:text-white"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={loading || !title.trim()}
              className="h-11 rounded-xl bg-red-600 px-6 text-xs font-semibold text-white shadow-[0_6px_20px_rgba(220,38,38,0.18)] transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  {isEditing ? (
                    <Images className="mr-2 h-4 w-4" />
                  ) : (
                    <PlusIcon />
                  )}
                  {isEditing ? "Guardar cambios" : "Crear álbum"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PlusIcon() {
  return <FolderPlus className="mr-2 h-4 w-4" />
}
