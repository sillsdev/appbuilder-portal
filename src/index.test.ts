import { describe, expect, it } from 'vitest';
import { RoleId } from '$lib/prisma';
import { BullMQ, getQueues } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';

describe('sum test', () => {
  it('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
  });
});

describe('email test', () => {
  it('send test email', async () => {
    const email = 'success@simulator.amazonses.com';
    const inviteToken = await DatabaseWrites.organizationMemberships.createOrganizationInvite(
      email,
      1, // SIL International
      (await DatabaseReads.users.findFirstOrThrow({ where: { Email: 'ci@scriptoria.io' } })).Id, // Scriptoria CI
      [RoleId.Author],
      [1] // LSDEV
    );
    const job = await getQueues().Emails.add('Send test email', {
      type: BullMQ.JobType.Email_InviteUser,
      email,
      inviteToken,
      inviteLink: 'test'
    });
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    const res = await getQueues().Emails.getJob(job.id!);
    expect(res?.returnvalue?.email).toBeTruthy();
  }, 11_000);
});
