# Security Policy

Sinkaf QA projesinde güvenlik açığı bulduğunuzu düşünüyorsanız, lütfen bu sorunları açık GitHub Issues üzerinden **PAYLAŞMAYIN**.

Güvenlik bildirimlerini doğrudan `security@sinkaf.com.tr` (veya proje sahibinin sağladığı güvenli e-posta/iletişim) adresine yapın.

## Kapsam
Aşağıdaki konular güvenlik raporlaması kapsamındadır:
- **SSRF (Server-Side Request Forgery) Zafiyetleri:** Sinkaf QA, `127.0.0.1`, `localhost` veya AWS/GCP Metadata IP'lerini hedef almayı reddetmelidir. Bu bypass edilebiliyorsa kritiktir.
- **Secret İfşası (Secret Leakage):** Auth Profile ile yapılandırılan test hesabı şifrelerinin Gemini LLM'e (Prompt), Artifacts'a (Trace/Screenshot) veya Console Log'lara sızması.
- **Public Demo İstismarı:** `sinkaf.com.tr` public demosunda Rate Limiting veya Hashing IP bypass yapılarak sonsuz kullanım elde edilmesi.

## Demo İstisnaları
Public demo üzerinde bir IP'nin farklı fingerprint'ler ile (veya VPN ile) tekrar demo hakkı alabilmesi, sistemin tasarımı gereği %100 engellenemeyen "best-effort" bir abuse engelidir ve kritik güvenlik açığı *sayılmaz*.
