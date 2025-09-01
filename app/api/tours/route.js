import { connectDB } from "@/lib/mongodb";
import Tour from "@/models/Tour";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const tours = await Tour.find();
    return NextResponse.json(tours);
  } catch (error) {
    console.error("Error fetching tours:", error);
    return NextResponse.json({ message: "Error fetching tours" }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const tour = new Tour(body);
    const newTour = await tour.save();
    return NextResponse.json(newTour, { status: 201 });
  } catch (error) {
    console.error("Error creating tour:", error);
    return NextResponse.json({ message: "Error creating tour" }, { status: 400 });
  }
}