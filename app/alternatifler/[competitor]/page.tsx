import fs from "fs";
import path from "path";

export default function Component({ params }: { params: { competitor: string } }) {
  const c = params.competitor.replace('-alternatifi', '');
  const filePath = path.join(process.cwd(), "content", "competitors", `${c}.json`);
  let data = null;
  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch(e) {}

  if (!data) {
    return <main className="p-8 text-center text-red-500 font-mono text-xl">404 - Alternatif bulunamadı.</main>
  }

  return (
    <main className="min-h-screen bg-[#050505] text-gray-200 p-8 md:p-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">{data.name} Alternatifi: Sinkaf QA</h1>
        <p className="text-xl text-gray-400">
          <span className="text-white font-bold">{data.name}</span> gibi {data.category.toLowerCase()} platformlarına self-hosted ve açık kaynak (MIT) bir alternatif arıyorsanız doğru yerdesiniz.
        </p>

        <div className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2 mt-12 mb-4">Ne zaman {data.name} seçmelisiniz?</h2>
          <p className="text-gray-400">
            Eğer enterprise destekli, yönetilen (managed) bir test ekosistemi ve hizmet tabanlı bir çözüm arıyorsanız {data.name} gibi platformlar daha uygundur. Bu firmaların profesyonel QA hizmet ağları mevcuttur.
          </p>
          
          <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2 mt-12 mb-4">Ne zaman Sinkaf QA seçmelisiniz?</h2>
          <ul className="list-disc pl-6 text-gray-400 space-y-2">
            <li>Kendi <strong className="text-white">API anahtarlarınızı (BYOK)</strong> kullanarak maliyetleri kontrol etmek istiyorsanız.</li>
            <li>Test verilerinizin ve şifrelerinizin üçüncü parti SaaS sistemlere <strong className="text-white">gitmemesini</strong> istiyorsanız (Self-hosted).</li>
            <li>Uygulamanızı kod seviyesinde entegre ederek (GitHub PR ortamları) <strong className="text-white">otonom</strong> testler koşturmak istiyorsanız.</li>
            <li>Test otomasyonu için açık kaynak <strong className="text-white">MIT lisansına</strong> sahip bir araca yatırım yapmak istiyorsanız.</li>
          </ul>
        </div>

        <div className="bg-gray-900/50 p-6 rounded mt-12 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-2">Sinkaf QA nasıl çalışır?</h3>
          <p className="text-gray-400 text-sm mb-4">URL&apos;yi verirsiniz. Sinkaf, Playwright ile gerçek bir Chromium açar, modelin DOM&apos;u görüp gezinmesini sağlar, şüpheli bulguları tekrar üreterek (reproduce) test eder ve kanıtlı (screenshot/trace) rapor sunar.</p>
          <a href="https://github.com/sinkaf-qa/sinkaf" className="text-red-500 hover:text-red-400 font-bold uppercase tracking-wider text-sm">→ GITHUB&apos;DA İNCELE</a>
        </div>
      </div>
    </main>
  );
}

export function generateMetadata({ params }: { params: { competitor: string } }) {
  const c = params.competitor.replace('-alternatifi', '');
  return {
    title: `${c.toUpperCase()} Alternatifi: Self-Hosted Sinkaf QA`,
    description: `${c.toUpperCase()} platformuna açık kaynak (open source) ve self-hosted bir yapay zeka web test aracı alternatifi arayanlar için Sinkaf QA mimarisi.`,
    alternates: {
      canonical: `https://sinkaf.com.tr/alternatifler/${c}-alternatifi`,
    }
  }
}
