export function _formatPrice(price: number) {
  return centsToAmount(price).toFixed(2);
}

export function centsToAmount(cents: number) {
  return Number((cents / 100).toFixed(2));
}

export function amountToCents(price: number) {
  return Math.floor(price * 100);
}

export function formatPrice(price: number, currency?: string) {
  let instance = new Intl.NumberFormat(window.site_locale, {
    style: 'currency',
    currency: currency ?? 'USD',
  });

  if (currency == null) {
    let parts = instance.formatToParts(centsToAmount(price));
    return parts.reduce((acc, part) => {
      if (part.type === 'currency') return acc;
      return acc + part.value;
    }, '');
  }

  return instance.format(centsToAmount(price));
}

export function formattedNumberToCents(formattedNumber: string) {
  let config = getConfig();
  let number = Number(formattedNumber.replaceAll(config.group, '').replaceAll(config.decimal, '.').replaceAll(' ', ''));
  return amountToCents(number);
}

export function formattedCurrency(currency: string) {
  let parts = new Intl.NumberFormat(window.site_locale, { style: 'currency', currency }).formatToParts(0);
  let index = parts.findIndex((part) => part.type === 'currency');
  let formatted = parts[index]?.value ?? currency;

  return { value: formatted, location: index === 0 ? 'start' : 'end' };
}

type NumberFormatParts = { decimal: string; group: string };
let config: NumberFormatParts | null = null;
function getConfig() {
  if (config == null) {
    let instance = new Intl.NumberFormat(window.site_locale, { style: 'currency', currency: 'USD' });
    let parts = instance.formatToParts(100_000.5);
    let conf = {} as NumberFormatParts;

    for (let part of parts) {
      if (part.type === 'decimal') {
        conf.decimal = part.value;
      }

      if (part.type === 'group') {
        conf.group = part.value;
      }
    }

    config = conf;
  }

  return config;
}
