import { Job } from 'bullmq';
import { BuildEngine, BullMQ, DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';

export async function checkStatuses(job: Job<BullMQ.System.CheckStatuses>): Promise<unknown> {
  const organizations = await prisma.organizations.findMany({
    where: {
      OR: [
        {
          UseDefaultBuildEngine: null
        },
        {
          UseDefaultBuildEngine: false
        }
      ]
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
  job.updateProgress(10);
  // remove statuses that do not correspond to organizations
  const removed = await DatabaseWrites.systemStatuses.deleteMany({
    where: {
      BuildEngineUrl: {
        notIn: organizations.map((o) => o.BuildEngineUrl)
      },
      BuildEngineApiAccessToken: {
        notIn: organizations.map((o) => o.BuildEngineApiAccessToken)
      }
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
  const filteredOrgs = organizations.filter(
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
    (
      await prisma.systemStatuses.findMany()
    ).map(async (s) => {
      const res = await BuildEngine.Requests.systemCheck({
        type: 'provided',
        url: s.BuildEngineUrl,
        token: s.BuildEngineApiAccessToken
      });
      await DatabaseWrites.systemStatuses.update({
        where: {
          Id: s.Id
        },
        data: {
          SystemAvailable: res.status === 200
        }
      });
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
