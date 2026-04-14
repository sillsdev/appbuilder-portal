import type { Job } from 'bullmq';
import { BuildEngine } from '../../build-engine-api';
import { BullMQ, getQueues } from '../../bullmq';
import { DatabaseReads, DatabaseWrites } from '../../database';
import { activeSystems } from '$lib/organizations/server';

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
