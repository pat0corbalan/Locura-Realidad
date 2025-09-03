import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Guitar, Music } from "lucide-react"
import { PhotoGallery } from "@/components/photo-gallery"
import { ShoppingCartButton } from "@/components/shopping-cart"
import { CartPageContent } from "@/components/cart-page-content"
import { FloatingRockIcons, RockPatternBackground, SectionDivider, RockQuote } from "@/components/rock-visual-elements"
import ElectricGuitarIcon from "@/components/icon/ElectricGuitarIcon"

export default function HomePage() {
  const tours = [
    {
      id: 1,
      title: "Rock Legends of London",
      description: "Explora los lugares icónicos del rock británico, desde Abbey Road hasta el Cavern Club.",
      destination: "Londres, Reino Unido",
      dates: "15-22 Marzo 2024",
      price: "$2,499",
      image: "/london-rock-venues-abbey-road-beatles.png",
    },
    {
      id: 2,
      title: "Metal Masters of Germany",
      description: "Descubre la cuna del metal alemán visitando estudios legendarios y venues históricos.",
      destination: "Berlín - Hamburgo, Alemania",
      dates: "5-12 Abril 2024",
      price: "$2,199",
      image: "/german-metal-venues-berlin-hamburg-rock.png",
    },
    {
      id: 3,
      title: "Grunge Seattle Experience",
      description: "Sumérgete en la escena grunge de los 90s en la ciudad que lo vio nacer.",
      destination: "Seattle, Estados Unidos",
      dates: "20-27 Mayo 2024",
      price: "$2,799",
      image: "/seattle-grunge-venues-nirvana-pearl-jam.png",
    },
  ]

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingRockIcons />
      <RockPatternBackground />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* <Guitar className="h-8 w-8 text-primary animate-rock-glow" /> */}
              <h1 className="text-2xl font-bold text-foreground text-rock-shadow">
                Locura <span
                  className="text-black"
                  style={{
                    textShadow: '0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 40px #ff0000',
                  }}
                >
                  &
                </span> Realidad
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#tours" className="text-foreground hover:text-primary transition-colors">
                Tours
              </a>
              <a href="#gallery" className="text-foreground hover:text-primary transition-colors">
                Galería
              </a>
              <a href="#store" className="text-foreground hover:text-primary transition-colors">
                Tienda
              </a>
              <ShoppingCartButton />
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-40 px-4 text-center z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Music className="h-12 w-12 text-primary mr-4 animate-pulse" />
            <h2 className="text-5xl md:text-7xl font-bold text-foreground text-neon-glow">
              LOCURA <span className="text-black neon-red-border">&</span> <span className="text-primary">REALIDAD</span>
            </h2>
              
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Vive la experiencia definitiva del rock. Tours únicos que te llevan a los lugares más legendarios de la
            música.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 animate-rock-glow">
              Explorar Tours
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
              Ver Galería
            </Button>
          </div>
        </div>
      </section>

      <SectionDivider variant="guitar" />

      {/* Tours Section */}
      <section id="tours" className="py-16 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-foreground mb-4 text-rock-shadow">Tours Disponibles</h3>
            <p className="text-xl text-muted-foreground">Descubre los destinos más rockeros del mundo</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <Card
                key={tour.id}
                className="bg-card border-border hover:border-primary/50 transition-all duration-300 group relative z-10"
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={tour.image || "/placeholder.svg"}
                    alt={tour.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      {tour.price}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl text-card-foreground">{tour.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{tour.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {tour.destination}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    {tour.dates}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    Grupos pequeños (máx. 12 personas)
                  </div>

                  <Button className="w-full mt-4">Reservar Ahora</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <RockQuote />

      <SectionDivider variant="vinyl" />

      {/* Gallery Section */}
      <section id="gallery" className="py-16 px-4 bg-card/30 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-foreground mb-4 text-rock-shadow">Galería de Momentos</h3>
            <p className="text-xl text-muted-foreground">Revive las experiencias más increíbles de nuestros tours</p>
          </div>

          <PhotoGallery />
        </div>
      </section>

      <SectionDivider variant="lightning" />

      {/* Merchandise Store Section */}
      <section id="store" className="py-16 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-foreground mb-4 text-rock-shadow">Tienda de Merchandising</h3>
            <p className="text-xl text-muted-foreground">
              Lleva contigo el espíritu del rock con nuestros productos exclusivos
            </p>
          </div>

          <CartPageContent />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/30 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-foreground mb-4 text-rock-shadow">¿Por qué Locura y Realidad?</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-rock-glow">
                <Guitar className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Experiencias Auténticas</h4>
              <p className="text-muted-foreground">
                Acceso exclusivo a estudios, venues y lugares históricos del rock.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-rock-glow">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Grupos Pequeños</h4>
              <p className="text-muted-foreground">Máximo 12 personas por tour para una experiencia más personal.</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-rock-glow">
                <Music className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Guías Expertos</h4>
              <p className="text-muted-foreground">Músicos y expertos en rock que conocen las historias reales.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Guitar className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">Locura y Realidad</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Tours de rock únicos que te conectan con la historia y la pasión de la música.
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-4">Tours</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Europa
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Estados Unidos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Reino Unido
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-4">Empresa</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Sobre Nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-4">Síguenos</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">© 2024 Locura y Realidad. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
