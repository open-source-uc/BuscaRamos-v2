import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettierPlugin from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: [".git", ".next", ".vercel", ".wrangler", "node_modules", "dist", "build"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      prettier: prettierPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      // ✅ Integración con Prettier
      "prettier/prettier": "error",

      // ✅ Máximo de líneas en archivos TSX
      "max-lines": ["error", { max: 250, skipBlankLines: true, skipComments: true }],

      // ✅ Detectar y eliminar imports no usados
      "no-unused-vars": "off", // Desactivar la regla base
      "@typescript-eslint/no-unused-vars": "off", // Desactivar la regla de TypeScript
      "unused-imports/no-unused-imports": "error", // Detectar imports no usados
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
    files: ["**/*.tsx", "**/*.ts", "**/*.jsx", "**/*.js"], // Aplica a todos los archivos
  },
];
