import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Component } from './types';
import { getCompatibilityIssues, checkFormFactorCompatibility } from './compatibility';

interface CompatibilityPageProps {
  selectedComponents: Record<string, Component>;
  totalPowerConsumption: number;
}

const CompatibilityPage: React.FC<CompatibilityPageProps> = ({ selectedComponents, totalPowerConsumption }) => {
  const t = useTranslations();
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    const newIssues = getCompatibilityIssues(selectedComponents, totalPowerConsumption, t);
    setIssues(newIssues);
  }, [selectedComponents, totalPowerConsumption, t]);

  return (
    <div className="p-4 bg-white dark:bg-stone-950 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-2">{t('configurator.compatibility.title')}</h2>
      {issues.length === 0 ? (
        <p className="text-green-600">{t('configurator.compatibility.noIssues')}</p>
      ) : (
        <ul className="list-disc list-inside text-red-600">
          {issues.map((issue, idx) => (
            <li key={idx}>{issue}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompatibilityPage;
