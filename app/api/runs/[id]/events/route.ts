import { NextResponse } from "next/server";
import { runRepository } from "../../../../../lib/runs/repository";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!runRepository.listEvents) {
      return NextResponse.json({ events: [] });
    }
    const events = await runRepository.listEvents(id);
    return NextResponse.json({ events });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
