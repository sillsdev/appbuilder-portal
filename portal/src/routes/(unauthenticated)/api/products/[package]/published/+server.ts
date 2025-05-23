import { getFileInfo } from '$lib/products';
import { getPublishedFile } from '$lib/products/server';
import { prisma } from 'sil.appbuilder.portal.common';

type ManifestResponse = {
  url: string;
  icon: string;
  color: string;
  ['default-language']: string;
  ['download-apk-strings']: Record<string, string>;
  languages: string[];
  files: string[];
};

export async function GET({ params }) {
  // Get the play-listing/manifest.json artifact
  const manifestArtifact = await getPublishedAppDetails(params.package);
  if (!manifestArtifact?.Url) {
    return new Response(null, { status: 404 });
  }
  // Get the size of the apk
  const apkArtifact = await getPublishedFile(manifestArtifact.ProductId, 'apk');
  if (!apkArtifact?.Url) {
    return new Response(null, { status: 404 });
  }
  const { fileSize } = await getFileInfo(apkArtifact.Url);

  // Get the contents of the manifest.json
  const manifestJson = await fetch(manifestArtifact.Url).then((r) => r.text());

  const manifest = JSON.parse(manifestJson) as ManifestResponse;

  // The bucket in the URL stored in the manifest can change over time. The URL from
  // the artifact query is updated when buckets change.  Update the hostname stored
  // in the manifest file based on the hostname from the artifact query.
  const manifestUri = new URL(manifestArtifact.Url);
  const url = new URL(manifest.url);
  url.host = manifestUri.host;
  const titles = {} as Record<string, string>;
  const descriptions = {} as Record<string, string>;
  for (const language of manifest.languages) {
    let title = '';
    const titleSearch = new RegExp(`${language}/title.txt`);
    const titlePath = manifest.files.find((s) => titleSearch.test(s));

    if (titlePath) {
      title = await fetch(url + titlePath).then((r) => r.text());
    }
    titles[language] = title.trim();

    let description = '';
    const descriptionSearch = new RegExp(`${language}/short_description.txt`);
    const descriptionPath = manifest.files.find((s) => descriptionSearch.test(s));
    if (descriptionPath) {
      description = await fetch(url + descriptionPath).then((r) => r.text());
    }
    descriptions[language] = description;
  }

  const details = {
    ...manifest,
    id: manifestArtifact.ProductId,
    link: `/api/products/${manifestArtifact.ProductId}/files/published/apk`,
    size: fileSize,
    icon: url + manifest.icon,
    titles: titles,
    descriptions: descriptions,
    url: undefined,
    files: undefined
  };

  return new Response(JSON.stringify(details), { status: 200 });
}

async function getPublishedAppDetails(Package: string) {
  const publications = await prisma.productPublications.findMany({
    where: {
      Package,
      Success: true
    },
    include: {
      ProductBuild: {
        include: {
          ProductArtifacts: {
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
      Id: 'asc'
    }
  });

  for (const publication of publications) {
    if (!publication.ProductBuild.ProductArtifacts.length) {
      continue;
    }
    const artifact = publication.ProductBuild.ProductArtifacts.find(
      (pa) => pa.ArtifactType === 'play-listing-manifest'
    );

    if (artifact) {
      return artifact;
    }
  }

  return null;
}
