import { connectDB } from "@/lib/mongodb";
import Photo from "@/models/Photo";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const photos = await Photo.find();
    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json({ message: "Error fetching photos" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const photo = new Photo(body);
    const newPhoto = await photo.save();
    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    console.error("Error creating photo:", error);
    return NextResponse.json({ message: "Error creating photo" }, { status: 400 });
  }
}