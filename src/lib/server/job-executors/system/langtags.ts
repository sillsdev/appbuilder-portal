import type { Job } from 'bullmq';
import { XMLParser } from 'fast-xml-parser';
import { existsSync } from 'fs';
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import type { BullMQ } from '../../bullmq';

const sectionDelim = '********************';

export async function refreshLangTags(job: Job<BullMQ.System.RefreshLangTags>): Promise<unknown> {
  const localDir = join(process.cwd(), 'languages');
  if (!existsSync(localDir)) {
    await mkdir(localDir, { recursive: true });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ret: any = {};

  const log = (msg: string) => job.log(msg);

  try {
    job.log(sectionDelim);

    const langtagsPath = join(localDir, 'langtags.json');

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

      const langtags = (
        (await res.json()) as {
          tag: string;
          localname?: string | undefined;
          name: string;
          names?: string[] | undefined;
          region: string;
          regions?: string[] | undefined;
          variants?: string[] | undefined;
        }[]
      )
        .filter((lang) => !lang.tag.startsWith('_'))
        .map(({ tag, localname, name, names, region, regions, variants }) => ({
          tag,
          localname,
          name,
          names,
          region,
          regions,
          variants
        }));

      await writeFile(langtagsPath, JSON.stringify(langtags));

      job.log(`langtags written to ${langtagsPath}`);

      ret['langtags']['length'] = langtags.length;

      job.log(`Downloaded all supported languages\n${sectionDelim}`);
    }
    job.updateProgress(55);

    ret['es-419'] = await processLocalizedNames(localDir, 'es-419', log);
    job.updateProgress(70);
    // TODO: should we rename our en-us translations to en?
    //       this would _only_ be because the ldml endpoint does not have an en-us entry
    ret['en-US'] = await processLocalizedNames(localDir, 'en', log, 'en-US');
    job.updateProgress(85);
    ret['fr-FR'] = await processLocalizedNames(localDir, 'fr-FR', log);

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

async function shouldUpdate(localPath: string, remotePath: string, logger: Logger) {
  if (existsSync(localPath)) {
    logger(`Found ${localPath}`);
    try {
      const localLastModified = new Date((await stat(localPath)).mtimeMs);
      const res = await fetchWithLog(remotePath, logger, { method: 'HEAD' });
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

async function processLocalizedNames(
  localDir: string,
  lang: string,
  logger: Logger,
  fileName?: string
) {
  fileName ??= lang;

  const finalDir = join(localDir, fileName);
  if (!existsSync(finalDir)) {
    await mkdir(finalDir, { recursive: true });
  }
  const finalName = join(finalDir, 'ldml.json');
  const revIdFileName = join(finalDir, 'revid');
  const endpoint = `https://ldml.api.sil.org/${lang}`;

  logger(`${sectionDelim}`);

  let revid = '';
  let update: Awaited<ReturnType<typeof shouldUpdate>> & {
    foundRevid?: string;
    languages?: number;
    territories?: number;
    revid?: string;
  };
  if (existsSync(revIdFileName)) {
    revid = (await readFile(revIdFileName)).toString();
    update = await shouldUpdate(finalName, endpoint + '?revid=' + revid, logger);
  } else {
    logger(`${revIdFileName} does not exist`);
    update = { shouldUpdate: true };
  }

  update['foundRevid'] = revid;

  if (update.shouldUpdate || !revid) {
    logger(`Downloading ldml data for ${lang}...`);

    const res = await fetchWithLog(endpoint + '?inc[0]=localeDisplayNames', logger);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
    const parsed = parser.parse(await res.text());

    revid = parsed.ldml.identity.special['sil:identity']['@_revid'];

    const output = [
      [
        'languages',
        parsed.ldml.localeDisplayNames.languages.language
          .map(mapXMLAttributes)
          .map(([code, name]: [string, string]) => [code.replace(/_/g, '-'), name])
      ],
      ['territories', parsed.ldml.localeDisplayNames.territories.territory.map(mapXMLAttributes)]
    ];

    update['languages'] = output[0][1].length;
    update['territories'] = output[1][1].length;
    update['revid'] = revid;

    await writeFile(finalName, JSON.stringify(output));
    await writeFile(revIdFileName, revid);

    logger(`Localized language names for ${lang} written to ${finalName}`);
  } else {
    logger(`Skipping ${lang}\n${sectionDelim}`);
  }

  return update;
}
