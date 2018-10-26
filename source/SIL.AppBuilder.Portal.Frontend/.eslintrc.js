const path = require('path');

module.exports = (dirname) => ({
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": [
    "typescript",
    "typescript/react",
  ],
  "parser": "typescript-eslint-parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true,
    },
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "plugins": [
  ],
  "settings": {
  },

  // 0 = off, 1 = warn, 2 = error
  "rules": {
    // style
    "padded-blocks": ["error", "never"],
    "indent": [
      "error",
       2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],

    // web api usage
    "no-console": 1,

    // typescript
    "typescript/explicit-function-return-type": 0,

    // imports
    "import/prefer-default-export": 0,

    // docs
    "require-jsdoc": 0,
  },
});
