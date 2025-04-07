import React, { useState, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/app/contexts/CartContext';
import { Configuration } from '@/lib/services/api.service';
import { formatCurrency } from '@/lib/utils/format';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';

interface ProductCardProps {
  config: Configuration;
  onCustomize: (configId: string) => void;
}

const ProductSpecs = memo(({ components }: { components: Configuration['components'] }) => {
  const configT = useTranslations('configurator');
 
  const getCategoryTranslation = (category: string): string => {
    try {
      const categoryKey = category.toLowerCase().replace(/\s+/g, '');
      return configT(`categories.${categoryKey}`);
    } catch (e) {
      return category;
    }
  };
  
  return (
    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
      {components.map((component) => (
        <div key={component.id} className="flex justify-between items-center">
          <div>
            <p className="text-sm text-white">{component.name}</p>
            <p className="text-xs text-gray-400">{getCategoryTranslation(component.category)}</p>
          </div>
          <p className="text-sm text-gray-300">{formatCurrency(component.price)}</p>
        </div>
      ))}
    </div>
  );
});

const StatusBadge = memo(({ status }: { status: string }) => {
  const t = useTranslations('readyConfigs');

  const statusColorMap: Record<string, string> = {
    approved: 'bg-green-900 text-green-300',
    pending: 'bg-yellow-900 text-yellow-300',
    rejected: 'bg-red-900 text-red-300',
    default: 'bg-gray-900 text-gray-300'
  };
  
  const statusKey = status === 'approved' ? 'approved' : 
                    status === 'awaiting_approval' ? 'pending' : 
                    status === 'rejected' ? 'rejected' : 'default';
  
  const statusText = status === 'approved' ? t('statusApproved') : 
                     status === 'awaiting_approval' ? t('statusPending') : 
                     status === 'rejected' ? t('statusRejected') : status;
  
  return (
    <Badge className={`px-2 py-1 text-xs rounded-full ${statusColorMap[statusKey]}`}>
      {statusText}
    </Badge>
  );
});

const ProductCard: React.FC<ProductCardProps> = memo(({ config, onCustomize }) => {
  const t = useTranslations('productCatalog');
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = useCallback(() => {
    setIsAdding(true);

    setTimeout(() => {
      addItem({
        id: config.id,
        name: config.name,
        price: config.totalPrice,
        type: 'ready'
      });
      
      setIsAdding(false);
    }, 300);
  }, [config.id, config.name, config.totalPrice, addItem]);
  
  const handleCustomize = useCallback(() => {
    onCustomize(config.id);
  }, [config.id, onCustomize]);
  
  return (
    <div className="bg-[#2A2A2A] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">{config.name}</h2>
          <StatusBadge status={config.status} />
        </div>
        <p className="text-2xl font-bold text-[#E63946] mt-2">{formatCurrency(config.totalPrice)}</p>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">{t('components')}</h3>
        
        {/* Izmantojam izdalīto apakškomponenti */}
        <ProductSpecs components={config.components} />
        
        <div className="flex space-x-2 mt-4">
          <Button 
            onClick={handleAddToCart}
            disabled={isAdding}
            variant="primary"
            className="flex-1"
          >
            {isAdding ? t('addingToCart') : t('addToCart')}
          </Button>
          
          <Button
            onClick={handleCustomize}
            variant="secondary"
            className="flex-1"
          >
            {t('customize')}
          </Button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
ProductSpecs.displayName = 'ProductSpecs';
StatusBadge.displayName = 'StatusBadge';

export default ProductCard;