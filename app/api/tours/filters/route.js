import { connectDB } from "@/lib/mongodb";
import Tour from "@/models/Tour";

export async function GET() {
  try {
    await connectDB();
    const tours = await Tour.find({}, "destination grupo");
    const destinations = Array.from(new Set(tours.map((tour) => tour.destination))).sort();
    const grupos = Array.from(new Set(tours.map((tour) => tour.grupo).filter(Boolean))).sort();
    return Response.json({ destinations, grupos });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}