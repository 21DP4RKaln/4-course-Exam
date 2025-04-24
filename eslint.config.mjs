import { defineConfig } from "eslint-define-config";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default defineConfig({
  extends: [
    "eslint:recommended",
    "plugin:@next/next/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  plugins: {
    "@next/next": nextPlugin,
    "@typescript-eslint": tseslint.plugins,
  },
  rules: {
  },
  settings: {
    react: {
      version: "detect",
    },
  },
});