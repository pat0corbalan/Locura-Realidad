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
  Bus,
  CreditCard,
  Handshake,
  CalendarDays,
  MessageCircle,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Disc3,
  Ticket,
  MoveDown,
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
    number: "01",
    title: "Atención directa",
    description:
      "Escribinos por WhatsApp o por nuestras redes. Del otro lado hay personas, no respuestas automáticas.",
  },
  {
    icon: Bus,
    number: "02",
    title: "La ruta nos une",
    description:
      "Organizamos viajes durante todo el año para que puedas estar cerca de la música que te mueve.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Pagá a tu manera",
    description:
      "Elegí el medio de pago que te resulte más cómodo. Tenés 10% de descuento abonando por transferencia.",
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
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
  });
}

function Eyebrow({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <div
      className={`mb-5 inline-flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.28em] ${
        light ? "text-red-300" : "text-primary"
      }`}
    >
      <span className="h-px w-8 bg-current" />
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mx-auto mb-12 max-w-3xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-foreground sm:text-5xl md:text-6xl"
        style={{ fontFamily: "var(--font-londrina)" }}
      >
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        {description}
      </p>
    </header>
  );
}

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
    () => eventos.filter((evento) => evento.activo),
    [eventos]
  );

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
        const response = await fetch("/api/tours", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("No se pudieron cargar los viajes.");
        setTours(await response.json());
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
        const response = await fetch("/api/eventos", {
          signal: controller.signal,
        });
        if (response.ok) setEventos(await response.json());
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

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>

      <FloatingRockIcons />
      <RockPatternBackground />

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

      {/* Navegación */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#090909]/90 text-white shadow-[0_8px_35px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <a
            href="#inicio"
            className="group flex items-center gap-3"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Locura y Realidad, inicio"
          >
            {/* <span className="flex h-10 w-10 items-center justify-center border border-red-500/40 bg-red-500/10 text-red-500 transition-colors group-hover:bg-red-600 group-hover:text-white">
              <Guitar className="h-5 w-5" />
            </span> */}
            <span
              className="text-xl font-black uppercase leading-none tracking-tight sm:text-2xl"
              style={{ fontFamily: "var(--font-bbh)" }}
            >
              Locura <span className="text-red-500">&</span>
              <br />
              <span className="text-white/65">Realidad</span>
            </span>
          </a>

          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Navegación principal"
          >
            {navLinks.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {label}
              </a>
            ))}
            <ShoppingCartButton
              open={cartOpen}
              onOpenChange={setCartOpen}
              onCheckout={() => setCheckoutOpen(true)}
            />
          </nav>

          <div className="flex items-center gap-3 lg:hidden">
            <ShoppingCartButton
              open={cartOpen}
              onOpenChange={setCartOpen}
              onCheckout={() => setCheckoutOpen(true)}
            />
            <button
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="flex h-10 w-10 items-center justify-center border border-white/15 text-white transition-colors hover:border-red-500 hover:bg-red-500/10"
              onClick={() => setMobileMenuOpen((value) => !value)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="border-t border-white/10 bg-[#090909] px-5 py-5 lg:hidden"
            aria-label="Menú móvil"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {navLinks.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="border-b border-white/[0.07] py-3 text-sm font-bold uppercase tracking-[0.15em] text-white/75 transition-colors hover:text-red-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main id="contenido">
        {/* Hero */}
        
<section
  id="inicio"
  className="relative isolate min-h-[760px] scroll-mt-24 overflow-hidden bg-[#070707] text-white sm:min-h-[850px]"
>
  {/* BACKGROUND */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute -left-64 -top-40 h-[650px] w-[650px] rounded-full bg-red-800/15 blur-[160px]" />
    <div className="absolute -bottom-64 right-[-10%] h-[600px] w-[600px] rounded-full bg-red-700/10 blur-[170px]" />

    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,rgba(127,29,29,.13),transparent_45%)]" />

    <div
      className="absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
      }}
    />

    <div className="absolute bottom-0 h-px w-full bg-gradient-to-r from-transparent via-red-600/60 to-transparent" />
  </div>

  {/* MAIN CONTENT */}
  <div className="relative mx-auto flex min-h-[760px] max-w-[1440px] flex-col justify-center px-5 pb-10 pt-28 sm:min-h-[850px] sm:px-8 lg:px-12 lg:pt-24">

    <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">

      {/* LEFT: COPY */}
      <div className="relative z-10">

        {/* EYEBROW */}
        <div className="mb-8 inline-flex items-center gap-3 border border-red-500/20 bg-red-950/20 px-4 py-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-red-500" />
          </span>

          <span className="text-[9px] font-black uppercase tracking-[.27em] text-white/75 sm:text-[10px]">
            Viajes · Música · Experiencias
          </span>
        </div>

        {/* HEADLINE */}
        <h1
          className="max-w-4xl text-[clamp(4.5rem,9.2vw,8.7rem)] font-black uppercase leading-[.76] tracking-[-.055em]"
          style={{ fontFamily: "var(--font-londrina)" }}
        >
          VIVÍ
          <br />
          LA MÚSICA.
          <br />

          <span className="text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,.85)]">
            SENTÍ
          </span>
          <br />

          <span className="relative inline-block text-red-600">
            EL ROCK.
            <span className="absolute -bottom-2 left-1 h-[3px] w-2/3 bg-red-600/80" />
          </span>
        </h1>

        {/* BRAND LINE */}
        <div className="mt-9 flex items-center gap-4">
          <span className="h-[2px] w-12 bg-red-600" />
          <span className="text-[9px] font-black uppercase tracking-[.28em] text-white/45 sm:text-[10px]">
            Locura & Realidad
          </span>
          <span className="h-1 w-1 rounded-full bg-red-600" />
          <span className="text-[9px] font-bold uppercase tracking-[.2em] text-white/35 sm:text-[10px]">
            Desde 2022
          </span>
        </div>

        {/* DESCRIPTION */}
        <p className="mt-8 max-w-[530px] text-[14px] leading-[1.9] text-white/55 sm:text-base sm:leading-8">
          No somos solamente un viaje. Somos el camino hacia ese recital
          que tanto esperás. Salimos desde Santiago del Estero para vivir
          la música como se merece: juntos, cerca y a todo volumen.
        </p>

        {/* ACTIONS */}
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">

          <Button
            size="lg"
            className="group h-14 rounded-none bg-red-600 px-7 text-[10px] font-black uppercase tracking-[.16em] text-white shadow-[0_12px_40px_rgba(220,38,38,.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-red-700 hover:shadow-[0_16px_50px_rgba(220,38,38,.35)]"
            onClick={() => scrollTo("tours")}
          >
            Descubrí los próximos viajes
            <ArrowRight className="ml-4 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            asChild
            className="h-14 rounded-none border-white/15 bg-white/[0.025] px-7 text-[10px] font-black uppercase tracking-[.16em] text-white transition-all duration-300 hover:border-red-500/60 hover:bg-red-500/10 hover:text-white"
          >
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-3 h-4 w-4 text-red-500" />
              Hablemos
            </a>
          </Button>
        </div>

        {/* LOCATION */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[9px] font-bold uppercase tracking-[.17em] text-white/35 sm:text-[10px]">
          <span className="inline-flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-red-500" />
            Santiago del Estero, Argentina
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-red-600 sm:block" />

          <span>La ruta es parte del show</span>
        </div>
      </div>

      {/* RIGHT: CINEMATIC VIDEO */}
      <div className="relative mx-auto w-full max-w-[520px] lg:ml-auto">

        {/* RED GLOW */}
        <div className="absolute inset-8 rounded-full bg-red-700/20 blur-[100px]" />

        {/* CORNER DETAILS */}
        <div className="absolute -right-4 -top-4 z-20 hidden h-24 w-24 border-r border-t border-red-500/50 sm:block" />
        <div className="absolute -bottom-4 -left-4 z-20 hidden h-24 w-24 border-b border-l border-red-500/50 sm:block" />

        {/* VIDEO FRAME */}
        <div className="relative aspect-[4/5] overflow-hidden border border-white/15 bg-[#090909] shadow-[0_35px_100px_rgba(0,0,0,.65)]">

          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/rock-poster.jpg"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source
              src="/videos/rock-background.mp4"
              type="video/mp4"
            />
          </video>

          {/* CINEMATIC OVERLAYS */}
          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-0 bg-gradient-to-br from-red-950/45 via-transparent to-black/80" />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/20" />

          {/* SUBTLE TEXTURE */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(135deg,transparent 48%,rgba(255,255,255,.15) 49%,transparent 50%)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* TOP LABEL */}
          <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.8)]" />
              <span className="text-[9px] font-black uppercase tracking-[.28em] text-white/80">
                Locura & Realidad
              </span>
            </div>

            <span className="border border-white/15 bg-black/20 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.2em] text-white/65 backdrop-blur-md">
              Desde el 2022
            </span>
          </div>

          {/* CENTRAL GRAPHIC */}
          <div className="absolute inset-0 flex items-center justify-center">

            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-white/10 bg-black/10 backdrop-blur-[1px] sm:h-72 sm:w-72">

              <div className="absolute inset-5 rounded-full border border-white/10" />

              <div className="absolute inset-10 rounded-full border border-red-500/25" />

              <div className="absolute inset-0 rounded-full bg-red-600/[0.035] blur-xl" />

              <Disc3
                className="absolute h-52 w-52 text-white/[0.10] sm:h-60 sm:w-60"
                strokeWidth={0.45}
              />

              {/* <Music
                className="relative z-10 h-36 w-36 -rotate-[18deg] text-red-400/90 drop-shadow-[0_0_35px_rgba(239,68,68,.5)] sm:h-44 sm:w-44"
                strokeWidth={0.65}
              /> */}
            </div>
          </div>

          {/* BOTTOM CONTENT */}
          <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-9">

            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-red-500" />
              <span className="text-[9px] font-black uppercase tracking-[.3em] text-white/65">
                Más que un tour
              </span>
            </div>

            <p
              className="text-5xl font-black uppercase leading-[.83] tracking-[-.035em] text-white sm:text-6xl"
              style={{ fontFamily: "var(--font-londrina)" }}
            >
              UNA PASIÓN
              <br />
              <span className="text-red-500">
                QUE NOS UNE.
              </span>
            </p>

            <div className="mt-6 h-px w-full bg-white/15" />

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[8px] font-bold uppercase tracking-[.24em] text-white/45">
                Desde Santiago para todo el rock
              </span>

              <Music className="h-4 w-4 text-red-500" />
            </div>
          </div>
        </div>

        {/* EXTERNAL LABEL */}
        <div className="mt-6 flex items-center justify-end gap-3 text-[9px] font-black uppercase tracking-[.24em] text-white/30">
          <span className="h-px w-10 bg-red-600" />
          La música nos mueve
        </div>
      </div>
    </div>

    {/* BOTTOM FOOTER */}
    <div className="mt-16 flex items-center justify-between border-t border-white/10 pt-6 sm:mt-20">

      <div className="flex items-center gap-3">
        <span className="h-[2px] w-8 bg-red-600" />
        <span className="text-[8px] font-bold uppercase tracking-[.22em] text-white/30 sm:text-[9px]">
          No importa el destino. Importa lo que vivimos.
        </span>
      </div>

      <button
        onClick={() => scrollTo("tours")}
        className="group inline-flex items-center gap-3 text-[9px] font-black uppercase tracking-[.2em] text-white/55 transition-colors hover:text-white"
      >
        Explorá
        <MoveDown className="h-4 w-4 text-red-500 transition-transform duration-300 group-hover:translate-y-1" />
      </button>
    </div>

  </div>
</section>


        <SpotifyWidget
          playlistId="2ZFNwdOcz8zLKz0R4xZKUS"
          position="right"
          theme={0}
        />

        {/* <SectionDivider variant="guitar" /> */}

        {/* Viajes */}
        <section
          id="tours"
          aria-labelledby="tours-title"
          className="relative z-10 scroll-mt-24 overflow-hidden py-24"
        >
          <div className="container mx-auto px-4">
            <SectionHeading
              eyebrow="El próximo destino te espera"
              title="Subite a la ruta"
              description="Encontrá tu próximo recital. Nos ocupamos del viaje de ida y vuelta para que vos te concentres en disfrutar."
            />
            <div className="mb-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground md:hidden">
              <span className="h-px w-6 bg-primary" />
              Deslizá para ver más viajes
              <span className="h-px w-6 bg-primary" />
            </div>
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

        {/* Eventos */}
        {!loadingEventos && eventosActivos.length > 0 && (
          <section
            id="eventos"
            aria-labelledby="eventos-title"
            className="relative z-10 scroll-mt-24 border-y border-primary/20 bg-[#0b0b0b] px-4 py-24 text-white"
          >
            <div className="container mx-auto">
              <SectionHeading
                eyebrow="Nos encontramos ahí"
                title="Eventos y entradas"
                description="Viví de cerca nuestros encuentros. Elegí tu evento y asegurá tu lugar."
              />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {eventosActivos.map((evento) => {
                  const fecha = formatFecha(evento.fecha);
                  return (
                    <article
                      key={evento._id}
                      className="group relative overflow-hidden border border-white/10 bg-[#111] transition-all duration-300 hover:-translate-y-1 hover:border-red-500/50"
                    >
                      <div className="relative flex aspect-[16/8] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(185,28,28,.28),transparent_65%),#171010]">
                        <Guitar className="h-20 w-20 text-red-500/30 transition-transform duration-500 group-hover:scale-110" strokeWidth={0.7} />
                        <span className="absolute left-5 top-5 inline-flex items-center gap-2 border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.2em] text-red-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Confirmado
                        </span>
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-black uppercase tracking-tight">
                          {evento.titulo}
                        </h3>
                        <div className="mt-5 space-y-3 text-sm text-white/55">
                          {fecha && (
                            <p className="flex items-center gap-3">
                              <CalendarDays className="h-4 w-4 text-red-500" />
                              {fecha}
                            </p>
                          )}
                          <p className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-red-500" />
                            {evento.lugar}
                          </p>
                        </div>
                        <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/35">
                              Entrada
                            </p>
                            <p className="mt-1 text-2xl font-black text-white">
                              ${evento.precio.toLocaleString("es-AR")}
                            </p>
                          </div>
                          <Button
                            className="rounded-none bg-red-600 px-5 text-[10px] font-black uppercase tracking-[.12em] text-white hover:bg-red-700"
                            onClick={() =>
                              handleReservar({
                                title: evento.titulo,
                                tipo: "ticket",
                              })
                            }
                          >
                            <Ticket className="mr-2 h-4 w-4" />
                            Comprar
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <RockQuote />
        {/* <SectionDivider variant="vinyl" /> */}

        {/* Galería */}
        <section
          id="galeria"
          aria-labelledby="galeria-title"
          className="relative z-10 scroll-mt-24 bg-card/30 px-4 py-24"
        >
          <div className="container mx-auto">
            <SectionHeading
              eyebrow="Momentos que quedan"
              title="Esto también es rock"
              description="Cada ruta, cada show y cada encuentro suma una historia. Acá guardamos algunos de esos recuerdos."
            />
            <PhotoGallery />
          </div>
        </section>

        {/* <SectionDivider variant="lightning" /> */}

        {/* Tienda */}
        <section
          id="tienda"
          aria-labelledby="tienda-title"
          className="relative z-10 scroll-mt-24 overflow-hidden py-24"
        >
          <div className="container mx-auto px-4">
            <div className="mb-12 grid items-end gap-6 md:grid-cols-[1fr_auto]">
              <div>
                <Eyebrow>Vestí tu pasión</Eyebrow>
                <h2
                  className="text-4xl font-black uppercase leading-[.9] tracking-tight text-foreground sm:text-5xl md:text-6xl"
                  style={{ fontFamily: "var(--font-londrina)" }}
                >
                  El rock también
                  <br />
                  <span className="text-primary">se lleva puesto.</span>
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Elegí tu diseño y tu banda. Llevá con vos una remera que te
                  identifique en cada viaje. ¿No encontrás lo que buscás?
                  Escribinos tu pedido.
                </p>
              </div>
              <div className="hidden h-16 w-16 items-center justify-center border border-primary/30 bg-primary/5 text-primary md:flex">
                <Sparkles className="h-7 w-7" />
              </div>
            </div>
            <CartPageContent />
          </div>
        </section>

        {/* Contacto */}
        <section
          id="contacto"
          aria-labelledby="contacto-title"
          className="relative z-10 scroll-mt-24 overflow-hidden border-y border-white/10 bg-[#090909] px-4 py-24 text-white"
        >
          <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-red-700/15 blur-[120px]" />
          <div className="container relative mx-auto">
            <div className="grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
              <div>
                <Eyebrow light>Del otro lado estamos nosotros</Eyebrow>
                <h2
                  className="max-w-xl text-5xl font-black uppercase leading-[.86] tracking-tight sm:text-6xl md:text-7xl"
                  style={{ fontFamily: "var(--font-londrina)" }}
                >
                  ¿Nos vamos
                  <br />
                  <span className="text-red-600">de viaje?</span>
                </h2>
                <p className="mt-6 max-w-lg text-base leading-8 text-white/55 sm:text-lg">
                  ¿Tenés dudas sobre un viaje, una reserva o un pedido? Hablá
                  directamente con nosotros. Te ayudamos a preparar el próximo
                  recital.
                </p>
                <Button
                  size="lg"
                  className="mt-8 h-14 rounded-none bg-red-600 px-7 text-xs font-black uppercase tracking-[.14em] text-white hover:bg-red-700"
                  asChild
                >
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Escribinos por WhatsApp
                    <ArrowUpRight className="ml-3 h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
                {BENEFICIOS.map(({ icon: Icon, number, title, description }) => (
                  <article
                    key={title}
                    className="bg-[#101010] p-6 transition-colors hover:bg-[#151010] sm:p-7"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-7 w-7 text-red-500" />
                      <span className="text-[10px] font-black tracking-[.2em] text-white/25">
                        {number}
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-black uppercase tracking-tight text-white">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-white/45">
                      {description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <CartFloatingButton onOpen={() => setCartOpen(true)} />

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribinos por WhatsApp"
        className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,.28)] transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]"
      >
        <MessageCircle className="h-7 w-7" aria-hidden="true" />
      </a>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#050505] px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <div className="mb-5 flex items-center gap-3">
                {/* <span className="flex h-11 w-11 items-center justify-center border border-red-500/40 bg-red-500/10 text-red-500">
                  <Guitar className="h-6 w-6" />
                </span> */}
                <span
                  className="text-2xl font-black uppercase leading-none"
                  style={{ fontFamily: "var(--font-bbh)" }}
                >
                  Locura <span className="text-red-500">&</span>
                  <br />
                  <span className="text-white/55">Realidad</span>
                </span>
              </div>
              <p className="max-w-xs text-sm leading-7 text-white/40">
                Viajes a recitales desde Santiago del Estero. Una comunidad
                que se encuentra en la ruta desde el 23 de marzo de 2022.
              </p>
            </div>

            <nav aria-label="Secciones del sitio">
              <h2 className="mb-5 text-[10px] font-black uppercase tracking-[.25em] text-white/75">
                Explorá
              </h2>
              <ul className="space-y-3 text-sm text-white/40">
                {navLinks
                  .filter((link) => link.id !== "contacto")
                  .map(({ id, label }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className="transition-colors hover:text-red-400"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
              </ul>
            </nav>

            <div>
              <h2 className="mb-5 text-[10px] font-black uppercase tracking-[.25em] text-white/75">
                Estamos cerca
              </h2>
              <ul className="space-y-3 text-sm text-white/40">
                <li>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-red-400"
                  >
                    WhatsApp
                  </a>
                </li>
                <li>Santiago del Estero, Argentina</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-5 text-[10px] font-black uppercase tracking-[.25em] text-white/75">
                Seguinos
              </h2>
              <ul className="flex gap-3">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center border border-white/10 text-white/45 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-[10px] font-semibold uppercase tracking-[.15em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Locura y Realidad. Todos los
              derechos reservados.
            </p>
            <p className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              La ruta es parte del show
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
