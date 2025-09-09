import type { Job } from 'bullmq';
import { XMLParser } from 'fast-xml-parser';
import { existsSync } from 'fs';
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { BuildEngine } from '../build-engine-api';
import { BullMQ, getQueues } from '../bullmq';
import { DatabaseReads, DatabaseWrites } from '../database';
import { Workflow } from '../workflow';
import { WorkflowType, WorkflowTypeString } from '$lib/prisma';
import { extractPackageName } from '$lib/products';
import {
  ENVKeys,
  ProductType,
  WorkflowAction,
  WorkflowOptions,
  WorkflowState,
  isDeprecated,
  isWorkflowState
} from '$lib/workflowTypes';
import type { Environment, WorkflowInstanceContext } from '$lib/workflowTypes';

export async function checkSystemStatuses(
  job: Job<BullMQ.System.CheckEngineStatuses>
): Promise<unknown> {
  const organizations = await DatabaseReads.organizations.findMany({
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
  if (defaults.url && defaults.token) {
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
  const systems = await DatabaseReads.systemStatuses.findMany({
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
    (await DatabaseReads.systemStatuses.findMany()).map(async (s) => {
      const res = await BuildEngine.Requests.systemCheck({
        type: 'provided',
        url: s.BuildEngineUrl ?? '',
        token: s.BuildEngineApiAccessToken ?? ''
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
        partialToken: s.BuildEngineApiAccessToken?.substring(0, 4),
        status: res.status,
        error: res.responseType === 'error' ? res : undefined,
        minutes: Math.floor((Date.now() - new Date(s.DateUpdated!).valueOf()) / 60000),
        updating: available !== s.SystemAvailable
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
    removed: removed.count,
    added: filteredOrgs.length,
    total: statuses.length,
    statuses
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
   * 4. Populate Product.PackageName
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
  job.updateProgress(25);

  // 2. Add UserId to transitions with a WorkflowUserId but no UserId
  const updatedTransitions = (
    await Promise.all(
      (
        await DatabaseReads.productTransitions.findMany({
          where: {
            UserId: null,
            WorkflowUserId: { not: null }
          },
          select: { WorkflowUserId: true },
          distinct: 'WorkflowUserId'
        })
      ).map(async ({ WorkflowUserId }) => {
        const user = await DatabaseReads.users.findFirst({
          where: { WorkflowUserId },
          select: { Id: true }
        });
        if (!user) return { count: 0 };

        return (
          (await DatabaseWrites.productTransitions.updateMany(
            {
              where: { UserId: null, WorkflowUserId },
              data: { UserId: user.Id }
            },
            // System startup; no need to update SvelteSSE projects
            // Also this is a migration that should not change any UI
            0
          )) || { count: 0 }
        );
      })
    )
  ).reduce((p, c) => p + c.count, 0);

  const missingWorkflowUserIDs = (
    await DatabaseReads.productTransitions.findMany({
      where: {
        UserId: null,
        WorkflowUserId: { not: null }
      },
      select: { WorkflowUserId: true },
      distinct: 'WorkflowUserId'
    })
  ).map(({ WorkflowUserId }) => WorkflowUserId);

  job.updateProgress(50);

  // 3. Migrate data from DWKit tables to WorkflowInstances

  // Any product we would be interested in
  // - already exists in the Products table
  // - lacks a WorkflowInstance
  // - has an associated WorkflowProcessInstance

  type ProductId = {
    Id: string;
  };

  type InstanceData = ProductId & { ActivityName: string; Status: number };

  let migratedProducts = 0;
  const migrationErrors: { Id: string; error: string }[] = [];
  const products = await DatabaseReads.$queryRaw<InstanceData[]>`
    SELECT p."Id", wpi."ActivityName", wpis."Status" from "Products" p
    LEFT JOIN "WorkflowProcessInstance" wpi on wpi."Id" = p."Id"
    LEFT JOIN "WorkflowProcessInstanceStatus" wpis on wpis."Id" = p."Id"
    WHERE wpi."ActivityName" IS NOT NULL AND wpis."Status" IS NOT NULL AND
    NOT EXISTS (SELECT "ProductId" FROM "WorkflowInstances" wi WHERE p."Id" = wi."ProductId")`;

  for (const product of products) {
    // we aren't interested in the weird edge cases, none of these show up in the prod dump anyways
    if (uninterestedStatuses.get(product.Status)) {
      migrationErrors.push({
        Id: product.Id,
        error: uninterestedStatuses.get(product.Status)!
      });
      continue;
    }

    // We are interested in the Idled, Error, and Finalized states
    if (usableStatuses.get(product.Status)) {
      const res = await tryCreateInstance(product.Id, product.Status, product.ActivityName, (s) =>
        job.log(s)
      );
      if (res.ok) {
        migratedProducts++;
      } else {
        migrationErrors.push({
          Id: product.Id,
          error: res.value
        });
        continue;
      }
    } else if (
      product.Status === ProcessStatus.Initialized ||
      product.Status === ProcessStatus.Running
    ) {
      // if the process is currently running or just created, we want to check back in a little bit
      // PR #1115: TODO create delayed job to take care of instances that are currently running or initialized???
      migrationErrors.push({
        Id: product.Id,
        error: product.Status ? 'Running' : 'Initialized'
      });
      continue;
    } else {
      migrationErrors.push({
        Id: product.Id,
        error: `Unrecognized status: '${product.Status}'`
      });
      continue;
    }
  }

  // delete any WorkflowProcessInstances that are no longer associated with a product
  const orphanedInstances = await Promise.all(
    // If the database had properly defined relationships between these tables, this raw query wouldn't be necessary...
    (
      await DatabaseReads.$queryRaw<ProductId[]>`
        SELECT wpi."Id" FROM "WorkflowProcessInstance" wpi 
        WHERE NOT EXISTS (SELECT p."Id" from "Products" p WHERE p."Id" = wpi."Id")`
    ).map(({ Id }) => DatabaseWrites.workflowInstances.markProcessFinalized(Id))
  );

  job.updateProgress(70);
  // Update WorkflowDefinitions ProductType and WorkflowOptions
  const workflowDefsNeedUpdate =
    (await DatabaseReads.workflowDefinitions.count({
      where: {
        ProductType: 0
      }
    })) === 14;
  if (workflowDefsNeedUpdate) {
    const workflowDefs: Parameters<typeof DatabaseWrites.workflowDefinitions.updateMany>[0][] = [
      {
        where: {
          Name: {
            contains: 'google_play'
          }
        },
        data: {
          ProductType: ProductType.Android_GooglePlay
        }
      },
      {
        where: {
          Name: {
            contains: 's3'
          }
        },
        data: {
          ProductType: ProductType.Android_S3
        }
      },
      {
        where: {
          Name: {
            contains: 'cloud'
          }
        },
        data: {
          ProductType: ProductType.Web
        }
      },
      {
        where: {
          Name: {
            contains: 'asset_package'
          }
        },
        data: {
          ProductType: ProductType.AssetPackage
        }
      },
      {
        where: {
          Name: 'sil_android_google_play'
        },
        data: {
          WorkflowOptions: [WorkflowOptions.AdminStoreAccess, WorkflowOptions.ApprovalProcess]
        }
      },
      {
        where: {
          Name: 'sil_android_s3'
        },
        data: {
          WorkflowOptions: [WorkflowOptions.ApprovalProcess]
        }
      },
      {
        where: {
          Name: 'la_android_google_play'
        },
        data: {
          WorkflowOptions: [WorkflowOptions.AdminStoreAccess]
        }
      }
    ];
    for (const def of workflowDefs) {
      await DatabaseWrites.workflowDefinitions.updateMany(def);
    }
  }
  job.updateProgress(75);

  // 4. Populate Product.PackageName
  const updatedPackages = await Promise.all(
    (
      await DatabaseReads.products.findMany({
        where: {
          PackageName: null,
          PublishLink: {
            startsWith: 'https://play.google.com/store/apps/details',
            mode: 'insensitive'
          }
        },
        select: {
          Id: true,
          PublishLink: true
        }
      })
    ).map(async (p) => {
      const pname = extractPackageName(p.PublishLink);
      await DatabaseWrites.products.update(p.Id, {
        PackageName: pname
      });
      return pname;
    })
  );

  job.updateProgress(100);
  return {
    deletedTasks: deletedTasks.count,
    updatedTransitions,
    missingWorkflowUserIDs,
    migratedProducts,
    migrationErrors,
    orphanedWPIs: orphanedInstances.reduce((p, c) => p + (c?.at(-1)?.count ?? 0), 0),
    updatedWorkflowDefinitions: workflowDefsNeedUpdate,
    updatedPackages
  };
}

async function tryCreateInstance(
  productId: string,
  Status: number,
  ActivityName: string,
  log: Logger
): Promise<{ ok: boolean; value: string }> {
  try {
    const product = await DatabaseReads.products.findUnique({
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

    const persistence = await DatabaseReads.workflowProcessInstancePersistence.findMany({
      where: { ProcessId: productId }
    });

    if (Status === ProcessStatus.Finalized) {
      await DatabaseWrites.workflowInstances.markProcessFinalized(productId);
      return { ok: true, value: '' };
    }

    if (!(isWorkflowState(ActivityName) || isDeprecated(ActivityName))) {
      return {
        ok: false,
        value: `Unrecognized ActivityName '${ActivityName}'`
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

    const instance = await DatabaseWrites.workflowInstances.upsert(productId, {
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

    // If DateCreated is less than the timestamp (i.e. NOT >=) it already existed and we don't want to send the jump command
    if (instance.DateCreated && instance.DateCreated.valueOf() >= timestamp.valueOf()) {
      const flow = await Workflow.restore(productId);
      // this will make sure all fields are correct and UserTasks are created if needed
      flow?.send({
        type: WorkflowAction.Migrate,
        target: ActivityName
      });
    }
    return { ok: true, value: '' };
  } catch (e) {
    return { ok: false, value: e instanceof Error ? e.message : String(e) };
  }
}
