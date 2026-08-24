import type { Prisma } from '@prisma/client';
import type { Job } from 'bullmq';
import { randomInt } from 'crypto';
import * as v from 'valibot';
import { BuildEngine } from '../../build-engine-api';
import { BullMQ, getQueues } from '../../bullmq';
import { DatabaseReads, DatabaseWrites } from '../../database';
import { checkBuildRetryCondition } from '../common.build-publish';
import { JobSchedulerId } from '$lib/bullmq';
import { fetchPublicationDetails } from '$lib/products/server';
import { getRelease } from '$lib/server/build-engine-api/requests';

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

  job.updateProgress(75);

  // 2. Add placeholder AdminSettings to database
  await DatabaseWrites.adminSettings.insertPlaceholders();

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
  const steps = Object.keys(migrationSteps).filter((k) =>
    job.data.steps?.includes(k as MigrationStep)
  ) as MigrationStep[];

  const results: [string, Error | Awaited<ReturnType<(typeof migrationSteps)[MigrationStep]>>][] =
    [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    try {
      const op = migrationSteps[step];
      const res = await op();
      if (res.before && !res.after) {
        await getQueues().Emails.add(`Notify SuperAdmins of Finished Migration Step: ${step}`, {
          type: BullMQ.JobType.Email_NotifySuperAdminsLowPriority,
          messageKey: 'migrationStepFinished',
          messageProperties: {
            step
          }
        });
      }
      results.push([step, res]);
      job.updateProgress(((i + 1) * 100) / steps.length);
    } catch (e) {
      results.push([step, e as Error]);
    }
  }

  if (results.length && results.every(([_, data]) => 'after' in data && !data['after'])) {
    await getQueues().SystemRecurring.removeJobScheduler(JobSchedulerId.MigrateChunks);
    job.log('All migrations have finished... Removing task');
    await getQueues().Emails.add(`Notify SuperAdmins of Finished Migration Steps`, {
      type: BullMQ.JobType.Email_NotifySuperAdminsLowPriority,
      messageKey: 'migrationStepFinished',
      messageProperties: {
        step: steps.join(', ')
      }
    });
  }

  return Object.fromEntries(results);
}

type MigrationOutput = { before: number; after: number } & Record<string, unknown>;

const sample = (total: number, size: number) => ({
  take: size,
  skip: Math.max(0, randomInt(total || 1) - size)
});

async function backfillPublicationLogUrl(): Promise<MigrationOutput> {
  const chunkSize = 20;
  const where = {
    OR: [
      { LogUrl: null },
      { LogUrl: '' },
      { LogUrl: { startsWith: 'https://console.aws.com' } },
      {
        AND: [{ OR: [{ PublishLink: null }, { PublishLink: '' }] }, { Success: true }]
      },
      {
        AND: [
          { OR: [{ Package: null }, { Package: '' }] },
          { ProductBuild: { ProductArtifacts: { some: { ArtifactType: 'package_name' } } } }
        ]
      }
    ],
    // releases created before this time don't have the correct variables set in BuildEngine
    DateCreated: { gt: new Date('2018-08-30 19:12:02.000') }
  } as const satisfies Prisma.ProductPublicationsWhereInput;

  const before = await DatabaseReads.productPublications.count({ where });

  const chunk = await Promise.all(
    (
      await DatabaseReads.productPublications.findMany({
        where,
        ...sample(before, chunkSize),
        select: {
          ProductId: true,
          BuildEngineBuildId: true,
          BuildEngineReleaseId: true,
          ProductBuild: {
            select: {
              ProductArtifacts: {
                where: {
                  ArtifactType: 'package_name'
                },
                select: {
                  ArtifactType: true,
                  Url: true
                },
                take: 1
              }
            }
          },
          Product: {
            select: { BuildEngineJobId: true, Project: { select: { OrganizationId: true } } }
          }
        }
      })
    ).map((pub) =>
      getRelease(
        { type: 'query', organizationId: pub.Product.Project.OrganizationId },
        pub.Product.BuildEngineJobId,
        pub.BuildEngineBuildId,
        pub.BuildEngineReleaseId
      ).then(async (release) => {
        if (release.responseType === 'release') {
          const url = release.consoleText || release.artifacts['consoleText'];
          const { publishLink, packageName } = await fetchPublicationDetails(
            release,
            pub.ProductBuild.ProductArtifacts
          );
          if (url || publishLink || packageName) {
            await DatabaseWrites.productPublications.update(
              pub.ProductId,
              pub.BuildEngineReleaseId,
              { LogUrl: url, PublishLink: publishLink, Package: packageName }
            );
          }

          return { pub, release, url, publishLink, packageName };
        }

        return { pub, release };
      })
    )
  );

  const after = await DatabaseReads.productPublications.count({ where });

  return { before, chunk, after };
}

const vnum = /\d+\.\d+(\.\d+)?/;

/** Preferred */
const fromScriptVersion = new RegExp(`APPBUILDER_SCRIPT_VERSION=(${vnum.source})`);
/** Alternates */
const fromVersion = new RegExp(`Version (${vnum.source})`);
const fromStarHeader = new RegExp(`\\*\\*\\* (${vnum.source}) \\*\\*\\*`);
const manageVersionName = new RegExp('^BUILD_MANAGE_VERSION_NAME=1');
const fromVersionName = new RegExp(`^VERSION_NAME=(${vnum.source})`);

async function backfillAppBuilderVersion(): Promise<MigrationOutput> {
  const chunkSize = 20;
  const matchers: ((text: string) => string | undefined)[] = [
    (text) => text.match(fromScriptVersion)?.at(1),
    (text) => text.match(fromVersion)?.at(1),
    (text) => text.match(fromStarHeader)?.at(1),
    (text) => (text.match(manageVersionName) ? text.match(fromVersionName)?.at(1) : undefined)
  ];
  const where = {
    Success: true,
    AND: [
      {
        OR: [
          {
            AppBuilderVersion: null
          },
          { AppBuilderVersion: '' }
        ]
      },
      {
        OR: [
          {
            ProductArtifacts: {
              some: {
                ArtifactType: 'consoleText'
              }
            }
          },
          {
            ProductArtifacts: {
              some: {
                ArtifactType: 'version'
              }
            }
          }
        ]
      }
    ]
  } as const satisfies Prisma.ProductBuildsWhereInput;

  const before = await DatabaseReads.productBuilds.count({ where });

  const chunk = await Promise.all(
    (
      await DatabaseReads.productBuilds.findMany({
        where,
        ...sample(before, chunkSize),
        select: {
          ProductId: true,
          BuildEngineBuildId: true,
          AppBuilderVersion: true,
          ProductArtifacts: {
            where: {
              ArtifactType: { in: ['consoleText', 'version'] }
            },
            select: {
              ArtifactType: true,
              Url: true
            }
          }
        }
      })
    ).map(async (pb) => {
      let appVersion: string = '';
      const versionJSON = pb.ProductArtifacts.find((pa) => pa.ArtifactType === 'version')?.Url;
      const logUrl = pb.ProductArtifacts.find((pa) => pa.ArtifactType === 'consoleText')?.Url;
      try {
        appVersion = await v
          .safeParseAsync(
            v.pipe(
              v.string(),
              v.parseJson(),
              v.object({ appbuilderVersion: v.optional(v.string()) })
            ),
            versionJSON && (await fetch(versionJSON).then((r) => r.text()))
          )
          .then((r) => (r.success && r.output.appbuilderVersion) || '');
      } catch (error) {
        if (!logUrl) {
          return { pb, error };
        }
      }
      if (!appVersion && logUrl) {
        try {
          const log = await fetch(logUrl).then((r) => r.text());

          for (const matcher of matchers) {
            const match = matcher(log);
            if (match) {
              appVersion = match;
              break;
            }
          }
        } catch (error) {
          return { pb, error };
        }
      }
      if (appVersion) {
        await DatabaseWrites.productBuilds.update(pb.ProductId, pb.BuildEngineBuildId, {
          AppBuilderVersion: appVersion
        });
      }
      return { pb, appVersion };
    })
  );

  const after = await DatabaseReads.productBuilds.count({ where });

  return { before, chunk, after };
}

async function renameRetryComments() {
  const filter: Prisma.ProductTransitionsWhereInput = {
    Comment: 'Build may have failed due to insufficient memory. Retrying with medium compute type.'
  };
  const chunkSize = 20;

  const before = await DatabaseReads.productTransitions.count({
    where: filter
  });
  const chunk = await DatabaseReads.productTransitions.findMany({
    where: filter,
    select: {
      Id: true,
      ProductBuilds: {
        where: {
          Success: false,
          ProductArtifacts: {
            some: {
              ArtifactType: 'consoleText'
            }
          }
        },
        select: {
          ProductArtifacts: {
            where: {
              ArtifactType: 'consoleText'
            },
            select: {
              Url: true
            }
          }
        },
        orderBy: {
          DateCreated: 'desc'
        }
      }
    },
    take: chunkSize,
    skip: Math.max(0, randomInt(before || 1) - chunkSize)
  });

  const fixed = await Promise.all(
    chunk.map(async (p) => {
      try {
        const urls = p.ProductBuilds.map((b) => b.ProductArtifacts?.at(0)?.Url ?? '');
        let matchingUrl = '';
        for (const url of urls) {
          if (url && (await checkBuildRetryCondition(url))) matchingUrl = url;
        }
        await DatabaseWrites.productTransitions.update({
          where: { Id: p.Id },
          data: {
            Comment: `system.build-retry,${matchingUrl}`
          }
        });
        return { ...p, ConsoleText: matchingUrl };
      } catch (e) {
        return { ...p, Error: e };
      }
    })
  );

  const after = await DatabaseReads.productTransitions.count({
    where: filter
  });

  return { before, chunk, fixed, after };
}

const migrationSteps = {
  'Patch ProductPublications.LogUrl': backfillPublicationLogUrl,
  'Backfill Remaining ProductBuilds.AppBuilderVersion': backfillAppBuilderVersion,
  'Rename Retry Comments': renameRetryComments
} as const satisfies Record<string, () => Promise<MigrationOutput>>;

export type MigrationStep = keyof typeof migrationSteps;
