import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ─────────────────────────────────────────────────────────────
  // Erişilebilirlik kuralları (jsx-a11y) - Next.js config'den override
  // ─────────────────────────────────────────────────────────────
  {
    name: "accessibility-rules",
    rules: {
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/img-redundant-alt": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/no-redundant-roles": "warn",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/tabindex-no-positive": "warn",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // Import sıralaması ve düzeni kuralları
  // ─────────────────────────────────────────────────────────────
  {
    name: "import-rules",
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "type",
          ],
          pathGroups: [
            { pattern: "react", group: "builtin", position: "before" },
            { pattern: "next/**", group: "builtin", position: "before" },
            { pattern: "@/**", group: "internal", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/first": "error",
      "import/newline-after-import": "warn",
      "import/no-duplicates": "error",
      "import/no-useless-path-segments": "warn",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // Temel özel kurallar
  // ─────────────────────────────────────────────────────────────
  {
    name: "custom-rules",
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      // Console & Debugger
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "no-debugger": "error",

      // Import sıralaması (sort-imports ile birlikte)
      "sort-imports": [
        "warn",
        { ignoreDeclarationSort: true, allowSeparatedGroups: true },
      ],

      // TypeScript kuralları
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", disallowTypeAnnotations: false },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // React kuralları
      "react-hooks/exhaustive-deps": "error",
      "react/jsx-no-useless-fragment": "warn",
      "react/self-closing-comp": "warn",
      "react/jsx-curly-brace-presence": [
        "warn",
        { props: "never", children: "never" },
      ],
      "react/jsx-boolean-value": ["warn", "never"],

      // Kod kalitesi kuralları
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-nested-ternary": "off", // className için ternary patternleri yaygın
      "no-else-return": "warn",
      "no-lonely-if": "warn",
      "no-unneeded-ternary": "warn",
      "object-shorthand": ["warn", "always"],
      "prefer-template": "warn",
      "prefer-arrow-callback": "warn",
    },
  },
  {
    name: "enforce-shared-hooks-location",
    files: ["src/**/*.{ts,tsx}"],
    // Allow hooks in both hooks and context folders
    ignores: ["src/shared/hooks/**/*", "src/shared/context/**/*"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration[id.name=/^use[A-Z]/]",
          message: "Custom hooks sadece src/shared/hooks veya src/shared/context altında tanımlanmalı.",
        },
        {
          selector:
            "VariableDeclarator[id.name=/^use[A-Z]/][init.type='ArrowFunctionExpression']",
          message: "Custom hooks sadece src/shared/hooks veya src/shared/context altında tanımlanmalı.",
        },
        {
          selector:
            "VariableDeclarator[id.name=/^use[A-Z]/][init.type='FunctionExpression']",
          message: "Custom hooks sadece src/shared/hooks veya src/shared/context altında tanımlanmalı.",
        },
        {
          selector:
            "CallExpression[callee.object.name='window'][callee.property.name='addEventListener'][arguments.0.value=/^(resize|orientationchange)$/]",
          message:
            "Pencere boyutu dinlemeleri için ortak hook'u kullan (useWindowSize/useMediaQuery).",
        },
        {
          selector:
            "MemberExpression[object.name='window'][property.name=/^(innerWidth|innerHeight)$/]",
          message:
            "Pencere boyutu okumaları için ortak hook'u kullan (useWindowSize).",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Auto-generated folders:
    "coverage/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
