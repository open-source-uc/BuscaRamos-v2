import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettierPlugin from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: [
      ".git",
      ".next",
      ".vercel",
      ".wrangler",
      "node_modules",
      "dist",
      "build"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // ✅ Integración con Prettier
      "prettier/prettier": "error",

      // ✅ Máximo de líneas en archivos TSX
      "max-lines": ["error", { max: 250, skipBlankLines: true, skipComments: true }]
    },
    files: ["**/*.tsx"], // Solo aplica a TSX
  }
];
