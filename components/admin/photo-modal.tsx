"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Save, X, UploadCloud } from "lucide-react";
import Image from "next/image";

interface Photo {
  _id?: string;
  src: string;
  alt: string;
  title: string;
  location: string;
}

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (photo: Photo) => void;
  photo?: Photo | null;
}

export function PhotoModal({ isOpen, onClose, onSave, photo }: PhotoModalProps) {
  const [formData, setFormData] = useState<Omit<Photo, "_id">>({
    src: "",
    alt: "",
    title: "",
    location: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (photo) {
      setFormData({
        src: photo.src,
        alt: photo.alt,
        title: photo.title,
        location: photo.location,
      });
      setFile(null);
    } else {
      setFormData({
        src: "",
        alt: "",
        title: "",
        location: "",
      });
    }
    setErrors({});
  }, [photo, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "El título es requerido";
    if (!formData.alt.trim()) newErrors.alt = "La descripción alternativa es requerida";
    if (!formData.location.trim()) newErrors.location = "La ubicación es requerida";

    // Si es una nueva foto y no se ha seleccionado un archivo, también es un error
    if (!photo && !file) newErrors.src = "La imagen es requerida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Opcional: mostrar una vista previa local de la imagen
      const src = URL.createObjectURL(selectedFile);
      setFormData((prev) => ({ ...prev, src }));
      if (errors.src) {
        setErrors((prev) => ({ ...prev, src: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Si estamos editando y no se ha seleccionado un nuevo archivo, solo guardamos los metadatos
    const isEditingWithoutNewFile = photo && !file;

    const finalFormData = new FormData();
    if (file) {
      finalFormData.append("file", file);
    }
    finalFormData.append("title", formData.title);
    finalFormData.append("alt", formData.alt);
    finalFormData.append("location", formData.location);

    if (isEditingWithoutNewFile) {
      // Si solo se están actualizando los metadatos, envía una solicitud diferente
      // Considera crear un endpoint PUT o PATCH para esto. Por ahora, asumiremos que
      // la lógica de tu backend maneja esta situación.
      console.warn("Se están actualizando solo los metadatos. La URL de la imagen no cambiará.");
    }

    try {
      setLoading(true);

      const res = await fetch("/api/photos", {
        method: "POST", // Tu backend unificado manejará ambas lógicas
        body: finalFormData,
      });

      const data = await res.json();

      if (!res.ok) {
        // Manejar errores de validación del backend
        if (data.errors) {
          const newErrors: Record<string, string> = {};
          for (const key in data.errors) {
            newErrors[key] = data.errors[key].message;
          }
          setErrors(newErrors);
        }
        throw new Error(data.message || "Error al guardar la foto");
      }

      onSave(data);
      onClose();
    } catch (error: any) {
      console.error("Error al enviar el formulario:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-card-foreground max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Camera className="w-5 h-5 mr-2 text-accent" />
            {photo ? "Editar Foto" : "Nueva Foto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {(formData.src || file) && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={file ? URL.createObjectURL(file) : formData.src}
                alt={formData.alt || "Vista previa"}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Imagen *</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                {loading ? "Subiendo..." : "Subir imagen"}
              </Button>
              {formData.src && (
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {file ? file.name : "Imagen cargada"}
                </span>
              )}
            </div>
            {errors.src && <p className="text-sm text-destructive">{errors.src}</p>}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ej: Atardecer en la montaña"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt">Descripción Alternativa *</Label>
              <Textarea
                id="alt"
                value={formData.alt}
                onChange={(e) => handleInputChange("alt", e.target.value)}
                placeholder="Describe la imagen para accesibilidad..."
                className={`resize-none ${errors.alt ? "border-destructive" : ""}`}
                rows={3}
              />
              {errors.alt && <p className="text-sm text-destructive">{errors.alt}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Ej: Cordillera de los Andes"
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {photo ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
