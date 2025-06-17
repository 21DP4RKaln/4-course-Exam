// Utility functions for the configurator

/**
 * Extract wattage from a PSU name string
 */
export function extractWattage(name: string): number {
  const match = name.match(/(\d+)\s*w/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0;
}

/**
 * Calculate recommended PSU wattage based on power consumption
 */
export function getRecommendedPsuWattage(
  totalPowerConsumption: number
): string {
  if (totalPowerConsumption === 0) return 'N/A';
  if (totalPowerConsumption <= 300) return '450W';
  if (totalPowerConsumption <= 400) return '550W';
  if (totalPowerConsumption <= 500) return '650W';
  if (totalPowerConsumption <= 650) return '750W';
  if (totalPowerConsumption <= 800) return '850W';
  return '1000W+';
}

/**
 * Format price with currency
 */
export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}
