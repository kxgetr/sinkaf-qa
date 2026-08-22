"use client";

import { useEffect, useState, use } from "react";
import { Run } from "../../../lib/domain";

export default function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [run, setRun] = useState<Run | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchRun = async () => {
      try {
        const res = await fetch(`/api/runs/${id}`);
        if (!res.ok) throw new Error("Run not found");
        const data = await res.json();
        setRun(data);

        const evRes = await fetch(`/api/runs/${id}/events`);
        if (evRes.ok) {
          const evData = await evRes.json();
          setEvents(evData);
        }

        if (["pending", "queued", "running"].includes(data.status)) {
          if (!interval) {
            interval = setInterval(fetchRun, 2000);
          }
        } else {
          if (interval) clearInterval(interval);
        }
      } catch (err: unknown) {
        if (!run) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchRun();
    return () => clearInterval(interval);
  }, [id, run?.status]);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-mono flex items-center justify-center">Yükleniyor...</div>;
  }

  if (error || !run) {
    return <div className="min-h-screen bg-[#0a0a0a] text-red-500 p-8 font-mono flex items-center justify-center">Hata: {error || "Bulunamadı"}</div>;
  }

  const result = run.result as any;
  const isFinished = ["passed", "issues_found", "infra_error"].includes(run.status);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8 font-mono flex flex-col items-center">
      <div className="w-full max-w-4xl mt-12 space-y-8">
        <h1 className="text-4xl font-bold tracking-tighter text-center">SINKAF QA</h1>
        
        {isFinished && (
          <div className="text-center py-8">
            <h2 className="text-2xl text-gray-400 mb-2">SIÇTI MI?</h2>
            {run.status === "issues_found" && <div className="text-6xl font-bold text-red-500">EVET AMK.</div>}
            {run.status === "passed" && <div className="text-6xl font-bold text-green-500">ŞİMDİLİK HAYIR.</div>}
            {run.status === "infra_error" && <div className="text-6xl font-bold text-yellow-500">BU SEFER BİZ SIÇTIK.</div>}
          </div>
        )}

        {result?.projectId && result?.comparison && (
          <div className="bg-[#111] p-6 border border-gray-800 rounded-lg shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-blue-400 mb-2">BU SİTEYİ HATIRLIYORUM</h2>
            <div className="grid grid-cols-4 gap-4 mt-2">
              <div className="p-3 bg-gray-900 border border-gray-800 rounded">
                <div className="text-xs text-gray-500">YENİ BUG</div>
                <div className="text-xl font-bold text-red-400">+{result.comparison.newBugs?.length || 0}</div>
              </div>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded">
                <div className="text-xs text-gray-500">DEVAM EDEN</div>
                <div className="text-xl font-bold text-orange-400">{result.comparison.recurringBugs?.length || 0}</div>
              </div>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded">
                <div className="text-xs text-gray-500">REGRESSION</div>
                <div className="text-xl font-bold text-purple-400">{result.comparison.regressedBugs?.length || 0}</div>
              </div>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded">
                <div className="text-xs text-gray-500">DÜZELMİŞ</div>
                <div className="text-xl font-bold text-green-400">{result.comparison.fixedBugs?.length || 0}</div>
              </div>
            </div>
          </div>
        )}

        {(result?.summary?.summaryComment || result?.error?.comment) && (
          <div className="bg-[#111] p-8 border border-gray-700 rounded-xl shadow-2xl">
            <p className="text-2xl italic font-serif text-gray-300">
              &quot;{result?.summary?.summaryComment || result?.error?.comment}&quot;
            </p>
          </div>
        )}

        <div className="bg-[#111] p-6 border border-gray-800 rounded-lg shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-gray-800 pb-2">
            <h2 className="text-xl font-bold text-gray-100">Test Detayı</h2>
            <div className={`px-3 py-1 rounded text-xs font-bold uppercase ${run.status === 'running' ? 'bg-blue-900/50 text-blue-400' : run.status === 'passed' ? 'bg-green-900/50 text-green-400' : run.status === 'issues_found' ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-gray-300'}`}>
              {run.status}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">URL:</div>
              <div className="text-gray-200 truncate">{run.request.url}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Hedef:</div>
              <div className="text-gray-200 truncate">{run.request.goal || "Yok"}</div>
            </div>
          </div>

          {result?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-800">
              <div className="bg-black p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-500">Confirmed Bugs</div>
                <div className="text-2xl font-bold text-red-400">{result.summary.confirmedBugs}</div>
              </div>
              <div className="bg-black p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-500">Pages Visited</div>
                <div className="text-2xl font-bold">{result.summary.pagesVisited}</div>
              </div>
              <div className="bg-black p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-500">Browser Actions</div>
                <div className="text-2xl font-bold">{result.summary.browserActions}</div>
              </div>
              <div className="bg-black p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-500">Test Cases</div>
                <div className="text-2xl font-bold">{result.summary.testCasesAttempted}</div>
              </div>
            </div>
          )}
        </div>

        {result?.artifacts && (
          <div className="bg-[#111] p-6 border border-gray-800 rounded-lg shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-gray-100 mb-2 border-b border-gray-800 pb-2">KANITLAR</h2>
            <div className="flex gap-4">
              <div className="px-3 py-1 bg-gray-900 rounded text-sm text-gray-300">
                {result.artifacts.filter((a: any) => a.type === "SCREENSHOT").length} Screenshot
              </div>
              <div className="px-3 py-1 bg-gray-900 rounded text-sm text-gray-300">
                {result.artifacts.filter((a: any) => a.type === "TRACE").length} Browser Trace
              </div>
            </div>
            
            {result.artifacts.filter((a: any) => a.type === "TRACE").map((art: any) => (
              <div key={art.id} className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-gray-200">Playwright Trace Captured</div>
                  <div className="text-xs text-gray-500">{(art.byteLength / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <a href={`/api/artifacts/${art.id}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-sm">
                  [ TRACE&apos;İ AL ]
                </a>
              </div>
            ))}
            
            {result.artifacts.filter((a: any) => a.type === "RUN_REPORT").map((art: any) => (
              <div key={art.id} className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-gray-200">Test Raporu (JSON)</div>
                  <div className="text-xs text-gray-500">Makine okunabilir QA Raporu</div>
                </div>
                <a href={`/api/artifacts/${art.id}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-sm">
                  [ RAPOR JSON ]
                </a>
              </div>
            ))}
          </div>
        )}

        {result?.findings && result.findings.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-gray-800 pb-2">Bulgular</h2>
            {result.findings.map((bug: any) => {
              const isRegressed = result.comparison?.regressedBugs?.includes(bug.id);
              const isRecurring = result.comparison?.recurringBugs?.includes(bug.id);
              const isNew = result.comparison?.newBugs?.includes(bug.id);

              return (
              <div key={bug.id} className={`bg-[#111] p-6 border ${isRegressed ? 'border-purple-900/50' : 'border-red-900/30'} rounded-lg space-y-4`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-red-500 text-xs font-bold uppercase tracking-widest">{bug.severity}</div>
                      {isRegressed && <div className="bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded text-[10px] font-bold">GERİ DÖNMÜŞ AQ</div>}
                      {isRecurring && <div className="bg-orange-900/50 text-orange-400 px-2 py-0.5 rounded text-[10px] font-bold">HALA BURADA</div>}
                      {isNew && <div className="bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">YENİ SIÇMIŞ</div>}
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">{bug.title}</h3>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div>Confidence: {Math.round(bug.confidence * 100)}%</div>
                    <div>Reproduced: {bug.reproductionCount}</div>
                  </div>
                </div>

                {bug.comment && (
                  <div className="my-4 p-4 bg-red-950/20 border-l-4 border-red-500 italic text-lg text-gray-200">
                    &quot;{bug.comment}&quot;
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-800">
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-2">Description</div>
                    <div className="text-sm text-gray-300">{bug.description}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-2">Expected vs Actual</div>
                    <div className="text-sm text-green-400 mb-2">+ {bug.expected}</div>
                    <div className="text-sm text-red-400">- {bug.actual}</div>
                  </div>
                </div>

                {bug.steps && bug.steps.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="text-xs text-gray-500 uppercase mb-2">Steps</div>
                    <ul className="list-decimal list-inside text-sm text-gray-300 space-y-1">
                      {bug.steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {bug.evidence?.console && bug.evidence.console.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="text-xs text-gray-500 uppercase mb-2">Console</div>
                    <div className="space-y-2">
                      {bug.evidence.console.slice(0, 3).map((c: any, i: number) => (
                        <div key={i} className="text-xs font-mono bg-black p-2 rounded text-red-400">
                          [{c.type}] {c.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {bug.evidence?.network && bug.evidence.network.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="text-xs text-gray-500 uppercase mb-2">Network</div>
                    <div className="space-y-2">
                      {bug.evidence.network.slice(0, 3).map((n: any, i: number) => (
                        <div key={i} className="text-xs font-mono bg-black p-2 rounded text-red-400">
                          {n.method} {n.url} {n.status ? `(HTTP ${n.status})` : `(Failed: ${n.failureText})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {bug.evidence?.screenshots?.[0] && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                     <div className="text-xs text-gray-500 uppercase mb-2">Evidence</div>
                     <a href={`/api/artifacts/${bug.evidence.screenshots[0].id}`} target="_blank" rel="noreferrer">
                       <img src={`/api/artifacts/${bug.evidence.screenshots[0].id}`} alt="Bug evidence" className="max-w-full border border-gray-700 rounded cursor-pointer hover:opacity-90" />
                     </a>
                  </div>
                )}
              </div>
            )})}
          </div>
        )}

        <div className="bg-[#111] p-6 border border-gray-800 rounded-lg">
          <h2 className="text-xl font-bold border-b border-gray-800 pb-2 mb-4">Run Events</h2>
          <div className="space-y-2 font-mono text-sm">
            {events.map((ev: any, i: number) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-gray-600">{new Date(ev.createdAt).toLocaleTimeString()}</span>
                <span className="text-gray-300">{ev.message}</span>
              </div>
            ))}
            {events.length === 0 && <div className="text-gray-500">Henüz event yok...</div>}
          </div>
        </div>

      </div>
    </main>
  );
}
