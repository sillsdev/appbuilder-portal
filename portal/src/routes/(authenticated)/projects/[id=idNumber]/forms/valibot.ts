import * as v from 'valibot';
import { idSchema } from '$lib/valibot';

export const addReviewerSchema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  language: v.string()
});

export type ReviewerSchema = typeof addReviewerSchema;

export const addAuthorSchema = v.object({
  author: idSchema
});

export type AuthorSchema = typeof addAuthorSchema;
