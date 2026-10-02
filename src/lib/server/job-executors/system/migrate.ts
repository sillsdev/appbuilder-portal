import type { Job } from 'bullmq';
import { randomInt } from 'crypto';
import { BuildEngine } from '../../build-engine-api';
import { BullMQ, getQueues } from '../../bullmq';
import { DatabaseReads, DatabaseWrites } from '../../database';
import { JobSchedulerId } from '$lib/bullmq';

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
  const steps = Object.keys(migrationSteps).filter(
    (k) => k !== 'foo' && job.data.steps?.includes(k as MigrationStep)
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

const migrationSteps = {
  /* dummy step to keep type-system happy. will never be executed */
  foo: () => Promise.resolve({ before: 0, after: 0, ...sample(0, 0) })
} as const satisfies Record<string, () => Promise<MigrationOutput>>;

export type MigrationStep = keyof typeof migrationSteps;
