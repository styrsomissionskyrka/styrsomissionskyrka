import {
  BaseControl,
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
import { useInstanceId } from '@wordpress/compose';
import { PluginSidebar } from '@wordpress/edit-post';
import { Fragment, useState } from 'react';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export const Plugin: React.FC<{ name: string; icon: Dashicon.Icon }> = ({ name, icon }) => {
  let [products, setProducts] = useState<Product[]>([{ id: '0', name: 'New price', description: '', price: 0 }]);

  function updateProduct<Key extends keyof Product>(id: Product['id'], key: Key, value: Product[Key]) {
    setProducts((products) => {
      return products.map((product) => {
        if (product.id === id) {
          return { ...product, [key]: value };
        }

        return product;
      });
    });
  }

  return (
    <PluginSidebar name={name} title="Edit prices" icon={icon}>
      <Flex direction="column" gap={4} style={{ padding: 12, marginBlockEnd: 12 }}>
        <FlexItem>
          Below you can edit and add new prices. E.g. if there should be a different/special price for students or
          similar.
        </FlexItem>
        <FlexItem>
          <Button
            variant="secondary"
            onClick={() => {
              setProducts(
                products.concat({ id: products.length.toString(), name: 'New price', description: '', price: 0 }),
              );
            }}
          >
            Add {products.length < 1 ? 'first' : 'new'} price
          </Button>
        </FlexItem>
      </Flex>

      <Panel>
        {products.map((product) => (
          <PanelBody
            key={product.id}
            title={
              (
                <Fragment>
                  {product.name}{' '}
                  <span style={{ fontWeight: 400, marginLeft: 4 }}> ({formatPrice(product.price)} kr)</span>
                </Fragment>
              ) as unknown as string
            }
            initialOpen={true}
          >
            <TextControl
              label="Name"
              value={product.name}
              onChange={(value) => updateProduct(product.id, 'name', value)}
            />
            <TextareaControl
              label="Description"
              value={product.description}
              onChange={(value) => updateProduct(product.id, 'description', value)}
            />
            <PriceControl
              label="Price"
              value={product.price}
              onChange={(value) => updateProduct(product.id, 'price', Number(value))}
            />
            <Flex justify="flex-end">
              <ButtonGroup>
                <Button variant="secondary" isSmall>
                  Save changes
                </Button>
                <Button
                  variant="secondary"
                  isDestructive
                  isSmall
                  onClick={() => setProducts(products.filter((p) => p.id !== product.id))}
                >
                  Remove price
                </Button>
              </ButtonGroup>
            </Flex>
          </PanelBody>
        ))}
      </Panel>
    </PluginSidebar>
  );
};

type PriceControlProps = {
  label: React.ReactNode;
  value: number;
  help?: React.ReactNode;
  onChange: (value: number) => void;
};

const PriceControl: React.FC<PriceControlProps> = ({ label, value, help, onChange }) => {
  let [proxyValue, setProxyValue] = useState(formatPrice(value));

  let instanceId = useInstanceId(PriceControl);
  let id = `inspector-text-control-${instanceId}`;

  let handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    let value = event.target.value;
    setProxyValue(value);
  };

  let handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    let cleanValue = event.target.value.replace(/\s/g, '').replace(/,/g, '.').split('.').slice(0, 2).join('.');
    let next = Number(cleanValue);

    if (Number.isNaN(next)) {
      setProxyValue(formatPrice(value));
    } else {
      setProxyValue(formatPrice(amountToCents(next)));
      onChange(amountToCents(next));
    }
  };

  return (
    <BaseControl label={label} id={id} help={help}>
      <input
        className="components-text-control__input"
        type="text"
        inputMode="numeric"
        id={id}
        value={proxyValue}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-describedby={help != null ? id + '__help' : undefined}
      />
    </BaseControl>
  );
};

function formatPrice(price: number) {
  return centsToAmount(price).toFixed(2);
}

function centsToAmount(cents: number) {
  return Number((cents / 100).toFixed(2));
}

function amountToCents(price: number) {
  return Math.floor(price * 100);
}
