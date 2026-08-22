import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/",
    "node_modules/",
    "coverage/",
    "build/",
    "dist/",
    "apps/worker/dist/",
    ".github/actions/*/src/main.js",
    "out/**",
    "next-env.d.ts",
    "drizzle/**"
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
]);

export default eslintConfig;
