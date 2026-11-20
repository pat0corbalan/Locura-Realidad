
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Save,
  X,
  Plus,
  Trash2,
  Calendar,
  ImagePlus,
  Loader2,
} from "lucide-react";
import { Tour } from "@/components/types/tour";

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tour: Tour & { imageFile?: File }) => Promise<void>;
  tour?: Tour | null;
}

type TourForm = {
  title: string;
  description: string;
  destination: string;
  dates: string[];
  price: number;
  image: string;
  grupo: string;
};

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitialForm(tour?: Tour | null): TourForm {
  return {
    title: tour?.title || "",
    description: tour?.description || "",
    destination: tour?.destination || "",
    dates: Array.isArray(tour?.dates) ? [...tour.dates] : [],
    price: Number(tour?.price) || 0,
    image: tour?.image || "",
    grupo: tour?.grupo || "",
  };
}

export function TourModal({
  isOpen,
  onClose,
  onSave,
  tour,
}: TourModalProps) {
  const [formData, setFormData] = useState<TourForm>(() =>
    getInitialForm(tour)
  );
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [previewImage, setPreviewImage] = useState("");
  const [newDate, setNewDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormData(getInitialForm(tour));
    setImageFile(undefined);
    setPreviewImage(tour?.image || "");
    setNewDate("");
    setErrors({});
    setSubmitError("");
  }, [tour, isOpen]);

  // Crea y revoca la URL temporal de la imagen seleccionada.
  useEffect(() => {
    if (!imageFile) {
      setPreviewImage(tour?.image || "");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewImage(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile, tour?.image]);

  const handleInputChange = <K extends keyof TourForm>(
    field: K,
    value: TourForm[K]
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setSubmitError("");
  };

  const handleImageChange = (file?: File) => {
    setImageFile(file);
    setErrors((previous) => ({
      ...previous,
      image: "",
    }));
  };

  const addDate = () => {
    if (!newDate) return;

    if (formData.dates.includes(newDate)) {
      setErrors((previous) => ({
        ...previous,
        dates: "Esa fecha ya fue agregada.",
      }));
      return;
    }

    const dates = [...formData.dates, newDate].sort();

    setFormData((previous) => ({
      ...previous,
      dates,
    }));

    setNewDate("");
    setErrors((previous) => ({
      ...previous,
      dates: "",
    }));
  };

  const removeDate = (dateToRemove: string) => {
    setFormData((previous) => ({
      ...previous,
      dates: previous.dates.filter((date) => date !== dateToRemove),
    }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      nextErrors.title = "El título es obligatorio.";
    }

    if (!formData.description.trim()) {
      nextErrors.description = "La descripción es obligatoria.";
    }

    if (!formData.destination.trim()) {
      nextErrors.destination = "El destino es obligatorio.";
    }

    if (!Number.isFinite(formData.price) || formData.price <= 0) {
      nextErrors.price = "El precio debe ser mayor a cero.";
    }

    if (formData.dates.length === 0) {
      nextErrors.dates = "Agregá al menos una fecha disponible.";
    }

    if (!tour && !imageFile) {
      nextErrors.image = "Seleccioná una imagen para el tour.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || !validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await onSave({
        ...formData,
        dates: [...formData.dates].sort(),
        imageFile,
      });

      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el tour. Intentá nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto border-white/10 bg-[#101010] p-0 text-white shadow-2xl">
        <div className="border-b border-white/10 bg-gradient-to-r from-red-950/40 via-[#151515] to-[#101010] px-6 py-6 sm:px-8">
          <DialogHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
              <MapPin className="h-5 w-5 text-red-400" />
            </div>

            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
              {tour ? "Editar experiencia" : "Crear nuevo tour"}
            </DialogTitle>

            <p className="mt-1 text-sm text-zinc-400">
              Completá los detalles de la experiencia y sus próximas salidas.
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 p-6 sm:p-8">
          {submitError && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {submitError}
            </div>
          )}

          <div className="grid gap-7 lg:grid-cols-[1fr_0.85fr]">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="tour-title" className="text-zinc-200">
                  Nombre del tour *
                </Label>
                <Input
                  id="tour-title"
                  value={formData.title}
                  onChange={(event) =>
                    handleInputChange("title", event.target.value)
                  }
                  placeholder="Ej. Aventura en los Andes"
                  disabled={isSubmitting}
                  className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
                />
                {errors.title && (
                  <p className="text-xs text-red-400">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tour-description" className="text-zinc-200">
                  Descripción *
                </Label>
                <Textarea
                  id="tour-description"
                  value={formData.description}
                  onChange={(event) =>
                    handleInputChange("description", event.target.value)
                  }
                  placeholder="Contá qué hace especial a esta experiencia..."
                  rows={5}
                  disabled={isSubmitting}
                  className="resize-none border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
                />
                {errors.description && (
                  <p className="text-xs text-red-400">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tour-destination" className="text-zinc-200">
                  Destino *
                </Label>
                <Input
                  id="tour-destination"
                  value={formData.destination}
                  onChange={(event) =>
                    handleInputChange("destination", event.target.value)
                  }
                  placeholder="Ej. Cordillera de los Andes"
                  disabled={isSubmitting}
                  className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
                />
                {errors.destination && (
                  <p className="text-xs text-red-400">
                    {errors.destination}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tour-group" className="text-zinc-200">
                  Categoría o grupo
                </Label>
                <Input
                  id="tour-group"
                  value={formData.grupo}
                  onChange={(event) =>
                    handleInputChange("grupo", event.target.value)
                  }
                  placeholder="Ej. Aventura, Cultural, Relax"
                  disabled={isSubmitting}
                  className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="tour-price" className="text-zinc-200">
                  Precio *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                    $
                  </span>
                  <Input
                    id="tour-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={(event) =>
                      handleInputChange(
                        "price",
                        Number(event.target.value) || 0
                      )
                    }
                    placeholder="0"
                    disabled={isSubmitting}
                    className="h-11 border-white/10 bg-white/[0.04] pl-8 text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-red-400">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-200">Imagen del tour *</Label>

                <label
                  htmlFor="tour-image"
                  className="group flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.025] transition hover:border-red-500/50 hover:bg-red-500/[0.04]"
                >
                  {previewImage ? (
                    <div className="relative aspect-[16/10] w-full">
                      <img
                        src={previewImage}
                        alt="Vista previa del tour"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                        <span className="flex items-center gap-2 text-sm font-medium text-white">
                          <ImagePlus className="h-4 w-4" />
                          Cambiar imagen
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-44 flex-col items-center justify-center gap-3 p-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-400">
                        <ImagePlus className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          Seleccioná una imagen
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          JPG, PNG o WEBP · Máximo 10 MB
                        </p>
                      </div>
                    </div>
                  )}
                </label>

                <input
                  id="tour-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={isSubmitting}
                  onChange={(event) => {
                    handleImageChange(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />

                {errors.image && (
                  <p className="text-xs text-red-400">{errors.image}</p>
                )}

                {tour && (
                  <p className="text-xs text-zinc-500">
                    Si no seleccionás una imagen nueva, se conserva la actual.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Fechas disponibles
                </h3>
                <p className="text-xs text-zinc-500">
                  Agregá las fechas en las que se realizará el tour.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="date"
                value={newDate}
                min={getLocalDate()}
                onChange={(event) => setNewDate(event.target.value)}
                disabled={isSubmitting}
                className="h-11 border-white/10 bg-white/[0.04] text-white [color-scheme:dark] focus-visible:ring-red-500/40"
              />

              <Button
                type="button"
                onClick={addDate}
                disabled={!newDate || isSubmitting}
                className="h-11 shrink-0 bg-red-600 text-white hover:bg-red-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar fecha
              </Button>
            </div>

            {errors.dates && (
              <p className="text-xs text-red-400">{errors.dates}</p>
            )}

            {formData.dates.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.dates.map((date) => (
                  <Badge
                    key={date}
                    className="gap-2 border border-white/10 bg-white/[0.06] px-3 py-2 text-zinc-200 hover:bg-white/[0.08]"
                  >
                    <Calendar className="h-3 w-3 text-red-400" />
                    {formatDate(date)}
                    <button
                      type="button"
                      aria-label={`Eliminar fecha ${date}`}
                      onClick={() => removeDate(date)}
                      disabled={isSubmitting}
                      className="ml-1 text-zinc-500 transition hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-white/10 py-5 text-center text-xs text-zinc-500">
                Todavía no agregaste fechas.
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/[0.06] hover:text-white"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 text-white shadow-lg shadow-red-950/30 hover:bg-red-500"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSubmitting
                ? "Guardando..."
                : tour
                  ? "Guardar cambios"
                  : "Crear tour"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
