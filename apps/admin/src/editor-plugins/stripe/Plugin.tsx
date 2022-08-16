import {
  Button,
  ButtonGroup,
  Dashicon,
  Flex,
  FlexItem,
  Panel,
  PanelBody,
  TextControl,
  TextareaControl,
} from '@wordpress/components';
import { PluginSidebar } from '@wordpress/edit-post';
import equal from 'fast-deep-equal';
import React, { Fragment, useState } from 'react';

import { PriceControl } from '../../components';
import { useRetreatAttribute } from '../../hooks/use-post-attribute';
import { QueryClientProvider, useMutation, useQuery, useQueryClient } from '../../react-query';
import { Product } from '../../types/stripe';
import { formatPrice } from '../../utils/prices';
import { createProduct, getProducts, toggleProduct, updateProduct } from './api';

export const Plugin: React.FC<{ name: string; icon: Dashicon.Icon }> = ({ name, icon }) => {
  let [postId] = useRetreatAttribute('id');

  return (
    <PluginSidebar name={name} title="Edit prices" icon={icon}>
      <QueryClientProvider>
        <Sidebar postId={postId} />
      </QueryClientProvider>
    </PluginSidebar>
  );
};

const Sidebar: React.FC<{ postId: number }> = ({ postId }) => {
  let [addNew, setAddNew] = useState(false);

  let client = useQueryClient();
  let products = useQuery(['products', postId], () => getProducts(postId));

  let createProductMutation = useMutation((data: FormProduct) => createProduct(postId, data), {
    onSuccess(data) {
      client.setQueryData(['products', postId], [...(products.data ?? []), data]);
    },
    onSettled() {
      setAddNew(false);
    },
  });

  let updateProductMutation = useMutation(
    ({ productId, data }: { productId: string; data: FormProduct }) => updateProduct(postId, productId, data),
    {
      onSuccess(data) {
        client.setQueryData(
          ['products', postId],
          (products.data ?? []).map((product) => (product.id === data.id ? data : product)),
        );
      },
    },
  );

  let activateProductMutation = useMutation(
    ({ productId, activate }: { productId: string; activate: boolean }) => toggleProduct(postId, productId, activate),
    {
      onSuccess(data) {
        client.setQueryData(
          ['products', postId],
          (products.data ?? []).map((product) => (product.id === data.id ? data : product)),
        );
      },
    },
  );

  return (
    <Fragment>
      <SectionHead hasMoreThanOne={(products.data?.length ?? 0) > 0} addProduct={() => setAddNew(true)} />

      {addNew ? (
        <Panel>
          <ProductSection
            onSubmit={(product) => createProductMutation.mutate(product)}
            onCancelNew={() => setAddNew(false)}
          />
        </Panel>
      ) : null}

      {products.status === 'success' && (
        <Panel>
          {products.data.map((product) => (
            <ProductSection
              key={product.id}
              product={product}
              onSubmit={(data) => {
                updateProductMutation.mutate({ productId: product.id, data });
              }}
              onActivate={(id) => {
                activateProductMutation.mutate({ productId: id, activate: true });
              }}
              onDeactivate={(id) => {
                activateProductMutation.mutate({ productId: id, activate: false });
              }}
            />
          ))}
        </Panel>
      )}
    </Fragment>
  );
};

const SectionHead: React.FC<{ addProduct: () => void; hasMoreThanOne: boolean }> = ({ addProduct, hasMoreThanOne }) => {
  return (
    <Flex direction="column" gap={4} style={{ padding: 12, marginBlockEnd: 12 }}>
      <FlexItem>
        Below you can edit and add new prices. E.g. if there should be a different/special price for students or
        similar.
      </FlexItem>
      <FlexItem>
        <Button variant="secondary" onClick={addProduct}>
          Add {hasMoreThanOne ? 'new' : 'first'} price
        </Button>
      </FlexItem>
    </Flex>
  );
};

type FormProduct = {
  name: string;
  description: string;
  price: number;
};

const ProductSection: React.FC<{
  product?: Product;
  onSubmit: (product: FormProduct) => void;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onCancelNew?: () => void;
}> = ({ product, onSubmit, onActivate, onDeactivate, onCancelNew }) => {
  let initial = {
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.default_price?.unit_amount ?? 0,
  } as FormProduct;

  let [proxy, setProxy] = useState(initial);
  let isDirty = product == null || !equal(proxy, initial);

  function updateProduct<Key extends keyof FormProduct>(key: Key, value: FormProduct[Key]) {
    setProxy((product) => ({ ...product, [key]: value }));
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onSubmit(proxy);
  };

  return (
    <PanelBody
      title={
        (
          <Fragment>
            <span style={{ color: product != null && !product.active ? 'gray' : undefined }}>
              {product?.name ?? 'New product'}
            </span>
            <span style={{ fontWeight: 400, marginLeft: 4, flex: 'none' }}>
              ({formatPrice(proxy.price, product?.default_price?.currency ?? 'sek')}){' '}
              <span style={{ color: 'red' }}>{isDirty ? '*' : ''}</span>
            </span>
          </Fragment>
        ) as unknown as string
      }
      initialOpen={product != null}
    >
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="product_id" value={product?.id ?? '__new__'} />
        <TextControl
          name="product_name"
          label="Name"
          value={proxy.name}
          onChange={(value) => updateProduct('name', value)}
        />

        <TextareaControl
          name="product_description"
          label="Description"
          value={proxy.description}
          onChange={(value) => updateProduct('description', value)}
        />

        <PriceControl
          name="product_price"
          label="Price"
          value={proxy.price}
          currency={product?.default_price?.currency ?? 'sek'}
          onChange={(value) => updateProduct('price', Number(value))}
        />

        <Flex justify="flex-end">
          <ButtonGroup>
            <Button type="submit" variant="secondary" isSmall disabled={!isDirty}>
              Save changes
            </Button>
            {product != null && product.active && onDeactivate != null ? (
              <Button type="button" variant="secondary" isDestructive isSmall onClick={() => onDeactivate(product.id)}>
                Deactive price
              </Button>
            ) : null}

            {product != null && !product.active && onActivate != null ? (
              <Button type="button" variant="secondary" isSmall onClick={() => onActivate(product.id)}>
                Activate price
              </Button>
            ) : null}

            {product == null && onCancelNew != null ? (
              <Button type="button" variant="secondary" isDestructive isSmall onClick={() => onCancelNew()}>
                Cancel
              </Button>
            ) : null}
          </ButtonGroup>
        </Flex>
      </form>
    </PanelBody>
  );
};
