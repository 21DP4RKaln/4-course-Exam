import { Component } from '../types';
import { FilterGroup, FilterOption } from '../filterInterfaces';
import { extractBrandOptions } from './brandUtils';

/**
 * Generate filter groups for CPU components dynamically based on component specifications.
 * Filters are ordered by priority: Brand, Series, Cores, Threads, then other specifications.
 */
export const createCpuFilterGroups = (
  components: Component[],
  t?: (key: string) => string
): FilterGroup[] => {
  const groups: FilterGroup[] = [];

  // 1. Brand group (highest priority)
  const brandMap = extractBrandOptions(components);
  if (brandMap.size > 0) {
    const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(
      ([value]) => ({
        id: `manufacturer=${value}`,
        name: value,
      })
    );
    groups.push({
      title: 'specs.brand',
      type: 'manufacturer',
      titleTranslationKey: 'filterGroups.brand',
      options: brandOptions,
    });
  }

  // 2. Series group
  const seriesSet = new Set<string>();
  components.forEach(c => {
    const series =
      c.specifications?.['Series'] ||
      c.specifications?.['series'] ||
      c.specifications?.['Product Series'] ||
      c.specifications?.['productSeries'] ||
      c.cpu?.series;
    if (series) seriesSet.add(String(series));
  });
  if (seriesSet.size > 0) {
    const seriesOptions: FilterOption[] = Array.from(seriesSet)
      .sort()
      .map(val => ({ id: `series=${val}`, name: val }));
    groups.push({
      title: 'specs.series',
      type: 'series',
      titleTranslationKey: 'filterGroups.series',
      options: seriesOptions,
    });
  }

  // 3. Cores group
  const coresSet = new Set<string>();
  components.forEach(c => {
    const cores = c.specifications?.['Cores'] || c.specifications?.['cores'];
    if (cores) coresSet.add(String(cores));
  });
  if (coresSet.size > 0) {
    const options: FilterOption[] = Array.from(coresSet)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(val => ({ id: `cores=${val}`, name: `${val}` }));
    groups.push({
      title: 'specs.cores',
      titleTranslationKey: 'filterGroups.cores',
      type: 'cores',
      options,
    });
  }

  // 4. Threads group
  const threadsSet = new Set<string>();
  components.forEach(c => {
    const threads =
      c.specifications?.['Threads'] || c.specifications?.['threads'];
    if (threads) threadsSet.add(String(threads));
  });
  if (threadsSet.size > 0) {
    const options: FilterOption[] = Array.from(threadsSet)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(val => ({ id: `threads=${val}`, name: `${val}` }));
    groups.push({
      title: 'specs.threads',
      titleTranslationKey: 'filterGroups.threads',
      type: 'threads',
      options,
    });
  }
  // 5. Socket group
  const socketSet = new Set<string>();
  components.forEach(c => {
    const socket = c.specifications?.['Socket'] || c.specifications?.['socket'];
    if (socket) socketSet.add(String(socket));
  });
  if (socketSet.size > 0) {
    const options: FilterOption[] = Array.from(socketSet).map(val => ({
      id: `socket=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.socket',
      titleTranslationKey: 'filterGroups.socket',
      type: 'socket',
      options,
    });
  }

  // 6. Integrated GPU group
  const igpuSet = new Set<string>();
  components.forEach(c => {
    let igpu =
      c.specifications?.['Integrated GPU'] ||
      c.specifications?.['integratedGpu'] ||
      c.specifications?.['Graphics'] ||
      c.specifications?.['graphics'];
    // Normalize values to Yes/No for consistency
    if (igpu) {
      const igpuLower = String(igpu).toLowerCase();
      if (
        igpuLower === 'yes' ||
        igpuLower === 'true' ||
        igpuLower.includes('uhd') ||
        igpuLower.includes('iris')
      ) {
        igpu = t ? t('common.yes') : 'Yes';
      } else if (
        igpuLower === 'no' ||
        igpuLower === 'false' ||
        igpuLower === 'none'
      ) {
        igpu = t ? t('common.no') : 'No';
      }
      igpuSet.add(String(igpu));
    }
  });
  if (igpuSet.size > 0) {
    const options: FilterOption[] = Array.from(igpuSet).map(val => ({
      id: `integratedGpu=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.integratedGpu',
      titleTranslationKey: 'filterGroups.integratedGraphics',
      type: 'integratedGpu',
      options,
    });
  }

  // 7. Base Frequency group
  const baseFreqSet = new Set<string>();
  components.forEach(c => {
    const baseFreq =
      c.specifications?.['Base Frequency'] ||
      c.specifications?.['baseFrequency'] ||
      c.specifications?.['Base Clock'] ||
      c.specifications?.['baseClock'];
    if (baseFreq) baseFreqSet.add(String(baseFreq));
  });
  if (baseFreqSet.size > 0) {
    // Sort frequencies numerically
    const sortedFreq = Array.from(baseFreqSet).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.]/g, ''));
      const numB = parseFloat(b.replace(/[^\d.]/g, ''));
      return numA - numB;
    });

    const options: FilterOption[] = sortedFreq.map(val => ({
      id: `baseFrequency=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.baseFrequency',
      titleTranslationKey: 'filterGroups.baseClock',
      type: 'baseFrequency',
      options,
    });
  }

  // 8. Max RAM Frequency
  const maxRamFreqSet = new Set<string>();
  components.forEach(c => {
    const maxRamFreq =
      c.specifications?.['Max RAM Frequency'] ||
      c.specifications?.['maxRamFrequency'] ||
      c.specifications?.['Memory Speed'] ||
      c.specifications?.['memorySpeed'];
    if (maxRamFreq) maxRamFreqSet.add(String(maxRamFreq));
  });
  if (maxRamFreqSet.size > 0) {
    // Sort frequencies numerically
    const sortedFreq = Array.from(maxRamFreqSet).sort((a, b) => {
      const numA = parseInt(a.replace(/[^\d]/g, ''));
      const numB = parseInt(b.replace(/[^\d]/g, ''));
      return numA - numB;
    });

    const options: FilterOption[] = sortedFreq.map(val => ({
      id: `maxRamFrequency=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.maxRamFrequency',
      titleTranslationKey: 'filterGroups.memorySpeed',
      type: 'maxRamFrequency',
      options,
    });
  }

  // 9. Max RAM Capacity
  const maxRamCapacitySet = new Set<string>();
  components.forEach(c => {
    const maxRam =
      c.specifications?.['Max RAM Capacity'] ||
      c.specifications?.['maxRamCapacity'] ||
      c.specifications?.['Max Memory'] ||
      c.specifications?.['maxMemory'];
    if (maxRam) maxRamCapacitySet.add(String(maxRam));
  });
  if (maxRamCapacitySet.size > 0) {
    // Sort capacity numerically
    const sortedCapacity = Array.from(maxRamCapacitySet).sort((a, b) => {
      const numA = parseInt(a.replace(/[^\d]/g, ''));
      const numB = parseInt(b.replace(/[^\d]/g, ''));
      return numA - numB;
    });

    const options: FilterOption[] = sortedCapacity.map(val => ({
      id: `maxRamCapacity=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.maxRamCapacity',
      titleTranslationKey: 'filterGroups.maxMemory',
      type: 'maxRamCapacity',
      options,
    });
  }

  // 10. Multithreading
  const multiThreadingSet = new Set<string>();
  components.forEach(c => {
    let multithreading =
      c.specifications?.['Multithreading'] ||
      c.specifications?.['multithreading'] ||
      c.specifications?.['HyperThreading'] ||
      c.specifications?.['hyperThreading'];

    // If not specified in specs, try to infer from cores/threads
    if (!multithreading) {
      const cores = c.specifications?.['Cores'] || c.specifications?.['cores'];
      const threads =
        c.specifications?.['Threads'] || c.specifications?.['threads'];
      if (
        cores &&
        threads &&
        parseInt(String(cores)) < parseInt(String(threads))
      ) {
        multithreading = 'Yes';
      }
    }

    if (multithreading) multiThreadingSet.add(String(multithreading));
  });
  if (multiThreadingSet.size > 0) {
    const options: FilterOption[] = Array.from(multiThreadingSet).map(val => ({
      id: `multithreading=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.multithreading',
      titleTranslationKey: 'filterGroups.multithreading',
      type: 'multithreading',
      options,
    });
  }

  // 11. Power Consumption group
  const powerConsumptionSet = new Set<string>();
  components.forEach(c => {
    const powerConsumption =
      c.specifications?.['Power Consumption'] ||
      c.specifications?.['powerConsumption'] ||
      c.specifications?.['TDP'] ||
      c.specifications?.['tdp'];
    if (powerConsumption) powerConsumptionSet.add(String(powerConsumption));
  });
  if (powerConsumptionSet.size > 0) {
    // Sort power consumption numerically
    const sortedPowerConsumption = Array.from(powerConsumptionSet).sort(
      (a, b) => {
        const numA = parseInt(a.replace(/[^\d]/g, ''));
        const numB = parseInt(b.replace(/[^\d]/g, ''));
        return numA - numB;
      }
    );

    const options: FilterOption[] = sortedPowerConsumption.map(val => ({
      id: `powerConsumption=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.powerConsumption',
      titleTranslationKey: 'filterGroups.powerConsumption',
      type: 'powerConsumption',
      options,
    });
  }
  // 12. Boost Clock group
  const boostClockSet = new Set<string>();
  components.forEach(c => {
    const boost =
      c.specifications?.['Boost Clock'] ||
      c.specifications?.['boostClock'] ||
      c.specifications?.['Boost_Clock'] ||
      c.specifications?.['Max Frequency'] ||
      c.specifications?.['maxFrequency'];
    if (boost) boostClockSet.add(String(boost));
  });
  if (boostClockSet.size > 0) {
    // Sort frequencies numerically
    const sortedBoost = Array.from(boostClockSet).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.]/g, ''));
      const numB = parseFloat(b.replace(/[^\d.]/g, ''));
      return numA - numB;
    });

    const options: FilterOption[] = sortedBoost.map(val => ({
      id: `boostClock=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.boostClock',
      titleTranslationKey: 'filterGroups.boostClock',
      type: 'boostClock',
      options,
    });
  }

  // 13. Cache group
  const cacheSet = new Set<string>();
  components.forEach(c => {
    const cache =
      c.specifications?.['Cache'] ||
      c.specifications?.['cacheSize'] ||
      c.specifications?.['cache'] ||
      c.specifications?.['L3 Cache'] ||
      c.specifications?.['l3Cache'];
    if (cache) cacheSet.add(String(cache));
  });
  if (cacheSet.size > 0) {
    // Sort cache sizes numerically
    const sortedCache = Array.from(cacheSet).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.]/g, ''));
      const numB = parseFloat(b.replace(/[^\d.]/g, ''));
      return numA - numB;
    });

    const options: FilterOption[] = sortedCache.map(val => ({
      id: `cache=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.cache',
      titleTranslationKey: 'filterGroups.cache',
      type: 'cache',
      options,
    });
  }

  // 14. Architecture group
  const archSet = new Set<string>();
  components.forEach(c => {
    const arch =
      c.specifications?.['Architecture'] ||
      c.specifications?.['architecture'] ||
      c.specifications?.['Microarchitecture'] ||
      c.specifications?.['microarchitecture'];
    if (arch) archSet.add(String(arch));
  });
  if (archSet.size > 0) {
    const options: FilterOption[] = Array.from(archSet)
      .sort()
      .map(val => ({
        id: `architecture=${val}`,
        name: val,
      }));
    groups.push({
      title: 'specs.architecture',
      titleTranslationKey: 'filterGroups.architecture',
      type: 'architecture',
      options,
    });
  }

  return groups;
};
