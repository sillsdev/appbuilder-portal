module.exports = {
  root: true,
  parser: "typescript-eslint-parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      modules: true,
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  env: {
    browser: true,
  },
  plugins: [
    'prettier',
    'typescript',
    'import',
    'react',
  ],
  extends: [
    // 'typescript', // does not work...
    'eslint:recommended',
    "plugin:react/recommended",
    'prettier',
    "prettier/typescript",
    "prettier/react"
  ],

  // 0 = off, 1 = warn, 2 = error
  rules: {
    // web api usage
    "no-console": 'warn',

    // typescript
    "typescript/explicit-function-return-type": 'off',
    "typescript/interface-name-prefix": "off", // someday...
    "typescript/class-name-casing": "error",
    "typescript/no-explicit-any": "off", // someday...
    "typescript/no-unused-vars": "error",
    "typescript/member-ordering": "off", // someday...
    "typescript/generic-type-naming": "error",
    "typescript/member-delimiter-style": "error",
    "typescript/type-annotation-spacing": ["error", {
      before: true, after: true,
      overrides: {
        colon: { before: false, after: true },
        arrow: { before: true, after: true }
      }
    }],

    // react
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'off',

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
  },
  overrides: [
    // node files
    {
      files: [
        'config/**/*.js',
      ],
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
