import { Component } from '../types';
import { FilterGroup, FilterOption } from '../filterInterfaces';
import { extractBrandOptions } from './brandUtils';

/**
 * Generate filter groups for GPU components dynamically based on component specifications.
 * Excludes Brand and Series filters as they are handled by Quick Filters.
 */
export const createGpuFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const groups: FilterGroup[] = [];

  // Brand group
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

  // Architecture group
  const architectureSet = new Set<string>();
  components.forEach(c => {
    const architecture =
      c.specifications?.['Architecture'] ||
      c.specifications?.['architecture'] ||
      c.specifications?.['Product Architecture'] ||
      c.specifications?.['productArchitecture'];
    if (architecture) architectureSet.add(String(architecture));
  });
  if (architectureSet.size > 0) {
    const architectureOptions: FilterOption[] = Array.from(architectureSet)
      .sort()
      .map(val => ({ id: `architecture=${val}`, name: val }));
    groups.push({
      title: 'specs.architecture',
      type: 'architecture',
      titleTranslationKey: 'filterGroups.architecture',
      options: architectureOptions,
    });
  }

  // Memory Size (VRAM)
  const memorySet = new Set<string>();
  components.forEach(c => {
    const memory =
      c.specifications?.['Memory'] ||
      c.specifications?.['VRAM'] ||
      c.specifications?.['memory'] ||
      c.specifications?.['vram'] ||
      c.specifications?.['Video Memory'] ||
      c.specifications?.['videoMemory'];
    if (memory) memorySet.add(String(memory));
  });
  if (memorySet.size > 0) {
    // Sort memory values numerically
    const sortedMemory = Array.from(memorySet).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

    const options: FilterOption[] = sortedMemory.map(val => ({
      id: `memory=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.memory',
      type: 'memory',
      titleTranslationKey: 'filterGroups.memory',
      options,
    });
  }

  // Memory Type (GDDR6, GDDR6X, etc.)
  const memoryTypeSet = new Set<string>();
  components.forEach(c => {
    const memType =
      c.specifications?.['Memory Type'] || c.specifications?.['memoryType'];
    if (memType) memoryTypeSet.add(String(memType));
  });
  if (memoryTypeSet.size > 0) {
    const options: FilterOption[] = Array.from(memoryTypeSet).map(val => ({
      id: `memoryType=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.memoryType',
      type: 'memoryType',
      titleTranslationKey: 'filterGroups.memoryType',
      options,
    });
  }

  // Fan Count
  const fanCountSet = new Set<string>();
  components.forEach(c => {
    const fans =
      c.specifications?.['Fan Count'] ||
      c.specifications?.['fanCount'] ||
      c.specifications?.['Fans'] ||
      c.specifications?.['fans'];
    if (fans) fanCountSet.add(String(fans));
  });
  if (fanCountSet.size > 0) {
    // Sort fan count numerically
    const sortedFans = Array.from(fanCountSet).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    });

    const options: FilterOption[] = sortedFans.map(val => ({
      id: `fanCount=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.fanCount',
      type: 'fanCount',
      titleTranslationKey: 'filterGroups.fans',
      options,
    });
  }

  // Chip Type (AD107, GA104, etc.)
  const chipTypeSet = new Set<string>();
  components.forEach(c => {
    const chipType =
      c.specifications?.['Chip Type'] ||
      c.specifications?.['chipType'] ||
      c.specifications?.['GPU'] ||
      c.specifications?.['gpu'];
    if (chipType) chipTypeSet.add(String(chipType));
  });
  if (chipTypeSet.size > 0) {
    const options: FilterOption[] = Array.from(chipTypeSet).map(val => ({
      id: `chipType=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.chipType',
      type: 'chipType',
      titleTranslationKey: 'filterGroups.chipType',
      options,
    });
  }

  // Display Ports
  // HDMI Port
  const hdmiSet = new Set<string>();
  components.forEach(c => {
    const hdmi =
      c.specifications?.['HDMI Port'] ||
      c.specifications?.['hdmiPort'] ||
      c.specifications?.['HDMI'] ||
      c.specifications?.['hdmi'];
    if (hdmi !== undefined) hdmiSet.add(String(hdmi));
  });
  if (hdmiSet.size > 0) {
    const options: FilterOption[] = Array.from(hdmiSet).map(val => ({
      id: `hdmiPort=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.hdmiPort',
      type: 'hdmiPort',
      titleTranslationKey: 'filterGroups.hdmiPort',
      options,
    });
  }

  // DisplayPort
  const displayPortSet = new Set<string>();
  components.forEach(c => {
    const dp =
      c.specifications?.['DisplayPort'] || c.specifications?.['displayPort'];
    if (dp !== undefined) displayPortSet.add(String(dp));
  });
  if (displayPortSet.size > 0) {
    const options: FilterOption[] = Array.from(displayPortSet).map(val => ({
      id: `displayPort=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.displayPort',
      type: 'displayPort',
      titleTranslationKey: 'filterGroups.displayPort',
      options,
    });
  }

  // DVI Port
  const dviSet = new Set<string>();
  components.forEach(c => {
    const dvi =
      c.specifications?.['DVI Port'] ||
      c.specifications?.['dviPort'] ||
      c.specifications?.['DVI'] ||
      c.specifications?.['dvi'];
    if (dvi !== undefined) dviSet.add(String(dvi));
  });
  if (dviSet.size > 0) {
    const options: FilterOption[] = Array.from(dviSet).map(val => ({
      id: `dviPort=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.dviPort',
      type: 'dviPort',
      titleTranslationKey: 'filterGroups.dviPort',
      options,
    });
  }

  // VGA Port
  const vgaSet = new Set<string>();
  components.forEach(c => {
    const vga =
      c.specifications?.['VGA Port'] ||
      c.specifications?.['vgaPort'] ||
      c.specifications?.['VGA'] ||
      c.specifications?.['vga'];
    if (vga !== undefined) vgaSet.add(String(vga));
  });
  if (vgaSet.size > 0) {
    const options: FilterOption[] = Array.from(vgaSet).map(val => ({
      id: `vgaPort=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.vgaPort',
      type: 'vgaPort',
      titleTranslationKey: 'filterGroups.vgaPort',
      options,
    });
  }

  return groups;
};
