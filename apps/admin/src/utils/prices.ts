export function formatPrice(price: number) {
  return centsToAmount(price).toFixed(2);
}

export function centsToAmount(cents: number) {
  return Number((cents / 100).toFixed(2));
}

export function amountToCents(price: number) {
  return Math.floor(price * 100);
}
