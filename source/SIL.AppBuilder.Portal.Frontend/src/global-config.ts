import { getToken } from '@lib/auth0';
import { getCurrentOrganizationId } from '@lib/current-organization';

import { api, isDevelopment } from '@env';

// DWKit does not allow customization of their network requests.
// so we need to configure globally.
//
// NOTE: given the state of the source code, it _may_ not
//       be worth the time to fix up all of their behemoth components
$.ajaxSetup({
  beforeSend(xhr, options) {
    const token = getToken();
    const orgId = getCurrentOrganizationId();

    let protocol = '';

    if (isDevelopment) {
      protocol = 'http://';
    }

    options.url = `${protocol}${api.host}${options.url}`;

    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Organization', `${orgId}`);
  }
});
