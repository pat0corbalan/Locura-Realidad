"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Package, MapPin, TrendingUp, Eye } from "lucide-react"

// Importa tus tipos
import { Photo } from "@/components/types/photo"
import { Product } from "@/components/types/product"
import { Tour } from "@/components/types/tour"

// Definir la interfaz para los datos combinados
interface Data {
  photosData: Photo[]
  productsData: Product[]
  toursData: Tour[]
}

// Función para obtener los datos de las APIs
const fetchData = async (): Promise<Data> => {
  try {
    const [photosRes, toursRes, productsRes] = await Promise.all([
      fetch("/api/photos"),
      fetch("/api/tours"),
      fetch("/api/products"),
    ])

    const [photosData, toursData, productsData] = await Promise.all([
      photosRes.json(),
      toursRes.json(),
      productsRes.json(),
    ])

    return { photosData, toursData, productsData }
  } catch (error) {
    console.error("Error fetching data", error)
    return { photosData: [], toursData: [], productsData: [] }
  }
}

export default function AdminDashboard() {
  const [data, setData] = useState<Data>({
    photosData: [],
    toursData: [],
    productsData: [],
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData()
      setData(result)
      setLoading(false)
    }

    loadData()
  }, [])

  // Calculando los stats basados en los datos obtenidos
  const stats = [
    {
      title: "Total Fotos",
      value: data.photosData.length,
      description: "Fotos subidas este mes",
      icon: Camera,
      trend: "+12%", // Puedes hacer cálculos dinámicos si tienes un historial de fotos
    },
    {
      title: "Productos",
      value: data.productsData.length,
      description: "Productos activos",
      icon: Package,
      trend: "+5%", // También se puede hacer dinámico si tienes datos de ventas o cambios
    },
    {
      title: "Tours",
      value: data.toursData.length,
      description: "Tours disponibles",
      icon: MapPin,
      trend: "+8%", // Igual que los demás
    },
  ]

  const recentActivity = [
    {
      action: "Nueva foto subida",
      item: data.photosData[0]?.title || "N/A", // Usar el primer elemento de las fotos
      time: "Hace 2 minutos",
    },
    {
      action: "Producto actualizado",
      item: data.productsData[0]?.name || "N/A", // Lo mismo para productos
      time: "Hace 15 minutos",
    },
    {
      action: "Tour creado",
      item: data.toursData[0]?.title || "N/A", // Lo mismo para tours
      time: "Hace 1 hora",
    },
  ]

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Panel de Administración</h1>
        <p className="text-muted-foreground mt-2">Gestiona el contenido de Locura & Realidad desde aquí</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-primary">{stat.trend}</span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-1">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-card-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.item}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
