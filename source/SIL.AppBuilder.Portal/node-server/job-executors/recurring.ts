import { Job } from 'bullmq';
import { stat, writeFile } from 'fs/promises';
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

export async function refreshLangTags(
  job: Job<BullMQ.Recurring.RefreshLangTags>
): Promise<unknown> {
  const path =
    process.env.NODE_ENV === 'development'
      ? join(import.meta.dirname, '../../static/langtags.json')
      : '/app/build/client/langtags.json';
  const ret = {};
  try {
    const mtime = (await stat(path)).mtimeMs;
    const lastModified = new Date(
      (await fetch('https://ldml.api.sil.org/langtags.json', { method: 'HEAD' })).headers.get(
        'Last-Modified'
      )
    );

    if (mtime >= lastModified?.valueOf()) {
      job.updateProgress(100);
      return {
        mtime: new Date(mtime),
        lastModified
      };
    } else {
      ret['mtime'] = new Date(mtime);
      ret['lastModified'] = lastModified;
    }
  } catch (err) {
    // an error either happened when reading the file stats (i.e. it probably doesn't exist)
    // or when fetching the headers
    job.log(err);
  }

  job.updateProgress(25);

  try {
    const langtags: {
      tag: string;
      full: string;
      name: string;
      localname: string;
      code: string;
      regions: string[];
    }[] = await fetch('https://ldml.api.sil.org/langtags.json').then((f) => f.json());
    job.updateProgress(50);
    const parsed = langtags
      .filter((tag) => !tag.tag.startsWith('_'))
      .map(({ tag, full, name, localname, code, regions }) => ({
        tag,
        full,
        name,
        localname,
        code,
        regions
      }));
    job.updateProgress(75);
    await writeFile(path, JSON.stringify(parsed));
    ret['langtags'] = parsed.length;
    job.updateProgress(100);
  } catch (err) {
    job.log(err);
  }

  return ret;
}
