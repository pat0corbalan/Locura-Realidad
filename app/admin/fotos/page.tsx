
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Images,
  Camera,
  Image as ImageIcon,
  Trash2,
  Eye,
  X,
  Loader2,
  MapPin,
  Layers3,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Photo {
  _id: string;
  src: string;
  alt?: string;
  public_id?: string | null;
}

interface Album {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  photos: Photo[];
}

interface GalleryPhoto extends Photo {
  albumId: string;
  albumTitle: string;
  albumLocation?: string;
}

export default function FotosPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/albums", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar las fotografías.");
      }

      const data = await response.json();

      setAlbums(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando fotografías:", error);
      toast.error("No se pudo cargar la galería.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // Unificar todas las fotografías de todos los álbumes.
  const allPhotos = useMemo<GalleryPhoto[]>(() => {
    return albums.flatMap((album) =>
      (album.photos || []).map((photo) => ({
        ...photo,
        albumId: album._id,
        albumTitle: album.title,
        albumLocation: album.location,
      }))
    );
  }, [albums]);

  // Aplicar búsqueda y filtro de álbum.
  const filteredPhotos = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return allPhotos.filter((photo) => {
      const matchesSearch =
        !normalizedSearch ||
        photo.alt?.toLowerCase().includes(normalizedSearch) ||
        photo.albumTitle?.toLowerCase().includes(normalizedSearch) ||
        photo.albumLocation?.toLowerCase().includes(normalizedSearch);

      const matchesAlbum =
        selectedAlbum === "all" ||
        photo.albumId === selectedAlbum;

      return matchesSearch && matchesAlbum;
    });
  }, [allPhotos, searchTerm, selectedAlbum]);

  const albumsWithPhotos = useMemo(
    () => albums.filter((album) => album.photos?.length > 0).length,
    [albums]
  );

  const handleDeletePhoto = async (photo: GalleryPhoto) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      `¿Querés eliminar esta fotografía del álbum "${photo.albumTitle}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(photo._id);

      const response = await fetch(
        `/api/albums/${photo.albumId}/photos/${photo._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo eliminar la fotografía.");
      }

      setAlbums((current) =>
        current.map((album) =>
          album._id === photo.albumId
            ? {
                ...album,
                photos: album.photos.filter(
                  (item) => item._id !== photo._id
                ),
              }
            : album
        )
      );

      setSelectedPhoto((current) =>
        current?._id === photo._id ? null : current
      );

      if (data?.cloudinaryDeleted === false) {
        toast.warning(
          "La foto se quitó del álbum, pero el archivo remoto podría seguir en Cloudinary."
        );
      } else {
        toast.success("Fotografía eliminada correctamente.");
      }
    } catch (error) {
      console.error("Error eliminando fotografía:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al eliminar la fotografía."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAlbum("all");
  };

  const hasFilters = searchTerm.trim() !== "" || selectedAlbum !== "all";

  return (
    <div className="min-h-screen space-y-8 bg-[#080808] p-4 text-white sm:p-6 lg:p-8">
      {/* HEADER */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
            Administración
          </span>
        </div>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Fotografías
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
              Biblioteca centralizada de imágenes. Visualizá y administrá
              todas las fotografías de tus álbumes desde un solo lugar.
            </p>
          </div>

          <Badge className="w-fit border border-white/10 bg-white/[0.04] px-3 py-2 text-zinc-300 hover:bg-white/[0.04]">
            <Images className="mr-2 h-4 w-4 text-red-400" />
            Biblioteca multimedia
          </Badge>
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-white/[0.07] bg-[#111111]">
          <CardContent className="p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
              <Images className="h-5 w-5 text-red-400" />
            </div>

            <p className="mt-5 text-3xl font-bold tabular-nums">
              {allPhotos.length}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Fotografías totales
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/[0.07] bg-[#111111]">
          <CardContent className="p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06]">
              <Layers3 className="h-5 w-5 text-zinc-300" />
            </div>

            <p className="mt-5 text-3xl font-bold tabular-nums">
              {albumsWithPhotos}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Álbumes con fotografías
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/[0.07] bg-[#111111]">
          <CardContent className="p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
              <Camera className="h-5 w-5 text-amber-400" />
            </div>

            <p className="mt-5 text-3xl font-bold tabular-nums">
              {albums.length}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Álbumes registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <Card className="rounded-2xl border-white/[0.07] bg-[#111111]">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_260px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por álbum o ubicación..."
                className="h-12 rounded-xl border-white/10 bg-[#090909] pl-11 pr-10 text-white placeholder:text-zinc-600 focus-visible:ring-red-500/50"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <select
              value={selectedAlbum}
              onChange={(event) => setSelectedAlbum(event.target.value)}
              className="h-12 rounded-xl border border-white/10 bg-[#090909] px-4 text-sm text-zinc-200 outline-none transition focus:border-red-500/50"
            >
              <option value="all">Todos los álbumes</option>

              {albums.map((album) => (
                <option key={album._id} value={album._id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
            <p className="text-sm text-zinc-500">
              Mostrando{" "}
              <span className="font-semibold text-white">
                {filteredPhotos.length}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-white">
                {allPhotos.length}
              </span>{" "}
              fotografías
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-red-400 transition hover:text-red-300"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GALLERY */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              Biblioteca de fotografías
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Todas tus imágenes, organizadas visualmente.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#111111]">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-red-500" />
            <p className="text-sm text-zinc-400">
              Cargando fotografías...
            </p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#111111] px-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
              <ImageIcon className="h-8 w-8 text-zinc-500" />
            </div>

            <h3 className="text-lg font-semibold">
              {allPhotos.length === 0
                ? "Todavía no hay fotografías"
                : "No encontramos fotografías"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
              {allPhotos.length === 0
                ? "Cuando agregues fotografías a tus álbumes, aparecerán automáticamente en esta biblioteca."
                : "Probá cambiar el álbum seleccionado o modificar la búsqueda."}
            </p>

            {hasFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-6 rounded-xl border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.07] hover:text-white"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filteredPhotos.map((photo) => {
              const isDeleting = deletingId === photo._id;

              return (
                <div
                  key={`${photo.albumId}-${photo._id}`}
                  className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#111111] transition duration-300 hover:border-red-500/40 hover:shadow-xl hover:shadow-black/30"
                >
                  {/* IMAGE */}
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className="relative block aspect-square w-full overflow-hidden bg-[#191919] text-left"
                    aria-label={`Ver fotografía de ${photo.albumTitle}`}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt || photo.albumTitle}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm">
                        <Eye className="h-5 w-5" />
                      </div>
                    </div>
                  </button>

                  {/* DELETE */}
                  <button
                    type="button"
                    disabled={isDeleting || deletingId !== null}
                    onClick={() => handleDeletePhoto(photo)}
                    aria-label="Eliminar fotografía"
                    className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-black/70 text-red-400 opacity-100 backdrop-blur-md transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>

                  {/* INFO */}
                  <div className="space-y-2 p-3">
                    <p className="truncate text-xs font-semibold text-white">
                      {photo.albumTitle}
                    </p>

                    {photo.albumLocation && (
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <MapPin className="h-3 w-3 shrink-0 text-red-400" />
                        <span className="truncate">
                          {photo.albumLocation}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-white/[0.06] pt-2">
                      <span className="text-[10px] text-zinc-600">
                        Fotografía
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedPhoto(photo)}
                        className="text-[10px] font-semibold text-red-400 hover:text-red-300"
                      >
                        Ver imagen
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* IMAGE PREVIEW */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {selectedPhoto.albumTitle}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {selectedPhoto.albumLocation || "Sin ubicación"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Cerrar vista previa"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-black/40 p-3 sm:p-6">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.alt || selectedPhoto.albumTitle}
                className="max-h-[65vh] max-w-full rounded-lg object-contain"
              />
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-white/[0.07] p-4 sm:flex-row sm:items-center">
              <div className="text-xs text-zinc-500">
                {selectedPhoto.alt || "Fotografía de la galería"}
              </div>

              <Button
                disabled={deletingId !== null}
                onClick={() => handleDeletePhoto(selectedPhoto)}
                className="gap-2 rounded-xl bg-red-600 text-white hover:bg-red-500"
              >
                {deletingId === selectedPhoto._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Eliminar fotografía
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
