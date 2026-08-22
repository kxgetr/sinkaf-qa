import fs from "fs";
import path from "path";

export default function Component({ params }: { params: { competitor: string } }) {
  const filePath = path.join(process.cwd(), "content", "competitors", `${params.competitor.replace('sinkaf-qa-vs-', '')}.json`);
  let data = null;
  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch(e) {}

  if (!data) {
    return <main className="p-8 text-center text-red-500 font-mono text-xl">404 - Rekabet bulunamadı.</main>
  }

  return (
    <main className="min-h-screen bg-[#050505] text-gray-200 p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Sinkaf QA vs {data.name}: Açık Kaynak QA Karşılaştırması</h1>
        <p className="text-xl text-gray-400">
          Bu doküman, <span className="text-red-500 font-bold">Sinkaf QA</span> ile <span className="text-white font-bold">{data.name}</span> platformunu teknik ve lisans açısından karşılaştırmaktadır.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-widest text-sm">
                <th className="py-4 font-normal">Özellik</th>
                <th className="py-4 font-normal text-white">Sinkaf QA</th>
                <th className="py-4 font-normal text-gray-400">{data.name}</th>
              </tr>
            </thead>
            <tbody>
              {data.verifiedFacts.map((fact: any) => (
                <tr key={fact.feature} className="border-b border-gray-800/50">
                  <td className="py-4 text-gray-300">{fact.feature}</td>
                  <td className="py-4 text-green-500 font-bold">
                    {fact.feature === "Open Source" || fact.feature === "Self Hosted" ? "Evet" : "Hayır (Otonom Agent)"}
                  </td>
                  <td className="py-4 text-yellow-500 font-mono">
                    {fact.value ? "EVET" : "HAYIR"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-900/50 p-6 rounded text-sm text-gray-400">
          <p>Son doğrulama: {new Date(data.verifiedAt).toLocaleDateString("tr-TR")}</p>
          <p>Sinkaf QA is not affiliated with {data.name}. Product information was verified from publicly available sources.</p>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Neden Sinkaf QA?</h2>
          <p className="text-gray-400 mb-6">Kurumsal managed QA platformu yerine kodunu görmek, kendi LLM anahtarlarını bağlamak (BYOK) ve verilerini tamamen kendi altyapında tutmak istiyorsan açık kaynak Sinkaf QA&apos;ya bak.</p>
          <a href="https://github.com/sinkaf-qa/sinkaf" className="inline-block bg-white text-black font-bold px-6 py-3 uppercase tracking-wider hover:bg-gray-200 transition-colors">
            GitHub Repo
          </a>
        </div>
      </div>
    </main>
  );
}

export function generateMetadata({ params }: { params: { competitor: string } }) {
  const c = params.competitor.replace('sinkaf-qa-vs-', '');
  return {
    title: `Sinkaf QA vs ${c.toUpperCase()}: Açık Kaynak QA Karşılaştırması`,
    description: `${c.toUpperCase()} ile açık kaynaklı Sinkaf QA araçlarının farklılıkları. Self-hosted, BYOK ve otonom test mimarisi hakkında doğrulanmış veriler.`,
    alternates: {
      canonical: `https://sinkaf.com.tr/karsilastir/sinkaf-qa-vs-${c}`,
    }
  }
}
