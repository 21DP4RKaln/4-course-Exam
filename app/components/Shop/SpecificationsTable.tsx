import React from 'react';

interface SpecificationsTableProps {
  specifications: Record<string, string>;
  isExpanded: boolean;
  toggleExpand: () => void;
}

export default function SpecificationsTable({ 
  specifications,
  isExpanded,
  toggleExpand
}: SpecificationsTableProps) {  
  console.log('SpecificationsTable received:', {
    type: typeof specifications,
    isNull: specifications === null,
    isUndefined: specifications === undefined,
    keysCount: specifications && typeof specifications === 'object' ? Object.keys(specifications).length : 0,
    firstKeys: specifications && typeof specifications === 'object' ? Object.keys(specifications).slice(0, 5) : []
  });
  
  const groupSpecifications = () => {
    // Safety check - if specifications is null, undefined or not an object, return empty groups
    if (!specifications || typeof specifications !== 'object') {
      console.error('Invalid specifications passed to SpecificationsTable:', specifications);
      return {};
    }
    
    const groups: Record<string, Record<string, string>> = {
      'Manufacturer': {},
      'General': {},
      'Performance': {},
      'Technical': {},
      'Physical': {},
      'Features': {},
      'Other': {}
    };

    const groupMapping: Record<string, string> = {
      // Manufacturer info
      'brand': 'Manufacturer',
      'manufacturer': 'Manufacturer',
      'model': 'Manufacturer',
      
      // General info
      'type': 'General',
      'series': 'General',
      'color': 'General',
      
      // Performance specs
      'speed': 'Performance',
      'frequency': 'Performance',
      'clock': 'Performance',
      'performance': 'Performance',
      'dpi': 'Performance',
      'polling': 'Performance',
      'refresh': 'Performance',
      'response': 'Performance',
      
      // Technical specs
      'interface': 'Technical',
      'socket': 'Technical',
      'chipset': 'Technical',
      'cores': 'Technical',
      'threads': 'Technical',
      'sensor': 'Technical',
      'switches': 'Technical',
      'capacity': 'Technical',
      'memory': 'Technical',
      'memoryType': 'Technical',
      'storage': 'Technical',
      
      // Physical attributes
      'dimensions': 'Physical',
      'size': 'Physical',
      'weight': 'Physical',
      'materials': 'Physical',
      
      // Features
      'features': 'Features',
      'rgb': 'Features',
      'lighting': 'Features',
      'wireless': 'Features',
      'connectivity': 'Features',
      'connection': 'Features',
      'resolution': 'Features',
      'backlight': 'Features'
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

  const formatSpecKey = (key: string): string => {
    const spaced = key
      .replace(/([A-Z])/g, ' $1') 
      .replace(/_/g, ' '); 

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
            {groupName}
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
                      {value}
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