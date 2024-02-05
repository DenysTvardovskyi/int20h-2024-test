module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: [ "dist", ".eslintrc.cjs" ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  plugins: [ "react-refresh", "react", "@typescript-eslint" ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "spaced-comment": "error",
    "no-duplicate-imports": "error",
    "no-alert": "error",
    "no-console": "error"
  },
};
