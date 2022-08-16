import apiFetch from '@wordpress/api-fetch';

import { ProductSchema } from '../../types/stripe';

export async function getProducts(postId: number) {
  let response = await apiFetch({
    path: `/retreat-pricing/v1/${postId}/products`,
  });
  return ProductSchema.array().parse(response);
}

export async function createProduct(
  postId: number,
  product: {
    name: string;
    description: string;
    price: number;
  },
) {
  let response = await apiFetch({
    path: `/retreat-pricing/v1/${postId}/products`,
    method: 'POST',
    data: product,
  });

  return ProductSchema.parse(response);
}

export async function updateProduct(
  postId: number,
  productId: string,
  product: {
    name: string;
    description: string;
    price: number;
  },
) {
  let response = await apiFetch({
    path: `/retreat-pricing/v1/${postId}/products/${productId}`,
    method: 'POST',
    data: product,
  });

  return ProductSchema.parse(response);
}
