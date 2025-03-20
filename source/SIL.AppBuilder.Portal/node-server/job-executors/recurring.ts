import { Job } from 'bullmq';
import { XMLParser } from 'fast-xml-parser';
import { existsSync } from 'fs';
import { mkdir, readFile, rm, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { BuildEngine, BullMQ, DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';

export async function checkSystemStatuses(
  job: Job<BullMQ.Recurring.CheckSystemStatuses>
): Promise<unknown> {
  const organizations = await prisma.organizations.findMany({
    where: {
      OR: [
        {
          UseDefaultBuildEngine: false
        }
      ],
      BuildEngineUrl: { not: null },
      BuildEngineApiAccessToken: { not: null }
    },
    select: {
      BuildEngineUrl: true,
      BuildEngineApiAccessToken: true
    }
  });
  // Add defaults
  if (process.env.DEFAULT_BUILDENGINE_URL && process.env.DEFAULT_BUILDENGINE_API_ACCESS_TOKEN) {
    organizations.push({
      BuildEngineUrl: process.env.DEFAULT_BUILDENGINE_URL,
      BuildEngineApiAccessToken: process.env.DEFAULT_BUILDENGINE_API_ACCESS_TOKEN
    });
  }
  const uniquePairs = new Set(organizations.map((o) => JSON.stringify(o)))
    .values()
    .map((e) => JSON.parse(e))
    .toArray() as typeof organizations;
  job.updateProgress(10);
  // remove statuses that do not correspond to organizations
  const removed = await DatabaseWrites.systemStatuses.deleteMany({
    where: {
      OR: [
        {
          BuildEngineUrl: {
            notIn: uniquePairs.map((o) => o.BuildEngineUrl)
          }
        },
        {
          BuildEngineApiAccessToken: {
            notIn: uniquePairs.map((o) => o.BuildEngineApiAccessToken)
          }
        }
      ]
    }
  });
  job.updateProgress(20);
  const systems = await prisma.systemStatuses.findMany({
    select: {
      BuildEngineUrl: true,
      BuildEngineApiAccessToken: true
    }
  });
  // Filter out url/token pairs that already exist in the status table
  const filteredOrgs = uniquePairs.filter(
    (o) =>
      !systems.find(
        (s) =>
          s.BuildEngineUrl === o.BuildEngineUrl &&
          s.BuildEngineApiAccessToken === o.BuildEngineApiAccessToken
      )
  );
  job.updateProgress(30);
  await DatabaseWrites.systemStatuses.createMany({
    data: filteredOrgs.map((o) => ({ ...o, SystemAvailable: false }))
  });
  job.updateProgress(50);
  const statuses = await Promise.all(
    (await prisma.systemStatuses.findMany()).map(async (s) => {
      const res = await BuildEngine.Requests.systemCheck({
        type: 'provided',
        url: s.BuildEngineUrl,
        token: s.BuildEngineApiAccessToken
      });
      const available = res.status === 200;
      if (s.SystemAvailable !== available) {
        await DatabaseWrites.systemStatuses.update({
          where: {
            Id: s.Id
          },
          data: {
            SystemAvailable: available
          }
        });
      }
      return {
        url: s.BuildEngineUrl,
        // return first 4 characters of token for differentiation purposes
        partialToken: s.BuildEngineApiAccessToken.substring(0, 4),
        status: res.status,
        error: res.responseType === 'error' ? res : undefined
      };
    })
  );
  job.updateProgress(100);
  return {
    removed: removed.count,
    added: filteredOrgs.length,
    total: statuses.length,
    statuses
  };
}

const sectionDelim = '********************';

export async function refreshLangTags(
  job: Job<BullMQ.Recurring.RefreshLangTags>
): Promise<unknown> {
  const localDir =
    process.env.NODE_ENV === 'development'
      ? join(import.meta.dirname, '../../static/languages')
      : '/app/build/client/languages';
  if (!existsSync(localDir)) {
    await mkdir(localDir);
  }
  const tempPath = join(localDir, 'langtags.tmp.json');
  const langtagsPath = join(localDir, 'langtags.json');

  const ret = {};

  const log = (msg: string) => job.log(msg);

  try {
    job.log(sectionDelim);

    const shouldUpdateLangtags = await shouldUpdate(
      langtagsPath,
      'https://ldml.api.sil.org/langtags.json',
      log
    );

    ret['langtags'] = shouldUpdateLangtags;

    job.log(sectionDelim);

    job.updateProgress(25);

    job.log(`${sectionDelim}\nDownloading all supported languages...`);
    await writeFile(
      tempPath,
      JSON.stringify(await fetch('https://ldml.api.sil.org/langtags.json').then((r) => r.json()))
    );

    const split = await splitLangtagsJson(tempPath, langtagsPath, log);

    ret['langtags']['length'] = split.langtags;
    //ret['specialtags'] = split.specialtags;

    job.log(`Downloaded all supported languages\n${sectionDelim}`);
    job.updateProgress(55);

    ret['es-419'] = await downloadAndConvert(localDir, 'es-419', log);
    job.updateProgress(70);
    // TODO: should we rename our en-us translations to en?
    //       this would _only_ be because the ldml endpoint does not have an en-us entry
    ret['en-US'] = await downloadAndConvert(localDir, 'en', log, 'en-US');
    job.updateProgress(85);
    ret['fr-FR'] = await downloadAndConvert(localDir, 'fr-FR', log);

    job.updateProgress(100);
  } catch (err) {
    job.log(err);
  }

  return ret;
}

type Logger = (msg: string) => void;

async function shouldUpdate(localPath: string, remotePath: string, logger: Logger) {
  if (existsSync(localPath)) {
    logger(`Found ${localPath}`);
    try {
      const localLastModified = new Date((await stat(localPath)).mtimeMs);
      logger(`Local LastModified: ${localLastModified}`);
      const res = await fetch(remotePath, { method: 'HEAD' });
      logger(`Fetching HEAD of ${remotePath}\n\\=> ${res.status} ${res.statusText}`);
      const remoteLastModified = new Date(res.headers.get('Last-Modified'));
      logger(`Remote LastModified: ${remoteLastModified}`);

      return {
        shouldUpdate: localLastModified?.valueOf() >= remoteLastModified?.valueOf(),
        localLastModified,
        remoteLastModified
      };
    } catch (err) {
      logger(err);
    }
  } else {
    logger(`${localPath} does not exist`);
  }
  return {
    shouldUpdate: true
  };
}

async function downloadAndConvert(
  localDir: string,
  lang: string,
  logger: Logger,
  fileName?: string
) {
  fileName ??= lang;

  const tmpName = join(localDir, `ldml.tmp.${fileName}.json`);
  const finalDir = join(localDir, fileName);
  if (!existsSync(finalDir)) {
    await mkdir(finalDir);
  }
  const finalName = join(finalDir, 'ldml.json');
  const endpoint = `https://ldml.api.sil.org/${lang}?inc[0]=localeDisplayNames`;

  logger(`${sectionDelim}`);

  const update = await shouldUpdate(finalName, endpoint, logger);

  if (update.shouldUpdate) {
    logger(`Downloading ldml data for ${lang}...`);

    const res = await fetch(endpoint);

    logger(`Fetching ${endpoint}\n \\=> ${res.status} ${res.statusText}`);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
    const parsed = parser.parse(await res.text());
    await writeFile(tmpName, JSON.stringify(parsed));

    logger(`Writing temporary file ${tmpName}`);

    // TODO: use a custom node script to convert the language
    // list to something more easily consumeable by a javascript app.
    await cleanupLDMLJSON(tmpName, finalName, logger);

    await rm(tmpName);

    logger(`Removed ${tmpName}\n${sectionDelim}`);
  } else {
    logger(`Skipping ${lang}\n${sectionDelim}`);
  }

  return update;
}

async function splitLangtagsJson(inputName: string, outputName: string, logger: Logger) {
  logger(`Splitting langtags @ ${inputName}`);
  const raw = (await readFile(inputName)).toString();
  const data = JSON.parse(raw) as { tag: string }[];

  const output = data.filter((el: { tag: string }) => {
    return !el.tag.startsWith('_');
  });

  /*const special = data.filter((el: { tag: string }) => {
    return el.tag.startsWith('_');
  });*/

  await writeFile(outputName, JSON.stringify(output));

  //await writeFile(specialName, JSON.stringify(special));

  logger(`JSON output written to ${outputName}`); // and ${specialName}`);

  await rm(inputName);

  logger(`Removed ${inputName}`);

  return { langtags: output.length }; //, specialtags: special.length };
}

function toAbbrTextMap(arr: Record<string, unknown>[]) {
  return Object.fromEntries(arr.map((item) => [item['@_type'], item['#text']]));
}

async function cleanupLDMLJSON(inputName: string, outputName: string, logger: Logger) {
  let raw = (await readFile(inputName)).toString();
  let data = JSON.parse(raw);

  let ldn = data.ldml.localeDisplayNames;
  let output = {
    ...data.ldml,
    localeDisplayNames: {
      ...data.ldml.localeDisplayNames,
      languages: { ...toAbbrTextMap(ldn.languages.language) },
      scripts: { ...toAbbrTextMap(ldn.scripts.script) },
      territories: { ...toAbbrTextMap(ldn.territories.territory) },
      variants: { ...toAbbrTextMap(ldn.variants.variant) },
      keys: { ...toAbbrTextMap(ldn.keys.key) },
      types: { ...toAbbrTextMap(ldn.types.type) },
      measurementSystemNames: {
        ...toAbbrTextMap(ldn.measurementSystemNames.measurementSystemName)
      },
      codePatterns: { ...toAbbrTextMap(ldn.codePatterns.codePattern) }
    }
  };

  let outputString = JSON.stringify(output);

  await writeFile(outputName, outputString);

  logger(`JSON output has been cleaned at ${outputName}`);
}
