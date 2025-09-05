export interface Tour {
  _id?: string // opcional en creación, obligatorio en edición
  title: string
  description: string
  destination: string
  dates: string[]
  price: number
  image?: string // opcional porque puede venir como file
  grupo?: string
}
