// file initialized by the Paraglide-SvelteKit CLI - Feel free to edit it
import { createI18n } from '@inlang/paraglide-sveltekit';
import * as runtime from '$lib/paraglide/runtime.js';
import * as m from "./paraglide/messages";

export const i18n = createI18n(runtime);

type ValidKey<T extends object> = {
  [K in keyof T]: T[K] extends () => void ? K : never;
}[keyof T];
export type ValidI13nKey = ValidKey<typeof m>;