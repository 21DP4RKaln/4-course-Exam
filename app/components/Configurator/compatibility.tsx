// Consolidated compatibility checking functionality
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Gauge } from 'lucide-react';
import { Component } from './types';

// Helper function to check form factor compatibility
export const checkFormFactorCompatibility = (
  caseFormFactor: string,
  motherboardFormFactor: string
): boolean => {
  if (!caseFormFactor || !motherboardFormFactor) return true;

  const caseSize = caseFormFactor.toLowerCase();
  const mbSize = motherboardFormFactor.toLowerCase();

  const normalizeMbSize = (size: string) => {
    if (size.includes('mini-itx') || size.includes('mitx') || size === 'itx')
      return 'mini-itx';
    if (
      size.includes('micro-atx') ||
      size.includes('matx') ||
      size.includes('m-atx')
    )
      return 'micro-atx';
    if (size.includes('e-atx') || size.includes('eatx')) return 'e-atx';
    if (size.includes('atx')) return 'atx';
    return size;
  };

  const normalizedMb = normalizeMbSize(mbSize);

  if (caseSize.includes('full tower') || caseSize.includes('e-atx')) {
    return true;
  }
  if (caseSize.includes('mid tower') || caseSize.includes('atx')) {
    return ['mini-itx', 'micro-atx', 'atx'].includes(normalizedMb);
  }
  if (caseSize.includes('micro-atx') || caseSize.includes('matx')) {
    return ['mini-itx', 'micro-atx'].includes(normalizedMb);
  }
  if (caseSize.includes('mini-itx') || caseSize.includes('mitx')) {
    return normalizedMb === 'mini-itx';
  }
  return true;
};

// Generate compatibility issues for selected components
export const getCompatibilityIssues = (
  selectedComponents: Record<string, Component>,
  totalPowerConsumption: number,
  t: (key: string) => string
): string[] => {
  const issues: string[] = [];

  // Pārbaudīt enerģijas patēriņu pret PSU jaudu
  if (selectedComponents.psu && totalPowerConsumption > 0) {
    const psuPower = parseInt(
      selectedComponents.psu.specifications?.['Power'] || '0'
    );
    // Recommend 40% headroom for the PSU
    const recommendedPower = Math.ceil(totalPowerConsumption * 1.4);

    if (psuPower < totalPowerConsumption) {
      issues.push(
        `${t('configurator.compatibility.psuTooWeak')} (${totalPowerConsumption}W > ${psuPower}W)`
      );
    } else if (psuPower < recommendedPower) {
      issues.push(
        `${t('configurator.compatibility.psuLowHeadroom')} (${recommendedPower}W recommended)`
      );
    }
  }

  // Piemērs: CPU-Mātesplates ligzda
  if (selectedComponents.cpu && selectedComponents.motherboard) {
    const cpuSocket = selectedComponents.cpu.specifications?.['Socket'];
    const mbSocket =
      selectedComponents.motherboard.specifications?.['CPU Socket'] ||
      selectedComponents.motherboard.specifications?.['Socket'];
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      issues.push(
        `${t('configurator.compatibility.cpuSocketMismatch')} (${cpuSocket} ≠ ${mbSocket})`
      );
    }
    // ... other checks omitted for brevity
  }

  // PSU wattage check
  if (selectedComponents.psu && totalPowerConsumption > 0) {
    const psuWattage = parseInt(
      selectedComponents.psu.specifications?.['Wattage'] ||
        selectedComponents.psu.specifications?.['Power'] ||
        '0',
      10
    );
    const recommendedW = Math.ceil(totalPowerConsumption * 1.3);
    if (!isNaN(psuWattage)) {
      if (psuWattage < totalPowerConsumption) {
        issues.push(
          `${t('configurator.compatibility.psuCriticallyUnderpowered')} (${psuWattage}W < ${totalPowerConsumption}W)`
        );
      } else if (psuWattage < recommendedW) {
        issues.push(
          `${t('configurator.compatibility.psuUnderpowered')} (${psuWattage}W < ${recommendedW}W recommended)`
        );
      }
    }
  }

  return issues;
};

// React komponente saderības pārbaudes attēlošanai
interface CompatibilityCheckerProps {
  totalPowerConsumption: number;
  compatibilityIssues: string[];
}

export const CompatibilityChecker: React.FC<CompatibilityCheckerProps> = ({
  totalPowerConsumption,
  compatibilityIssues,
}) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-end">
      {/* Power consumption indicator */}
      {totalPowerConsumption > 0 && (
        <div className="flex items-center bg-gray-100 dark:bg-stone-950 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
          <Gauge size={18} className="text-gray-600 dark:text-gray-400 mr-2" />
          <span className="text-sm font-medium text-stone-950 dark:text-gray-300">
            {t('configurator.compatibility.estimatedPower')}:{' '}
            {totalPowerConsumption}W
          </span>
        </div>
      )}
    </div>
  );
};
