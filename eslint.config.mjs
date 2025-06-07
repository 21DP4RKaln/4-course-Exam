import { defineConfig } from "eslint-define-config";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default defineConfig({
  extends: [
    "eslint:recommended",
    "plugin:@next/next/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  plugins: {
    "@next/next": nextPlugin,
    "@typescript-eslint": tseslint.plugins,
    "prettier": "eslint-plugin-prettier"
  },
  rules: {
    "prettier/prettier": "error"
  },
  settings: {
    react: {
      version: "detect",
    },
  },
});