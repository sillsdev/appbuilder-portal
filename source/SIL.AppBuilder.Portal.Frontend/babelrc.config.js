module.exports = {
  "presets": [
    "@babel/preset-react",
    "@babel/preset-typescript",
    ["@babel/preset-env", {
      "shippedProposals": true,
      "useBuiltIns": "entry",
      "modules": false,
      "targets": {
        "browsers": "last 2 versions"
      }
    }]
  ],
  "plugins": [
    "@babel/plugin-proposal-class-properties",
    ["@babel/plugin-proposal-object-rest-spread", {
      "useBuiltIns": true
    }],
    ["@babel/plugin-proposal-decorators", {
      /* TODO: update this whenever TC39 makes a decision */
      // "decoratorsBeforeExport": true
      "legacy": true
    }],
    ["@babel/plugin-transform-runtime", {
      "corejs": 2
    }]
  ]
}
