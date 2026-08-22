# SINKAF QA

**URL'yi ver. AI siteni kurcalasın. Sıçtı mı öğren.**

Sinkaf QA, Playwright ve Gemini AI kullanan, otonom, self-hosted ve bol küfürlü bir Exploratory QA test aracıdır.

[Sıçtı Mı? (Public Demo)](https://sinkaf.com.tr)

## Özellikler

* **Gerçek Tarayıcı (Playwright):** Sitenizi gerçekten açar, gezer, tıklar, form doldurur.
* **Otonom Test (Gemini AI):** Sitenin nasıl çalıştığını kendisi anlar ve keşfeder.
* **Kanıt (Evidence) Toplama:** Bulduğu hataların ekran görüntüsünü alır, console/network kayıtlarını çıkarır.
* **Proje Hafızası (Memory):** Önceki testleri hatırlar, tekrar eden (regression) hataları affetmez.
* **GitHub PR Entegrasyonu:** Pull Request'lere Vercel Preview vs. üzerinden otomatik test ve yorum (CI gate).
* **Authenticated Test:** Test hesapları (Auth Profiles) ile şifreli/kapalı sayfaları da güvenle tarar.
* **SINKAF Persona:** Hataları teknik olarak mükemmel yakalar ama raporlarken ağzı çok bozuktur.

## Mimari

Detaylı bilgi için [Architecture](./docs/architecture.md) ve [Security](./docs/security.md) belgelerini inceleyin.

## Kurulum (Quick Start)

### 1. Klonlama ve Yükleme
```bash
git clone https://github.com/sinkaf-qa/sinkaf.git
cd sinkaf
pnpm install
```

### 2. Ortam Değişkenleri
```bash
cp .env.example .env
```
`.env` dosyasını kendi bilgilerinize göre doldurun:
- `DATABASE_URL` (PostgreSQL / Neon)
- `GEMINI_API_KEY` (Gemini kullanımı için)
- `QA_WORKER_URL` & `QA_WORKER_API_KEY`

### 3. Veritabanı
```bash
pnpm drizzle-kit push
```

### 4. Başlatma
```bash
pnpm dev:all
```

## Doctor (Ortam Kontrolü)
Kurulumun eksiksiz olduğunu doğrulamak için:
```bash
pnpm sinkaf:doctor
```

## Public Demo Mode
`sinkaf.com.tr` üzerindeki kısıtlı Public Demo versiyonu sadece ziyaretçilere **TEK SEFERLİK (1 run)** deneme hakkı verir. Bu kısıtlama, bu açık kaynak kodun "Self-hosted" (Kendi kurulumunuz) versiyonunda *YOKTUR*. Sinkaf QA'i self-hosted kurduğunuzda, kendi Gemini kotanız ve kendi Playwright worker'ınız ile *SINIRSIZ* test yapabilirsiniz.

## Güvenlik
- Test hesapları ve şifreler (Auth Profile), Gemini AI'a kesinlikle gönderilmez (Prompt injection ve sızıntı koruması).
- Private IP (SSRF) koruması aktiftir.
- Zararlı ("Delete Account", "Payment") butonlara tıklama otomatik olarak bloke edilir.
Detaylı bilgi için `SECURITY.md`.

## Lisans
MIT

## Bağış
İşine yaradıysa bağış atabilirsin. Hayır kurumu değiliz, server da bedava çalışmıyor aq.
(Bağış linkleri vs. eklenebilir)
