import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { localizeHref, localizeUrl } from '$lib/paraglide/runtime';
import { orgActive } from '$lib/stores';

export function selectGotoFromOrg(
  select: boolean,
  target: string,
  alt: string,
  opts: Parameters<typeof goto>[1] = {}
) {
  if (!browser) return false;
  const selected = select ? target : alt;
  if (page.url.pathname !== localizeHref(selected)) {
    goto(localizeUrl(selected), opts);
    return true;
  } else {
    return false;
  }
}

export function setOrgFromParams(currentOrg: number | null, idParam?: string) {
  if (!browser) return;
  if (idParam && currentOrg !== parseInt(idParam)) {
    orgActive.set(parseInt(idParam));
  } else if (currentOrg && !idParam) {
    orgActive.set(null);
  }
}
