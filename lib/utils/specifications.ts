/**
 * Helper functions for handling product specifications
 */

/**
 * Parse specifications from various formats into a consistent Record<string, string> format
 * @param specifications The specifications data that could be in various formats
 * @returns A normalized Record<string, string> containing the specifications
 */
export function parseSpecifications(specifications: unknown): Record<string, string> {
  // Initialize empty object for specs
  let specs: Record<string, string> = {};
  
  // Handle different possible formats of specifications
  if (!specifications) {
    return specs;
  }
  
  // Case 1: Specifications is a string (possibly JSON)
  if (typeof specifications === 'string') {
    try {
      const parsed = JSON.parse(specifications);
      if (typeof parsed === 'object' && parsed !== null) {
        // Convert all values to strings to ensure consistency
        Object.entries(parsed).forEach(([key, value]) => {
          specs[key] = String(value);
        });
      }
    } catch (e) {
      console.error('Error parsing specifications JSON string:', e);
      // If it's not valid JSON, just return empty object
    }
  } 
  // Case 2: Specifications is already an object
  else if (typeof specifications === 'object' && specifications !== null) {
    // Convert all values to strings to ensure consistency
    Object.entries(specifications as Record<string, any>).forEach(([key, value]) => {
      specs[key] = String(value);
    });
  }
  
  console.debug('Parsed specifications:', specs);
  return specs;
}

/**
 * Add debug information to specifications object
 * @param specs The specifications object
 * @returns The same object with additional debug information
 */
export function withDebugInfo(specs: Record<string, string>): Record<string, string> {
  if (process.env.NODE_ENV === 'development') {
    return {
      ...specs,
      '_debug_count': String(Object.keys(specs).length),
      '_debug_keys': JSON.stringify(Object.keys(specs)),
      '_debug_timestamp': new Date().toISOString()
    };
  }
  return specs;
}
