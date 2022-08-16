import * as z from 'zod';

export type EditorRetreatMeta = z.infer<typeof EditorRetreatMetaSchema>;
export const EditorRetreatMetaSchema = z.object({
  stripe_product_ids: z.array(z.string()),
});

export type EditorRetreat = z.infer<typeof EditorRetreatSchema>;
export const EditorRetreatSchema = z.object({
  id: z.number(),
  date: z.string(),
  date_gmt: z.string(),
  guid: z.object({ rendered: z.string(), raw: z.string() }),
  modified: z.string(),
  modified_gmt: z.string(),
  password: z.string(),
  slug: z.string(),
  status: z.string(),
  type: z.string(),
  link: z.string(),
  title: z.string(),
  content: z.string(),
  featured_media: z.number(),
  template: z.string(),
  meta: EditorRetreatMetaSchema,
  permalink_template: z.string(),
  generated_slug: z.string(),
});
