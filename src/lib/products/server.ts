import { SpanStatusCode, trace } from '@opentelemetry/api';
import * as v from 'valibot';
import { isLocale } from '$lib/google-play/paraglide/runtime';
import { getBasicVariant } from '$lib/ldml';
import { ProductTransitionType, WorkflowType } from '$lib/prisma';
import { BullMQ, getQueues } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { Workflow } from '$lib/server/workflow';
import { WorkflowAction, WorkflowState } from '$lib/workflowTypes';
import { ProductActionType, getFileInfo } from '.';

const tracer = trace.getTracer('LibProducts');

export async function doProductAction(
  productId: string,
  action: ProductActionType,
  userId: number,
  comment?: string,
  isAutomatic = false,
  softwareUpdateId?: number
) {
  return tracer.startActiveSpan('doProductAction', async (span) => {
    try {
      const product = await DatabaseReads.products.findUnique({
        where: {
          Id: productId
        },
        select: {
          Id: true,
          ProjectId: true,
          ProductDefinition: {
            select: {
              RebuildWorkflow: {
                select: {
                  Type: true,
                  ProductType: true,
                  WorkflowOptions: true
                }
              },
              RepublishWorkflow: {
                select: {
                  Type: true,
                  ProductType: true,
                  WorkflowOptions: true
                }
              }
            }
          },
          WorkflowInstance: {
            select: {
              WorkflowDefinition: {
                select: { Type: true }
              },
              State: true
            }
          }
        }
      });

      if (product) {
        switch (action) {
          case ProductActionType.Rebuild:
          case ProductActionType.Republish: {
            const flowType = action === 'rebuild' ? 'RebuildWorkflow' : 'RepublishWorkflow';
            if (product.ProductDefinition[flowType] && !product.WorkflowInstance) {
              await Workflow.create(
                productId,
                {
                  productType: product.ProductDefinition[flowType].ProductType,
                  options: new Set(product.ProductDefinition[flowType].WorkflowOptions),
                  workflowType: product.ProductDefinition[flowType].Type,
                  isAutomatic
                },
                userId,
                comment,
                softwareUpdateId
              );
            }
            break;
          }
          case ProductActionType.CancelWorkflow:
            if (
              product.WorkflowInstance?.WorkflowDefinition &&
              product.WorkflowInstance.WorkflowDefinition.Type !== WorkflowType.Startup
            ) {
              await getQueues().UserTasks.add(
                `Delete UserTasks for canceled workflow (product #${productId})`,
                {
                  type: BullMQ.JobType.UserTasks_Workflow,
                  scope: 'Product',
                  productId,
                  operation: {
                    type: BullMQ.UserTasks.OpType.Delete
                  }
                }
              );
              await DatabaseWrites.productTransitions.create({
                data: {
                  ProductId: productId,
                  // This is how S1 does it. May want to change later
                  AllowedUserNames: '',
                  DateTransition: new Date(),
                  Comment: comment,
                  TransitionType: ProductTransitionType.CancelWorkflow,
                  WorkflowType: product.WorkflowInstance.WorkflowDefinition.Type,
                  UserId: userId
                }
              });
              await DatabaseWrites.productTransitions.deleteMany(
                {
                  where: {
                    ProductId: productId,
                    DateTransition: null,
                    UserId: null
                  }
                },
                (await DatabaseReads.products.findUnique({
                  where: { Id: productId },
                  select: { ProjectId: true }
                }))!.ProjectId
              );
              await DatabaseWrites.workflowInstances.delete(
                productId,
                product.ProjectId,
                WorkflowState.Terminated
              );
            }
            break;
          case ProductActionType.StopBuild:
          case ProductActionType.StopPublish:
            if (
              product.WorkflowInstance?.State === WorkflowState.Product_Build ||
              product.WorkflowInstance?.State === WorkflowState.Product_Publish
            ) {
              const flow = await Workflow.restore(product.Id);
              flow?.send({ type: WorkflowAction.Cancel, userId });
            }
        }
      }
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (e as Error).message
      });
      throw e;
    } finally {
      span.end();
    }
  });
}

type ArtifactFrom = { package: string } | { productId: string };

/**
 * Get the most recent published file of specified type associated with this product
 * @param from package/productId
 * @param type ProductArtifact type to be returned
 */
export async function getPublishedFile(from: ArtifactFrom, type: string) {
  const publications = await DatabaseReads.productPublications.findMany({
    where: {
      ProductId: 'productId' in from ? from.productId : undefined,
      Package: 'package' in from ? from.package : undefined,
      Success: true
    },
    select: {
      ProductBuild: {
        select: {
          ProductArtifacts: {
            where: {
              ArtifactType: type
            },
            select: {
              ProductId: true,
              ArtifactType: true,
              Url: true,
              ContentType: true
            }
          }
        }
      }
    },
    orderBy: {
      DateCreated: 'desc'
    }
  });
  for (const publication of publications) {
    if (!publication.ProductBuild.ProductArtifacts.length) {
      continue;
    }
    return publication.ProductBuild.ProductArtifacts[0];
  }

  // Return null if product has not been successfully published
  return null;
}

/**
 * Normalize an RGB hex color string to a length of 6+ with no leading #.
 * eg. fb9 => f0b090
 */
function normalizeColorString(color: string = '#1c3258') {
  const c = color.replaceAll('#', '');
  return c.length < 6 ? `${c[0]}0${c[1]}0${c[2]}0` : c.substring(0, 6);
}

const manifestSchema = v.pipe(
  v.string(),
  // make sure it is valid JSON
  v.rawTransform(({ dataset, addIssue, NEVER }) => {
    try {
      return JSON.parse(dataset.value || '{}');
    } catch (e) {
      addIssue({
        message: e instanceof Error ? e.message : String(e),
        path: [
          {
            type: 'unknown',
            origin: 'value',
            input: dataset.value,
            key: 'root',
            value: dataset.value
          }
        ]
      });
      return NEVER;
    }
  }),
  v.object({
    url: v.string(),
    icon: v.string(),
    color: v.pipe(
      v.string(),
      v.transform((s) => {
        const colors = s.trim().split('\n');
        return {
          light: normalizeColorString(colors[0]),
          dark: normalizeColorString(colors.at(-1))
        };
      })
    ),
    'default-language': v.string(),
    'download-apk-strings': v.record(v.string(), v.string()),
    languages: v.array(v.string()),
    files: v.array(v.string())
  })
);
type Manifest = v.InferOutput<typeof manifestSchema>;

export async function getFileFromManifest(
  language: string,
  file: string,
  manifest: Manifest,
  baseUrl: URL
) {
  try {
    const path = manifest.files.find(
      (s) => s === `${language}/${file}` || s === `${getBasicVariant(language)}/${file}`
    );
    const res = path ? await fetch(new URL(path, baseUrl)) : null;
    return res?.ok ? (await res.text()).trim() : '';
  } catch {
    return '';
  }
}

export async function getLatestManifest(from: ArtifactFrom) {
  const artifact = await getPublishedFile(from, 'play-listing-manifest');

  if (!artifact?.Url) return null;

  // Get the size of the apk
  const apkArtifact = await getPublishedFile(from, 'apk');
  if (!apkArtifact?.Url) return null;
  const { fileSize: apkSize } = await getFileInfo(apkArtifact.Url);

  // Get the contents of the manifest.json
  const manifestJson = await fetch(artifact.Url).then((r) => r.text());

  const manifest = await v
    .safeParseAsync(manifestSchema, manifestJson)
    .then((m) => (m.success ? m.output : null));

  if (!manifest) return null;

  // The bucket in the URL stored in the manifest can change over time. The URL from
  // the artifact query is updated when buckets change.  Update the hostname stored
  // in the manifest file based on the hostname from the artifact query.
  const baseUrl = new URL(manifest.url);
  baseUrl.host = new URL(artifact.Url).host;

  try {
    const iconURL = new URL(manifest.icon, baseUrl);
    // Empty manifest.icon before fetching so unreachable icons use the fallback.
    manifest.icon = '';

    const iconCheck = await fetch(iconURL, { method: 'HEAD' });
    if (iconCheck.ok) {
      manifest.icon = iconURL.href;
    }
  } catch {
    // Empty manifest.icon means callers should use their fallback icon.
  }

  return { manifest, baseUrl, productId: artifact.ProductId, apkSize };
}

export function resolveManifestLanguage(target: string, manifest: Manifest) {
  const found =
    manifest.languages.find(
      (l) =>
        l === target ||
        l === getBasicVariant(target) ||
        getBasicVariant(l) === getBasicVariant(target)
    ) || manifest['default-language'];
  if (isLocale(found)) {
    return found;
  } else {
    throw new Error(`Could not resolve language ${target} from package ${manifest.url}`);
  }
}

export async function translateManifest<File extends string>(
  fetchedManifest: NonNullable<Awaited<ReturnType<typeof getLatestManifest>>>,
  target: string,
  includeFiles: File[]
) {
  const { manifest, baseUrl, productId, apkSize } = fetchedManifest;

  const language = resolveManifestLanguage(target, manifest);

  return {
    id: productId,
    link: `/api/products/${productId}/files/published/apk`,
    size: apkSize,
    icon: manifest.icon,
    color: manifest.color,
    downloadTitle:
      manifest['download-apk-strings'][language] ||
      manifest['download-apk-strings'][getBasicVariant(language)],
    language,
    languages: manifest.languages,
    ...(Object.fromEntries(
      await Promise.all(
        includeFiles.map(async (f) => [
          f,
          await getFileFromManifest(language, f, manifest, baseUrl)
        ])
      )
    ) as Record<File, string>)
  };
}

export async function getArtifactHeaders(product_id: string, type: string) {
  const productArtifact = await getPublishedFile({ productId: product_id }, type);
  if (!productArtifact?.Url) return null;

  const { lastModified, fileSize, contentType } = await getFileInfo(productArtifact.Url);

  const headers: { 'Last-Modified': string; 'Content-Length'?: string; 'Content-Type'?: string } = {
    'Last-Modified': lastModified
  };

  if (fileSize) {
    headers['Content-Length'] = fileSize;
  }

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  return { product: productArtifact, headers };
}
