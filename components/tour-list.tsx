import { Tour } from "@/components/types/tour";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { useState, useEffect } from "react";
import { optimizeCloudinaryImage } from "@/utils/optimizeCloudinary";

interface TourListProps {
  tours: Tour[];
  loading: boolean;
  error: string | null;
  onReservar: (tour: Tour) => void;
}

export function TourList({ tours, loading, error, onReservar }: TourListProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateString: string) => {
    if (!mounted) return dateString;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getNextDate = (dates: string[] | string): string | null => {
    let parsedDates: string[] = [];
    try {
      parsedDates = Array.isArray(dates) ? dates : JSON.parse(dates || "[]");
    } catch {
      parsedDates = [];
    }
    const today = new Date();
    const validDates = parsedDates
      .map((d) => new Date(d))
      .filter((d) => !isNaN(d.getTime()));
    if (validDates.length === 0) return null;

    const futureDates = validDates.filter((d) => d >= today);
    if (futureDates.length > 0) {
      futureDates.sort((a, b) => a.getTime() - b.getTime());
      return futureDates[0].toISOString();
    }
    validDates.sort((a, b) => a.getTime() - b.getTime());
    return validDates[validDates.length - 1].toISOString();
  };

  if (error) {
    return (
      <div role="alert" className="text-center text-destructive" aria-live="assertive">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        <Carousel className="w-full" aria-label="Cargando tours">
          <CarouselContent className="pl-0">
            {[1, 2, 3].map((i) => (
              <CarouselItem key={`skeleton-${i}`} className="md:basis-1/2 lg:basis-1/3 px-4">
                <Card className="bg-transparent p-4 border border-border shadow rounded-md animate-pulse">
                  <Skeleton className="h-48 w-full mb-4 rounded-md bg-muted" />
                  <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-full mb-2 bg-muted" />
                  <Skeleton className="h-4 w-2/3 mb-4 bg-muted" />
                  <Skeleton className="h-10 w-full rounded bg-muted" />
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious aria-label="Anterior" />
          <CarouselNext aria-label="Siguiente" />
        </Carousel>
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <p className="text-center text-muted-foreground" role="status" aria-live="polite">
        No hay tours disponibles en este momento.
      </p>
    );
  }

  return (
    <Carousel className="w-full" aria-label="Lista de tours disponibles">
      <CarouselContent className="pl-0">
        {tours.map((tour) => {
          const priceFormatted = new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 0,
          }).format(Number(tour.price));

          return (
            <CarouselItem key={tour._id} className="md:basis-1/2 lg:basis-1/3 px-4">
              <article className="h-full" aria-labelledby={`tour-title-${tour._id}`} aria-describedby={`tour-desc-${tour._id}`}>
                <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 group relative z-10 h-full">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={tour.image ? optimizeCloudinaryImage(tour.image) : "/placeholder.svg"}
                      alt={tour.image ? `Imagen del tour ${tour.title}` : "Imagen no disponible"}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant="secondary"
                        className="bg-secondary text-secondary-foreground flex items-center gap-1"
                      >
                        {priceFormatted}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pt-4 pb-2 px-5">
                    <h2
                      id={`tour-title-${tour._id}`}
                      className="text-xl text-card-foreground line-clamp-2 font-semibold"
                    >
                      {tour.title}
                    </h2>
                    <p
                      id={`tour-desc-${tour._id}`}
                      className="text-muted-foreground line-clamp-3"
                    >
                      {tour.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-3 px-5 pt-0 pb-5">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 text-red-600" aria-hidden="true" />
                      <span>{tour.destination}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2 text-red-600" aria-hidden="true" />
                      <span>
                        Próxima salida:{" "}
                        {getNextDate(tour.dates) ? formatDate(getNextDate(tour.dates)!) : "Fechas por confirmar"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2 text-red-600" aria-hidden="true" />
                      <span>{tour.grupo || "Grupos pequeños (máx. 12 personas)"}</span>
                    </div>
                    <Button
                      className="w-full mt-2"
                      onClick={() => onReservar(tour)}
                      aria-label={`Reservar tour: ${tour.title}`}
                    >
                      Reservar Ahora
                    </Button>
                  </CardContent>
                </Card>
              </article>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious aria-label="Anterior" />
      <CarouselNext aria-label="Siguiente" />
    </Carousel>
  );
}
