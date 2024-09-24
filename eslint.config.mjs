import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  {
    files: ["**/*.{js,ts}"],
  },
  {
    languageOptions: {
      globals: globals.es2021,
    },
  },
  {
    ignores: [
      "package.json",
      "package-lock.json",
      "tsconfig.json",
      "node_modules",
      "dist"
    ],
  },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  ...tseslint.configs.recommended,
];
