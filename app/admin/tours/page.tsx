
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Compass,
  RefreshCw,
  ImageIcon,
  ArrowUpRight,
  X,
  Loader2,
  Map,
  CalendarDays,
} from "lucide-react";

import { TourModal } from "@/components/admin/tour-modal";
import { Tour } from "@/components/types/tour";

function normalizeDates(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((date): date is string => typeof date === "string")
      .filter((date) => !Number.isNaN(new Date(date).getTime()));
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .filter((date): date is string => typeof date === "string")
          .filter((date) => !Number.isNaN(new Date(date).getTime()));
      }
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeTour(tour: Tour): Tour {
  return {
    ...tour,
    dates: normalizeDates(
      (tour as unknown as { dates: unknown }).dates
    ),
    price: Number(tour.price) || 0,
    description: tour.description || "",
    destination: tour.destination || "",
    title: tour.title || "",
    image: tour.image || "",
    grupo: tour.grupo || "",
  };
}

function parseLocalDate(date: string): Date {
  const cleanDate = date.slice(0, 10);
  return new Date(`${cleanDate}T00:00:00`);
}

function formatDate(dateString: string): string {
  const date = parseLocalDate(dateString);

  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getNextDate(dates: string[]): string | null {
  if (!Array.isArray(dates) || dates.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validDates = dates
    .map(parseLocalDate)
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  return (
    validDates.find((date) => date >= today)?.toISOString() ||
    validDates[validDates.length - 1]?.toISOString() ||
    null
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("Todos");
  const [selectedGroup, setSelectedGroup] = useState("Todos");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchTours = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tours", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los tours.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("La respuesta del servidor no es válida.");
      }

      setTours(data.map((tour: Tour) => normalizeTour(tour)));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cargar los tours."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const destinations = useMemo(
    () => [
      "Todos",
      ...Array.from(
        new Set(
          tours
            .map((tour) => tour.destination?.trim())
            .filter((destination): destination is string => Boolean(destination))
        )
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [tours]
  );

  const groups = useMemo(
    () => [
      "Todos",
      ...Array.from(
        new Set(
          tours
            .map((tour) => tour.grupo?.trim())
            .filter((group): group is string => Boolean(group))
        )
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [tours]
  );

  const filteredTours = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return tours.filter((tour) => {
      const matchesSearch =
        tour.title.toLowerCase().includes(search) ||
        tour.description.toLowerCase().includes(search) ||
        tour.destination.toLowerCase().includes(search) ||
        (tour.grupo || "").toLowerCase().includes(search);

      const matchesDestination =
        selectedDestination === "Todos" ||
        tour.destination === selectedDestination;

      const matchesGroup =
        selectedGroup === "Todos" || tour.grupo === selectedGroup;

      return matchesSearch && matchesDestination && matchesGroup;
    });
  }, [tours, searchTerm, selectedDestination, selectedGroup]);

  const totalDates = useMemo(
    () => tours.reduce((total, tour) => total + tour.dates.length, 0),
    [tours]
  );

  const totalDestinations = destinations.length - 1;

  const handleAddTour = () => {
    setEditingTour(null);
    setIsModalOpen(true);
    setError(null);
  };

  const handleEditTour = (tour: Tour) => {
    setEditingTour(tour);
    setIsModalOpen(true);
    setError(null);
  };

  const handleDeleteTour = async (tour: Tour) => {
    if (!tour._id || deletingId) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que querés eliminar "${tour.title}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setDeletingId(tour._id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/tours/${tour._id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "No se pudo eliminar el tour.");
      }

      setTours((previous) =>
        previous.filter((item) => item._id !== tour._id)
      );

      setSuccess("El tour se eliminó correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al eliminar el tour."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveTour = async (
    tourData: Tour & { imageFile?: File }
  ) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();

      formData.append("title", tourData.title.trim());
      formData.append("description", tourData.description.trim());
      formData.append("destination", tourData.destination.trim());
      formData.append("dates", JSON.stringify(normalizeDates(tourData.dates)));
      formData.append("price", String(Number(tourData.price) || 0));
      formData.append("grupo", tourData.grupo?.trim() || "");

      if (tourData.imageFile) {
        formData.append("image", tourData.imageFile);
      }

      const isEditing = Boolean(editingTour?._id);

      const url = isEditing
        ? `/api/tours/${editingTour!._id}`
        : "/api/tours";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            `No se pudo ${isEditing ? "actualizar" : "crear"} el tour.`
        );
      }

      const savedTour = normalizeTour(data as Tour);

      if (isEditing) {
        setTours((previous) =>
          previous.map((tour) =>
            tour._id === savedTour._id ? savedTour : tour
          )
        );

        setSuccess("El tour se actualizó correctamente.");
      } else {
        setTours((previous) => [savedTour, ...previous]);

        setSuccess("El nuevo tour se creó correctamente.");
      }

      setIsModalOpen(false);
      setEditingTour(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar el tour.";

      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingTour(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDestination("Todos");
    setSelectedGroup("Todos");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedDestination !== "Todos" ||
    selectedGroup !== "Todos";

  return (
    <div className="min-h-screen space-y-8 pb-10 text-white">
      {/* ENCABEZADO */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111113] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-red-600/[0.12] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-red-900/[0.10] blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
              <Compass className="h-3.5 w-3.5" />
              Administración
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Gestión de <span className="text-red-500">Tours.</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
              Administrá tus experiencias, destinos, fechas disponibles e
              imágenes desde un solo lugar.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={fetchTours}
              disabled={loading}
              variant="outline"
              className="h-11 border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>

            <Button
              onClick={handleAddTour}
              disabled={saving}
              className="h-11 bg-red-600 px-5 font-semibold text-white shadow-lg shadow-red-950/30 hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo tour
            </Button>
          </div>
        </div>
      </section>

      {/* MENSAJES */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/[0.08] p-4 text-sm text-red-300">
          <div className="flex items-center gap-3">
            <X className="h-5 w-5 shrink-0" />
            {error}
          </div>

          <button
            onClick={() => setError(null)}
            className="text-red-300 transition hover:text-white"
            aria-label="Cerrar mensaje"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] p-4 text-sm text-emerald-300">
          <span>{success}</span>

          <button
            onClick={() => setSuccess(null)}
            aria-label="Cerrar mensaje"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ESTADÍSTICAS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Compass className="h-5 w-5" />}
          label="Tours registrados"
          value={tours.length}
          description="Experiencias disponibles"
        />

        <StatCard
          icon={<MapPin className="h-5 w-5" />}
          label="Destinos"
          value={totalDestinations}
          description="Lugares diferentes"
        />

        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Fechas programadas"
          value={totalDates}
          description="Salidas registradas"
        />

        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Categorías"
          value={groups.length - 1}
          description="Grupos de experiencias"
        />
      </section>

      {/* BUSCADOR Y FILTROS */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Tus experiencias
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Explorá, editá y administrá todos tus tours.
            </p>
          </div>

          <Badge className="w-fit border border-white/10 bg-white/[0.05] px-3 py-1.5 text-zinc-300 hover:bg-white/[0.05]">
            {filteredTours.length} resultado
            {filteredTours.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/[0.07] bg-[#111113] p-4 lg:grid-cols-[1fr_220px_200px_auto]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <Input
              placeholder="Buscar por nombre, destino o grupo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 border-white/10 bg-[#19191c] pl-10 text-white placeholder:text-zinc-600 focus-visible:ring-red-500/50"
            />
          </div>

          <Select
            value={selectedDestination}
            onValueChange={setSelectedDestination}
          >
            <SelectTrigger className="h-11 border-white/10 bg-[#19191c] text-zinc-300">
              <SelectValue placeholder="Todos los destinos" />
            </SelectTrigger>

            <SelectContent className="border-white/10 bg-[#19191c] text-white">
              {destinations.map((destination) => (
                <SelectItem key={destination} value={destination}>
                  {destination === "Todos" ? "Todos los destinos" : destination}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedGroup}
            onValueChange={setSelectedGroup}
          >
            <SelectTrigger className="h-11 border-white/10 bg-[#19191c] text-zinc-300">
              <SelectValue placeholder="Todos los grupos" />
            </SelectTrigger>

            <SelectContent className="border-white/10 bg-[#19191c] text-white">
              {groups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group === "Todos" ? "Todos los grupos" : group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-11 border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </section>

      {/* CARGA */}
      {loading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111113]"
            >
              <div className="aspect-[16/10] animate-pulse bg-white/[0.05]" />
              <div className="space-y-4 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-3 w-full animate-pulse rounded bg-white/[0.05]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.05]" />
                <div className="h-10 animate-pulse rounded bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LISTADO */}
      {!loading && filteredTours.length > 0 && (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTours.map((tour) => {
            const nextDate = getNextDate(tour.dates);
            const isDeleting = deletingId === tour._id;

            return (
              <Card
                key={tour._id}
                className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111113] text-white transition-all duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:shadow-2xl hover:shadow-black/30"
              >
                {/* IMAGEN */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#19191c]">
                  {tour.image ? (
                    <img
                      src={tour.image}
                      alt={tour.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-600">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

                  {/* PRECIO */}
                  <div className="absolute right-4 top-4">
                    <Badge className="border border-white/15 bg-black/60 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-md hover:bg-black/60">
                      <DollarSign className="mr-1 h-3.5 w-3.5 text-red-400" />
                      {formatPrice(tour.price)}
                    </Badge>
                  </div>

                  {/* GRUPO */}
                  {tour.grupo && (
                    <div className="absolute left-4 top-4">
                      <Badge className="border border-white/15 bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-md hover:bg-black/50">
                        <Users className="mr-1.5 h-3 w-3" />
                        {tour.grupo}
                      </Badge>
                    </div>
                  )}

                  {/* ACCIONES */}
                  <div className="absolute bottom-4 right-4 flex translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <Button
                      size="icon"
                      onClick={() => handleEditTour(tour)}
                      disabled={saving || deletingId !== null}
                      className="h-10 w-10 border border-white/20 bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
                      title="Editar tour"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      onClick={() => handleDeleteTour(tour)}
                      disabled={saving || deletingId !== null}
                      className="h-10 w-10 border border-red-500/30 bg-red-600/80 text-white backdrop-blur-md hover:bg-red-600"
                      title="Eliminar tour"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* DESTINO */}
                  <div className="absolute bottom-4 left-4 right-28">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                      <MapPin className="h-3.5 w-3.5 text-red-400" />
                      <span className="truncate">{tour.destination}</span>
                    </div>
                  </div>
                </div>

                {/* INFORMACIÓN */}
                <CardHeader className="space-y-4 p-5">
                  <div>
                    <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-white transition-colors group-hover:text-red-400">
                      {tour.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-5 text-zinc-500">
                      {tour.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 border-t border-white/[0.07] pt-4 text-sm">
                    <Calendar className="h-4 w-4 shrink-0 text-red-400" />

                    <span className="text-zinc-500">Próxima salida:</span>

                    <span className="font-medium text-zinc-200">
                      {nextDate
                        ? formatDate(nextDate)
                        : "Sin fechas"}
                    </span>
                  </div>

                  {/* FECHAS */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Fechas disponibles
                      </span>

                      <span className="text-xs text-zinc-600">
                        {tour.dates.length} fecha
                        {tour.dates.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex min-h-7 flex-wrap gap-1.5">
                      {tour.dates.length > 0 ? (
                        <>
                          {tour.dates.slice(0, 3).map((date, index) => (
                            <Badge
                              key={`${date}-${index}`}
                              className="border border-white/[0.08] bg-white/[0.04] text-xs font-normal text-zinc-400 hover:bg-white/[0.04]"
                            >
                              {formatDate(date)}
                            </Badge>
                          ))}

                          {tour.dates.length > 3 && (
                            <Badge className="border border-red-500/20 bg-red-500/[0.08] text-xs text-red-400 hover:bg-red-500/[0.08]">
                              +{tour.dates.length - 3}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-zinc-600">
                          No hay fechas cargadas
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BOTONES */}
                  <div className="grid grid-cols-2 gap-2 border-t border-white/[0.07] pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleEditTour(tour)}
                      disabled={saving || deletingId !== null}
                      className="h-10 border-white/10 bg-white/[0.03] text-zinc-300 hover:border-red-500/30 hover:bg-red-500/[0.07] hover:text-red-400"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleDeleteTour(tour)}
                      disabled={saving || deletingId !== null}
                      className="h-10 border-white/10 bg-white/[0.03] text-zinc-400 hover:border-red-500/30 hover:bg-red-500/[0.07] hover:text-red-400"
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Eliminar
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </section>
      )}

      {/* ESTADO VACÍO */}
      {!loading && filteredTours.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#111113] px-6 py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/[0.08]">
            <Map className="h-8 w-8 text-red-400" />
          </div>

          <h3 className="text-xl font-bold text-white">
            {hasActiveFilters
              ? "No encontramos resultados"
              : "Todavía no hay tours"}
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
            {hasActiveFilters
              ? "Probá cambiar los términos de búsqueda o limpiar los filtros para ver más experiencias."
              : "Comenzá creando tu primera experiencia para que aparezca en esta sección."}
          </p>

          {hasActiveFilters ? (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-6 border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          ) : (
            <Button
              onClick={handleAddTour}
              className="mt-6 bg-red-600 text-white hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear primer tour
            </Button>
          )}
        </div>
      )}

      {/* MODAL */}
      <TourModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveTour}
        tour={editingTour}
      />

      {saving && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-white/10 bg-[#19191c] px-4 py-3 text-sm text-zinc-300 shadow-2xl">
          <Loader2 className="h-4 w-4 animate-spin text-red-400" />
          Guardando cambios...
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111113] p-5 transition-all duration-300 hover:border-red-500/20">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-red-600/[0.06] blur-2xl transition-all group-hover:bg-red-600/[0.12]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>

          <p className="mt-3 text-3xl font-black tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-zinc-600">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/15 bg-red-500/[0.08] text-red-400">
          {icon}
        </div>
      </div>
    </div>
  );
}
