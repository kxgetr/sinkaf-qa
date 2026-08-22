# Contributing Guidelines

Sinkaf QA'e katkıda bulunmak isteyen herkes davetlidir. Ancak aşağıdaki kurallara uyulması zorunludur:

## 1. Teknik Gerçeklik (Technical Truth)
Sinkaf'ın ağzı bozuk olabilir, ama teknik olarak **kesinlikle dürüsttür**. Olmayan bir bug'ı varmış gibi raporlamaz (Hallucination'a karşı sıkı önlem alınmıştır).
Ego Engine veya Personality dosyalarına eklediğiniz komiklikler, teknik `BugFinding` yapılarını bozmamalı veya kanıtı olmayan bir şeyi iddia etmemelidir.

## 2. Şifreler ve Sırlar
Test için dahi olsa repoya `.env` dosyası, API anahtarı, `storageState` JSON verisi commit etmeyin.
Bütün environment ayarlarını `.env.example` içinde boş bırakın.

## 3. Kod ve Mimari
Projeye yeni bir "Major Feature" (SaaS özellikleri, Billing, Ödeme Duvarı) EKLEMEYİN. Sinkaf QA açık kaynaklı, self-hosted bir araç olarak kalacaktır.

## 4. İletişim ve Saygı
Botumuz projenizi ve kodunuzu acımasızca eleştirebilir. Ancak repoya katkı sağlayan **gerçek insanlara** saygılı davranmak esastır. Sinkaf'ın küfürlü konseptini, gerçek insanları taciz veya rahatsız etmek için bahane olarak KULLANAMAZSINIZ.
