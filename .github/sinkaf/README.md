## GitHub PR Entegrasyonu

Sinkaf QA, GitHub Actions üzerinden Vercel (veya herhangi bir) preview deployment'ını test edip PR'a yorum atabilir.

### Gereksinimler

1. SINKAF_QA_URL: Sinkaf QA Next.js sunucunuzun public URL'i.
2. SINKAF_QA_TOKEN: \`SINKAF_TRIGGER_TOKEN\` env değeriniz ile eşleşen bir token.

Bu 2 değeri hedef projenizin GitHub Secrets alanına ekleyin. 

Sinkaf QA'in kendisine bir GitHub token'ı vermenize gerek yoktur, aksiyonun kendi içinde sağladığı \`GITHUB_TOKEN\` kullanılır.

### Nasıl Çalışır?

GitHub Deployment başarılı olduğunda (örn. Vercel preview deployment tamamlandığında), Sinkaf QA tetiklenir ve preview url'ye giderek:
- Exploratory QA yapar
- Hataları tespit eder
- Önceki çalışmalara bakarak (Memory) regresyon analizi yapar
- Varsa PR'ınıza yorum olarak "SIÇTI MI?" formatında kanıtlı QA raporu ekler.
- Commit durumunu başarı / hata olarak işaretler.

Fork PR'larından gelen durumlarda secret'ların dışa kapalı kalması için \`deployment_status\` event'ini kullanmanızı öneririz (\`pull_request\` tetiklemesi yapmayın).
