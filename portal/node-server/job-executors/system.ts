import { Job } from 'bullmq';
import { XMLParser } from 'fast-xml-parser';
import { existsSync } from 'fs';
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import {
  BuildEngine,
  BullMQ,
  DatabaseWrites,
  prisma,
  Queues,
  Workflow
} from 'sil.appbuilder.portal.common';
import { WorkflowType, WorkflowTypeString } from 'sil.appbuilder.portal.common/prisma';
import {
  Environment,
  ENVKeys,
  WorkflowAction,
  WorkflowInstanceContext,
  WorkflowState
} from 'sil.appbuilder.portal.common/workflow';

export async function checkSystemStatuses(
  job: Job<BullMQ.System.CheckEngineStatuses>
): Promise<unknown> {
  const organizations = await prisma.organizations.findMany({
    where: {
      // treat null same as false
      NOT: { UseDefaultBuildEngine: true },
      BuildEngineUrl: { not: null },
      BuildEngineApiAccessToken: { not: null }
    },
    select: {
      BuildEngineUrl: true,
      BuildEngineApiAccessToken: true
    }
  });
  // Add defaults
  const defaults = BuildEngine.Requests.tryGetDefaultBuildEngineParameters();
  if (defaults.url) {
    organizations.push({
      BuildEngineUrl: defaults.url,
      BuildEngineApiAccessToken: defaults.token
    });
  } else {
    job.log(
      'No default build engine is set (env.DEFAULT_BUILDENGINE_URL). Continuing with ' +
        organizations.length +
        ' organizations'
    );
    if (!organizations.length) {
      throw new Error('No build engines to check');
    }
  }
  const uniquePairs = Array.from(new Set(organizations.map((o) => JSON.stringify(o)))).map((e) =>
    JSON.parse(e)
  ) as typeof organizations;
  job.updateProgress(10);
  // remove statuses that do not correspond to organizations
  const removed = await DatabaseWrites.systemStatuses.deleteMany({
    where: {
      OR: [
        {
          BuildEngineUrl: {
            // we know these can't be null because that is handled by the query...
            notIn: uniquePairs.map((o) => o.BuildEngineUrl!)
          }
        },
        {
          BuildEngineApiAccessToken: {
            notIn: uniquePairs.map((o) => o.BuildEngineApiAccessToken!)
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
        url: s.BuildEngineUrl ?? '',
        token: s.BuildEngineApiAccessToken ?? ''
      });
      const available = res.status === 200;
      await DatabaseWrites.systemStatuses.update({
        where: {
          Id: s.Id
        },
        data: {
          SystemAvailable: available
        }
      });
      return {
        url: s.BuildEngineUrl,
        // return first 4 characters of token for differentiation purposes
        partialToken: s.BuildEngineApiAccessToken?.substring(0, 4),
        status: res.status,
        error: res.responseType === 'error' ? res : undefined,
        minutes: Math.floor((Date.now() - new Date(s.DateUpdated).valueOf()) / 60000)
      };
    })
  );
  job.updateProgress(80);
  // If there are offline systems, send an email to the super admins
  const offlineSystems = statuses.filter((s) => s.status !== 200);
  if (offlineSystems.length) {
    const brokenUrls = new Map();
    offlineSystems.forEach((s) => {
      brokenUrls.set(s.url, s);
    });
    const minutesSinceHalfHour = Math.floor((Date.now() / 1000 / 60) % 30);
    if (!(await Queues.Emails.getJobScheduler(BullMQ.JobSchedulerId.SystemStatusEmail))) {
      await Queues.Emails.upsertJobScheduler(
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
    removed: removed.count,
    added: filteredOrgs.length,
    total: statuses.length,
    statuses
  };
}

const sectionDelim = '********************';

export async function refreshLangTags(job: Job<BullMQ.System.RefreshLangTags>): Promise<unknown> {
  const localDir =
    process.env.NODE_ENV === 'development'
      ? join(import.meta.dirname, '../../static/languages')
      : '/app/build/client/languages';
  if (!existsSync(localDir)) {
    await mkdir(localDir);
  }
  const ret = {};

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
    job.log(err);
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
      logger(err);
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
    await mkdir(finalDir);
  }
  const finalName = join(finalDir, 'ldml.json');
  const revIdFileName = join(finalDir, 'revid');
  const endpoint = `https://ldml.api.sil.org/${lang}`;

  logger(`${sectionDelim}`);

  let revid = '';
  let update: Awaited<ReturnType<typeof shouldUpdate>>;
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
          .map(([code, name]) => [(code as string).replace(/_/g, '-'), name])
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

enum ProcessStatus {
  /** Status of a process which was created just now */
  Initialized = 0,
  /** Status of a process which is executing at current moment */
  Running = 1,
  /** Status of a process which is not executing at current moment and awaiting an external interaction */
  Idled = 2,
  /** Status of a process which was finalized */
  Finalized = 3,
  /** Status of a process which was terminated with an error */
  Terminated = 4,
  /** Status of a process which had an error but not terminated */
  Error = 5,
  /** Status of a process which exists in persistence store but its status is not defined */
  Unknown = 254,
  /** Status of a process which does not exist in persistence store */
  NotFound = 255
}

const uninterestedStatuses = new Map([
  [ProcessStatus.Terminated, 'Terminated'],
  [ProcessStatus.Unknown, 'Unknown'],
  [ProcessStatus.NotFound, 'NotFound']
]);

const usableStatuses = new Map([
  [ProcessStatus.Idled, 'Idled'],
  [ProcessStatus.Finalized, 'Finalized'],
  [ProcessStatus.Error, 'Error']
]);

export async function migrate(job: Job<BullMQ.System.Migrate>): Promise<unknown> {
  /**
   * Migration Tasks:
   * 1. Delete UserTasks for archived projects
   * 2. Add UserId to transitions with a WorkflowUserId but no UserId
   * 3. Migrate data from DWKit tables to WorkflowInstances
   */

  // 1. Delete UserTasks for archived projects
  const deletedTasks = await DatabaseWrites.userTasks.deleteMany({
    where: {
      Product: {
        Project: {
          DateArchived: { not: null }
        }
      }
    }
  });
  job.updateProgress(33);

  // 2. Add UserId to transitions with a WorkflowUserId but no UserId
  const updatedTransitions = (
    await Promise.all(
      (
        await prisma.productTransitions.findMany({
          where: {
            UserId: null,
            WorkflowUserId: { not: null }
          },
          select: { WorkflowUserId: true },
          distinct: 'WorkflowUserId'
        })
      ).map(async ({ WorkflowUserId }) => {
        const user = await prisma.users.findFirst({
          where: { WorkflowUserId },
          select: { Id: true }
        });
        if (!user) return { count: 0 };

        return await DatabaseWrites.productTransitions.updateMany({
          where: { UserId: null, WorkflowUserId },
          data: { UserId: user.Id }
        });
      })
    )
  ).reduce((p, c) => p + c.count, 0);

  const missingWorkflowUserIDs = (
    await prisma.productTransitions.findMany({
      where: {
        UserId: null,
        WorkflowUserId: { not: null }
      },
      select: { WorkflowUserId: true },
      distinct: 'WorkflowUserId'
    })
  ).map(({ WorkflowUserId }) => WorkflowUserId);

  job.updateProgress(66);

  // 3. Migrate data from DWKit tables to WorkflowInstances

  // Any product we would be interested in
  // - already exists in the Products table
  // - lacks a WorkflowInstance
  // - has an associated WorkflowProcessInstance

  type ProductId = {
    Id: string;
  };

  const products: { Id: string; WorkflowInstance?: unknown; ProcessStatus?: string }[] =
    await Promise.all(
      // If the database had properly defined relationships between these tables, this raw query wouldn't be necessary...
      (
        await prisma.$queryRaw<ProductId[]>`
          SELECT p."Id" from "Products" p
          WHERE NOT EXISTS (SELECT "ProductId" FROM "WorkflowInstances" wi WHERE p."Id" = wi."ProductId") 
          AND EXISTS (SELECT wpi."Id" FROM "WorkflowProcessInstance" wpi WHERE p."Id" = wpi."Id") 
          AND EXISTS (SELECT wpis."Id" FROM "WorkflowProcessInstanceStatus" wpis WHERE p."Id" = wpis."Id")`
      ).map(async (product) => {
        const processInstance = await prisma.workflowProcessInstance.findUniqueOrThrow({
          // all of the WorkflowProcessInstance* models use Product.Id effectively as a primary/foreign key
          // why the database doesn't have any relations (i.e. actual primary/foreign keys) based on this is beyond me
          where: { Id: product.Id },
          select: { ActivityName: true }
        });
        const processStatus = await prisma.workflowProcessInstanceStatus.findUniqueOrThrow({
          where: { Id: product.Id },
          select: { Status: true }
        });

        // we aren't interested in the weird edge cases, none of these show up in the prod dump anyways
        if (uninterestedStatuses.get(processStatus.Status)) {
          return { Id: product.Id, ProcessStatus: uninterestedStatuses.get(processStatus.Status) };
        }

        // We are interested in the Idled, Error, and Finalized states
        if (usableStatuses.get(processStatus.Status)) {
          const res = await tryCreateInstance(
            product.Id,
            processStatus.Status,
            processInstance.ActivityName,
            (s) => job.log(s)
          );
          return {
            Id: product.Id,
            ProcessStatus: usableStatuses.get(processStatus.Status),
            WorkflowInstance: res.value
          };
        } else if (
          processStatus.Status === ProcessStatus.Initialized ||
          processStatus.Status === ProcessStatus.Running
        ) {
          // if the process is currently running or just created, we want to check back in a little bit
          // PR #1115: TODO create delayed job to take care of instances that are currently running or initialized???
          return {
            Id: product.Id,
            ProcessStatus: processStatus.Status ? 'Running' : 'Initialized'
          };
        } else {
          job.log(`${product.Id}: Unrecognized status: "${processStatus.Status}"`);
          return { Id: product.Id, ProcessStatus: uninterestedStatuses.get(ProcessStatus.Unknown) };
        }
      })
    );

  // delete any WorkflowProcessInstances that are no longer associated with a product
  const orphanedInstances = await Promise.all(
    // If the database had properly defined relationships between these tables, this raw query wouldn't be necessary...
    (
      await prisma.$queryRaw<ProductId[]>`
        SELECT wpi."Id" FROM "WorkflowProcessInstance" wpi 
        WHERE NOT EXISTS (SELECT p."Id" from "Products" p WHERE p."Id" = wpi."Id")`
    ).map(({ Id }) => DatabaseWrites.workflowInstances.markProcessFinalized(Id))
  );

  job.updateProgress(100);
  return {
    deletedTasks: deletedTasks.count,
    updatedTransitions,
    missingWorkflowUserIDs,
    products,
    orphanedWPIs: orphanedInstances.reduce((p, c) => p + (c?.at(-1)?.count ?? 0), 0)
  };
}

async function tryCreateInstance(
  productId: string,
  Status: number,
  ActivityName: string,
  log: Logger
): Promise<{ ok: boolean; value: unknown }> {
  try {
    const product = await prisma.products.findUnique({
      where: { Id: productId },
      select: {
        ProductDefinition: {
          select: {
            Name: true,
            WorkflowId: true,
            RebuildWorkflowId: true,
            RepublishWorkflowId: true
          }
        }
      }
    });

    if (!product) return { ok: false, value: 'Product not found' };

    const persistence = await prisma.workflowProcessInstancePersistence.findMany({
      where: { ProcessId: productId }
    });

    if (Status === ProcessStatus.Finalized) {
      await DatabaseWrites.workflowInstances.markProcessFinalized(productId);
      return { ok: true, value: usableStatuses.get(Status) };
    }

    /** If it is at these specific activities, redirect to Synchronize Data */
    const redirectableStates = ['Check Product Publish', 'Check Product Build'].includes(
      ActivityName
    );

    if (
      !(Object.values(WorkflowState).includes(ActivityName as WorkflowState) || redirectableStates)
    ) {
      return {
        ok: false,
        value: `Unrecognized ActivityName "${ActivityName}"`
      };
    }

    const mergedEnv: Environment = {};
    for (const c of persistence) {
      if (c.ParameterName === 'environment') {
        try {
          Object.assign(mergedEnv, mergedEnv, JSON.parse(JSON.parse(c.Value)));
        } catch (e) {
          log(`${productId}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }

    // Pass empty string if key is not defined. empty string is at index 0 of WorkflowTypeString
    const typeIndex = WorkflowTypeString.indexOf(mergedEnv[ENVKeys.WORKFLOW_TYPE] ?? '');

    let workflowType = typeIndex as WorkflowType;

    // typeIndex could be -1 if not found in array, handled by < WorkflowType.Startup check
    if (typeIndex < WorkflowType.Startup || typeIndex > WorkflowType.Republish) {
      log(
        `${productId}: Invalid WORKFLOW_TYPE (${mergedEnv[ENVKeys.WORKFLOW_TYPE]}) in ProcessPersistence. Assuming Startup`
      );

      // If not defined assume Startup type
      workflowType = WorkflowType.Startup;
    }

    let WorkflowDefinitionId = product.ProductDefinition.WorkflowId; /* Startup */
    if (workflowType === WorkflowType.Rebuild && product.ProductDefinition.RebuildWorkflowId) {
      WorkflowDefinitionId = product.ProductDefinition.RebuildWorkflowId;
    } else if (
      workflowType === WorkflowType.Republish &&
      product.ProductDefinition.RepublishWorkflowId
    ) {
      WorkflowDefinitionId = product.ProductDefinition.RepublishWorkflowId;
    } else if (workflowType !== WorkflowType.Startup) {
      return {
        ok: false,
        value: `${WorkflowTypeString[workflowType]} is not available for ${product.ProductDefinition.Name}`
      };
    }

    const timestamp = new Date();

    const value = await DatabaseWrites.workflowInstances.upsert(productId, {
      create: {
        State: WorkflowState.Start,
        Context: JSON.stringify({
          instructions: null,
          includeFields: [],
          includeArtifacts: null,
          includeReviewers: false,
          environment: mergedEnv,
          start: ActivityName as WorkflowState
        } satisfies WorkflowInstanceContext),
        WorkflowDefinitionId
      },
      update: {}
    });

    // instance already existed, date created will be less than the timestamp
    if (value.DateCreated && value.DateCreated.valueOf() >= timestamp.valueOf()) {
      const flow = await Workflow.restore(productId);
      // this will make sure all fields are correct and UserTasks are created if needed
      flow?.send({
        type: WorkflowAction.Jump,
        target: redirectableStates
          ? WorkflowState.Synchronize_Data
          : (ActivityName as WorkflowState),
        userId: null,
        comment: 'Migrate workflow data to new backend',
        // we still want to create UserTasks if we are in one of the states that is redirected to Synchronize Data
        migration: !redirectableStates
      });
    }
    return { ok: true, value };
  } catch (e) {
    const value = e instanceof Error ? e.message : String(e);
    log(value);
    return { ok: false, value };
  }
}
