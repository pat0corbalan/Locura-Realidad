// app/layout.tsx

import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/contexts/cart-context";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tours de Rock en Argentina | Vive la Historia del Rock con Locura y Realidad",
  description:
    "Logística en viajes con destino a recitales desde Santiago Del Estero, capital. Organización de eventos locales y venta de indumentaria dirigida al público de rock.",
  generator: "Next.js + Pat0Corbalan",
  keywords: [
    "locura y realidad tour",
    "tours de rock",
    "viajes musicales",
    "rock nacional",
    "rock argentino",
    "historia del rock",
    "turismo musical",
    "lugares emblemáticos del rock",
    "Locura y Realidad",
    "destinos rock Argentina",
  ],
  metadataBase: new URL("https://locura-realidad.vercel.app"),
  openGraph: {
    title: "Tours de Rock en Argentina | Locura y Realidad",
    description:
      "Logística en viajes con destino a recitales desde Santiago Del Estero, capital. Organización de eventos locales y venta de indumentaria dirigida al público de rock.",
    url: "https://locura-realidad.vercel.app",
    siteName: "Locura y Realidad",
    images: [
      {
        url: "https://locura-realidad.vercel.app/lyr.png",
        width: 1200,
        height: 630,
        alt: "Tours de Rock - Locura y Realidad Argentina",
        type: "image/png",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tours de Rock en Argentina | Locura y Realidad",
    description:
      "Logística en viajes con destino a recitales desde Santiago Del Estero, capital. Organización de eventos locales y venta de indumentaria dirigida al público de rock.",
    images: "https://locura-realidad.vercel.app/lyr.png",
    site: "@LyR_Tour", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="Un_QoY66hLuiFGOySM37Zh6VrnHqyyqAR53KZ3zpXN4" />

        {/* Favicons y manifest */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <CartProvider>{children}</CartProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
