import { db } from "../../../lib/db/client";
import { attackSessions, ipBans, securityEvents } from "../../../lib/db/schema";
import { desc, count, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SecurityDashboard({ searchParams }: { searchParams: { token?: string } }) {
  if (searchParams.token !== process.env.SECURITY_ADMIN_TOKEN && process.env.SECURITY_ADMIN_TOKEN) {
    redirect("/");
  }

  const bannedCountResult = await db.select({ count: count() }).from(ipBans);
  const bannedCount = bannedCountResult[0]?.count || 0;

  const totalSessionsResult = await db.select({ count: count() }).from(attackSessions);
  const totalSessions = totalSessionsResult[0]?.count || 0;
  
  const recentSessions = await db.select().from(attackSessions).orderBy(desc(attackSessions.lastSeenAt)).limit(20);

  return (
    <main className="min-h-screen bg-[#050505] text-red-500 font-mono p-8">
      <h1 className="text-3xl font-bold mb-8 uppercase tracking-widest text-red-600 border-b border-red-900 pb-2">SINKAF SECURITY OPERATOR DASHBOARD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111] border border-red-900 p-4 rounded">
          <div className="text-xs text-red-400 mb-1">TOTAL BANNED IPs</div>
          <div className="text-3xl font-bold">{bannedCount}</div>
        </div>
        <div className="bg-[#111] border border-red-900 p-4 rounded">
          <div className="text-xs text-red-400 mb-1">ATTACK SESSIONS</div>
          <div className="text-3xl font-bold">{totalSessions}</div>
        </div>
        <div className="bg-[#111] border border-red-900 p-4 rounded">
          <div className="text-xs text-red-400 mb-1">HONEYPOT STATUS</div>
          <div className="text-3xl font-bold text-green-500">ACTIVE</div>
        </div>
        <div className="bg-[#111] border border-red-900 p-4 rounded">
          <div className="text-xs text-red-400 mb-1">CVE INTELLIGENCE</div>
          <div className="text-xl font-bold text-yellow-500">FRESH</div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 text-red-400">RECENT SESSIONS</h2>
      <div className="space-y-4">
        {recentSessions.map(s => (
          <div key={s.id} className="bg-[#111] border border-gray-800 p-4 rounded flex flex-col md:flex-row justify-between">
            <div>
              <div className="text-sm text-gray-400">Session ID: {s.id}</div>
              <div className="text-lg text-white font-bold mb-2">Status: <span className={s.status === "banned" ? "text-red-500" : "text-yellow-500"}>{s.status.toUpperCase()}</span></div>
              <div className="text-xs text-gray-500">First seen: {s.firstSeenAt.toLocaleString()}</div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-xl font-bold text-red-600 mb-1">Risk: {s.riskScore}</div>
              <div className="text-xs text-gray-400">Hits: {s.honeypotHits} | Requests: {s.requestCount}</div>
              <div className="text-xs text-yellow-600 mt-2">Classes: {(s.classification as string[]).join(", ")}</div>
            </div>
          </div>
        ))}
        {recentSessions.length === 0 && <div className="text-gray-500 italic">No hostile traffic yet. Internet is sleeping.</div>}
      </div>
    </main>
  );
}
