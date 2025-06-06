import js from "@eslint/js"
import next from "@next/eslint-plugin-next"
import ts from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import jestDom from "eslint-plugin-jest-dom"
import jsdoc from 'eslint-plugin-jsdoc'
import testingLibrary from "eslint-plugin-testing-library"

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
      jsdoc,
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
      "jsdoc/require-description": "warn", // Ensure descriptions are present
      "jsdoc/require-param-type": "error", // Enforce TypeScript types in @param
      "jsdoc/require-returns-type": "error", // Enforce TypeScript types in @returns
      "jsdoc/check-tag-names": "error", // Validate JSDoc tag names
      "jsdoc/check-types": "error", // Ensure TypeScript types are correctly used
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          "jest-environment": "jest-environment", // Some unit test need to change the env
        },
      },
    },
  },
]
