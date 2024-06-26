import { browser } from "$app/environment";
import { writable } from "svelte/store";

// We store the selectedOrganization in both sessionStorage and localStorage. This is to support
// multiple concurrent sessions so that they can have different selected orgs. If one is reloaded
// it will keep its selected org but the most recently selected will also persist across sessions. 

// (authenticated)/layout.svelte will overwrite a 0 value with the first organization the user has access to

export const selectedOrganizationId = writable(0);
console.log(selectedOrganizationId);
if(browser) {
  selectedOrganizationId.set(parseInt(sessionStorage.getItem("selectedOrganization") ?? localStorage.getItem("selectedOrganization") ?? "0") || 0);
  selectedOrganizationId.subscribe(v => [sessionStorage, localStorage].forEach(s => s.setItem("selectedOrganization", v + "")));
}
console.log(selectedOrganizationId);
