"use client";

import { useEffect, useMemo, useState } from "react";
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
  X,
  BusIcon,
  CreditCard,
  Handshake,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import { PhotoGallery } from "@/components/photo-gallery-album";
import { ShoppingCartButton } from "@/components/shopping-cart";
import { CartFloatingButton } from "@/components/cart-floating-button";
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
import { ReservaModal, type ReservaItem } from "@/components/reserva-modal";

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */

const SITE_URL = "https://locura-realidad.vercel.app/";
const WHATSAPP_URL =
  "https://wa.me/543855227041?text=" +
  encodeURIComponent("Hola! Quiero consultar por los próximos viajes.");

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/locurayrealidad.tour/",
    Icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/Locurayrealidad.tour",
    Icon: Facebook,
  },
  { label: "X (Twitter)", href: "https://x.com/LyR_Tour", Icon: Twitter },
];

const BENEFICIOS = [
  {
    icon: Handshake,
    title: "Atención directa",
    description:
      "Escribinos por WhatsApp o por nuestras redes y te respondemos personalmente.",
  },
  {
    icon: BusIcon,
    title: "Viajes todo el año",
    description:
      "Todos los meses hay fechas disponibles para reservar tu lugar.",
  },
  {
    icon: CreditCard,
    title: "Pagá como prefieras",
    description:
      "Aceptamos todos los medios de pago. 10% de descuento si abonás por transferencia.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Locura y Realidad",
  description:
    "Viajes en micro a recitales desde Santiago del Estero capital. Organización de eventos locales y venta de indumentaria para el público de rock.",
  url: SITE_URL,
  foundingDate: "2022-03-23",
  areaServed: "Argentina",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Santiago del Estero",
    addressCountry: "AR",
  },
  sameAs: SOCIALS.map((s) => s.href),
};

/* ------------------------------------------------------------------ */
/* Tipos y helpers                                                     */
/* ------------------------------------------------------------------ */

interface Evento {
  _id: string;
  titulo: string;
  lugar: string;
  precio: number;
  fecha: string;
  activo: boolean;
}

function formatFecha(fecha: string) {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reservaOpen, setReservaOpen] = useState(false);
  const [reserva, setReserva] = useState<ReservaItem | null>(null);

  const eventosActivos = useMemo(
    () => eventos.filter((e) => e.activo),
    [eventos]
  );

  // El link a Eventos solo aparece si realmente hay eventos
  const navLinks = useMemo(
    () => [
      { id: "tours", label: "Viajes" },
      ...(eventosActivos.length > 0
        ? [{ id: "eventos", label: "Eventos" }]
        : []),
      { id: "galeria", label: "Galería" },
      { id: "tienda", label: "Tienda" },
      { id: "contacto", label: "Contacto" },
    ],
    [eventosActivos.length]
  );

  const handleReservar = (item: ReservaItem) => {
    setReserva(item);
    setReservaOpen(true);
  };

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTours() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tours", { signal: controller.signal });
        if (!res.ok) throw new Error("No se pudieron cargar los viajes.");
        setTours(await res.json());
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Error al cargar los datos."
        );
      } finally {
        setLoading(false);
      }
    }

    async function fetchEventos() {
      try {
        const res = await fetch("/api/eventos", { signal: controller.signal });
        if (res.ok) setEventos(await res.json());
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error cargando eventos:", err);
        }
      } finally {
        setLoadingEventos(false);
      }
    }

    fetchTours();
    fetchEventos();
    return () => controller.abort();
  }, []);

  // Cerrar el menú móvil con Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Accesibilidad: saltar al contenido */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>

      <FloatingRockIcons />
      <RockPatternBackground />

      {/* Datos estructurados para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />

      <ReservaModal
        open={reservaOpen}
        onOpenChange={setReservaOpen}
        item={reserva}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/70 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <nav
            className="flex items-center justify-between"
            aria-label="Navegación principal"
          >
            <a
              href="#inicio"
              className="text-2xl font-bold text-foreground text-rock-shadow"
              style={{ fontFamily: "var(--font-bbh)" }}
              onClick={() => setMobileMenuOpen(false)}
            >
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
            </a>

            <div className="hidden items-center space-x-6 md:flex">
              {navLinks.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                >
                  {label}
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
                className="rounded-md p-2 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-foreground" />
                ) : (
                  <Menu className="h-6 w-6 text-foreground" />
                )}
              </button>
            </div>
          </nav>

          {mobileMenuOpen && (
            <div
              id="mobile-menu"
              className="mt-4 flex flex-col space-y-4 text-center md:hidden"
            >
              {navLinks.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="text-lg font-semibold text-foreground transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <main id="contenido">
        {/* HERO */}
        <section
          id="inicio"
          className="relative z-10 scroll-mt-24 px-4 py-32 text-center md:py-40"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
          <div className="container relative z-10 mx-auto">
            <div className="mb-6 flex items-center justify-center">
              <Music
                aria-hidden="true"
                className="mr-4 h-12 w-12 text-primary motion-safe:animate-pulse"
              />
              <h1
                className="text-5xl font-bold text-foreground text-neon-glow md:text-8xl"
                style={{ fontFamily: "var(--font-londrina)" }}
              >
                LOCURA <span className="text-black neon-red-border">&amp;</span>{" "}
                <span className="text-primary">REALIDAD</span>
              </h1>
            </div>
            <p className="mx-auto mb-3 max-w-3xl text-xl text-muted-foreground md:text-2xl">
              Viajes a recitales desde Santiago del Estero.
            </p>
            <p className="mb-8 text-sm text-muted-foreground">
              Viajando con la gente del rock desde el 23 de marzo de 2022
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="px-8 py-6 text-lg motion-safe:animate-rock-glow"
                onClick={() => scrollTo("tours")}
              >
                Ver próximos viajes
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent px-8 py-6 text-lg"
                asChild
              >
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                  Consultanos por WhatsApp
                </a>
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

        {/* VIAJES */}
        <section
          id="tours"
          aria-labelledby="tours-title"
          className="relative z-10 scroll-mt-24 overflow-hidden py-16"
        >
          <div className="container mx-auto">
            <header className="mb-12 px-4 text-center">
              <h2
                id="tours-title"
                className="mb-4 text-4xl font-bold text-foreground text-rock-shadow"
              >
                Viajes disponibles
              </h2>
              <p className="text-xl text-muted-foreground">
                Traslado de ida y vuelta. La entrada al recital es opcional.
              </p>
            </header>
            <p className="mb-4 text-center text-sm text-muted-foreground motion-safe:animate-pulse md:hidden">
              Deslizá para ver más viajes →
            </p>
            <TourList
              tours={tours}
              loading={loading}
              error={error}
              onReservar={(tour) =>
                handleReservar({ title: tour.title, tipo: "tour" })
              }
            />
          </div>
        </section>

        {/* EVENTOS / TICKETS QR: solo si hay eventos activos */}
        {/* {!loadingEventos && eventosActivos.length > 0 && (
          <section
            id="eventos"
            aria-labelledby="eventos-title"
            className="relative z-10 scroll-mt-24 border-y border-primary/20 bg-primary/5 px-4 py-16"
          >
            <div className="container mx-auto">
              <header className="mb-12 text-center">
                <div className="mb-4 inline-block rounded-full bg-primary/10 p-3">
                  <Music className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h2
                  id="eventos-title"
                  className="mb-4 text-4xl font-bold text-foreground text-rock-shadow"
                >
                  Eventos y tickets
                </h2>
                <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                  Comprá tu entrada anticipada para nuestros eventos locales y
                  recibí tu{" "}
                  <span className="font-bold text-foreground">acceso QR</span> al
                  instante.
                </p>
              </header>

              <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {eventosActivos.map((evento) => {
                  const fecha = formatFecha(evento.fecha);
                  return (
                    <li
                      key={evento._id}
                      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-all hover:border-primary"
                    >
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-transform duration-500 motion-safe:group-hover:scale-110">
                          <Guitar
                            className="h-12 w-12 text-primary/50"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="absolute left-2 top-2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                          Confirmado
                        </span>
                      </div>

                      <div className="p-6">
                        <h3 className="mb-3 text-xl font-bold">
                          {evento.titulo}
                        </h3>
                        <div className="mb-6 space-y-2">
                          {fecha && (
                            <p className="flex items-center text-sm text-muted-foreground">
                              <CalendarDays
                                className="mr-2 h-4 w-4 text-primary"
                                aria-hidden="true"
                              />
                              {fecha}
                            </p>
                          )}
                          <p className="flex items-center text-sm text-muted-foreground">
                            <MapPin
                              className="mr-2 h-4 w-4 text-primary"
                              aria-hidden="true"
                            />
                            {evento.lugar}
                          </p>
                          <p className="text-2xl font-black text-primary">
                            ${evento.precio.toLocaleString("es-AR")}
                          </p>
                        </div>

                        <Button
                          className="w-full py-6 font-bold"
                          onClick={() =>
                            handleReservar({ title: evento.titulo, tipo: "ticket" })
                          }
                        >
                          Comprar ticket QR
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )} */}

        <RockQuote />

        <SectionDivider variant="vinyl" />

        {/* GALERÍA */}
        <section
          id="galeria"
          aria-labelledby="galeria-title"
          className="relative z-10 scroll-mt-24 bg-card/30 px-4 py-16"
        >
          <div className="container mx-auto">
            <header className="mb-12 text-center">
              <h2
                id="galeria-title"
                className="mb-4 text-4xl font-bold text-foreground text-rock-shadow"
              >
                Galería de momentos
              </h2>
              <p className="text-xl text-muted-foreground">
                Reviví algunos de los viajes y eventos de estos años.
              </p>
            </header>
            <PhotoGallery />
          </div>
        </section>

        <SectionDivider variant="lightning" />

        {/* TIENDA */}
        <section
          id="tienda"
          aria-labelledby="tienda-title"
          className="relative z-10 scroll-mt-24 overflow-hidden py-16"
        >
          <div className="container mx-auto">
            <header className="mb-12 px-4 text-center">
              <h2
                id="tienda-title"
                className="mb-4 text-4xl font-bold text-foreground text-rock-shadow"
              >
                Tienda
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                Llevá con vos una remera que te identifique en cada viaje. Elegí
                tu diseño y tu banda. ¿Falta alguna? Escribinos y dejanos tu
                pedido.
              </p>
            </header>
            <CartPageContent />
          </div>
        </section>

        {/* CONTACTO */}
        <section
          id="contacto"
          aria-labelledby="contacto-title"
          className="relative z-10 scroll-mt-24 bg-card/30 px-4 py-16"
        >
          <div className="container mx-auto">
            <header className="mb-12 text-center">
              <h2
                id="contacto-title"
                className="mb-4 text-4xl font-bold text-foreground text-rock-shadow"
              >
                Contacto
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                ¿Dudas sobre un viaje, una reserva o un pedido? Hablá con
                nosotros directamente.
              </p>
              <Button size="lg" className="mt-6 px-8 py-6 text-lg" asChild>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                  Escribinos por WhatsApp
                </a>
              </Button>
            </header>

            <div className="grid gap-8 md:grid-cols-3">
              {BENEFICIOS.map(({ icon: Icon, title, description }) => (
                <article key={title} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 motion-safe:animate-rock-glow">
                    <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
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
      </main>

      {/* CARRITO FLOTANTE + AVISO AL AGREGAR */}
      <CartFloatingButton onOpen={() => setCartOpen(true)} />

      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribinos por WhatsApp"
        className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]"
      >
        <MessageCircle className="h-7 w-7" aria-hidden="true" />
      </a>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-border bg-card px-6 py-12">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-3">
                <Guitar className="h-7 w-7 text-primary" aria-hidden="true" />
                <span className="text-xl font-bold text-foreground">
                  Locura y Realidad
                </span>
              </div>
              <p className="max-w-xs text-base leading-relaxed text-muted-foreground">
                Viajes a recitales desde Santiago del Estero. Desde el 23 de
                marzo de 2022.
              </p>
            </div>

            <nav aria-label="Secciones del sitio">
              <h2 className="mb-6 flex items-center space-x-2 font-semibold text-foreground">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                <span>Explorá</span>
              </h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {navLinks
                  .filter((l) => l.id !== "contacto")
                  .map(({ id, label }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className="transition-colors hover:text-primary"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
              </ul>
            </nav>

            <div>
              <h2 className="mb-6 flex items-center space-x-2 font-semibold text-foreground">
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                <span>Empresa</span>
              </h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-primary"
                  >
                    WhatsApp
                  </a>
                </li>
                <li>Santiago del Estero, Argentina</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-6 flex items-center space-x-2 font-semibold text-foreground">
                <Newspaper className="h-5 w-5 text-primary" aria-hidden="true" />
                <span>Seguinos</span>
              </h2>
              <ul className="flex space-x-6 text-muted-foreground">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-primary"
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Locura y Realidad. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}