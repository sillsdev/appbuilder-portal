module.exports = {
  root: true,
  parser: "typescript-eslint-parser",
  parserOptions: {
    // parser: "typescript-eslint-parser",
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
  ],

  // 0 = off, 1 = warn, 2 = error
  rules: {
    // style
    "padded-blocks": ["error", "never"],
    'padding-line-between-statements': [
      'error',
      // TODO: be on the lookout for something that handles a line after statements
      { blankLine: "always", prev: "*", next: ["block-like", "multiline-block-like", "try"] },
      { blankLine: "always", prev: "*", next: ["return"] },
    ],
    "linebreak-style": ["error", "unix"],
    "space-in-parens": ["error", "never"],
    "object-curly-spacing": ["error", "always"],

    // web api usage
    "no-console": 'warn',

    // typescript
    "typescript/explicit-function-return-type": 'off',

    // react
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'off',

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
    "semi": 'off',
    "quotes": 'off',
    "indent": 'off',
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
