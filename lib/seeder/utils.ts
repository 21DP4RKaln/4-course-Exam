export function priceWith99(min: number, max: number): number {
  const base = Math.random() * (max - min) + min;
  const integer = Math.floor(base);
  return parseFloat((integer + 0.99).toFixed(2));
}
