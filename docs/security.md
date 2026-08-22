# Security Model

Sinkaf QA, harici veya dahili web uygulamalarını tararken yüksek güvenlik standartları uygular.

## 1. SSRF (Server-Side Request Forgery) Koruması
Kullanıcıların test etmesi için gönderdiği URL'ler (eğer config üzerinden explicit izin verilmemişse), özel, lokal ve metadata IP'lerine (`127.0.0.1`, `10.x.x.x`, `169.254.169.254`) çözümleniyorsa bloke edilir. `dns.lookup` ile host çözümlenir ve özel IP kontrolü yapılır.

## 2. LLM Secret Isolation & Prompt Injection Koruması
Test hesaplarının (Authentication) bilgileri Gemini modeline gönderilmez. `AuthRedactor` isimli katman, DOM içerisinde şifre tespit edilirse (veya string olarak modele gitmek üzereyse) bunları anında `[REDACTED_SECRET]` ile değiştirir.

## 3. Destructive Action (Zararlı Eylem) Koruması
Ajanın rastgele tıklamalar yapıp "Delete Account" veya "Purchase" butonlarına basmasını önlemek adına, Playwright aksiyon katmanında Regex tabanlı bir "Block List" mevcuttur.

## 4. Public Demo Identity Hashing
Herkese açık Demo modunda (opsiyonel), spam engellemek için Client IP'leri `crypto.createHmac` ile "Pepper" (tuz) kullanılarak tek yönlü hash'lenir. Ziyaretçilerin cihazlarının ham MAC adresi alınmaz ve kalıcı veri izi bırakılmaz. Kısacası NSA araçları üretmiyoruz.
