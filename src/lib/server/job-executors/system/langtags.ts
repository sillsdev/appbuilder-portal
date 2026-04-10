import type { Job } from 'bullmq';
import { stringify } from 'devalue';
import { XMLParser } from 'fast-xml-parser';
import { existsSync } from 'fs';
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import * as v from 'valibot';
import type { BullMQ } from '../../bullmq';
import { withAlternates } from '$lib/google-play';
import { addBasicVariants, langtagSchema } from '$lib/ldml';
import { locales as defaultLocales } from '$lib/paraglide/runtime';

const sectionDelim = '********************';

export async function refreshLangTags(job: Job<BullMQ.System.RefreshLangTags>): Promise<unknown> {
  const localDir = join(process.cwd(), 'languages');
  const googlePlayDir = join(localDir, 'google-play');
  if (!existsSync(localDir)) {
    await mkdir(localDir, { recursive: true });
  }
  if (!existsSync(googlePlayDir)) {
    await mkdir(googlePlayDir, { recursive: true });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ret: any = {};

  const log = (msg: string) => job.log(msg);

  try {
    job.log(sectionDelim);

    const langtagsPath = join(localDir, 'langtags.dev');

    const shouldUpdateLangtags = await shouldUpdate(
      langtagsPath,
      'https://ldml.api.sil.org/langtags.json',
      log
    );

    ret['langtags'] = shouldUpdateLangtags;

    job.log(sectionDelim);

    job.updateProgress(25);

    if (shouldUpdateLangtags.shouldUpdate) {
      job.log(`${sectionDelim}\nDownloading all supported languages...`);

      const res = await fetchWithLog('https://ldml.api.sil.org/langtags.json', log);

      if (res.ok) {
        const langtags = ((await res.json()) as unknown[])
          .map((tag) => {
            const parsed = v.safeParse(langtagSchema, tag);

            return parsed.success ? parsed.output : null;
          })
          .filter((lang) => lang && !lang.tag.startsWith('_'));

        await writeFile(langtagsPath, stringify(langtags));

        job.log(`langtags written to ${langtagsPath}`);

        ret['langtags']['length'] = langtags.length;

        job.log(`Downloaded all supported languages\n${sectionDelim}`);
      } else {
        job.log(`Fetch failed for langtags.json with status ${res.status}`);
      }
    }
    job.updateProgress(55);

    ret['default'] = {};
    for (const locale of defaultLocales) {
      ret['default'][locale] = await getLDML(localDir, locale, log, true);
    }

    job.updateProgress(65);

    // also fetch LDML tags for no script/nation variants as a fallback
    const includeBasic = addBasicVariants(withAlternates());

    ret['google-play'] = {};
    for (const locale of includeBasic) {
      ret['google-play'][locale] = await getLDML(googlePlayDir, locale, log, false, includeBasic);
    }

    job.updateProgress(100);
  } catch (err) {
    job.log(JSON.stringify(err));
  }

  return ret;
}

type Logger = (msg: string) => void;

async function fetchWithLog(url: string, logger: Logger, fetchInit?: RequestInit) {
  const res = await fetch(url, fetchInit);
  logger(`${fetchInit?.method ?? 'GET'} ${url}\n\\=> ${res.status} ${res.statusText}`);
  return res;
}

async function shouldUpdate(
  localPath: string,
  remotePath: string,
  logger: Logger
): Promise<
  | { shouldUpdate: false; status: string }
  | { shouldUpdate: true }
  | { shouldUpdate: boolean; localLastModified: Date; remoteLastModified: Date }
> {
  if (existsSync(localPath)) {
    logger(`Found ${localPath}`);
    try {
      const localLastModified = new Date((await stat(localPath)).mtimeMs);
      const res = await fetchWithLog(remotePath, logger, {
        method: 'HEAD',
        headers: { 'If-Modified-Since': localLastModified.toUTCString() }
      });
      if (res.status === 304) {
        // HTTP 304 Not Modified
        return {
          shouldUpdate: false,
          status: res.status + ' ' + res.statusText
        };
      }
      logger(`Local LastModified: ${localLastModified.valueOf()} (${localLastModified})`);
      // If we can't get the headers, assume we should update?
      const remoteLastModified = new Date(res.headers.get('Last-Modified') ?? Date.now());
      logger(`Remote LastModified: ${remoteLastModified.valueOf()} (${remoteLastModified})`);

      return {
        shouldUpdate: localLastModified.valueOf() < remoteLastModified.valueOf(),
        localLastModified,
        remoteLastModified
      };
    } catch (err) {
      logger(JSON.stringify(err));
    }
  } else {
    logger(`${localPath} does not exist`);
  }
  return {
    shouldUpdate: true
  };
}

function mapXMLAttributes(item: Record<string, unknown>) {
  return [item['@_type'], item['#text']];
}

async function getLDML<Locale extends string>(
  localDir: string,
  lang: string,
  logger: Logger,
  includeTerritories: boolean,
  locales?: Readonly<Locale[]>
) {
  const finalDir = join(localDir, lang);
  if (!existsSync(finalDir)) {
    await mkdir(finalDir, { recursive: true });
  }
  const finalName = join(finalDir, 'ldml.dev');
  const revIdFileName = join(finalDir, 'revid');
  const endpoint = `https://ldml.api.sil.org/${lang}`;

  logger(`${sectionDelim}`);

  let revid = '';
  let update: Awaited<ReturnType<typeof shouldUpdate>> & {
    code?: string;
    foundRevid?: string;
    languages?: number;
    territories?: number;
    revid?: string;
  } = { shouldUpdate: true };
  try {
    if (existsSync(revIdFileName)) {
      revid = (await readFile(revIdFileName)).toString();
      update = await shouldUpdate(finalName, endpoint + '?revid=' + revid, logger);
    } else {
      logger(`${revIdFileName} does not exist`);
    }

    update['code'] = lang;

    update['foundRevid'] = revid;

    if (update.shouldUpdate || !revid) {
      logger(`Downloading ldml data for ${lang}...`);

      const res = await fetchWithLog(endpoint + '?inc[0]=localeDisplayNames', logger);

      if (res.ok) {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_'
        });
        const parsed = parser.parse(await res.text());

        revid = parsed.ldml.identity.special['sil:identity']['@_revid'];

        const output = {
          languages: new Map<Locale, string>(
            parsed.ldml.localeDisplayNames.languages.language
              .map(mapXMLAttributes)
              .map(([code, name]: [string, string]) => [code.replace(/_/g, '-'), name])
              .filter(([code, _]: [Locale, string]) => !locales?.length || locales.includes(code))
          )
        } as Record<string, Map<string, string>>;

        if (includeTerritories) {
          output['territories'] = new Map<string, string>(
            parsed.ldml.localeDisplayNames.territories.territory.map(mapXMLAttributes)
          );
        }

        update['languages'] = output['languages'].size;
        if (includeTerritories) {
          update['territories'] = output['territories'].size;
        }
        update['revid'] = revid;

        await writeFile(finalName, stringify(output));
        await writeFile(revIdFileName, revid);

        logger(`Localized language names for ${lang} written to ${finalName}`);
      } else {
        logger(`Fetch failed for ${lang} with status ${res.status}`);
      }
    } else {
      logger(`Skipping ${lang}\n${sectionDelim}`);
    }
  } catch (e) {
    logger((e as Error).message);
  }

  return update;
}
