import * as fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recurse(obj: any, path = '', ret: any = {}) {
  for (const i in obj) {
    const newI = i
      .split('-')
      .map((v, i) => (i ? v[0].toUpperCase() + v.slice(1) : v))
      .join('');
    if (typeof obj[i] === 'object') recurse(obj[i], path + newI + '_', ret);
    else {
      const regex = /\{(\w+), plural, =0 \{\} other \{\(\{ \1 \}\)\}\}/;
      const match = (obj[i] + '').match(regex);
      if (match) {
        ret[path + newI + '_zero'] = (obj[i] + '').replace(regex, '').trim();
        ret[path + newI + '_other'] = (obj[i] + '').replace(regex, '({{' + match[1] + '}})');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ret[path + newI] = ((obj[i] + '') as any).replaceAll(
          /(?<!\{)\{\s?(\w+)\s?\}(?!\})/g,
          '{{$1}}'
        );
      }
    }
  }
  return ret;
}

function operate(infile: string) {
  // Technically should be path.join
  const data = JSON.parse(fs.readFileSync('src/lib/imported-locales/' + infile, 'utf-8'));
  const out = JSON.stringify(recurse(data), null, 4);
  fs.writeFileSync('src/lib/locales/' + infile, out);
}
if (!fs.existsSync('src/lib/')) {
  console.error(
    'Wrong directory. Run this script from the SIL.AppBuilder.Portal directory like so: '
  );
  console.error('    npm run flatten-locales');
}
operate('en-us.json');
operate('es-419.json');
operate('fr-FR.json');
