import config from '@equalsite/eslint-config/react';

export default [
    ...config,
    {
        ignores: [
            'vendor/**',
            'public/**',
            'bootstrap/ssr/**',
            'resources/js/actions/**',
            'resources/js/routes/**',
            'resources/js/wayfinder/**',
            'scripts/**',
            '.claude/**',
        ],
    },
];
