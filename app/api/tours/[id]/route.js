import { connectDB } from "@/lib/mongodb";
import Tour from "@/models/Tour";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const tour = await Tour.findById(params.id);
    if (!tour) {
      return NextResponse.json({ message: "Tour not found" }, { status: 404 });
    }
    return NextResponse.json(tour);
  } catch (error) {
    console.error("Error fetching tour:", error);
    return NextResponse.json({ message: "Error fetching tour" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const tour = await Tour.findById(params.id);
    if (!tour) {
      return NextResponse.json({ message: "Tour not found" }, { status: 404 });
    }
    Object.assign(tour, body);
    const updatedTour = await tour.save();
    return NextResponse.json(updatedTour);
  } catch (error) {
    console.error("Error updating tour:", error);
    return NextResponse.json({ message: "Error updating tour" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const tour = await Tour.findById(params.id);
    if (!tour) {
      return NextResponse.json({ message: "Tour not found" }, { status: 404 });
    }
    await tour.deleteOne();
    return NextResponse.json({ message: "Tour deleted" });
  } catch (error) {
    console.error("Error deleting tour:", error);
    return NextResponse.json({ message: "Error deleting tour" }, { status: 500 });
  }
}