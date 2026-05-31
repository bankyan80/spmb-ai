import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // TypeScript rules - allow explicit any but warn on unused vars
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/prefer-as-const": "error",
    
    // React rules
    "react-hooks/exhaustive-deps": "warn",
    "react/no-unescaped-entities": "warn",
    "react/display-name": "warn",
    
    // Next.js rules - allow img-element (img tag usage)
    "@next/next/no-img-element": "warn",
    "@next/next/no-html-link-for-pages": "off",
    
    // General JavaScript rules
    "prefer-const": "error",
    "no-unused-vars": "off", // handled by @typescript-eslint/no-unused-vars
    "no-console": "warn",
    "no-debugger": "warn",
    "no-empty": "warn",
    "no-case-declarations": "error",
    "no-fallthrough": "error",
    "no-irregular-whitespace": "error",
    "no-useless-escape": "warn",
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "examples/**", "skills"]
}];

export default eslintConfig;
