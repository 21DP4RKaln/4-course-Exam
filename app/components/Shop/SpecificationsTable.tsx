import React from 'react';
import { ChevronDown } from 'lucide-react';

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
  // Group specifications into logical categories
  const groupSpecifications = () => {
    const groups: Record<string, Record<string, string>> = {
      'Manufacturer': {},
      'General': {},
      'Performance': {},
      'Technical': {},
      'Physical': {},
      'Features': {},
      'Other': {}
    };
    
    // Mapping of spec keys to their respective groups
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
    
    // Place each specification in the appropriate group
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
      
      // If not matched to a specific group, put in General
      if (!placed) {
        groups['Other'][key] = value;
      }
    });
    
    // Filter out empty groups
    const filteredGroups: Record<string, Record<string, string>> = {};
    Object.entries(groups).forEach(([groupName, specs]) => {
      if (Object.keys(specs).length > 0) {
        filteredGroups[groupName] = specs;
      }
    });
    
    return filteredGroups;
  };
  
  const groupedSpecs = groupSpecifications();
  
  // Format the specification key for display
  const formatSpecKey = (key: string): string => {
    // Convert camelCase or snake_case to spaces
    const spaced = key
      .replace(/([A-Z])/g, ' $1') // camelCase to spaces
      .replace(/_/g, ' '); // snake_case to spaces
    
    // Capitalize first letter of each word
    return spaced
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  return (
    <div className="specs-container">
      <button
        onClick={toggleExpand}
        className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 mb-3"
      >
        <span className="font-medium text-gray-800 dark:text-gray-200">
          Specifications
        </span>
        <ChevronDown 
          size={20} 
          className={`text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isExpanded && (
        <div className="space-y-6 mt-4">
          {Object.entries(groupedSpecs).map(([groupName, specs]) => (
            <div key={groupName} className="specs-group">
              <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {groupName}
              </h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(specs).map(([key, value]) => (
                      <tr key={key}>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 w-1/3">
                          {formatSpecKey(key)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
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
      )}
    </div>
  );
}