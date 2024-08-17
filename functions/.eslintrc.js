module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", { "allowTemplateLiterals": true }],
    "require-jsdoc": "off",
    "max-len": "off",
    "object-curly-spacing": ["error", "always"],
  },
  overrides: [
    {
      files: [
        "**/*.spec.*",
      ],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
