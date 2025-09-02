/* eslint-disable @typescript-eslint/no-require-imports */

// https://github.com/sveltejs/kit/issues/10040#issuecomment-2599028458

// This file MUST be a .cts file
// This forces it to be treated as CommonJS, which is necessary to
// monkey-patch the fs module in a way that sorcery will use.
// Once ESM is loaded, monkey-patching is no longer possible.
// For the same reason this file must be run with
// node --experimental-strip-types directly, not via ts-node/tsx/etc.

// All imports must be require() calls until after the monkey-patch is done
const { opendir, readFile, writeFile } = require('node:fs/promises');
const fs = require('node:fs/promises');
const { join } = require('path');

async function* walk(dir) {
  for await (const file of await opendir(dir)) {
    const path = join(dir, file.name);
    if (file.isDirectory()) {
      yield* walk(path);
    } else {
      yield path;
    }
  }
}

(async () => {
  console.log('Fix source paths being wrong by one directory level');
  for await (const file of walk('.svelte-kit/adapter-node')) {
    if (!file.endsWith('.js.map')) {
      continue;
    }

    const content = await readFile(file, 'utf-8');
    const json = JSON.parse(content);
    json.sources = json.sources.map((source) => {
      if (source.startsWith('../../../')) {
        return source.slice('../'.length);
      }
      return source;
    });
    await writeFile(file, JSON.stringify(json));
  }

  // Amazingly horrific hack to avoid sorcery complaining about missing files
  const originalReadFile = fs.readFile;
  fs.readFile = (async (...args: Parameters<typeof fs.readFile>) => {
    try {
      return await originalReadFile(...args);
    } catch {
      console.warn('ignoring issue reading file', args[0]);
      return '';
    }
  }) as typeof fs.readFile;

  console.log('Running sorcery over everything to get ✨ working sourcemaps ✨');
  const { load } = await import('sorcery');
  for await (const file of walk('out/build/server')) {
    if (!file.endsWith('.js')) {
      continue;
    }

    try {
      const chain = await load(file, {});
      if (chain) {
        await chain.write();
      }
    } catch (err) {
      console.warn('failed to write chain', file, err);
    }
  }
})();
