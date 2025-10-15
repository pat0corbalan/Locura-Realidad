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
    "Explora los destinos más emblemáticos del rock en Argentina con nuestros tours exclusivos. Sumérgete en la cultura y la música que marcaron la historia del rock nacional e internacional con Locura y Realidad.",
  generator: "Next.js + Pat0Corbalan",
  keywords: [
    "tours de rock",
    "viajes musicales",
    "rock nacional",
    "rock argentino",
    "historia del rock",
    "turismo musical",
    "lugares emblemáticos del rock",
    "Locura y Realidad",
    "destinos rock Argentina"
  ],
  openGraph: {
    title: "Tours de Rock en Argentina | Locura y Realidad",
    description:
      "Viajes únicos para fans del rock: conoce los sitios más emblemáticos y culturales de la historia del rock nacional e internacional en Argentina.",
    url: "https://locura-realidad.vercel.app",
    siteName: "Locura y Realidad",
    images: [
      {
        url: "https://locura-realidad.vercel.app/images/og-rock-tours-argentina.jpg", // Imagen OG específica Argentina
        width: 1200,
        height: 630,
        alt: "Tours de Rock - Locura y Realidad Argentina",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tours de Rock en Argentina | Locura y Realidad",
    description:
      "Descubre destinos legendarios del rock con nuestros tours especializados por Argentina. Vive la música como nunca antes.",
    images: ["https://locura-realidad.vercel.app/images/twitter-rock-tours-argentina.jpg"], // Imagen Twitter Argentina
    site: "@tuusuario",
  },
  metadataBase: new URL("https://locura-realidad.vercel.app"),
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
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Android Chrome */}
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
