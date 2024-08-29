export enum RoleId {
  SuperAdmin = 1,
  OrgAdmin,
  AppBuilder,
  Author
}

export enum ProductTransitionType {
  Activity = 1,
  StartWorkflow,
  EndWorkflow,
  CancelWorkflow,
  ProjectAccess
}

// export async function getOrganizationsForUser(userId: number) {
//   const user = await prisma.users.findUnique({
//     where: {
//       Id: userId
//     },
//     include: { UserRoles: true, Organizations: true }
//   });
//   const organizations = user?.UserRoles.find((roleDef) => roleDef.RoleId === RoleId.SuperAdmin)
//     ? await prisma.organizations.findMany({
//       include: {
//         Owner: true
//       }
//     })
//     : await prisma.organizations.findMany({
//       where: {
//         OrganizationMemberships: {
//           every: {
//             UserId: userId
//           }
//         }
//       },
//       include: {
//         Owner: true
//       }
//     });
//   return organizations;
// }
