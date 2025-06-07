import React from 'react';
import { useTranslations } from 'next-intl';

interface SpecificationsTableProps {
  specifications: Record<string, string>;
  isExpanded: boolean;
  toggleExpand: () => void;
}

export default function SpecificationsTable({
  specifications,
  isExpanded,
  toggleExpand,
}: SpecificationsTableProps) {
  const t = useTranslations('product');
  console.log('SpecificationsTable received:', {
    type: typeof specifications,
    isNull: specifications === null,
    isUndefined: specifications === undefined,
    keysCount:
      specifications && typeof specifications === 'object'
        ? Object.keys(specifications).length
        : 0,
    firstKeys:
      specifications && typeof specifications === 'object'
        ? Object.keys(specifications).slice(0, 5)
        : [],
  });

  const groupSpecifications = () => {
    if (!specifications || typeof specifications !== 'object') {
      console.error(
        'Invalid specifications passed to SpecificationsTable:',
        specifications
      );
      return {};
    }

    const groups: Record<string, Record<string, string>> = {
      Manufacturer: {},
      General: {},
      Performance: {},
      Technical: {},
      Physical: {},
      Features: {},
      Other: {},
    };

    const groupMapping: Record<string, string> = {
      brand: 'Manufacturer',
      manufacturer: 'Manufacturer',
      model: 'Manufacturer',

      type: 'General',
      series: 'General',
      color: 'General',

      speed: 'Performance',
      frequency: 'Performance',
      clock: 'Performance',
      performance: 'Performance',
      dpi: 'Performance',
      polling: 'Performance',
      refresh: 'Performance',
      response: 'Performance',

      interface: 'Technical',
      socket: 'Technical',
      chipset: 'Technical',
      cores: 'Technical',
      threads: 'Technical',
      sensor: 'Technical',
      switches: 'Technical',
      capacity: 'Technical',
      memory: 'Technical',
      memoryType: 'Technical',
      storage: 'Technical',

      dimensions: 'Physical',
      size: 'Physical',
      weight: 'Physical',
      materials: 'Physical',

      features: 'Features',
      rgb: 'Features',
      lighting: 'Features',
      wireless: 'Features',
      connectivity: 'Features',
      connection: 'Features',
      resolution: 'Features',
      backlight: 'Features',
    };

    Object.entries(specifications).forEach(([key, value]) => {
      let placed = false;
      const keyLower = key.toLowerCase();

      for (const [matchKey, groupName] of Object.entries(groupMapping)) {
        if (keyLower.includes(matchKey)) {
          groups[groupName][key] = value;
          placed = true;
          break;
        }
      }

      if (!placed) {
        groups['Other'][key] = value;
      }
    });

    const filteredGroups: Record<string, Record<string, string>> = {};
    Object.entries(groups).forEach(([groupName, specs]) => {
      if (Object.keys(specs).length > 0) {
        filteredGroups[groupName] = specs;
      }
    });

    return filteredGroups;
  };

  const groupedSpecs = groupSpecifications();

  const formatSpecValue = (value: string): string => {
    const valueLower = value.toLowerCase().trim();

    // Translate Yes/No values
    if (valueLower === 'yes' || valueLower === 'jā' || valueLower === 'да') {
      return t('specificationValues.yes');
    }
    if (
      valueLower === 'no' ||
      valueLower === 'nē' ||
      valueLower === 'не' ||
      valueLower === 'нет'
    ) {
      return t('specificationValues.no');
    }

    // Return original value if no translation needed
    return value;
  };

  const formatSpecKey = (key: string): string => {
    // Check if we have a translation for this key
    const keyLower = key.toLowerCase();
    const translationKey = `specificationKeys.${keyLower}`;
    const translated = t(translationKey);

    // If translation exists and is not the fallback, use it
    if (translated && translated !== translationKey) {
      return translated;
    }

    // Check for common key patterns that might have translations
    const mappingKeys = [
      'brand',
      'manufacturer',
      'model',
      'subtype',
      'type',
      'series',
      'color',
      'speed',
      'frequency',
      'clock',
      'performance',
      'dpi',
      'polling',
      'refresh',
      'response',
      'interface',
      'socket',
      'chipset',
      'cores',
      'threads',
      'sensor',
      'switches',
      'capacity',
      'memory',
      'memorytype',
      'storage',
      'dimensions',
      'size',
      'weight',
      'materials',
      'features',
      'rgb',
      'lighting',
      'wireless',
      'connectivity',
      'connection',
      'resolution',
      'backlight',
      'multithreading',
    ];

    for (const mappingKey of mappingKeys) {
      if (keyLower.includes(mappingKey)) {
        const mappingTranslation = t(`specificationKeys.${mappingKey}`);
        if (
          mappingTranslation &&
          mappingTranslation !== `specificationKeys.${mappingKey}`
        ) {
          return mappingTranslation;
        }
      }
    }

    // Fallback to formatted version
    const spaced = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
    return spaced
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedSpecs).map(([groupName, specs]) => (
        <div key={groupName} className="specs-group">
          <h4 className="text-md font-semibold text-stone-950 dark:text-neutral-200 mb-2">
            {t(`specificationGroups.${groupName}`)}
          </h4>
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {Object.entries(specs).map(([key, value]) => (
                  <tr key={key}>
                    <td className="py-3 px-4 text-sm font-medium text-neutral-900 dark:text-white bg-neutral-50 dark:bg-stone-950 w-1/3">
                      {formatSpecKey(key)}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                      {formatSpecValue(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
