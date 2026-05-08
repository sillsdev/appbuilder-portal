import * as v from 'valibot';
import { locales } from '$lib/paraglide/runtime';
import { idSchema } from '$lib/valibot';

export const addReviewerSchema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  language: v.pipe(v.string(), v.picklist(locales))
});

export type ReviewerSchema = typeof addReviewerSchema;

export const addAuthorSchema = v.object({
  author: idSchema
});

export type AuthorSchema = typeof addAuthorSchema;
