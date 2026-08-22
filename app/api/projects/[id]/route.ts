import { NextResponse } from "next/server";
import { db } from "../../../../lib/db/client";
import { projects } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await db.select().from(projects).where(eq(projects.id, id)).then((res: any) => res[0]);
    
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json(project);
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
