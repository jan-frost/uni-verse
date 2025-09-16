module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        // Add custom rules here if needed
    },
    globals: {
        ROT: 'readonly' // Declare ROT as a read-only global variable
    }
};