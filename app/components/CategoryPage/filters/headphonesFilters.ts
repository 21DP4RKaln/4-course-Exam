import { Component } from '../types';
import { FilterGroup, FilterOption } from '../filterInterfaces';
import { extractBrandOptions } from './brandUtils';

export const createHeadphonesFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const brandMap = extractBrandOptions(components);
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(
    ([value, label]) => ({
      id: `manufacturer=${value}`,
      name: label,
    })
  );

  return [
    {
      title: 'Brand',
      type: 'manufacturer',
      options: brandOptions,
    },
  ];
};
