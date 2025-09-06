import { Tour } from "@/components/types/tour"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface TourListProps {
  tours: Tour[]
  loading: boolean
  error: string | null
  onReservar: (tour: Tour) => void
}


export function TourList({ tours, loading, error, onReservar }: TourListProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (loading)
    return (
      <p className="text-center col-span-full text-muted-foreground">
        Cargando tours...
      </p>
    )
  if (error)
    return (
      <p className="text-center col-span-full text-destructive">{error}</p>
    )
  if (tours.length === 0)
    return (
      <p className="text-center col-span-full text-muted-foreground">
        No hay tours disponibles en este momento.
      </p>
    )

  // Formatea la fecha como: 05 sept 2025
  const formatDate = (dateString: string) => {
    if (!mounted) return dateString
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    const day = date.getDate().toString().padStart(2, "0")
    const monthNames = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sept",
      "oct",
      "nov",
      "dic",
    ]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  // Obtiene la próxima fecha >= hoy, o null si no hay
  const getNextDate = (dates: string[] | string): string | null => {
    let parsedDates: string[] = []
    try {
      parsedDates = Array.isArray(dates) ? dates : JSON.parse(dates || "[]")
    } catch {
      parsedDates = []
    }
    const today = new Date()
    const validDates = parsedDates
      .map((d) => new Date(d))
      .filter((d) => !isNaN(d.getTime()))
    if (validDates.length === 0) return null

    const futureDates = validDates.filter((d) => d >= today)
    if (futureDates.length > 0) {
      futureDates.sort((a, b) => a.getTime() - b.getTime())
      return futureDates[0].toISOString()
    }
    validDates.sort((a, b) => a.getTime() - b.getTime())
    return validDates[validDates.length - 1].toISOString()
  }

  return (
    <>
      {tours.map((tour) => {
        const priceFormatted = new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "ARS",
          minimumFractionDigits: 0,
        }).format(Number(tour.price))

        return (
          <Card
            key={tour._id || tour.title}
            className="bg-card border-border hover:border-primary/50 transition-all duration-300 group relative z-10"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={tour.image || "/placeholder.svg"}
                alt={tour.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground flex items-center gap-1">
                  {priceFormatted}
                </Badge>
              </div>
            </div>

            <CardHeader className="pt-4 pb-2 px-5">
              <CardTitle className="text-xl text-card-foreground">{tour.title}</CardTitle>
              <CardDescription className="text-muted-foreground line-clamp-3">
                {tour.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 px-5 pt-0 pb-5">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 text-red-600" />
                <span>{tour.destination}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2 text-red-600" />
                <span>
                  Próxima salida:{" "}
                  {getNextDate(tour.dates)
                    ? formatDate(getNextDate(tour.dates)!)
                    : "Fechas por confirmar"}
                </span>
              </div>
            <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2 text-red-600" />
            <span>{tour.grupo || "Grupos pequeños (máx. 12 personas)"}</span>
            </div>
            <Button className="w-full mt-2" onClick={() => onReservar(tour)}>
            Reservar Ahora
            </Button>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
