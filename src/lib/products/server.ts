import * as v from 'valibot';
import { getBasicVariant } from '$lib/ldml';
import { ProductTransitionType, WorkflowType } from '$lib/prisma';
import { BullMQ, getQueues } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { Workflow } from '$lib/server/workflow';
import { WorkflowAction, WorkflowState } from '$lib/workflowTypes';
import { ProductActionType, getFileInfo } from '.';

export async function doProductAction(
  productId: string,
  action: ProductActionType,
  userId: number
) {
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
              workflowType: product.ProductDefinition[flowType].Type
            },
            userId
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
              TransitionType: ProductTransitionType.CancelWorkflow,
              WorkflowType: product.WorkflowInstance.WorkflowDefinition.Type,
              UserId: userId
            }
          });
          await DatabaseWrites.workflowInstances.delete(productId, product.ProjectId);
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
              Url: true
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
    color: v.string(),
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

  return { manifest, baseUrl, productId: artifact.ProductId, apkSize };
}

export function resolveManifestLanguage(target: string, manifest: Manifest) {
  return (
    manifest.languages.find(
      (l) =>
        l === target ||
        l === getBasicVariant(target) ||
        getBasicVariant(l) === getBasicVariant(target)
    ) || manifest['default-language']
  );
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
    icon: new URL(manifest.icon, baseUrl).href,
    // use primary color if match not found
    color: manifest.color.match(/^(#[0-9a-f]{6})/i)?.at(1) ?? '#1c3258',
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

  const { lastModified, fileSize } = await getFileInfo(productArtifact.Url);

  const headers: { 'Last-Modified': string; 'Content-Length'?: string } = {
    'Last-Modified': lastModified
  };

  if (fileSize) {
    headers['Content-Length'] = fileSize;
  }

  return { product: productArtifact, headers };
}
