import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    
    // Intentionally missing backend validation
    if (email) {
      return NextResponse.json({ success: true, message: "Registered!" }, { status: 201 });
    }
    
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
