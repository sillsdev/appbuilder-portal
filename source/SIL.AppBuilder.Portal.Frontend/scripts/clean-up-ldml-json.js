const fs = require('fs');

const [_executor, _file, inputName, outputName] = process.argv;

let raw = fs.readFileSync(inputName);
let data = JSON.parse(raw);

function toAbbrTextMap(arr) {
  return arr.reduce((obj, item) => {
    let text = item['#text'];
    let abbr = item['@_type'];

    obj[abbr] = text;
    return obj;
  }, {});
}

let ldn = data.ldml.localeDisplayNames;
let output = {
  ...data.ldml,
  localeDisplayNames: {
    ...data.ldml.localeDisplayNames,
    languages: {
      ...toAbbrTextMap(ldn.languages.language),
    },
    scripts: {
      ...toAbbrTextMap(ldn.scripts.script),
    },
    territories: {
      ...toAbbrTextMap(ldn.territories.territory),
    },
    variants: {
      ...toAbbrTextMap(ldn.variants.variant),
    },
    keys: {
      ...toAbbrTextMap(ldn.keys.key),
    },
    types: {
      ...toAbbrTextMap(ldn.types.type),
    },
    transformNames: {
      ...toAbbrTextMap(ldn.transformNames.transformName),
    },
    measurementSystemNames: {
      ...toAbbrTextMap(ldn.measurementSystemNames.measurementSystemName),
    },
    codePatterns: {
      ...toAbbrTextMap(ldn.codePatterns.codePattern),
    },
  },
};

let outputString = JSON.stringify(output);

fs.writeFileSync(outputName, outputString);

console.log(`JSON output has been cleaned at ${outputName}`);
