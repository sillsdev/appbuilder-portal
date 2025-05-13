import { Job } from 'bullmq';
import { BullMQ, prisma } from 'sil.appbuilder.portal.common';
import { sendEmail } from '../email-service/EmailClient.js';
import {
  addProperties,
  NotificationEmailTemplate,
  OrganizationMembershipInviteTemplate,
  ReviewProductTemplate
} from '../email-service/EmailTemplates.js';
import { translate } from '../email-service/locales/locale.js';
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
  // We have no localization information because the user isn't created yet
  // Assume English
  await sendEmail(
    [{ email: job.data.email, name: job.data.email }],
    translate('en', 'organizationMembershipInvites.subject'),
    addProperties(OrganizationMembershipInviteTemplate, {
      OrganizationName: inviteInformation.Organization.Name,
      InvitedBy: inviteInformation.User.Name,
      InviteUrl: job.data.inviteLink
    })
  );
  return {};
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
  for (const r of product.Project.Reviewers) {
    sendEmail(
      [{ email: r.Email, name: r.Name }],
      translate('en', 'notifications.subject.' + messageId, properties),
      addProperties(NotificationEmailTemplate, {
        Message: translate('en', 'notifications.body.' + messageId, {
          ...properties,
          reviewerName: r.Name
        })
      })
    );
  }
  sendEmail(
    [{ email: product.Project.Owner.Email, name: product.Project.Owner.Name }],
    translate('en', 'notifications.subject.' + messageId, properties),
    addProperties(ReviewProductTemplate, {
      Message: translate('en', 'notifications.body.' + messageId, {
        ...properties,
        ownerName: product.Project.Owner.Name,
        reviewerNames: product.Project.Reviewers.map((r) => r.Name + ' (' + r.Email + ')').join(
          ', '
        ),
        reviewerName: 'REVIEWER_NAME'
      })
    })
  );

  return {};
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
    const message = translate(user.Locale, 'notifications.body.userTaskAdded', properties);
    allEmails.push(
      sendEmail(
        [{ email, name: user.Name }],
        translate(user.Locale, 'notifications.subject.userTaskAdded', properties),
        addProperties(NotificationEmailTemplate, {
          Message: message
        })
      )
    );
  }
  await Promise.all(allEmails);
  return {};
}
