# Sinkaf QA Defensive Security (Honeypot)

Sinkaf QA, kendisine yönelik saldırıları tespit edip, saldırganları yavaşlatmak, engellemek ve eğlenmek üzere bir bal küpü (honeypot) mimarisine sahiptir.

## İlkeler
1. **Biz Geri Saldırmayız (No Hack-back):** Sinkaf, saldırganın sistemine asla RCE yollamaz, port taraması yapmaz. Sadece kendi sunucusu üzerinde yalan verilerle onu oyalar (Deception).
2. **Kişiselleştirilmiş İzolasyon:** Her IP adresi için bir risk profili (`RiskEngine`) oluşturulur. Risk threshold aşılırsa (`>= 70` temporary ban, `>= 95` permanent ban) Sinkaf o IP'yi bloklar.
3. **Kanıta Dayalı Sinkaf Küfürleri:** Scannerlara veya manuel saldırganlara Sinkaf botumuz doğrudan söver. "Siteyi mi hackliyorsun amk" demez. "İsteği tutup method değiştirip aynı parametreleri manipüle ettin, sen mi akıllısın amk" der (Davranış sınıflandırmasına - Attack Classification - dayanır).

## Özellikler
- **Honeypot Route Familes:** `.env`, `.git/config`, `wp-admin`, `actuator`, vb. kritik dizinler Next.js `rewrites` ile `api/internal/security/honeypot`'a yönlendirilir.
- **Tarpit Engine (Bataklık):** Şüpheli (risk > 50) ziyaretçilere HTTP response'u bilerek 500ms - 4000ms arasında gecikmeli döndürülür. Scannarların vaktini çalar.
- **Canary Tokens:** Sinkaf, sahte `.env` cevaplarında `SINKAF_CANARY_SECRET` gibi uydurma değişkenler verir. Gerçek bir sistemle kesinlikle alakası yoktur.
- **CVE Intelligence:** CISA KEV ve NVD gibi kaynaklar gelecekte aktif edilebilir.

## Operatör Paneli
- `/admin/security?token=XYZ` adresi üzerinden canlı saldırıları ve atılan IP Ban'ları görebilirsiniz.
- Dashboard'da ham (raw) şifre / payload dump edilmez. Olası bir XSS veya log injection riski sıfıra indirilmiştir.

## Privacy (Gizlilik)
Cihazların MAC adresleri, ham Ethernet verileri kesinlikle TO PLAN MAZ.
Sistem, anti-abuse için HMAC-SHA256 kullanarak Client IP'sini tuzlar (`SECURITY_IDENTITY_PEPPER`) ve tek yönlü hashler ile takip eder.
