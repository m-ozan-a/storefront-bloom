import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
    {
        ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
    },
    {
        extends: [...nextCoreWebVitals, ...nextTypescript],

        rules: {
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",

            // Next 16 React Compiler kuralları: gerçek bug değil, performans/stil uyarısı.
            // shadcn boilerplate + mevcut sayfalarda yaygın → warn'a düşürüldü, kademeli düzeltilecek.
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/immutability": "warn",
            "react-hooks/purity": "warn",
        },
    },
]);
