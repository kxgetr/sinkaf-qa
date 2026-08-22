# Architecture

```text
User / GitHub PR
       ↓
Vercel / Next.js (API & UI)
       ↓
POST /api/runs (veya /api/demo/runs)
       ↓
Neon PostgreSQL (State & Memory)
       ↓
Remote Browser Worker (Fastify + Playwright)
       ↓
Gemini QA Agent (Autonomous)
       ↓
Browser Tools (Playwright Adapter)
       ↓
Target Website (Test Hedefi)
       ↓
Artifact Store (Screenshot, Trace)
       ↓
Sinkaf Reactor (Ego & Personality)
       ↓
Run Page UI / GitHub PR Comment
```

## Ayrık Mimari (Decoupled)
Sinkaf, frontend (Next.js) ve worker (Playwright/Node) olmak üzere iki ayrı parçadan oluşur.
Frontend Vercel gibi platformlarda serverless çalışırken, worker uzun süren tarayıcı testlerini yapabilmek için Docker, Railway veya Render gibi sunucularda çalışır.

## Proje Hafızası (Project Memory)
Önceki testlerin sonuçları PostgreSQL üzerinde `project_memory` tablosuna Fingerprint olarak kaydedilir. Aynı proje tekrar test edildiğinde, daha önce bulunan hatalar analiz edilir (Regression / Fixed / Recurring).

## Kimlik Doğrulama (Auth)
Ajanın LLM contextine asla şifreler gönderilmez. Şifreler `EnvSecretProvider` tarafından çekilerek izole edilmiş geçici bir Playwright context'ine yazılır, başarılı giriş sonrası salt `storageState` (çerez vb.) LLM testine devredilir.
