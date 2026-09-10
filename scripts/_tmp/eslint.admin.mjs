import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat({ baseDirectory: process.cwd() });
export default [
  { ignores: [".next/**", ".next-admin/**", "out/**", "build/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
