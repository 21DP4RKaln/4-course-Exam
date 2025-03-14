'use client';

import { useTranslations } from 'next-intl';

interface Component {
  id: string;
  category: string;
  name: string;
  manufacturer: string;
  price: number;
  specs: Record<string, any>;
  stock: number;
}

interface ComponentSelectorProps {
  components: Component[];
  category: string;
  selectedComponents: Record<string, Component>;
  addComponent: (component: Component) => void;
}

export default function ComponentSelector({
  components,
  category,
  selectedComponents,
  addComponent
}: ComponentSelectorProps) {
  const t = useTranslations('configurator');
  
  const isSelected = (component: Component) => {
    return selectedComponents[component.category]?.id === component.id;
  };

  const formatSpecs = (specs: Record<string, any>) => {
    return Object.entries(specs).map(([key, value]) => {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      return { key: formattedKey, value };
    });
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">{t(`categories.${category.toLowerCase()}`)}</h2>
        <span className="text-gray-400 text-sm">{components.length} {t('available')}</span>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto">
        {components.length > 0 ? (
          <div className="p-4 space-y-4">
            {components.map((component) => (
              <div 
                key={component.id} 
                className={`bg-gray-800 rounded-lg p-4 ${isSelected(component) ? 'ring-2 ring-[#E63946]' : ''}`}
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-white font-medium">{component.name}</h3>
                    <p className="text-gray-400 text-sm">{component.manufacturer}</p>
                    
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                      {formatSpecs(component.specs).map(({ key, value }) => (
                        <p key={key} className="text-gray-400 text-xs">
                          <span className="text-gray-500">{key}:</span> {value}
                        </p>
                      ))}
                    </div>
                    
                    {component.stock <= 0 && (
                      <p className="mt-2 text-red-500 text-xs">{t('outOfStock')}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-white font-bold mb-2">€{component.price.toFixed(2)}</span>
                    <button
                      onClick={() => addComponent(component)}
                      disabled={component.stock <= 0}
                      className={`px-3 py-1 rounded text-sm ${
                        isSelected(component)
                          ? 'bg-green-700 text-white hover:bg-green-800'
                          : 'bg-[#E63946] text-white hover:bg-[#FF4D5A]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSelected(component) 
                        ? t('actions.selected') 
                        : component.stock > 0 
                          ? t('actions.add') 
                          : t('actions.unavailable')
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-400">{t('noComponentsFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
}