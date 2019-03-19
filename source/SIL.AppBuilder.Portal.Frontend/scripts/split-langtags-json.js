const fs = require('fs');

const [_executor, _file, inputName, output1Name, output2Name] = process.argv;

let raw = fs.readFileSync(inputName);
let data = JSON.parse(raw);

let output1 = data.filter(function (el){
  return !el.tag.startsWith("_")
});
let output1String = JSON.stringify(output1,null,2);

let output2 = data.filter(function (el){
  return el.tag.startsWith("_")
});

let output2String = JSON.stringify(output2, null, 2);

fs.writeFileSync(output1Name, output1String);

fs.writeFileSync(output2Name, output2String);

console.log(`JSON output at ${output1Name} and ${output2Name}`);
