import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req) {
  const data = await req.formData();
  const file = data.get('file'); // nombre del campo enviado

  if (!file) {
    return new Response(JSON.stringify({ error: 'No se envió archivo' }), { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'LocuraRealidad' }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(buffer);
    });

    return Response.json({ url: result.secure_url });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
