import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import Photo from "@/models/Photo"
import Tour from "@/models/Tour"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ShoppingBag, ImageIcon, Calendar } from "lucide-react"
import { Types } from "mongoose"

type ProductType = {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  inStock: boolean
  sizes: string[]
}

type TourType = {
  _id: string
  title: string
  description: string
  destination: string
  dates: string
  price: string
  image: string
}

type PhotoType = {
  _id: string
  src: string
  alt: string
  title: string
  location: string
}

// Interfaces para los datos crudos de Mongo (con ObjectId)
interface RawProduct {
  _id: Types.ObjectId
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  inStock: boolean
  sizes?: string[]
}

interface RawTour {
  _id: Types.ObjectId
  title: string
  description: string
  destination: string
  dates: string
  price: string
  image: string
}

interface RawPhoto {
  _id: Types.ObjectId
  src: string
  alt: string
  title: string
  location: string
}

export default async function AdminDashboard() {
  await connectDB()

  // Contadores
  const productsCount = await Product.countDocuments()
  const toursCount = await Tour.countDocuments()
  const photosCount = await Photo.countDocuments()

  // Obtén datos crudos con lean<T>()
  const rawProducts = await Product.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean<RawProduct[]>()

  const rawTours = await Tour.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean<RawTour[]>()

  const rawPhotos = await Photo.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean<RawPhoto[]>()

  // Mapea los datos crudos a los tipos usados en la UI
  const recentProducts: ProductType[] = rawProducts.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.image,
    category: p.category,
    rating: p.rating,
    inStock: p.inStock,
    sizes: p.sizes ?? [],
  }))

  const recentTours: TourType[] = rawTours.map((t) => ({
    _id: t._id.toString(),
    title: t.title,
    description: t.description,
    destination: t.destination,
    dates: t.dates,
    price: t.price,
    image: t.image,
  }))

  const recentPhotos: PhotoType[] = rawPhotos.map((ph) => ({
    _id: ph._id.toString(),
    src: ph.src,
    alt: ph.alt,
    title: ph.title,
    location: ph.location,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600">Resumen de tu negocio de tours de rock</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toursCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fotos</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photosCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Productos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Recientes</CardTitle>
          <CardDescription>Últimos productos agregados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <div key={product._id} className="flex items-center space-x-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay productos recientes.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tours recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Tours Recientes</CardTitle>
          <CardDescription>Últimos tours agregados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTours.length > 0 ? (
              recentTours.map((tour) => (
                <div key={tour._id} className="flex items-center space-x-4">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{tour.title}</p>
                    <p className="text-sm text-gray-600">{tour.destination}</p>
                    <p className="text-sm text-gray-600">{tour.dates}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay tours recientes.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fotos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Fotos Recientes</CardTitle>
          <CardDescription>Últimas fotos agregadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPhotos.length > 0 ? (
              recentPhotos.map((photo) => (
                <div key={photo._id} className="flex items-center space-x-4">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{photo.title}</p>
                    <p className="text-sm text-gray-600">{photo.location}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay fotos recientes.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
