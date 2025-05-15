import { Job } from 'bullmq';
import { BullMQ, prisma, Queues } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { JobSchedulerId } from '../../common/bullmq/types.js';
import { notifySuperAdmins, sendEmail } from '../email-service/EmailClient.js';
import {
  addProperties,
  NotificationTemplate,
  NotificationWithLinkTemplate,
  OrganizationInviteRequestTemplate,
  OrganizationMembershipInviteTemplate,
  ProjectImportTemplate,
  ReviewProductTemplate
} from '../email-service/EmailTemplates.js';
import { getOwnerAdminVariantKeys, translate } from '../email-service/locales/locale.js';

export async function inviteUser(job: Job<BullMQ.Email.InviteUser>): Promise<unknown> {
  console.log('Inviting user', job.data.email);
  const inviteInformation = await prisma.organizationMembershipInvites.findFirstOrThrow({
    where: {
      Email: job.data.email,
      Token: job.data.inviteToken
    },
    include: {
      Organization: true,
      User: true
    }
  });
  // If there is a user with the same email, we can localize the email
  // If there is no existing user, we can assume English
  // User locale is actually never set in the db (always NULL) but might be set in the future
  const user = await prisma.users.findFirst({
    where: {
      Email: job.data.email
    }
  });
  const locale = user?.Locale || 'en';
  return {
    email: await sendEmail(
      [{ email: job.data.email, name: job.data.email }],
      translate(locale, 'organizationMembershipInvites.subject', {
        organizationName: inviteInformation.Organization.Name
      }),
      addProperties(OrganizationMembershipInviteTemplate, {
        OrganizationName: inviteInformation.Organization.Name,
        InvitedBy: inviteInformation.User.Name,
        InviteUrl: job.data.inviteLink
      })
    )
  };
}
export async function sendNotificationToReviewers(
  job: Job<BullMQ.Email.SendNotificationToReviewers>
): Promise<unknown> {
  // TODO: This entire process needs testing
  console.log('Sending review notification for product Id', job.data.productId);
  // Get the artifacts
  const product = await prisma.products.findFirstOrThrow({
    where: {
      Id: job.data.productId
    },
    include: {
      Project: {
        include: {
          Organization: true,
          Reviewers: true,
          Owner: true
        }
      },
      ProductArtifacts: true,
      ProductDefinition: true
    }
  });
  const apkUrl = product.ProductArtifacts.find((a) => a.ArtifactType === 'apk')?.Url;
  const pwaUrl = product.ProductArtifacts.find((a) => a.ArtifactType === 'pwa')?.Url;
  const playListingUrl = product.ProductArtifacts.find(
    (a) => a.ArtifactType === 'play-listing'
  )?.Url;
  const assetPreviewUrl = product.ProductArtifacts.find(
    (a) => a.ArtifactType === 'asset-preview'
  )?.Url;
  let messageId = 'reviewProduct';
  if (assetPreviewUrl) messageId = 'reviewAssetPackage';
  else if (pwaUrl) messageId = 'reviewPwaProduct';
  else if (!playListingUrl) messageId = 'reviewProductNoPlayListing';
  if (product.WorkflowComment) messageId += 'WithComment';
  const properties = {
    productName: product.ProductDefinition.Name,
    projectName: product.Project.Name,
    ownerName: product.Project.Owner.Name,
    ownerEmail: product.Project.Owner.Email,
    apkUrl,
    pwaUrl,
    playListingUrl,
    assetPreviewUrl,
    comment: product.WorkflowComment
  };

  return {
    reviewerEmails: await Promise.all(
      product.Project.Reviewers.map((r) =>
        sendEmail(
          [{ email: r.Email, name: r.Name }],
          translate(r.Locale, 'notifications.subject.' + messageId, properties),
          addProperties(NotificationTemplate, {
            Message: translate(r.Locale, 'notifications.body.' + messageId, {
              ...properties,
              reviewerName: r.Name
            })
          })
        )
      )
    ),
    ownerEmail: await sendEmail(
      [{ email: product.Project.Owner.Email, name: product.Project.Owner.Name }],
      translate(product.Project.Owner.Locale, 'notifications.subject.' + messageId, properties),
      addProperties(ReviewProductTemplate, {
        Message: translate(product.Project.Owner.Locale, 'notifications.body.' + messageId, {
          ...properties,
          ownerName: product.Project.Owner.Name,
          reviewerNames: product.Project.Reviewers.map((r) => r.Name + ' (' + r.Email + ')').join(
            ', '
          ),
          reviewerName: 'REVIEWER_NAME'
        })
      })
    )
  };
}
export async function sendBatchUserTaskNotifications(
  job: Job<BullMQ.Email.SendBatchUserTaskNotifications>
): Promise<unknown> {
  const allEmails = [];
  for (const notification of job.data.notifications) {
    const user = await prisma.users.findUniqueOrThrow({
      where: {
        Id: notification.userId
      }
    });
    const email = user.Email;
    const properties = {
      ...notification,
      to: user.Name,
      userId: undefined
    };
    // Fairly certain S1 only uses notifications.notification.* for logging which is weird
    // const message = translate(user.Locale, 'notifications.notification.userTaskAdded', properties);
    //// S1 used to have notifications in the frontend, with emails also being sent,
    //// but that feature was removed a while ago (but the i18n is still present for some reason...)
    const message = translate(user.Locale, 'notifications.body.userTaskAdded', properties);
    allEmails.push(
      sendEmail(
        [{ email, name: user.Name }],
        translate(user.Locale, 'notifications.subject.userTaskAdded', properties),
        addProperties(NotificationTemplate, {
          Message: message
        })
      )
    );
  }
  return { emails: await Promise.all(allEmails) };
}

export async function notifySuperAdminsOfNewOrganizationRequest(
  job: Job<BullMQ.Email.NotifySuperAdminsOfNewOrganizationRequest>
): Promise<unknown> {
  const superAdmins = await prisma.users.findMany({
    where: {
      UserRoles: {
        some: {
          RoleId: RoleId.SuperAdmin
        }
      }
    }
  });
  const properties = {
    Name: job.data.organizationName,
    WebsiteUrl: job.data.url,
    OrgAdminEmail: job.data.email
  };
  return {
    email: await sendEmail(
      superAdmins.map((admin) => ({ email: admin.Email, name: admin.Name })),
      translate('en', 'organizationInvites.subject', properties),
      addProperties(OrganizationInviteRequestTemplate, {
        ...properties
      })
    )
  };
}

export async function notifySuperAdminsOfOfflineSystems(
  job: Job<BullMQ.Email.NotifySuperAdminsOfOfflineSystems>
): Promise<unknown> {
  const statuses = await prisma.systemStatuses.findMany({
    where: {
      SystemAvailable: false
    }
  });
  if (statuses.length === 0) {
    await Queues.Emails.removeJobScheduler(JobSchedulerId.SystemStatusEmail);
    return;
  }
  if (process.env.NODE_ENV === 'development') {
    console.log(
      'Not notifying super admins of offline systems - ',
      statuses.map((s) => s.BuildEngineUrl).join(', ')
    );
    return;
  }
  return await notifySuperAdmins(
    translate('en', 'notifications.subject.buildengineDisconnected', {
      url: statuses.map((s) => s.BuildEngineUrl).join(', ')
    }),
    translate('en', 'notifications.body.buildengineDisconnected', {
      url: statuses.map((s) => s.BuildEngineUrl).join(', '),
      minutes: statuses
        .map((s) => Math.floor((Date.now() - s.DateUpdated.getTime()) / 1000 / 60))
        .join(', ')
    })
  );
}

export async function notifySuperAdminsGeneric(
  job: Job<BullMQ.Email.NotifySuperAdminsGeneric>
): Promise<unknown> {
  return await notifySuperAdmins(
    translate('en', 'notifications.subject.' + job.data.messageKey, job.data.messageProperties),
    translate('en', 'notifications.body.' + job.data.messageKey, job.data.messageProperties)
  );
}

export async function sendNotificationToUser(
  job: Job<BullMQ.Email.SendNotificationToUser>
): Promise<unknown> {
  const user = await prisma.users.findUniqueOrThrow({
    where: {
      Id: job.data.userId
    }
  });
  return await sendEmail(
    [{ email: user.Email, name: user.Name }],
    translate(
      user.Locale,
      'notifications.subject.' + job.data.messageKey,
      job.data.messageProperties
    ),
    addProperties(job.data.link ? NotificationWithLinkTemplate : NotificationTemplate, {
      Message: translate(
        user.Locale,
        'notifications.body.' + job.data.messageKey,
        job.data.messageProperties
      ),
      LinkUrl: job.data.link,
      UrlText: translate(user.Locale, 'notifications.body.log')
    })
  );
}

export async function reportProjectImport(
  job: Job<BullMQ.Email.ProjectImportReport>
): Promise<unknown> {
  // At this point the import is done.
  // We need to match the Projects table to projects listed in the import JSON
  // Each one is either "existing" or "new"
  const projectImport = await prisma.projectImports.findUniqueOrThrow({
    where: {
      Id: job.data.importId
    },
    include: {
      // Schema mistake; should be Owner or User not Users
      Users: true,
      Organizations: true,
      Groups: true,
      ApplicationTypes: true
    }
  });
  const newProjects = await prisma.projects.findMany({
    where: {
      ImportId: job.data.importId
    }
  });
  const importJSON: {
    Projects: {
      Name: string;
      Description: string;
      Language: string;
      IsPublic: boolean;
      AllowDownloads: boolean;
      AutomaticBuilds: boolean;
    }[];
    Products: {
      Name: string;
      Store: string;
    }[];
  } = JSON.parse(projectImport.ImportData);
  const existingProjects = await prisma.projects.findMany({
    where: {
      OrganizationId: projectImport.Organizations.Id,
      Name: {
        in: importJSON.Projects.map((p) => p.Name).filter(
          (p) => !newProjects.find((n) => n.Name === p)
        )
      }
    }
  });
  const reportLines = [
    ...newProjects.map((p) =>
      translate(projectImport.Users.Locale, 'importProject.newProject', {
        projectName: p.Name,
        projectId: '' + p.Id
      })
    ),
    ...existingProjects.map((p) =>
      translate(projectImport.Users.Locale, 'importProject.existingProject', {
        projectName: p.Name,
        projectId: '' + p.Id
      })
    )
  ];
  for (const project of newProjects) {
    const products = await prisma.products.findMany({
      where: {
        ProjectId: project.Id
      },
      include: {
        ProductDefinition: true,
        Store: true
      }
    });
    // It is not possible to have an imported project with existing products
    reportLines.push(
      ...products.map((p) =>
        translate(projectImport.Users.Locale, 'importProject.newProduct', {
          projectId: '' + project.Id,
          projectName: project.Name,
          productDefinitionName: p.ProductDefinition.Name,
          storeName: p.Store.Name,
          storeId: '' + p.StoreId
        })
      )
    );
    // Shouldn't happen, but just in case
    if (importJSON.Products.length > products.length) {
      reportLines.push('Project ' + project.Name + ' did not import all products - please check!');
    }
  }

  const properties = [
    translate(projectImport.Users.Locale, 'importProject.property', {
      name: translate(projectImport.Users.Locale, 'importProject.Owner'),
      value: projectImport.Users.Name
    }),
    translate(projectImport.Users.Locale, 'importProject.property', {
      name: translate(projectImport.Users.Locale, 'importProject.Group'),
      value: projectImport.Groups.Name
    }),
    translate(projectImport.Users.Locale, 'importProject.property', {
      name: translate(projectImport.Users.Locale, 'importProject.Organization'),
      value: projectImport.Organizations.Name
    }),
    translate(projectImport.Users.Locale, 'importProject.property', {
      name: translate(projectImport.Users.Locale, 'importProject.Application Type'),
      value: projectImport.ApplicationTypes.Description
    })
  ];

  const body = addProperties(ProjectImportTemplate, {
    Title: translate(projectImport.Users.Locale, 'importProject.title'),
    PropertiesHeader: translate(projectImport.Users.Locale, 'importProject.propertiesHeader'),
    Properties: '<li>' + properties.join('</li><li>') + '</li>',
    OutputHeader: translate(projectImport.Users.Locale, 'importProject.outputHeader'),
    Output: '<tr><td><p>' + reportLines.join('</p></td></tr><tr><td><p>') + '</p></td></tr>'
  });

  return await sendEmail(
    [{ email: projectImport.Users.Email, name: projectImport.Users.Name }],
    translate(projectImport.Users.Locale, 'importProject.subject'),
    body
  );
}

export async function sendNotificationToOrgAdminsAndOwner(
  job: Job<BullMQ.Email.SendNotificationToOrgAdminsAndOwner>
): Promise<unknown> {
  const project = await prisma.projects.findUniqueOrThrow({
    where: {
      Id: job.data.projectId
    },
    include: {
      Organization: true,
      Owner: true
    }
  });
  const orgAdmins = await prisma.users.findMany({
    where: {
      UserRoles: {
        some: {
          RoleId: RoleId.OrgAdmin,
          OrganizationId: project.OrganizationId
        }
      }
    }
  });
  const owner = await prisma.users.findUniqueOrThrow({
    where: {
      Id: project.OwnerId
    }
  });
  const messageKey = getOwnerAdminVariantKeys(job.data.messageKey);
  const emails = orgAdmins.map((admin) =>
    sendEmail(
      [{ email: admin.Email, name: admin.Name }],
      translate(
        admin.Locale,
        'notifications.subject.' + messageKey.admin,
        job.data.messageProperties
      ),
      addProperties(job.data.link ? NotificationWithLinkTemplate : NotificationTemplate, {
        Message: translate(
          admin.Locale,
          'notifications.body.' + messageKey.admin,
          job.data.messageProperties
        ),
        LinkUrl: job.data.link,
        UrlText: translate(admin.Locale, 'notifications.body.log')
      })
    )
  );
  // The org admin email contains more information than the owner email
  // If the owner is also an org admin, we don't need to send them a second email
  // They receive only the org admin email
  if (!orgAdmins.some((admin) => admin.Id === owner.Id)) {
    emails.push(
      sendEmail(
        [{ email: owner.Email, name: owner.Name }],
        translate(
          owner.Locale,
          'notifications.subject.' + messageKey.owner,
          job.data.messageProperties
        ),
        addProperties(job.data.link ? NotificationWithLinkTemplate : NotificationTemplate, {
          Message: translate(
            owner.Locale,
            'notifications.body.' + messageKey.owner,
            job.data.messageProperties
          ),
          LinkUrl: job.data.link,
          UrlText: translate(owner.Locale, 'notifications.body.log')
        })
      )
    );
  }
  return await Promise.all(emails);
}
