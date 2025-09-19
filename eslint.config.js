import eslint from '@eslint/js';

export default [
    // Global configuration for all JavaScript files
    {
        files: ['**/*.js'], // Apply to all .js files
        ignores: ['dist/bundle.js'],
        ...eslint.configs.recommended,
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                // Explicitly define browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                URLSearchParams: 'readonly',
                indexedDB: 'readonly',
                ROT: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': 'error'
        }
    }
];