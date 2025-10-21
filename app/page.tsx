"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  Guitar,
  Music,
  Newspaper,
  Instagram,
  Facebook,
  Twitter,
  Menu,
  BusIcon,
  CreditCard,
  Handshake,
} from "lucide-react";
import { PhotoGallery } from "@/components/photo-gallery";
import { ShoppingCartButton } from "@/components/shopping-cart";
import { CheckoutModal } from "@/components/checkout-modal";
import { CartPageContent } from "@/components/cart-page-content";
import { TourList } from "@/components/tour-list";
import { SpotifyWidget } from "@/components/spotify-widget";
import {
  FloatingRockIcons,
  RockPatternBackground,
  SectionDivider,
  RockQuote,
} from "@/components/rock-visual-elements";
import { Tour } from "@/components/types/tour";
import { ReservaModal } from "@/components/reserva-modal";

export default function HomePage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reservaOpen, setReservaOpen] = useState(false);
  const [reservaTour, setReservaTour] = useState<Tour | null>(null);

  const handleReservarTour = (tour: Tour) => {
    setReservaTour(tour);
    setReservaOpen(true);
  };

  useEffect(() => {
    async function fetchTours() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tours");
        if (!res.ok) throw new Error("No se pudieron cargar los tours.");
        const data: Tour[] = await res.json();
        setTours(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error al cargar los datos.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchTours();
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingRockIcons />
      <RockPatternBackground />

      {/* Datos estructurados para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: "Tours de Rock - Locura y Realidad",
            description:
              "Logística en viajes con destino a recitales desde Santiago Del Estero, capital. Organización de eventos locales y venta de indumentaria dirigida al público de rock.",
            provider: {
              "@type": "Organization",
              name: "Locura y Realidad",
              url: "https://locura-realidad.vercel.app/",
            },
          }),
        }}
      />

      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />

      {reservaTour && (
        <ReservaModal
          open={reservaOpen}
          onOpenChange={setReservaOpen}
          tour={reservaTour}
        />
      )}

      <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm relative">
        <div className="container mx-auto px-4 py-4">
          <nav
            className="flex items-center justify-between"
            aria-label="Navegación principal"
          >
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-foreground text-rock-shadow" style={{ fontFamily: "var(--font-bbh)" }}>
                Locura{" "}
                <span
                  className="text-black"
                  style={{
                    textShadow:
                      "0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 40px #ff0000",
                  }}
                >
                  &amp;
                </span>{" "}
                Realidad
              </h1>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {["tours", "Galeria", "Tienda"].map((section) => (
                <a
                  key={section}
                  href={`#${section}`}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </a>
              ))}
              <ShoppingCartButton
                open={cartOpen}
                onOpenChange={setCartOpen}
                onCheckout={() => setCheckoutOpen(true)}
              />
            </div>

            <div className="flex items-center space-x-4 md:hidden">
              <ShoppingCartButton
                open={cartOpen}
                onOpenChange={setCartOpen}
                onCheckout={() => setCheckoutOpen(true)}
              />
              <button
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6 text-foreground" />
              </button>
            </div>
          </nav>

          {mobileMenuOpen && (
            <div
              id="mobile-menu"
              className="mt-4 flex flex-col space-y-4 md:hidden text-center"
            >
              {["tours", "Galeria", "Tienda"].map((section) => (
                <a
                  key={section}
                  href={`#${section}`}
                  className="text-foreground hover:text-primary transition-colors text-lg font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className="relative py-40 px-4 text-center z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Music className="h-12 w-12 text-primary mr-4 animate-pulse" />
            <h2 className="text-5xl md:text-8xl font-bold text-foreground text-neon-glow" style={{ fontFamily: "var(--font-londrina)" }}>
            {/* <h2 className="font-londrina text-5xl md:text-7xl font-bold text-foreground text-neon-glow" > */}
              LOCURA <span className="text-black neon-red-border">&amp;</span>{" "}
              <span className="text-primary">REALIDAD</span>
            </h2>
          </div>
          <p className="mx-auto mb-8 max-w-3xl text-xl md:text-2xl text-muted-foreground">
            Viajes a recitales desde Santiago del Estero.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <Button
              size="lg"
              className="animate-rock-glow px-8 py-6 text-lg"
              onClick={() =>
                document.getElementById("tours")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Próximos Destinos
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent px-8 py-6 text-lg"
              onClick={() =>
                document.getElementById("Galeria")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Ver Galería
            </Button>
          </div>
        </div>
      </section>
    <SpotifyWidget 
  playlistId="2ZFNwdOcz8zLKz0R4xZKUS" 
  position="right" 
  theme={0} 
/>


      
      <SectionDivider variant="guitar" />

      <section
        id="tours"
        role="region"
        aria-label="Tours disponibles"
        className="relative z-49 py-16 overflow-hidden"
      >
        <div className="container mx-auto">
          <header className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground text-rock-shadow">
              Viajes Disponibles
            </h2>
            <p className="text-xl text-muted-foreground">
              Traslados ida y vuelta (entrada opcional)
            </p>
          </header>
          <p className="text-sm text-muted-foreground text-center mb-4 md:hidden animate-pulse">
            Desliza para ver más tours →
          </p>
          <TourList
            tours={tours}
            loading={loading}
            error={error}
            onReservar={handleReservarTour}
          />
        </div>
      </section>

      <RockQuote />

      <SectionDivider variant="vinyl" />

      <section
        id="Galeria"
        role="region"
        aria-label="Galería de Momentos"
        className="relative z-10 py-16 px-4 bg-card/30"
      >
        <div className="container mx-auto">
          <header className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground text-rock-shadow">
              Galería de Momentos
            </h2>
            <p className="text-xl text-muted-foreground">
              Reviví algunos viajes y eventos de los últimos años
            </p>
          </header>
          <PhotoGallery />
        </div>
      </section>

      <SectionDivider variant="lightning" />

      <section
        id="Tienda"
        role="region"
        aria-label="Tienda de Merchandising"
        className="relative z-10 py-16 overflow-hidden"
      >
        <div className="container mx-auto">
          <header className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground text-rock-shadow">
              Tienda
            </h2>
            <p className="text-xl text-muted-foreground">
              Lleva con vos una remera que te identifique en cada viaje. Elegí tu diseño y tu banda. ¿Crees que falta alguna? Comunícate con nosotros y déjanos tu pedido.
            </p>
          </header>
          <CartPageContent />
        </div>
      </section>

      <section
        role="region"
        aria-label="Características principales"
        className="relative z-10 py-16 px-4 bg-card/30"
      >
        <div className="container mx-auto">
          <header className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-foreground text-rock-shadow">
              Contactanos
            </h2>
          </header>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Handshake,
                title: "Contacto directo con nosotros.",
                description:
                  "Nos podes contactar a través de nuestras redes o nuestros números personales para una mejor atención.",
              },
              {
                icon: BusIcon,
                title: "Viajes durante todo el año",
                description:
                  "Todos los meses podes encontrar fechas disponibles para reservas.",
              },
              {
                icon: CreditCard,
                title: "Facilidad a la hora de pagar tu viaje o hacer una compra",
                description:
                  "Aceptamos todos los medios de pagos. 10% de descuento si abonas en transferencia.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <article key={title} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-rock-glow">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer
        role="contentinfo"
        aria-label="Pie de página"
        className="relative z-10 border-t border-border bg-card py-12 px-6"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-3">
                <Guitar className="h-7 w-7 text-primary" />
                <span className="text-xl font-bold text-foreground">
                  Locura y Realidad
                </span>
              </div>
              <p className="max-w-xs leading-relaxed text-base text-muted-foreground">
                Desde el 23 de marzo del 2022.
              </p>
            </div>

            <div>
              <h4 className="mb-6 flex items-center space-x-2 font-semibold text-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Tours</span>
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#tours"
                    className="transition-colors hover:text-primary"
                  >
                    Argentina
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 flex items-center space-x-2 font-semibold text-foreground">
                <Users className="h-5 w-5 text-primary" />
                <span>Empresa</span>
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  { label: "Contacto", href: "http://wa.me/543855227041" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="transition-colors hover:text-primary"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-6 flex items-center space-x-2 font-semibold text-foreground">
                <Newspaper className="h-5 w-5 text-primary" />
                <span>Síguenos</span>
              </h4>
              <ul className="flex space-x-6 text-muted-foreground">
                {[
                  { label: "Instagram", href: "https://www.instagram.com/locurayrealidad.tour/", IconComponent: Instagram },
                  { label: "Facebook", href: "https://www.facebook.com/Locurayrealidad.tour", IconComponent: Facebook },
                  { label: "Twitter", href: "https://x.com/LyR_Tour", IconComponent: Twitter },
                ].map(({ label, href, IconComponent }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      className="transition-colors hover:text-primary"
                    >
                      <IconComponent className="h-6 w-6" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-8 text-center">
            <p className="select-none text-sm text-muted-foreground">
              © 2025 Locura y Realidad. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
