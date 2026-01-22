import { DatabaseReads, DatabaseWrites } from './server/database';

export async function checkInviteErrors(inviteToken?: string | null, userId?: number) {
  try {
    const invite = await DatabaseReads.organizationMembershipInvites.findFirst({
      where: {
        Token: inviteToken + ''
      }
    });
    // This is really just for devs since most people don't have two accounts
    if (!invite || !inviteToken) return { error: 'not found' };
    if (invite.InvitedById === userId) return { error: 'self-invite' };
    if (invite.Redeemed) return { error: 'redeemed' };
    if (!invite.Expires || invite.Expires < new Date()) return { error: 'expired' };
    return {};
  } catch {
    return { error: 'not found' };
  }
}
export async function acceptOrganizationInvite(userId: number, inviteToken: string) {
  const invite = await DatabaseReads.organizationMembershipInvites.findFirst({
    where: {
      Token: inviteToken
    },
    include: {
      Organization: true
    }
  });
  // Redundant check for invite validity in case checkInviteErrors was not called
  if (
    !invite ||
    invite.Redeemed ||
    !invite.Expires ||
    invite.Expires < new Date() ||
    invite.InvitedById === userId
  )
    return { error: 'failed' };
  if (await DatabaseWrites.users.acceptInvite(userId, inviteToken))
    return {
      joinedOrganization: {
        logoUrl: invite.Organization.LogoUrl,
        name: invite.Organization.Name
      }
    };
  return { error: 'failed' };
}
