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

export async function getTranslatedManifest<File extends string>(
  from: ArtifactFrom,
  language: string,
  includeFiles: File[]
) {
  const manifestArtifact = await getPublishedFile(from, 'play-listing-manifest');

  if (!manifestArtifact?.Url) return null;

  // Get the size of the apk
  const apkArtifact = await getPublishedFile(from, 'apk');
  if (!apkArtifact?.Url) return null;
  const { fileSize } = await getFileInfo(apkArtifact.Url);

  // Get the contents of the manifest.json
  const manifestJson = await fetch(manifestArtifact.Url).then((r) => r.text());

  const manifest = await v
    .safeParseAsync(manifestSchema, manifestJson)
    .then((m) => (m.success ? m.output : null));

  if (!manifest) return null;

  language =
    manifest.languages.find((l) => l === language || l === getBasicVariant(language)) ||
    manifest['default-language'];

  language = language.match(/([a-z0-9-]+)/i)?.at(1) ?? '';

  if (!language) return null;

  const basicVariant = getBasicVariant(language);

  // The bucket in the URL stored in the manifest can change over time. The URL from
  // the artifact query is updated when buckets change.  Update the hostname stored
  // in the manifest file based on the hostname from the artifact query.
  const manifestUri = new URL(manifestArtifact.Url);
  const url = new URL(manifest.url);
  url.host = manifestUri.host;
  const files = Object.fromEntries(
    await Promise.all(
      includeFiles.map(async (f) => {
        const re = new RegExp(`${language}/${f}`);
        const basic = new RegExp(`${basicVariant}/${f}`);
        const path = manifest.files.find((s) => re.test(s) || basic.test(s));
        return [
          f,
          path
            ? await fetch(url + path)
                .then((r) => r.text())
                .then((t) => t.trim())
            : ''
        ];
      })
    )
  ) as Record<File, string>;

  return {
    id: manifestArtifact.ProductId,
    link: `/api/products/${manifestArtifact.ProductId}/files/published/apk`,
    size: fileSize,
    icon: url + manifest.icon,
    // use primary color if match not found
    color: manifest.color.match(/^(#[0-9a-f]{6})/i)?.at(1) ?? '#1c3258',
    downloadTitle:
      manifest['download-apk-strings'][language] || manifest['download-apk-strings'][basicVariant],
    language,
    languages: manifest.languages,
    ...files
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
