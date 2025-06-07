import { Component } from '../types';
import { FilterGroup, FilterOption } from '../filterInterfaces';
import { extractBrandOptions } from './brandUtils';

export const createMouseFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const brandMap = extractBrandOptions(components);
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(
    ([value]) => ({ id: `manufacturer=${value}`, name: value })
  );

  // Sensor type options from specifications
  const sensorSet = new Set<string>();
  components.forEach(c => {
    const val = c.specifications['sensor'] || c.specifications['sensorType'];
    if (val) sensorSet.add(val);
  });
  const sensorOptions: FilterOption[] = Array.from(sensorSet).map(v => ({
    id: `sensor=${v}`,
    name: v,
  }));

  // Connectivity options from specifications
  const connSet = new Set<string>();
  components.forEach(c => {
    const val = c.specifications['connection'] || c.specifications['interface'];
    if (val) connSet.add(val);
  });
  const connOptions: FilterOption[] = Array.from(connSet).map(v => ({
    id: `connection=${v}`,
    name: v,
  }));

  return [
    { title: 'Brand', type: 'manufacturer', options: brandOptions },
    { title: 'Sensor', type: 'sensor', options: sensorOptions },
    { title: 'Connection', type: 'connection', options: connOptions },
  ];
};
