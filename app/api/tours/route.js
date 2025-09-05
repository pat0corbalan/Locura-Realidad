// import { connectDB } from "@/lib/mongodb";
// import Tour from "@/models/Tour";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     await connectDB();
//     const tours = await Tour.find();
//     return NextResponse.json(tours);
//   } catch (error) {
//     console.error("Error fetching tours:", error);
//     return NextResponse.json({ message: "Error fetching tours" }, { status: 500 });
//   }
// }


// export async function POST(request) {
//   try {
//     await connectDB();
//     const body = await request.json();
//     const tour = new Tour(body);
//     const newTour = await tour.save();
//     return NextResponse.json(newTour, { status: 201 });
//   } catch (error) {
//     console.error("Error creating tour:", error);
//     return NextResponse.json({ message: "Error creating tour" }, { status: 400 });
//   }
// }


import { connectDB } from "../../../utils/mongoose";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import Tour from "../../../models/Tour";

export async function POST(req) {
  await connectDB();

  const form = await req.formData();

  const src = form.get("image");
  const title = form.get("title");
  const description = form.get("description");
  const destination = form.get("destination");
  const dates = form.get("dates");
  const price = form.get("price");
  const grupo = form.get("grupo");

  try {
    let uploadedImage;

    if (src && src.name) {
      uploadedImage = await uploadToCloudinary(src, `tours/${title}`);
    }

    const newTour = await Tour.create({
      title,
      description,
      destination,
      dates,
      price,
      grupo,
      image: uploadedImage?.secure_url || "",
    });

    return new Response(JSON.stringify(newTour), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
