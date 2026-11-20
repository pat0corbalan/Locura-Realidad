"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Camera, Package, MapPin, Ticket, Images, ArrowUpRight,
  RefreshCw, Activity, Plus, LayoutDashboard, Music2,
} from "lucide-react";
import { Photo } from "@/components/types/photo";
import { Product } from "@/components/types/product";
import { Tour } from "@/components/types/tour";

interface Album { _id: string; title?: string; photos?: unknown[] }
interface Reserva { _id: string; estado?: string; nombre?: string; apellido?: string; fecha?: string; evento?: string }

interface Data {
  photosData: Photo[];
  productsData: Product[];
  toursData: Tour[];
  albumsData: Album[];
  reservasData: Reserva[];
}

const emptyData: Data = {
  photosData: [], productsData: [], toursData: [], albumsData: [], reservasData: [],
};

const shortcuts = [
  { title: "Administrar eventos", description: "Revisá solicitudes y entradas", href: "/admin/reservas", icon: Ticket },
  { title: "Gestionar productos", description: "Actualizá tu tienda", href: "/admin/productos", icon: Package },
  { title: "Organizar tours", description: "Fechas, destinos y precios", href: "/admin/tours", icon: MapPin },
  { title: "Editar galería", description: "Fotos y álbumes", href: "/admin/fotos", icon: Camera },
];

async function fetchAdminData(): Promise<Data> {
  const endpoints = [
    ["/api/photos", "photosData"],
    ["/api/products", "productsData"],
    ["/api/tours", "toursData"],
    ["/api/albums", "albumsData"],
    ["/api/reservas", "reservasData"],
  ] as const;

  const values = await Promise.all(endpoints.map(async ([url]) => {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return [];
      const json = await response.json();
      if (Array.isArray(json)) return json;
      if (Array.isArray(json?.data)) return json.data;
      if (Array.isArray(json?.reservas)) return json.reservas;
      if (Array.isArray(json?.albums)) return json.albums;
      return [];
    } catch {
      return [];
    }
  }));

  return {
    photosData: values[0] as Photo[],
    productsData: values[1] as Product[],
    toursData: values[2] as Tour[],
    albumsData: values[3] as Album[],
    reservasData: values[4] as Reserva[],
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<Data>(emptyData);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchAdminData();
    setData(result);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => { void loadData(); }, []);

  const pending = useMemo(
    () => data.reservasData.filter((item) => (item.estado || "").toLowerCase() === "pendiente").length,
    [data.reservasData],
  );

  const stats = [
    { label: "Fotos publicadas", value: data.photosData.length, note: "Elementos en la galería", icon: Camera, href: "/admin/fotos" },
    { label: "Productos", value: data.productsData.length, note: "En el catálogo", icon: Package, href: "/admin/productos" },
    { label: "Tours", value: data.toursData.length, note: "Experiencias cargadas", icon: MapPin, href: "/admin/tours" },
    { label: "Reservas", value: data.reservasData.length, note: pending ? `${pending} pendientes de revisar` : "Solicitudes registradas", icon: Ticket, href: "/admin/reservas" },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="admin-eyebrow mb-3 flex items-center gap-2"><Music2 size={13} /> Centro de operaciones</p>
          <h1 className="admin-page-title">Tu mundo, bajo control.</h1>
          <p className="admin-page-description">Gestioná el contenido y la actividad de Locura &amp; Realidad desde un solo lugar.</p>
        </div>
        <button onClick={loadData} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground transition hover:border-primary/50 disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar datos
        </button>
      </section>

      <section className="relative overflow-hidden rounded-[22px] border border-red-500/20 bg-[radial-gradient(ellipse_at_80%_20%,rgba(220,38,38,.24),transparent_42%),linear-gradient(115deg,#191b22,#111319_65%,#1b1115)] p-6 sm:p-8">
        <div className="absolute -right-8 -top-16 h-64 w-64 rounded-full border border-white/[.06]" />
        <div className="absolute -right-1 -top-9 h-48 w-48 rounded-full border border-white/[.06]" />
        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_10px_#f87171]" /> Panel de control
          </div>
          <h2 className="text-2xl font-bold tracking-[-.04em] text-white sm:text-3xl">La experiencia empieza acá.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">Todo lo que publicás, organizás y compartís con la comunidad, en un espacio diseñado para trabajar mejor.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/reservas" className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500">
              Revisar reservas <ArrowUpRight size={14} />
            </Link>
            <Link href="/admin/productos" className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[.06] px-4 text-xs font-semibold text-white transition hover:bg-white/10">
              Ir a la tienda
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">Resumen general</h2>
            <p className="mt-1 text-xs text-muted-foreground">Datos actuales de tus secciones</p>
          </div>
          {lastUpdated && <span className="text-[10px] text-muted-foreground">Actualizado {lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</span>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link href={stat.href} key={stat.label} className="admin-stat group block transition hover:-translate-y-1 hover:border-primary/40">
                <div className="relative z-[1] flex items-center justify-between">
                  <span className="admin-stat-label">{stat.label}</span>
                  <span className="admin-icon-box"><Icon size={17} /></span>
                </div>
                <div className="admin-stat-value">{loading ? <span className="inline-block h-8 w-12 animate-pulse rounded-md bg-white/10" /> : stat.value}</div>
                <div className="relative z-[1] mt-3 flex items-center justify-between">
                  <span className="admin-stat-foot">{stat.note}</span>
                  <ArrowUpRight size={14} className="text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_.85fr]">
        <div className="admin-panel p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">Accesos rápidos</h2>
              <p className="mt-1 text-xs text-muted-foreground">Entrá directamente a lo que necesitás gestionar</p>
            </div>
            <span className="admin-icon-box"><LayoutDashboard size={17} /></span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {shortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.title} className="admin-quick-link group">
                  <span className="admin-icon-box shrink-0"><Icon size={17} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-foreground">{item.title}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">{item.description}</span>
                  </span>
                  <ArrowUpRight size={14} className="shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="admin-panel flex flex-col p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="admin-icon-box"><Activity size={17} /></span>
            <div>
              <h2 className="text-base font-bold">Estado del contenido</h2>
              <p className="mt-1 text-xs text-muted-foreground">Elementos disponibles en el panel</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {[
              { label: "Galería", value: data.photosData.length, icon: Camera },
              { label: "Álbumes", value: data.albumsData.length, icon: Images },
              { label: "Catálogo", value: data.productsData.length, icon: Package },
              { label: "Experiencias", value: data.toursData.length, icon: MapPin },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <Icon size={15} className="text-muted-foreground" />
                  <span className="flex-1 text-xs font-medium text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-bold tabular-nums text-foreground">{loading ? "—" : item.value}</span>
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[.06]">
                    <span className="block h-full rounded-full bg-red-500" style={{ width: `${loading ? 0 : Math.min(100, item.value ? 25 + item.value * 5 : 0)}%` }} />
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-auto border-t border-border pt-4">
            <p className="text-[10px] leading-5 text-muted-foreground">Los indicadores reflejan los registros que devuelven las API del proyecto. No representan métricas de ventas ni tendencias históricas.</p>
          </div>
        </div>
      </section>
      <div className="flex items-center justify-center gap-2 pb-2 text-[10px] text-muted-foreground/60">
        <Plus size={11} /> Locura &amp; Realidad · Administración
      </div>
    </div>
  );
}
