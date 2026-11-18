export interface AlbumPhoto {
  src: string
  alt?: string
}

export interface Album {
  _id: string
  title: string
  description?: string
  location?: string
  photos: AlbumPhoto[]
  createdAt?: string
}
