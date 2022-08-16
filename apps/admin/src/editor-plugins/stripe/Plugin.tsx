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
import { Fragment, useState } from 'react';

import { PriceControl } from '../../components';
import { formatPrice } from '../../utils/prices';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export const Plugin: React.FC<{ name: string; icon: Dashicon.Icon }> = ({ name, icon }) => {
  let [products, setProducts] = useState<Product[]>([{ id: '0', name: 'New price', description: '', price: 0 }]);

  return (
    <PluginSidebar name={name} title="Edit prices" icon={icon}>
      <SectionHead
        hasMoreThanOne={products.length > 0}
        addProduct={() => {
          setProducts(
            products.concat({ id: products.length.toString(), name: 'New price', description: '', price: 0 }),
          );
        }}
      />

      <Panel>
        {products.map((product) => (
          <ProductSection
            key={product.id}
            product={product}
            onRemove={(id) => {
              setProducts(products.filter((previous) => previous.id !== id));
            }}
            onSave={(next) => {
              setProducts(products.map((previous) => (previous.id === next.id ? next : previous)));
            }}
          />
        ))}
      </Panel>
    </PluginSidebar>
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

const ProductSection: React.FC<{
  product: Product;
  onSave: (next: Product) => void;
  onRemove: (id: string) => void;
}> = ({ product, onSave, onRemove }) => {
  let [proxy, setProxy] = useState(product);
  let areEqual = deepEqual(proxy, product);

  function updateProduct<Key extends keyof Product>(key: Key, value: Product[Key]) {
    setProxy((product) => ({ ...product, [key]: value }));
  }

  return (
    <PanelBody
      key={proxy.id}
      title={
        (
          <Fragment>
            {product.name} <span style={{ fontWeight: 400, marginLeft: 4 }}> ({formatPrice(proxy.price)} kr)</span>{' '}
            <span style={{ color: 'red' }}>{areEqual ? '' : '*'}</span>
          </Fragment>
        ) as unknown as string
      }
      initialOpen={true}
    >
      <form>
        <input type="hidden" name="product_id" value={proxy.id} />
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
          onChange={(value) => updateProduct('price', Number(value))}
        />

        <Flex justify="flex-end">
          <ButtonGroup>
            <Button type="submit" variant="secondary" isSmall onClick={() => onSave(proxy)} disabled={areEqual}>
              Save changes
            </Button>
            <Button type="button" variant="secondary" isDestructive isSmall onClick={() => onRemove(proxy.id)}>
              Remove price
            </Button>
          </ButtonGroup>
        </Flex>
      </form>
    </PanelBody>
  );
};

function deepEqual(a: Product, b: Product): a is typeof b {
  let keys = Object.keys(a) as (keyof Product)[];
  for (let key of keys) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}
