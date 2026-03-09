import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Mock types for your DB and Email providers
import { DatabaseReads } from '$lib/server/database';
import { DatabaseWrites } from '$lib/server/database';
import { sendEmail } from '$lib/server/email-service/EmailClient';
import { EmailLayoutTemplate, addProperties } from '$lib/server/email-service/EmailTemplates';
import { getPublishedFile } from '$lib/products/server';
// import { sendEmail } from '$lib/server/email';

type PlayListingManifest = {
  url: string;
  icon: string;
  color: string;
};

type AppInfo = {
  id: string;
  icon: string | null;
  name: string;
  developer: string;
  themeColor: string | null;
};

type ArtifactRef = {
  Url: string | null;
};

function resolveIconUrl(icon: string | null | undefined, baseUrl: URL, artifactUrl: URL) {
  if (!icon) return null;
  try {
    const iconUrl = new URL(icon);
    iconUrl.host = artifactUrl.host;
    iconUrl.protocol = artifactUrl.protocol;
    return iconUrl.toString();
  } catch {
    return new URL(icon, baseUrl).toString();
  }
}

async function getLatestBuiltFile(
  productId: string,
  artifactType: string
): Promise<ArtifactRef | null> {
  const builds = await DatabaseReads.productBuilds.findMany({
    where: { ProductId: productId },
    include: {
      ProductArtifacts: {
        select: {
          ArtifactType: true,
          Url: true
        }
      }
    },
    orderBy: { BuildEngineBuildId: 'desc' }
  });

  for (const build of builds) {
    const artifact = build.ProductArtifacts.find((a) => a.ArtifactType === artifactType);
    if (artifact?.Url) return artifact;
  }

  return null;
}

export const load: PageServerLoad = async ({ url, locals, params }) => {
  locals.security.requireNothing();

  const email = url.searchParams.get('email')?.trim().toLowerCase() ?? '';

  const product = await DatabaseReads.products.findUnique({
    where: { Id: params.id },
    select: {
      Id: true,
      Project: {
        select: {
          Name: true,
          Organization: { select: { Name: true } }
        }
      }
    }
  });

  if (!product) throw error(404);

  const developer =
    product.Project.Organization?.Name ?? product.Project.Name ?? 'Unknown developer';

  const app: AppInfo = {
    id: product.Id,
    icon: null,
    name: product.Project.Name ?? 'App',
    developer,
    themeColor: null
  };

  const manifestArtifact =
    (await getPublishedFile(product.Id, 'play-listing-manifest')) ??
    (await getLatestBuiltFile(product.Id, 'play-listing-manifest'));

  if (!manifestArtifact?.Url) return { email, app };

  let manifest: PlayListingManifest | null = null;
  try {
    manifest = (await fetch(manifestArtifact.Url).then((res) => res.json())) as PlayListingManifest;
  } catch {
    manifest = null;
  }

  if (!manifest) return { email, app };

  const artifactUrl = new URL(manifestArtifact.Url);
  let baseUrl: URL | null = null;
  try {
    baseUrl = new URL(manifest.url);
    baseUrl.host = artifactUrl.host;
    baseUrl.protocol = artifactUrl.protocol;
  } catch {
    baseUrl = null;
  }

  if (!baseUrl) return { email, app };

  app.icon = resolveIconUrl(manifest.icon, baseUrl, artifactUrl);
  app.themeColor = manifest.color || null;

  return { email, app };
};

export const actions: Actions = {
  sendCode: async ({ request, locals, params }) => {
    locals.security.requireNothing();
    const data = await request.formData();
    const email = data.get('email');

    if (typeof email !== 'string' || !email) {
      return fail(400, { email, missing: true });
    }
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 2. Save to DB (Upsert pattern)

    await DatabaseWrites.productUserChanges.create({
      data: {
        ProductId: params.id,
        Email: normalizedEmail,
        Change: 'User data deletion request verification',
        DateCreated: new Date(),
        DateUpdated: new Date(),
        ConfirmationCode: code,
        DateExpires: expiresAt,
        DateConfirmed: null
      }
    });

    // 3. Send the email
    await sendEmail(
      [{ email: normalizedEmail, name: normalizedEmail }],
      'Your verification code',
      addProperties(EmailLayoutTemplate, {
        INSERT_SUBJECT: `Your code is: ${code}`,
        INSERT_CONTENT: `Your code is: ${code}`
      })
    );

    console.log(`[UDM TEST] Verification code for ${normalizedEmail} (product ${params.id}): ${code}`);

    return { success: true, email: normalizedEmail, step: 'verify' as const };
  },

  verifyCode: async ({ request, locals, params }) => {
    locals.security.requireNothing();
    const data = await request.formData();
    const email = data.get('email');
    const userCode = data.get('code');

    if (typeof email !== 'string' || typeof userCode !== 'string') {
      return fail(400, { error: 'Invalid submission.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = userCode.trim();

    // 1. Fetch record from DB
    // const record = await db.emailVerifications.findUnique({ where: { email } });
    const userChange = await DatabaseReads.productUserChanges.findFirst({
      where: {
        Email: normalizedEmail,
        ProductId: params.id,
        DateConfirmed: null
      },
      orderBy: {
        DateCreated: 'desc'
      }
    });

    // 2. Validation Checks
    // Do we have a record?
    if (!userChange) return fail(400, { error: 'No code sent to this email.' });
    // Is the record expired?
    if (new Date() > userChange.DateExpires) return fail(400, { error: 'Code expired.' });

    // 3. Compare
    if (userChange.ConfirmationCode !== normalizedCode) {
      // If wrong code, move expiration up by minute to act as attempt counter
      await DatabaseWrites.productUserChanges.update({
        where: {
          Id: userChange.Id
        },
        data: {
          DateExpires: new Date(userChange.DateExpires.getTime() - 1 * 60 * 1000) // 1 minute
        }
      });
      return fail(400, { error: 'Invalid code.', email: normalizedEmail, step: 'verify' as const });
    }

    // 4. Success logic
    await DatabaseWrites.productUserChanges.update({
      where: {
        Id: userChange.Id
      },
      data: {
        DateUpdated: new Date(),
        DateConfirmed: new Date()
      }
    });
    // Store user task since verification successful.

    // possibly delete entry?

    throw redirect(303, '/dashboard');
  }
};
