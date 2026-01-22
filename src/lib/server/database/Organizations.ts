import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';

export async function createInvite(
  email: string,
  organizationId: number,
  invitedById: number,
  roles: number[],
  groups: number[]
) {
  // Note: this email is never used except to send the initial email.
  // It sits in the database for reference sake only
  const invite = await prisma.organizationMembershipInvites.create({
    data: {
      InvitedById: invitedById,
      Email: email,
      OrganizationId: organizationId,
      Roles: roles,
      Groups: groups
    }
  });
  return invite.Token;
}

export async function create(data: RequirePrimitive<Prisma.OrganizationsUncheckedCreateInput>) {
  return await prisma.organizations.create({
    data
  });
}

export async function update(
  id: number,
  data: RequirePrimitive<Prisma.OrganizationsUncheckedCreateInput>
) {
  return await prisma.organizations.update({
    where: { Id: id },
    data
  });
}
