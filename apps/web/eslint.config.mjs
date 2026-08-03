import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.recommended,
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts", "coverage/**"]),
]);
