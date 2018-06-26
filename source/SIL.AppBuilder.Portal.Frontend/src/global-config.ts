import { getToken } from '@lib/auth0';

// DWKit does not allow customization of their network requests.
// so we need to configure globally.
//
// NOTE: given the state of the source code, it _may_ not
//       be worth the time to fix up all of their behemoth components
$.ajaxSetup({
  beforeSend(xhr) {
    const token = getToken();

    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  }
});
