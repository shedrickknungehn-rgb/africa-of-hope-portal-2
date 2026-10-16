import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "node_modules", "src/components/ui"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // Context providers, the portal view registry and CMS primitives export
    // hooks/helpers alongside components by design; fast refresh falls back
    // to a full reload for these files, which is acceptable.
    files: [
      "src/context/**/*.tsx",
      "src/auth/AuthProvider.tsx",
      "src/portalViews.tsx",
      "src/components/CmsPrimitives.tsx",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
]);
