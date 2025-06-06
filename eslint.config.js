import js from "@eslint/js"
import ts from "@typescript-eslint/eslint-plugin"
import next from "@next/eslint-plugin-next"
import testingLibrary from "eslint-plugin-testing-library"
import jestDom from "eslint-plugin-jest-dom"
import tsParser from "@typescript-eslint/parser"

export default [
  { // needs to be its own array index or is not applyed
    ignores: ["node_modules/", ".next", "ui/", "api/", "dist"],
  },
  {
    plugins: {
      // TODO enable airbnb/hooks after resolve conflict with next
      // TODO enable airbnb it has better reasoning but Next v15 has ugly
      js, // ESLint core recommended rules
      "@typescript-eslint": ts, // TypeScript recommended rules
      "testing-library": testingLibrary,
      "jest-dom": jestDom,
      next,
    },
    languageOptions: {
      parser: tsParser, // Needed to .ts(x) files
      ecmaVersion: 2022, // Matches `target: "ES2022"`
      sourceType: "module", // Matches `module: "ESNext"`
      globals: {
        window: "readonly",
        document: "readonly",
      },
    },
    rules: {
      "max-len": [2, 150, 4], // increase page width
      "semi": ["error", "never"], // remove semicolons
    },
  },
]
