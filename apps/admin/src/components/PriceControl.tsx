import { BaseControl } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { useState } from 'react';

import { amountToCents, formatPrice } from '../utils/prices';

export type PriceControlProps = {
  label: React.ReactNode;
  value: number;
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
  help,
  onChange,
  ...inputProps
}) => {
  let [proxyValue, setProxyValue] = useState(formatPrice(value));

  let instanceId = useInstanceId(PriceControl);
  let id = `inspector-text-control-${instanceId}`;

  let refreshValue = (value: string) => {
    let cleanValue = value.replace(/\s/g, '').replace(/,/g, '.').split('.').slice(0, 2).join('.');
    let next = Number(cleanValue);

    if (Number.isNaN(next)) {
      setProxyValue(proxyValue);
    } else {
      setProxyValue(formatPrice(amountToCents(next)));
      onChange(amountToCents(next));
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

  return (
    <BaseControl label={label} id={id} help={help}>
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
      />
    </BaseControl>
  );
};
