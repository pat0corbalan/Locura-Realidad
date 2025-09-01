import { connectDB } from "@/lib/mongodb";
import Photo from "@/models/Photo";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const photo = await Photo.findById(params.id);
    if (!photo) {
      return NextResponse.json({ message: "Photo not found" }, { status: 404 });
    }
    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json({ message: "Error fetching photo" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const photo = await Photo.findById(params.id);
    if (!photo) {
      return NextResponse.json({ message: "Photo not found" }, { status: 404 });
    }
    Object.assign(photo, body);
    const updatedPhoto = await photo.save();
    return NextResponse.json(updatedPhoto);
  } catch (error) {
    console.error("Error updating photo:", error);
    return NextResponse.json({ message: "Error updating photo" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const photo = await Photo.findById(params.id);
    if (!photo) {
      return NextResponse.json({ message: "Photo not found" }, { status: 404 });
    }
    await photo.deleteOne();
    return NextResponse.json({ message: "Photo deleted" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json({ message: "Error deleting photo" }, { status: 500 });
  }
}