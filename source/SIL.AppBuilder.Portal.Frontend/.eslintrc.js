module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
  },
  plugins: [
    'prettier',
    'typescript',
    'import',
    '@typescript-eslint',
    'react-hooks',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    "prettier/typescript",
    "prettier/react"
  ],

  // 0 = off, 1 = warn, 2 = error
  rules: {
    // web api usage
    "no-console": 'warn',

    // typescript
    '@typescript-eslint/interface-name-prefix': 'off', // someday...
    '@typescript-eslint/no-object-literal-type-assertion': 'off', // someday...
    '@typescript-eslint/explicit-member-accessibility': 'off', // private fields are coming to native JS classes
    '@typescript-eslint/explicit-function-return-type': 'off', // TS is pretty good at inference
    '@typescript-eslint/no-use-before-define': 'off', // this doesn't matter for side-effect-free modules
    '@typescript-eslint/no-empty-interface': 'off', // better to have conventions for react prop interfaces
    // '@typescript-eslint/no-unused-vars': 'error', // why isn't this a default?

    // hooks
    "react-hooks/rules-of-hooks": "warn",
    "react-hooks/exhaustive-deps": "warn",

    // cleanliness
    'no-undef': 'off',
    'no-unused-vars': 'off',

    // imports
    "import/prefer-default-export": 'off',
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always",
    }],
    'import/exports-last': 'off', // not auto-fixable

    // docs
    "require-jsdoc": 'off',

    // handled by prettier
    'prettier/prettier': 'error',
    '@typescript-eslint/indent': 'off',
  },
  overrides: [
    // node / config files
    {
      files: [
        'config/**/*.js',
        'tests/test-setup.js',
        'tests/karma.conf.js',
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      },
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      }
    }
  ]
};