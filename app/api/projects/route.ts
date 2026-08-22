import { NextResponse } from "next/server";
import { db } from "../../../lib/db/client";
import { projects } from "../../../lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(projects).orderBy(desc(projects.updatedAt));
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
