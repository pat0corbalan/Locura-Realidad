"use client";

import { useState } from "react";
import { Tour } from "@/components/types/tour";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { optimizeCloudinaryImage } from "@/utils/optimizeCloudinary";
// Sugerencia: mové ExpandableDescription a su propio archivo
// (ej. components/expandable-description.tsx); no tiene por qué vivir en la tienda.
import { ExpandableDescription } from "@/components/merchandise-store";

interface TourListProps {
  tours: Tour[];
  loading: boolean;
  error: string | null;
  onReservar: (tour: Tour) => void;
}

/* ------------------------------------------------------------------ */
/* Helpers (fuera del componente: se crean una sola vez)               */
/* ------------------------------------------------------------------ */

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Convierte un string a Date sin desfase de zona horaria.
 * "2026-12-05" (o "2026-12-05T00:00:00.000Z") con new Date() se interpreta en UTC
 * y en Argentina (UTC-3) mostraría el día anterior. Acá se arma como fecha local.
 */
function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T00:00:00(?:\.0+)?Z)?$/.exec(
    value.trim()
  );
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getNextDate(dates: string[] | string | undefined): Date | null {
  let list: string[] = [];
  try {
    list = Array.isArray(dates) ? dates : JSON.parse(dates || "[]");
  } catch {
    list = [];
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const upcoming = list
    .map(parseDate)
    .filter((d): d is Date => d !== null && d >= startOfToday)
    .sort((a, b) => a.getTime() - b.getTime());

  // Solo fechas futuras: antes, si todas eran pasadas, mostraba la última
  // como "Próxima salida", lo cual era engañoso.
  return upcoming[0] ?? null;
}

function formatPrice(price: unknown): string | null {
  const n = Number(price);
  return Number.isFinite(n) && n > 0 ? priceFormatter.format(n) : null;
}

/* ------------------------------------------------------------------ */
/* Imagen con fallback                                                 */
/* ------------------------------------------------------------------ */

function TourImage({ tour }: { tour: Tour }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = failed ? undefined : tour.image;

  return (
    <img
      src={
        imageUrl
          ? optimizeCloudinaryImage(imageUrl, {
              width: 600,
              quality: "auto:eco",
              crop: "fill",
              format: "webp",
            })
          : "/placeholder.svg"
      }
      alt={imageUrl ? `Imagen de ${tour.title}` : ""}
      width={600}
      height={192}
      className="h-48 w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export function TourList({ tours, loading, error, onReservar }: TourListProps) {
  if (error) {
    return (
      <div role="alert" className="text-center text-destructive">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label="Cargando viajes">
        <Carousel className="w-full">
          <CarouselContent className="pl-0">
            {[1, 2, 3].map((i) => (
              <CarouselItem
                key={`skeleton-${i}`}
                className="px-4 md:basis-1/2 lg:basis-1/3"
              >
                <Card className="rounded-md border border-border bg-transparent p-4 shadow motion-safe:animate-pulse">
                  <Skeleton className="mb-4 h-48 w-full rounded-md bg-muted" />
                  <Skeleton className="mb-2 h-6 w-3/4 bg-muted" />
                  <Skeleton className="mb-2 h-4 w-full bg-muted" />
                  <Skeleton className="mb-4 h-4 w-2/3 bg-muted" />
                  <Skeleton className="h-10 w-full rounded bg-muted" />
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <p role="status" className="text-center text-muted-foreground">
        Por ahora no hay viajes publicados. Escribinos por WhatsApp y te
        avisamos cuando se abra el próximo.
      </p>
    );
  }

  return (
    <Carousel className="w-full" aria-label="Viajes disponibles">
      <CarouselContent className="pl-0">
        {tours.map((tour) => {
          const price = formatPrice(tour.price);
          const next = getNextDate(tour.dates);

          return (
            <CarouselItem
              key={tour._id}
              className="px-4 md:basis-1/2 lg:basis-1/3"
            >
              <article
                className="h-full"
                aria-labelledby={`tour-title-${tour._id}`}
              >
                <Card className="group relative z-10 h-full border-border bg-card transition-all duration-300 hover:border-primary/50">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <TourImage tour={tour} />
                    {price && (
                      <div className="absolute right-4 top-4">
                        <Badge
                          variant="secondary"
                          className="bg-secondary text-secondary-foreground"
                        >
                          {price}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="px-5 pb-2 pt-4">
                    {/* h3: cuelga del h2 "Viajes disponibles" de la página */}
                    <h3
                      id={`tour-title-${tour._id}`}
                      className="line-clamp-2 text-xl font-semibold text-card-foreground"
                    >
                      {tour.title}
                    </h3>
                    <ExpandableDescription
                      description={tour.description}
                      maxChars={150}
                    />
                  </CardHeader>

                  <CardContent className="space-y-3 px-5 pb-5 pt-0">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin
                        className="mr-2 h-4 w-4 text-primary"
                        aria-hidden="true"
                      />
                      <span>{tour.destination}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar
                        className="mr-2 h-4 w-4 text-primary"
                        aria-hidden="true"
                      />
                      <span>
                        Próxima salida:{" "}
                        {next ? dateFormatter.format(next) : "a confirmar"}
                      </span>
                    </div>
                    {/* Antes había un texto por defecto ("máx. 12 personas")
                        que podía no ser cierto para un micro. Solo se muestra
                        si el dato existe. */}
                    {tour.grupo && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users
                          className="mr-2 h-4 w-4 text-primary"
                          aria-hidden="true"
                        />
                        <span>{tour.grupo}</span>
                      </div>
                    )}
                    <Button className="mt-2 w-full" onClick={() => onReservar(tour)}>
                      Reservar ahora
                      <span className="sr-only">: {tour.title}</span>
                    </Button>
                  </CardContent>
                </Card>
              </article>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious aria-label="Viaje anterior" />
      <CarouselNext aria-label="Viaje siguiente" />
    </Carousel>
  );
}