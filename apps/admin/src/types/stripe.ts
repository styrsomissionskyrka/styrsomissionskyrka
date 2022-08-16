import * as z from 'zod';

export type Price = z.infer<typeof PriceSchema>;

export const PriceSchema = z.object({
  id: z.string(),
  object: z.literal('price'),
  active: z.boolean(),
  billing_scheme: z.string(),
  created: z.number(),
  currency: z.string(),
  custom_unit_amount: z.unknown().nullable(),
  livemode: z.boolean(),
  lookup_key: z.string().nullable(),
  metadata: z.unknown(),
  nickname: z.string().nullable(),
  product: z.string(),
  recurring: z.unknown().nullable(),
  tax_behavior: z.unknown(),
  tiers_mode: z.unknown(),
  transform_quantity: z.unknown(),
  type: z.union([z.literal('one_time'), z.literal('recurring')]),
  unit_amount: z.number(),
  unit_amount_decimal: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  object: z.literal('product'),
  active: z.boolean(),
  attributes: z.unknown(),
  created: z.number(),
  default_price: PriceSchema.nullable(),
  description: z.string().nullable(),
  images: z.array(z.string()),
  livemode: z.boolean(),
  metadata: z.unknown(),
  name: z.string(),
  type: z.string(),
  updated: z.number(),
  url: z.string().nullable(),
});
