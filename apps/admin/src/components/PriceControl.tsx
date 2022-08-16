import { BaseControl, Flex } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { useState } from 'react';

import { formatPrice, formattedCurrency, formattedNumberToCents } from '../utils/prices';

export type PriceControlProps = {
  label: React.ReactNode;
  value: number;
  currency?: string;
  help?: React.ReactNode;
  onChange: (value: number) => void;
};

type InputProps = Omit<
  JSX.IntrinsicElements['input'],
  | keyof PriceControlProps
  | 'key'
  | 'ref'
  | 'className'
  | 'id'
  | 'type'
  | 'inputMode'
  | 'className'
  | 'onBlur'
  | 'onKeyDown'
  | 'aria-describedby'
>;

export const PriceControl: React.FC<PriceControlProps & InputProps> = ({
  label,
  value,
  currency,
  help,
  onChange,
  ...inputProps
}) => {
  let [proxyValue, setProxyValue] = useState(formatPrice(value));

  let instanceId = useInstanceId(PriceControl);
  let id = `inspector-text-control-${instanceId}`;

  let refreshValue = (value: string) => {
    let next = formattedNumberToCents(value);

    if (Number.isNaN(next)) {
      setProxyValue(proxyValue);
    } else {
      setProxyValue(formatPrice(next));
      onChange(next);
    }
  };

  let handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    let value = event.currentTarget.value;
    setProxyValue(value);
  };

  let handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    refreshValue(event.currentTarget.value);
  };

  let handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      refreshValue(event.currentTarget.value);
    }
  };

  let curr = formattedCurrency(currency ?? 'sek');
  let currencyElement = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: 'auto',
        flex: 'none',
        border: '1px solid rgb(117, 117, 117)',
        borderLeft: curr.location === 'end' ? 'none' : '1px solid rgb(117, 117, 117)',
        borderRight: curr.location === 'start' ? 'none' : '1px solid rgb(117, 117, 117)',
        borderEndEndRadius: curr.location === 'end' ? 2 : 0,
        borderStartEndRadius: curr.location === 'end' ? 2 : 0,
        borderEndStartRadius: curr.location === 'start' ? 2 : 0,
        borderStartStartRadius: curr.location === 'start' ? 2 : 0,
        padding: '0 4px',
      }}
    >
      {curr.value}
    </div>
  );

  return (
    <BaseControl label={label} id={id} help={help}>
      <Flex gap={0} align="stretch">
        {curr.location === 'start' ? currencyElement : null}
        <input
          {...inputProps}
          id={id}
          type="text"
          inputMode="numeric"
          className="components-text-control__input"
          value={proxyValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-describedby={help != null ? id + '__help' : undefined}
          style={{
            marginLeft: 0,
            marginRight: 0,
            borderEndStartRadius: curr.location === 'end' ? 2 : 0,
            borderStartStartRadius: curr.location === 'end' ? 2 : 0,
            borderEndEndRadius: curr.location === 'start' ? 2 : 0,
            borderStartEndRadius: curr.location === 'start' ? 2 : 0,
          }}
        />
        {curr.location === 'end' ? currencyElement : null}
      </Flex>
    </BaseControl>
  );
};
