import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const monorepoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..',
);

export default defineConfig({
    resolve: {
        conditions: ['source'],
    },
    server: {
        fs: {
            allow: [monorepoRoot],
        },
        watch: {
            ignored: ['**/node_modules/**', '!**/packages/types/**'],
        },
    },
    optimizeDeps: {
        exclude: ['@equalsite/types'],
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Inter', {
                    weights: [400, 500],
                }),
                bunny('Lexend', {
                    weights: [400, 500],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
});
