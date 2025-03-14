'use client';

import { useTranslations } from 'next-intl';

interface ConfigurationSummaryProps {
  totalPrice: number;
}

export default function ConfigurationSummary({
  totalPrice
}: ConfigurationSummaryProps) {
  const t = useTranslations('configurator');
  
  const taxRate = 0.21;
  const taxAmount = totalPrice * taxRate;
  const totalWithTax = totalPrice + taxAmount;
  
  const estimateFPS = (price: number) => {
    if (price < 600) return { csgo: "90-120", fortnite: "55-75", cyberpunk: "30-45" };
    if (price < 1000) return { csgo: "180-240", fortnite: "90-120", cyberpunk: "45-60" };
    if (price < 1500) return { csgo: "240+", fortnite: "120-165", cyberpunk: "60-75" };
    return { csgo: "300+", fortnite: "165+", cyberpunk: "90+" };
  };
  
  const fpsEstimates = estimateFPS(totalPrice);

  return (
    <div className="bg-[#2A2A2A] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">{t('summary')}</h2>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Price breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">{t('subtotal')}</span>
            <span className="text-white">€{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">{t('tax')} (21%)</span>
            <span className="text-white">€{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-700">
            <span className="text-white">{t('total')}</span>
            <span className="text-[#E63946]">€{totalWithTax.toFixed(2)}</span>
          </div>
        </div>
        
        {/* FPS Estimates */}
        {totalPrice > 0 && (
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">{t('fps')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">CS:GO</span>
                <span className="text-white">{fpsEstimates.csgo} FPS</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Fortnite</span>
                <span className="text-white">{fpsEstimates.fortnite} FPS</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Cyberpunk 2077</span>
                <span className="text-white">{fpsEstimates.cyberpunk} FPS</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}