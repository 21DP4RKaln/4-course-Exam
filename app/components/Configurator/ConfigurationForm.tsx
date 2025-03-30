import { useTranslations } from 'next-intl';

interface ConfigFormProps {
  configName: string;
  setConfigName: (name: string) => void;
  handleSaveConfig: () => void;
  handleAddToCart?: () => void;
  savingConfig: boolean;
  isAuthenticated?: boolean;
}

export default function ConfigurationForm({
  configName,
  setConfigName,
  handleSaveConfig,
  handleAddToCart,
  savingConfig,
  isAuthenticated = true
}: ConfigFormProps) {
  const t = useTranslations('configurator');
  
  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4 mb-6">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {t('configName')}
      </label>
      <input
        type="text"
        value={configName}
        onChange={(e) => setConfigName(e.target.value)}
        placeholder={t('configNamePlaceholder')}
        className="w-full bg-gray-800 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946] border border-gray-700 mb-4"
      />
      
      <div className="flex space-x-4">
        <button
          onClick={handleSaveConfig}
          disabled={savingConfig}
          className="flex-1 bg-[#E63946] hover:bg-[#FF4D5A] text-white rounded-lg py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savingConfig ? t('actions.saving') : t('actions.save')}
        </button>
        
        {handleAddToCart && (
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-3 font-medium"
          >
            {t('actions.addToCart')}
          </button>
        )}
      </div>
      
      {!isAuthenticated && (
        <p className="mt-2 text-sm text-gray-400">
          {t('authNeededForSave')}
        </p>
      )}
    </div>
  );
}