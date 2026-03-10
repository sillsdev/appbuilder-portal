import type { Job } from 'bullmq';
import { randomInt } from 'crypto';
import { XMLParser } from 'fast-xml-parser';
import { existsSync } from 'fs';
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { BuildEngine } from '../build-engine-api';
import { BullMQ, getQueues } from '../bullmq';
import { DatabaseReads, DatabaseWrites } from '../database';
import { JobSchedulerId } from '$lib/bullmq';
import { activeSystems } from '$lib/organizations/server';
import { WorkflowState } from '$lib/workflowTypes';

export async function checkSystemStatuses(
  job: Job<BullMQ.System.CheckEngineStatuses>
): Promise<unknown> {
  const statuses = await Promise.all(
    (await DatabaseReads.systemStatuses.findMany({ where: activeSystems })).map(async (s) => {
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
        id: s.Id,
        url: s.BuildEngineUrl,
        // return first 4 characters of token for differentiation purposes
        partialToken: s.BuildEngineApiAccessToken?.substring(0, 4),
        status: res.status,
        error: res.responseType === 'error' ? res : undefined,
        minutes: Math.floor((Date.now() - new Date(s.DateUpdated!).valueOf()) / 60000),
        updating: available !== s.SystemAvailable,
        versionInfo: res.responseType === 'status' ? res : undefined
      };
    })
  );

  job.updateProgress(50);

  const applications = new Map(
    (
      await DatabaseReads.applicationTypes.findMany({
        select: {
          Id: true,
          Name: true
        }
      })
    ).map((a) => [a.Name, a.Id])
  );

  const versionInfo = statuses.flatMap((s) =>
    s.versionInfo
      ? Object.entries(s.versionInfo.versions)
          .filter(([key]) => applications.get(key))
          .map(([Name, Version]) => ({
            SystemId: s.id,
            ApplicationTypeId: applications.get(Name)!,
            Version,
            ImageHash: s.versionInfo!.imageHash
          }))
      : []
  );

  const versions = (
    await Promise.all(
      versionInfo.map(async (vi) => {
        return await DatabaseWrites.systemVersions.upsert({
          where: {
            SystemId_ApplicationTypeId: {
              SystemId: vi.SystemId,
              ApplicationTypeId: vi.ApplicationTypeId
            }
          },
          create: {
            SystemId: vi.SystemId,
            ApplicationTypeId: vi.ApplicationTypeId,
            Version: vi.Version,
            ImageHash: vi.ImageHash
          },
          update: {
            Version: vi.Version,
            ImageHash: vi.ImageHash
          }
        });
      })
    )
  ).filter((v) => !!v);

  job.updateProgress(80);
  // If there are offline systems, send an email to the super admins
  const offlineSystems = statuses.filter((s) => s.status !== 200);
  if (offlineSystems.length) {
    const minutesSinceHalfHour = Math.floor((Date.now() / 1000 / 60) % 30);
    if (!(await getQueues().Emails.getJobScheduler(BullMQ.JobSchedulerId.SystemStatusEmail))) {
      await getQueues().Emails.upsertJobScheduler(
        BullMQ.JobSchedulerId.SystemStatusEmail,
        {
          // Every 30 minutes from now
          // BullMQ does not have a good way to schedule repeating jobs at non-standard intervals
          // so we have to do this to calculate the in-hour offset manually
          pattern: `${minutesSinceHalfHour},${minutesSinceHalfHour + 30} * * * *`,
          immediately: true
        },
        {
          name: 'Email SuperAdmins about offline systems',
          data: {
            type: BullMQ.JobType.Email_NotifySuperAdminsOfOfflineSystems
          }
        }
      );
    }
  }
  job.updateProgress(100);
  return {
    statuses,
    versions,
    connected: await DatabaseReads.systemStatuses.count({
      where: { SystemAvailable: true, ...activeSystems }
    }),
    disconnected: await DatabaseReads.systemStatuses.count({
      where: { SystemAvailable: false, ...activeSystems }
    }),
    inactive: await DatabaseReads.systemStatuses.count({ where: { NOT: activeSystems } })
  };
}

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

export async function migrate(job: Job<BullMQ.System.Migrate>): Promise<unknown> {
  /**
   * 1. Pre-populate SystemStatuses
   */

  // 1a. Ensure default buildengine exists
  const defaultCredentials = BuildEngine.Requests.tryGetDefaultBuildEngineParameters();
  let existingDefault = await DatabaseReads.systemStatuses.findFirst({
    where: {
      OrganizationId: null
    }
  });
  existingDefault = existingDefault
    ? await DatabaseWrites.systemStatuses.update({
        where: {
          Id: existingDefault.Id
        },
        data: {
          BuildEngineUrl: defaultCredentials.url,
          BuildEngineApiAccessToken: defaultCredentials.token
        }
      })
    : await DatabaseWrites.systemStatuses.create({
        data: {
          BuildEngineUrl: defaultCredentials.url,
          BuildEngineApiAccessToken: defaultCredentials.token,
          SystemAvailable: false
        }
      });

  job.updateProgress(50);

  // 1b. Populate SystemStatuses from Organizations

  const organizations = await DatabaseReads.organizations.findMany({
    where: { System: null },
    select: {
      Id: true,
      UseDefaultBuildEngine: true,
      BuildEngineUrl: true,
      BuildEngineApiAccessToken: true
    }
  });

  if (organizations.length) {
    await DatabaseWrites.systemStatuses.createMany({
      data: organizations
        .filter((o) => o.BuildEngineUrl && o.BuildEngineApiAccessToken)
        .map((o) => ({
          BuildEngineUrl: o.BuildEngineUrl!,
          BuildEngineApiAccessToken: o.BuildEngineApiAccessToken!,
          SystemAvailable: false,
          OrganizationId: o.Id
        }))
    });
  }

  job.updateProgress(100);

  return {
    default: {
      ...existingDefault,
      BuildEngineApiAccessToken: existingDefault.BuildEngineApiAccessToken.substring(0, 4)
    },
    organizations: organizations.map((o) => ({
      ...o,
      BuildEngineApiAccessToken: o.BuildEngineApiAccessToken?.substring(0, 4)
    }))
  };
}

export async function lazyMigrate(job: Job<BullMQ.System.Migrate>): Promise<unknown> {
  /**
   * Migration Tasks:
   * 1. Populate ProductBuild/ProductPublications.TransitionId
   */

  const filter = { TransitionId: null, Success: { not: null } };
  const chunkSize = 20;

  // only try to associate completed builds
  const countBuilds = await DatabaseReads.products.count({
    where: { ProductBuilds: { some: filter } }
  });
  const orphanedBuilds = await DatabaseReads.products.findMany({
    where: { ProductBuilds: { some: filter } },
    select: {
      Id: true,
      ProductBuilds: {
        where: filter,
        select: {
          BuildEngineBuildId: true,
          DateCreated: true
        },
        orderBy: { DateCreated: 'asc' }
      },
      ProductTransitions: {
        where: {
          InitialState: WorkflowState.Product_Build,
          DateTransition: { not: null }
        },
        select: {
          Id: true,
          DateTransition: true
        },
        orderBy: {
          DateTransition: 'asc'
        }
      }
    },
    take: chunkSize,
    skip: Math.max(0, randomInt(countBuilds || 1) - chunkSize)
  });

  const associatedBuilds = await Promise.all(
    orphanedBuilds.map(async (p) => ({
      Id: p.Id,
      // find first transition where DateTransition is greater than Build.DateCreated
      // problem, date transition isn't set until build is completed... so we only do this for completed builds
      ProductBuilds: await Promise.all(
        p.ProductBuilds.map((build) => {
          const id = p.ProductTransitions.find(
            (pt) =>
              pt.DateTransition!.valueOf() > build.DateCreated!.valueOf() ||
              // or within 5 seconds
              Math.abs(pt.DateTransition!.valueOf() - build.DateCreated!.valueOf()) < 5000
          )?.Id;

          if (id) {
            return DatabaseWrites.productTransitions.tryConnect(
              p.Id,
              build.BuildEngineBuildId,
              'build',
              id
            );
          } else {
            return { BuildEngineBuildId: build.BuildEngineBuildId };
          }
        })
      )
    }))
  );

  job.updateProgress(50);

  // only try to associate completed releases
  const countReleases = await DatabaseReads.products.count({
    where: { ProductPublications: { some: filter } }
  });
  const orphanedReleases = await DatabaseReads.products.findMany({
    where: { ProductPublications: { some: filter } },
    select: {
      Id: true,
      ProductPublications: {
        where: filter,
        select: {
          BuildEngineReleaseId: true,
          DateCreated: true
        },
        orderBy: { DateCreated: 'asc' }
      },
      ProductTransitions: {
        where: {
          InitialState: WorkflowState.Product_Publish,
          DateTransition: { not: null }
        },
        select: {
          Id: true,
          DateTransition: true
        },
        orderBy: {
          DateTransition: 'asc'
        }
      }
    },
    take: chunkSize,
    skip: Math.max(0, randomInt(countReleases || 1) - chunkSize)
  });

  const associatedReleases = await Promise.all(
    orphanedReleases.map(async (p) => ({
      Id: p.Id,
      // find first transition where DateTransition is greater than Publication.DateCreated
      // problem, date transition isn't set until release is completed... so we only do this for completed releases
      ProductPublications: await Promise.all(
        p.ProductPublications.map((release) => {
          const id = p.ProductTransitions.find(
            (pt) =>
              pt.DateTransition!.valueOf() > release.DateCreated!.valueOf() ||
              // or within 5 seconds
              Math.abs(pt.DateTransition!.valueOf() - release.DateCreated!.valueOf()) < 5000
          )?.Id;

          if (id) {
            return DatabaseWrites.productTransitions.tryConnect(
              p.Id,
              release.BuildEngineReleaseId,
              'release',
              id
            );
          } else {
            return { BuildEngineReleaseId: release.BuildEngineReleaseId };
          }
        })
      )
    }))
  );

  if (!countBuilds && !countReleases) {
    await getQueues().SystemRecurring.removeJobScheduler(JobSchedulerId.MigrateChunks);
  }

  job.updateProgress(100);

  return {
    builds: {
      count: countBuilds,
      orphaned: orphanedBuilds,
      updated: associatedBuilds
    },
    releases: {
      count: countReleases,
      orphaned: orphanedReleases,
      updated: associatedReleases
    }
  };
}
