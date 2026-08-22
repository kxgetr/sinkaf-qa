"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Run } from "../lib/domain";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [goal, setGoal] = useState("");
  const [autoDiscover, setAutoDiscover] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentRuns, setRecentRuns] = useState<Run[]>([]);
  const isDemoEnabled = process.env.NEXT_PUBLIC_DEMO_ENABLED === "true";
  const donationUrl = process.env.NEXT_PUBLIC_DONATION_URL;

  useEffect(() => {
    fetch("/api/runs")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentRuns(data);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isDemoEnabled ? "/api/demo/runs" : "/api/runs";
      const payload: any = { url, goal, autoDiscover };
      
      if (isDemoEnabled) {
        payload.fingerprint = {
          userAgentFamily: navigator.userAgent,
          screen: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create run");
      }

      const run = await res.json();
      router.push(`/runs/${run.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8 font-mono flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-2 tracking-tighter">SINKAF QA</h1>
        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
          URL&apos;yi ver.<br />
          AI siteni kurcalasın.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-[#111] p-6 border border-gray-800 rounded-lg shadow-xl">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Website URL</label>
            <input 
              type="url" 
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Ne test edelim?</label>
            <textarea 
              required
              placeholder="Login, signup ve checkout akışlarını kurcala."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded p-3 text-white min-h-[100px] focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="autoDiscover"
              checked={autoDiscover}
              onChange={(e) => setAutoDiscover(e.target.checked)}
              className="w-5 h-5 accent-red-500 bg-black border-gray-700"
            />
            <label htmlFor="autoDiscover" className="text-sm text-gray-300 select-none">
              Siteyi kendi keşfetsin
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-900/20 p-3 rounded">{error}</div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded transition-colors disabled:opacity-50 tracking-widest"
          >
            {loading ? "HAZIRLANIYOR..." : "SİTEYİ KURCALA"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4 text-xs">
          {isDemoEnabled ? (
            <>Public demo tek kullanımlıktır. Kendi kurulumunda böyle bir sınır yoktur.</>
          ) : (
            <>[Self-Hosted Mode]</>
          )}
        </p>

        <div className="flex flex-col items-center justify-center space-y-4 mt-8 border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400 text-sm">
            Beğendiysen GitHub&apos;dan kur, kendi API key&apos;inle aban.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a href="https://github.com/sinkaf-qa/sinkaf" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors">
              ⭐ GitHub
            </a>
            {donationUrl && (
              <a href={donationUrl} target="_blank" rel="noopener noreferrer" className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                ☕ BAĞIŞ AT
              </a>
            )}
          </div>
          {donationUrl && (
            <p className="text-xs text-gray-600 text-center max-w-sm mt-2">
              İşine yaradıysa bağış atabilirsin. Hayır kurumu değiliz, server da bedava çalışmıyor aq.
            </p>
          )}
        </div>

        {recentRuns.length > 0 && !isDemoEnabled && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4 tracking-tighter text-gray-300 border-b border-gray-800 pb-2">SON TESTLER</h2>
            <div className="space-y-3">
              {recentRuns.map(run => (
                <Link href={`/runs/${run.id}`} key={run.id} className="block bg-[#111] border border-gray-800 rounded p-4 hover:border-gray-600 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="truncate pr-4 text-gray-200">
                      {run.request.url}
                    </div>
                    <div className="text-xs font-bold text-red-500 uppercase">
                      {run.status}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(run.createdAt).toLocaleString("tr-TR")}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
