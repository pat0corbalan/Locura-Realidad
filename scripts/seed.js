import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from "../lib/mongodb.js";
import Tour from "../models/Tour.js";
import Product from "../models/Product.js";
import Photo from "../models/Photo.js";


async function seedData() {
  await connectDB();

  const tours = [
    {
      title: "Rock Legends of London",
      description: "Explora los lugares icónicos del rock británico, desde Abbey Road hasta el Cavern Club.",
      destination: "Londres, Reino Unido",
      dates: "15-22 Marzo 2024",
      price: "$2,499",
      image: "/london-rock-venues-abbey-road-beatles.png",
    },
    {
      title: "Metal Masters of Germany",
      description: "Descubre la cuna del metal alemán visitando estudios legendarios y venues históricos.",
      destination: "Berlín - Hamburgo, Alemania",
      dates: "5-12 Abril 2024",
      price: "$2,199",
      image: "/german-metal-venues-berlin-hamburg-rock.png",
    },
    {
      title: "Grunge Seattle Experience",
      description: "Sumérgete en la escena grunge de los 90s en la ciudad que lo vio nacer.",
      destination: "Seattle, Estados Unidos",
      dates: "20-27 Mayo 2024",
      price: "$2,799",
      image: "/seattle-grunge-venues-nirvana-pearl-jam.png",
    },
  ];

  const products = [
    {
      name: "Camiseta Locura y Realidad",
      description: "Camiseta negra con logo vintage en rojo y blanco. 100% algodón premium.",
      price: 29.99,
      originalPrice: 39.99,
      image: "/merch-tshirt-black-logo-vintage.png",
      category: "Camisetas",
      rating: 4.8,
      inStock: true,
    },
    {
      name: "Gorra Rock Vintage",
      description: "Gorra ajustable con bordado del logo y detalles de guitarra eléctrica.",
      price: 24.99,
      image: "/merch-cap-black-guitar-embroidery.png",
      category: "Gorras",
      rating: 4.6,
      inStock: true,
    },
    {
      name: "Pin Set Rock Icons",
      description: "Set de 4 pins esmaltados con iconos del rock: guitarra, vinilo, amplificador y logo.",
      price: 15.99,
      image: "/merch-pins-set-rock-icons-enamel.png",
      category: "Pins",
      rating: 4.9,
      inStock: true,
    },
    {
      name: "Sudadera Tour Edition",
      description: "Sudadera con capucha negra, logo frontal y lista de ciudades del tour en la espalda.",
      price: 49.99,
      originalPrice: 59.99,
      image: "/merch-hoodie-tour-cities-back.png",
      category: "Sudaderas",
      rating: 4.7,
      inStock: true,
    },
    {
      name: "Taza Rock & Coffee",
      description: "Taza cerámica negra con frase 'Rock & Coffee' y logo dorado.",
      price: 18.99,
      image: "/merch-mug-ceramic-black-gold-logo.png",
      category: "Accesorios",
      rating: 4.5,
      inStock: false,
    },
    {
      name: "Parche Bordado Logo",
      description: "Parche bordado del logo para personalizar chaquetas y mochilas.",
      price: 9.99,
      image: "/merch-patch-embroidered-logo-jacket.png",
      category: "Parches",
      rating: 4.8,
      inStock: true,
    },
  ];

  const photos = [
    {
      src: "/gallery-rock-concert-crowd-energy.png",
      alt: "Multitud en concierto de rock",
      title: "Energía Pura",
      location: "Londres, Reino Unido",
    },
    {
      src: "/gallery-vintage-guitar-collection-studio.png",
      alt: "Colección de guitarras vintage",
      title: "Guitarras Legendarias",
      location: "Abbey Road Studios",
    },
    {
      src: "/gallery-rock-fans-tour-group-happy.png",
      alt: "Grupo de fans en tour",
      title: "Momentos Únicos",
      location: "Berlín, Alemania",
    },
    {
      src: "/gallery-historic-rock-venue-stage.png",
      alt: "Escenario histórico de rock",
      title: "Escenarios Míticos",
      location: "The Cavern Club",
    },
    {
      src: "/gallery-vinyl-records-collection-wall.png",
      alt: "Colección de vinilos en pared",
      title: "Tesoros Musicales",
      location: "Seattle, Estados Unidos",
    },
    {
      src: "/gallery-rock-memorabilia-museum-display.png",
      alt: "Memorabilia de rock en museo",
      title: "Historia del Rock",
      location: "Rock and Roll Hall of Fame",
    },
  ];

  try {
    await Tour.deleteMany();
    await Product.deleteMany();
    await Photo.deleteMany();
    await Tour.insertMany(tours);
    await Product.insertMany(products);
    await Photo.insertMany(photos);
    console.log("Data seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    process.exit();
  }
}

seedData();