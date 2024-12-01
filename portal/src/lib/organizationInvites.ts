import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';

export async function checkInviteErrors(inviteToken?: string | null) {
  try {
    const invite = await prisma.organizationMembershipInvites.findFirst({
      where: {
        Token: inviteToken + ''
      }
    });
    if (!invite || !inviteToken) return { error: 'not found' };
    if (invite.Redeemed) return { error: 'redeemed' };
    if (!invite.Expires || invite.Expires < new Date()) return { error: 'expired' };
    return {};
  } catch (e) {
    return { error: 'not found' };
  }
}
export async function acceptOrganizationInvite(userId: number, inviteToken: string) {
  const invite = await prisma.organizationMembershipInvites.findFirst({
    where: {
      Token: inviteToken
    },
    include: {
      Organization: true
    }
  });

  if (!invite || !inviteToken) return { error: 'not found' };
  if (invite.Redeemed) return { error: 'redeemed' };
  if (!invite.Expires || invite.Expires < new Date()) return { error: 'expired' };

  if (await DatabaseWrites.organizationMemberships.acceptOrganizationInvite(userId, inviteToken))
    return {
      joinedOrganization: {
        logoUrl: invite.Organization.LogoUrl,
        name: invite.Organization.Name
      }
    };
  return { error: 'failed' };
}
