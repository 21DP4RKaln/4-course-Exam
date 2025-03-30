import { useTranslations } from 'next-intl';

interface Component {
  id: string;
  category: string;
  name: string;
  manufacturer: string;
  price: number;
  specs?: Record<string, any>;
  stock?: number;
}

interface SelectedComponentsProps {
  selectedComponents: Record<string, Component>;
  removeComponent: (category: string) => void;
}

export default function SelectedComponents({
  selectedComponents,
  removeComponent
}: SelectedComponentsProps) {
  const t = useTranslations('configurator');
  
  const categoryOrder = ['CPU', 'Motherboard', 'GPU', 'RAM', 'Storage', 'PSU', 'Case', 'Cooling'];
  
  const orderedCategories = categoryOrder.filter(category => 
    Object.values(selectedComponents).some(comp => comp.category === category)
  );

  return (
    <div className="bg-[#2A2A2A] rounded-lg overflow-hidden mb-4">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">{t('selectedComponents')}</h2>
      </div>
      
      <div className="p-4">
        {orderedCategories.length > 0 ? (
          <div className="space-y-3">
            {orderedCategories.map((category) => {
              const component = Object.values(selectedComponents).find(c => c.category === category);
              if (!component) return null;
              
              return (
                <div 
                  key={component.id} 
                  className="flex justify-between items-center p-3 bg-gray-800 rounded-lg"
                >
                  <div>
                    <h3 className="text-white text-sm font-medium">{component.name}</h3>
                    <p className="text-gray-400 text-xs">{t(`categories.${component.category.toLowerCase()}`)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-white text-sm">€{component.price.toFixed(2)}</span>
                    <button
                      onClick={() => removeComponent(component.category)}
                      className="text-gray-400 hover:text-[#E63946]"
                      aria-label={t('actions.remove')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            {t('noComponentsSelected')}
          </p>
        )}
      </div>
    </div>
  );
}