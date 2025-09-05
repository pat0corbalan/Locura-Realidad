import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Package, MapPin, Users, TrendingUp, Eye } from "lucide-react"

const stats = [
  {
    title: "Total Fotos",
    value: "1,234",
    description: "Fotos subidas este mes",
    icon: Camera,
    trend: "+12%",
  },
  {
    title: "Productos",
    value: "89",
    description: "Productos activos",
    icon: Package,
    trend: "+5%",
  },
  {
    title: "Tours",
    value: "23",
    description: "Tours disponibles",
    icon: MapPin,
    trend: "+8%",
  },
  {
    title: "Usuarios",
    value: "456",
    description: "Usuarios registrados",
    icon: Users,
    trend: "+15%",
  },
]

const recentActivity = [
  {
    action: "Nueva foto subida",
    item: "Atardecer en la playa",
    time: "Hace 2 minutos",
  },
  {
    action: "Producto actualizado",
    item: "Camiseta Vintage",
    time: "Hace 15 minutos",
  },
  {
    action: "Tour creado",
    item: "Aventura en la Montaña",
    time: "Hace 1 hora",
  },
  {
    action: "Usuario registrado",
    item: "maria.gonzalez@email.com",
    time: "Hace 2 horas",
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Panel de Administración</h1>
        <p className="text-muted-foreground mt-2">Gestiona el contenido de Locura & Realidad desde aquí</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-accent" />
                <span className="text-accent">{stat.trend}</span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-accent rounded-full" />
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

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Accesos Rápidos</CardTitle>
            <CardDescription>Acciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <button className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-accent/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <Camera className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-foreground">Subir Nueva Foto</span>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-accent/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-foreground">Crear Producto</span>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-accent/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-foreground">Nuevo Tour</span>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
