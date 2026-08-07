import { SpanStatusCode, trace } from '@opentelemetry/api';
import { error, isRedirect, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getGPFallbackIcon } from '$lib/google-play';
import { deLocalizeUrl, localizeUrl } from '$lib/google-play/paraglide/runtime';
import {
  getLatestManifest,
  resolveManifestLanguage,
  translateManifest
} from '$lib/products/server';
import { DatabaseReads } from '$lib/server/database';

const tracer = trace.getTracer('UDMRequests');

export const load: LayoutServerLoad = async ({ locals, params, url }) => {
  locals.security.requireNothing();
  return tracer.startActiveSpan('UDM - Load Manifest', async (span) => {
    try {
      let fetchedManifest: Awaited<ReturnType<typeof getLatestManifest>> = null;
      try {
        fetchedManifest = await getLatestManifest({ productId: params.productId });
      } catch (e) {
        span.recordException(e as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (e as Error).message
        });
        throw error(404);
      }

      if (!fetchedManifest) throw error(404);

      const manifestLanguage = resolveManifestLanguage(locals.locale, fetchedManifest.manifest);
      if (locals.locale !== manifestLanguage) {
        throw redirect(302, localizeUrl(deLocalizeUrl(url), { locale: manifestLanguage }));
      }

      const translatedManifest = await translateManifest(fetchedManifest, manifestLanguage, [
        'title.txt',
        'short_description.txt',
        'full_description.txt',
        'description.txt'
      ]);

      const product = await DatabaseReads.products.findUnique({
        where: { Id: fetchedManifest.productId },
        select: {
          Id: true,
          Project: {
            select: {
              Name: true,
              TypeId: true
            }
          },
          Store: {
            select: {
              GooglePlayTitle: true
            }
          }
        }
      });

      if (!product) throw error(404);

      const developer = product.Store.GooglePlayTitle?.trim() || 'Unknown developer';
      const longDesc =
        translatedManifest['full_description.txt'] || translatedManifest['description.txt'] || '';
      const fallbackIcon = getGPFallbackIcon(product.Project.TypeId);

      return {
        app: {
          id: product.Id,
          icon: translatedManifest.icon || fallbackIcon,
          name: translatedManifest['title.txt'] || product.Project.Name || 'App',
          developer,
          language: translatedManifest.language,
          languages: translatedManifest.languages,
          themeColor: translatedManifest.color,
          shortDesc: translatedManifest['short_description.txt'] || '',
          longDesc
        }
      };
    } catch (e) {
      if (!isRedirect(e)) {
        span.recordException(e as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (e as Error).message
        });
      }
      throw e;
    } finally {
      span.end();
    }
  });
};
