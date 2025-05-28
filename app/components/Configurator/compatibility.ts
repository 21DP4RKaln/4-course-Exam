import { Component } from './types';

// Helper function to check form factor compatibility
export const checkFormFactorCompatibility = (caseFormFactor: string, motherboardFormFactor: string): boolean => {
  const caseSize = caseFormFactor.toLowerCase();
  const mbSize = motherboardFormFactor.toLowerCase();
  
  const normalizeMbSize = (size: string) => {
    if (size.includes('mini-itx') || size.includes('mitx') || size === 'itx') return 'mini-itx';
    if (size.includes('micro-atx') || size.includes('matx') || size.includes('m-atx')) return 'micro-atx';
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
  
  // Copy compatibility checks logic here (CPU vs Motherboard, RAM, Case, GPU, PSU, Storage...)
  
  // Example: CPU-Motherboard socket
  if (selectedComponents.cpu && selectedComponents.motherboard) {
    const cpuSocket = selectedComponents.cpu.specifications?.['Socket'];
    const mbSocket = selectedComponents.motherboard.specifications?.['CPU Socket'] || selectedComponents.motherboard.specifications?.['Socket'];
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      issues.push(`${t('configurator.compatibility.cpuSocketMismatch')} (${cpuSocket} ≠ ${mbSocket})`);
    }
    // ... other checks omitted for brevity
  }

  // PSU wattage check
  if (selectedComponents.psu && totalPowerConsumption > 0) {
    const psuWattage = parseInt(selectedComponents.psu.specifications?.['Wattage'] || selectedComponents.psu.specifications?.['Power'] || '0', 10);
    const recommendedW = Math.ceil(totalPowerConsumption * 1.3);
    if (!isNaN(psuWattage)) {
      if (psuWattage < totalPowerConsumption) {
        issues.push(`${t('configurator.compatibility.psuCriticallyUnderpowered')} (${psuWattage}W < ${totalPowerConsumption}W)`);
      } else if (psuWattage < recommendedW) {
        issues.push(`${t('configurator.compatibility.psuUnderpowered')} (${psuWattage}W < ${recommendedW}W recommended)`);
      }
    }
  }
  
  return issues;
};
