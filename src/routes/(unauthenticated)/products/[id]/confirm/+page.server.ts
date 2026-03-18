import { error, fail } from '@sveltejs/kit';
import { randomInt } from 'crypto';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import type { AppInfo, ArtifactRef, PlayListingManifest } from '$lib/products/UDMtypes';
import { getPublishedFile } from '$lib/products/server';

import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { sendEmail } from '$lib/server/email-service/EmailClient';

const sendCodeSchema = v.object({
  email: v.pipe(v.string(), v.email('Please enter a valid email address.'))
});

const verifyCodeSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  code: v.pipe(v.string(), v.length(6, 'Code must be 6 digits.'))
});

function resolveIconUrl(
  icon: string | null | undefined,
  manifestUrl: string | undefined,
  artifactUrlString: string
) {
  if (!icon) return null;
  const artifactUrl = new URL(artifactUrlString);
  const baseUrl = manifestUrl ? new URL(manifestUrl, artifactUrl) : artifactUrl;

  try {
    const iconUrl = new URL(icon, baseUrl);
    iconUrl.host = artifactUrl.host;
    iconUrl.protocol = artifactUrl.protocol;
    return iconUrl.toString();
  } catch {
    return null;
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
      },
      PackageName: true
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
    themeColor: null,
    shortDesc: '',
    longDesc: ''
  };

  const manifestArtifact =
    (await getPublishedFile(product.Id, 'play-listing-manifest')) ??
    (await getLatestBuiltFile(product.Id, 'play-listing-manifest'));

  const sendCodeForm = await superValidate({ email }, valibot(sendCodeSchema));
  const verifyCodeForm = await superValidate({ email }, valibot(verifyCodeSchema));

  if (!manifestArtifact?.Url) return { email, app, sendCodeForm, verifyCodeForm };

  let manifest: PlayListingManifest | null = null;
  try {
    manifest = (await fetch(manifestArtifact.Url).then((res) => res.json())) as PlayListingManifest;
  } catch {
    manifest = null;
  }

  if (manifest) {
    app.icon = resolveIconUrl(manifest.icon, manifest?.url, manifestArtifact.Url);
    app.themeColor = manifest.color || null;
  }

  return { email, app, sendCodeForm, verifyCodeForm };
};

export const actions: Actions = {
  sendCode: async ({ request, locals, params }) => {
    locals.security.requireNothing();
    const form = await superValidate(request, valibot(sendCodeSchema));

    if (!form.valid) {
      return fail(400, { form });
    }
    const normalizedEmail = form.data.email.trim().toLowerCase();

    // 1. Generate a random 6-digit code
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    try {
      // 2. Save to DB (Upsert pattern)
      await DatabaseWrites.productUserChanges.updateMany({
        where: {
          Email: normalizedEmail,
          ProductId: params.id,
          DateConfirmed: null,
          DateExpires: {
            gt: new Date()
          }
        },
        data: {
          DateUpdated: new Date(),
          DateExpires: new Date() // expire existing codes immediately
        }
      });

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
        '<p>Your verification code is: <strong>' + code + '</strong></p>'
      );

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[UDM TEST] Verification code for ${normalizedEmail} (product ${params.id}): ${code}`
        );
      }

      return message(form, { step: 'verify', email: normalizedEmail });
    } catch (e) {
      return message(form, { error: 'Failed to send code. Please try again.' }, { status: 500 });
    }
  },

  verifyCode: async ({ request, locals, params }) => {
    locals.security.requireNothing();
    const form = await superValidate(request, valibot(verifyCodeSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const normalizedEmail = form.data.email.trim().toLowerCase();
    const normalizedCode = form.data.code.trim();

    try {
      // 1. Fetch record from DB
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
      if (!userChange)
        return message(form, { error: 'No code sent to this email.' }, { status: 400 });
      if (new Date() > userChange.DateExpires)
        return message(form, { error: 'Code expired.' }, { status: 400 });

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
        return message(form, { error: 'Invalid code.', step: 'verify' }, { status: 400 });
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

      return message(form, { verified: true });
    } catch {
      return message(
        form,
        { error: 'Invalid code. Please check your email and try again.' },
        { status: 500 }
      );
    }
  }
};
