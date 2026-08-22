import { NextResponse } from "next/server";
import { runRepository } from "../../../../lib/runs/repository";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await runRepository.getById(id);
  if (!run) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(run);
}
