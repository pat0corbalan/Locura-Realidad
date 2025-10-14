import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/contexts/cart-context";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tours de Rock | Locura y Realidad",
  description:
    "Explora los destinos más legendarios del rock con nuestros tours únicos. Vive la música como nunca antes con Locura y Realidad.",
  generator: "Next.js + Pat0Corbalan",
  keywords: [
    "tours de rock",
    "viajes musicales",
    "rock and roll",
    "lugares del rock",
    "historia del rock",
    "turismo musical",
    "Locura y Realidad"
  ],
  openGraph: {
    title: "Tours de Rock | Locura y Realidad",
    description:
      "Viajes únicos para fans del rock: conoce los sitios más emblemáticos de la historia musical.",
    url: "https://tudominio.com",
    siteName: "Locura y Realidad",
    images: [
      {
        url: "https://locura-realidad.vercel.app/",
        width: 1200,
        height: 630,
        alt: "Tours de Rock - Locura y Realidad",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tours de Rock | Locura y Realidad",
    description:
      "Descubre destinos legendarios del rock con nuestros tours especializados.",
    images: ["https://locura-realidad.vercel.app/"],
    site: "@tuusuario",
  },
  metadataBase: new URL("https://locura-realidad.vercel.app/"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
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
