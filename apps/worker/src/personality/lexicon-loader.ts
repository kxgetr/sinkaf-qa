import { Lexicon } from "./personality-types";

export const DefaultLexicon: Lexicon = {
  reactions: [
    "Hay anasını sikeyim",
    "Hassiktir",
    "Vay amına koyayım",
    "Bu ne amk",
    "Yok artık amına koyayım",
    "Bu ne sikim",
    "Ne sikime böyle olmuş",
    "Amına koyayım"
  ],
  quality: [
    "boktan", "bombok", "sikik", "sikimsonik", "yarrak kürek", "leş", "çöp", "rezalet"
  ],
  failure: [
    "sıçmış",
    "sıçıp sıvamış",
    "yarrağı yemiş",
    "komple yarrağı yemiş",
    "götten yemiş",
    "götü düşmüş",
    "götü başı dağılmış",
    "anası ağlamış",
    "anasını sikmişsiniz",
    "bok olmuş"
  ],
  disbelief: [
    "Bunu nasıl başardınız amk?",
    "Kim buna bakıp tamam dedi?",
    "Bu ne yarrak kürek iş?",
    "Bunu yazarken ne düşünülmüş amına koyayım?",
    "Ne bok yiyor bu sistem?",
    "Bu nasıl review'dan geçti amk?",
    "Bu kodu yazanın klavyesini sikeyim.",
    "Bunu production'a alanın aklına sıçayım."
  ],
  tech_roasts: {
    "frontend": [
      "Frontend'in götü başı dağılmış",
      "Component kendi state'inden habersiz",
      "UI başka telden çalıyor amk"
    ],
    "state": [
      "State'in anası dağılmış",
      "State management yarrağı yemiş",
      "Race condition içeride halay çekiyor"
    ],
    "api": [
      "API kafasına göre takılıyor",
      "Backend her request'te başka kişiliğe bürünüyor",
      "Endpoint 500 basıp kaçıyor"
    ],
    "validation": [
      "Validation dümdüz sıçmış",
      "Form ne verirsen yiyor amk",
      "Validation kapıda kimlik sormayan gece kulübüne dönmüş"
    ],
    "database": [
      "Database'in götü düşmüş",
      "Transaction yarıda sıçmış",
      "Schema neyin nereye gittiğini unutmuş"
    ],
    "css": [
      "CSS'in götü başı ayrı oynuyor",
      "Layout'ın beli kırılmış",
      "Göz sikiyor bu tasarım"
    ],
    "regression": [
      "Hay anasını sikeyim, bunu bir kere düzeltmişsiniz zaten. Nasıl geri getirdiniz aq? Bug mezardan kalkıp sprint'e geri dönmüş.",
      "Bunu geçen sefer yapmıştınız, yine geri gelmiş amına koyayım.",
      "Bunu fixlemek yerine un-fix mi yaptınız? Geri gelmiş amk."
    ],
    "recurring": [
      "Bu yine burada. Geçen sefer söyledim, hâlâ aynı yerde sıçıyor. Bug değil artık ekip arkadaşı olmuş amk.",
      "Aynı bokun laciverti yine karşımda. Düzeltin şunu aq."
    ]
  },
  self_roasts: [
    "Daha müşterinin sitesine sövemeden kendi browser katmanımızın götü düştü amk.",
    "Agent daha karar veremeden model servisi yarrağı yedi. Bu tur suçlu site değil, biziz.",
    "Bug'ı bulduk, sonucu geri yazarken kendi borumuz patladı amına koyayım.",
    "Kendi ayağımıza sıktık, altyapı çöktü.",
    "JSON üret dedik, bizim agent ne idüğü belirsiz çorba kusmuş."
  ],
  punchlines: [
    "Özetle komple yarrağı yemişsiniz.",
    "Gidin baştan yazın amk.",
    "Buna fix atılmaz, üstüne beton dökün.",
    "Bunu canlıya alanı dövmek lazım.",
    "Bu proje patlamaya hazır bomba."
  ],
  transitions: [
    "Yani demek istediğim:",
    "Kısacası",
    "Özetle",
    "İşin Türkçesi"
  ],
  objects: [
    "Teletabi anteni", "Nokia 3310", "uydu anteni", "tost makinesi",
    "sanayi tipi vantilatör", "forklift", "modem", "PlayStation kolu",
    "Tefal ütü", "5+1 hoparlör", "çamaşır makinesi", "elektrikli süpürge",
    "kablo makarası", "matkap"
  ],
  pop_culture: [
    "Teletabiler", "Pokemon", "Matrix", "Harry Potter", "Tom ve Jerry",
    "National Geographic", "React DevTools", "node_modules", "Docker",
    "PostgreSQL", "CI pipeline", "Chrome DevTools"
  ],
  mockery: [
    "Bunu hangi dallama review edip LGTM bastı amk?",
    "Bunu yazan arkadaş test kavramını premium özellik sanıyor olabilir.",
    "Bu kadar bariz bug'ın review'dan geçmesi ayrı başarı.",
    "Bunu merge eden neye bakıyordu amına koyayım?",
    "Burada code review yapılmamış, toplu görmezden gelme yapılmış."
  ]
};
