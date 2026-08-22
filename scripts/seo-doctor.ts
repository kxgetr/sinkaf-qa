import fs from "fs";
import path from "path";

console.log("\nSINKAF SEO DOCTOR\n");

let errors = 0;
let warnings = 0;

function check(name: string, condition: boolean, optional = false) {
  if (condition) {
    console.log(`✓ ${name}`);
  } else {
    if (optional) {
      console.log(`- ${name} (Optional)`);
      warnings++;
    } else {
      console.log(`✗ ${name} eksik`);
      errors++;
    }
  }
}

// Check fundamental files
const p = (file: string) => path.join(process.cwd(), file);
check("robots.txt implementation (via next.js)", fs.existsSync(p("app/robots.ts")));
check("sitemap.xml implementation (via next.js)", fs.existsSync(p("app/sitemap.ts")));
check("llms.txt", fs.existsSync(p("public/llms.txt")));
check("SEO config", fs.existsSync(p("config/seo.ts")));

// Check competitor staleness
const compDir = p("content/competitors");
if (fs.existsSync(compDir)) {
  const files = fs.readdirSync(compDir);
  for (const f of files) {
    if (f.endsWith(".json")) {
      const data = JSON.parse(fs.readFileSync(path.join(compDir, f), "utf-8"));
      const verifiedAt = new Date(data.verifiedAt);
      const daysDiff = (new Date().getTime() - verifiedAt.getTime()) / (1000 * 3600 * 24);
      if (daysDiff > 90) {
        console.log(`- Uyarı: ${data.name} karşılaştırma verisi eski (>90 gün). Son doğrulama: ${data.verifiedAt}`);
        warnings++;
      }
    }
  }
}

// Output
console.log("");
if (errors === 0) {
  if (warnings > 0) {
    console.log(`${warnings} warning var. Teknik taraf sağlam ama competitor datası bayatlamış olabilir.`);
  } else {
    console.log("Google'a kurban kesmeye gerek yok. Teknik taraf sağlam.");
  }
  process.exit(0);
} else {
  console.log(`${errors} kritik SEO problemi var amk, bunları çözmeden deploy çıkma.`);
  process.exit(1);
}
