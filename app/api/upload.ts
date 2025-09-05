import { v2 as cloudinary } from "cloudinary"
import type { NextApiRequest, NextApiResponse } from "next"
import formidable from "formidable"
import fs from "fs"

export const config = {
  api: {
    bodyParser: false,
  },
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" })
  }

  const form = formidable({ multiples: false })

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: "Error al procesar el archivo" })
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "galeria",
      })

      return res.status(200).json({ secure_url: result.secure_url })
    } catch (err) {
      console.error("Cloudinary upload error:", err)
      return res.status(500).json({ error: "Error al subir a Cloudinary" })
    }
  })
}
