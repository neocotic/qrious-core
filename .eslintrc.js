
module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint",
    "eslint-plugin-tsdoc"
  ],
  "extends": [
    "notninja/es6",
    'plugin:@typescript-eslint/recommended',
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "env": {
    "node": true,
    "browser": true,
    "es2021": true
  },
  "parserOptions": {
    "ecmaVersion": 13,
    "tsconfigRootDir": __dirname,
    "project": ['./tsconfig.json'],
  },
  "rules": {
    "valid-jsdoc": "off",
    "tsdoc/syntax": "warn",
    "no-console": "error",
    "no-var": "error",
    "prefer-const": "error",
    "max-params": [
      "error",
      5
    ],
    "no-bitwise": "off",
    "no-empty-function": "off",
    "no-invalid-this": "off",
    "no-unused-vars": [
      "warn",
      {
        "args": "none"
      }
    ],
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-for-of": "error"
  }
}