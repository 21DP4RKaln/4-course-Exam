import { Component } from '../types';
import { FilterGroup, FilterOption } from '../filterInterfaces';
import { extractBrandOptions } from './brandUtils';

/**
 * Generate filter groups for Cooling components dynamically based on component specifications.
 * Excludes Type filters as they are handled by Quick Filters.
 */
export const createCoolingFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const groups: FilterGroup[] = [];

  // Socket Compatibility
  const socketSet = new Set<string>();
  components.forEach(c => {
    const socket =
      c.specifications?.['Socket'] ||
      c.specifications?.['socket'] ||
      c.specifications?.['Socket Compatibility'] ||
      c.specifications?.['socketCompatibility'];

    // Some coolers have multiple socket compatibilities separated by commas
    if (socket) {
      const sockets = String(socket)
        .split(/,|;/)
        .map(s => s.trim());
      sockets.forEach(s => {
        if (s) socketSet.add(s);
      });
    }
  });
  if (socketSet.size > 0) {
    const options: FilterOption[] = Array.from(socketSet)
      .sort()
      .map(val => ({
        id: `socket=${val}`,
        name: val,
      }));
    groups.push({
      title: 'specs.socket',
      type: 'socket',
      titleTranslationKey: 'filterGroups.socket',
      options,
    });
  }

  // Radiator Size (for AIOs)
  const radiatorSet = new Set<string>();
  components.forEach(c => {
    const radiator =
      c.specifications?.['Radiator Size'] ||
      c.specifications?.['radiatorSize'] ||
      c.specifications?.['Radiator'];

    if (radiator) {
      radiatorSet.add(String(radiator));
    } else {
      // Try to extract from name (e.g., "240mm AIO")
      const nameMatch = c.name.match(/(\d+)\s*mm/i);
      if (nameMatch) {
        radiatorSet.add(`${nameMatch[1]}mm`);
      }
    }
  });
  if (radiatorSet.size > 0) {
    const options: FilterOption[] = Array.from(radiatorSet)
      .sort((a, b) => {
        const aNum = parseInt(a.replace(/\D/g, '')) || 0;
        const bNum = parseInt(b.replace(/\D/g, '')) || 0;
        return aNum - bNum;
      })
      .map(val => ({
        id: `radiatorSize=${val}`,
        name: val,
      }));
    groups.push({
      title: 'specs.radiatorSize',
      type: 'radiatorSize',
      titleTranslationKey: 'filterGroups.radiatorSize',
      options,
    });
  }

  // RGB Lighting
  const rgbSet = new Set<string>();
  components.forEach(c => {
    // Check for RGB in specifications or name/description
    const hasRgb =
      c.specifications?.['RGB'] ||
      c.specifications?.['rgb'] ||
      c.name?.toLowerCase().includes('rgb') ||
      c.description?.toLowerCase().includes('rgb');

    if (hasRgb) {
      rgbSet.add('RGB');
    }
  });
  if (rgbSet.size > 0) {
    const options: FilterOption[] = Array.from(rgbSet).map(val => ({
      id: `rgb=true`,
      name: val,
    }));
    groups.push({
      title: 'specs.rgb',
      type: 'rgb',
      titleTranslationKey: 'filterGroups.rgb',
      options,
    });
  }

  // Fan Diameter
  const fanDiameterSet = new Set<string>();
  components.forEach(c => {
    const diameter =
      c.specifications?.['Fan Diameter'] ||
      c.specifications?.['fanDiameter'] ||
      c.specifications?.['Fan Size'] ||
      c.specifications?.['fanSize'];

    if (diameter) {
      fanDiameterSet.add(String(diameter));
    } else {
      // Try to extract from name (e.g., "120mm fan")
      const nameMatch = c.name.match(/(\d+)\s*mm.*fan/i);
      if (nameMatch) {
        fanDiameterSet.add(`${nameMatch[1]}mm`);
      }
    }
  });
  if (fanDiameterSet.size > 0) {
    const options: FilterOption[] = Array.from(fanDiameterSet)
      .sort((a, b) => {
        const aNum = parseInt(a.replace(/\D/g, '')) || 0;
        const bNum = parseInt(b.replace(/\D/g, '')) || 0;
        return aNum - bNum;
      })
      .map(val => ({
        id: `fanDiameter=${val}`,
        name: val,
      }));
    groups.push({
      title: 'specs.fanDiameter',
      type: 'fanDiameter',
      titleTranslationKey: 'filterGroups.fanDiameter',
      options,
    });
  }

  // Fan Speed (RPM)
  const fanSpeedSet = new Set<string>();
  components.forEach(c => {
    const speed =
      c.specifications?.['Fan Speed'] ||
      c.specifications?.['fanSpeed'] ||
      c.specifications?.['RPM'] ||
      c.specifications?.['rpm'] ||
      c.specifications?.['Max Fan Speed'] ||
      c.specifications?.['maxFanSpeed'];

    if (speed) {
      fanSpeedSet.add(String(speed));
    }
  });
  if (fanSpeedSet.size > 0) {
    const options: FilterOption[] = Array.from(fanSpeedSet)
      .sort((a, b) => {
        const aNum = parseInt(a.replace(/\D/g, '')) || 0;
        const bNum = parseInt(b.replace(/\D/g, '')) || 0;
        return aNum - bNum;
      })
      .map(val => ({
        id: `fanSpeed=${val}`,
        name: val,
      }));
    groups.push({
      title: 'specs.fanSpeed',
      type: 'fanSpeed',
      titleTranslationKey: 'filterGroups.fanSpeed',
      options,
    });
  }

  // Height/Clearance
  const heightSet = new Set<string>();
  components.forEach(c => {
    const height =
      c.specifications?.['Height'] ||
      c.specifications?.['height'] ||
      c.specifications?.['Clearance'] ||
      c.specifications?.['clearance'] ||
      c.specifications?.['Dimensions'] ||
      c.specifications?.['dimensions'];

    if (height) {
      heightSet.add(String(height));
    }
  });
  if (heightSet.size > 0) {
    const options: FilterOption[] = Array.from(heightSet)
      .sort((a, b) => {
        const aNum = parseFloat(a.replace(/[^\d.]/g, '')) || 0;
        const bNum = parseFloat(b.replace(/[^\d.]/g, '')) || 0;
        return aNum - bNum;
      })
      .map(val => ({
        id: `height=${val}`,
        name: val,
      }));
    groups.push({
      title: 'specs.height',
      type: 'height',
      titleTranslationKey: 'filterGroups.height',
      options,
    });
  }

  // Noise Level (dBA)
  const noiseSet = new Set<string>();
  components.forEach(c => {
    const noise =
      c.specifications?.['Noise Level'] ||
      c.specifications?.['noiseLevel'] ||
      c.specifications?.['Noise'] ||
      c.specifications?.['noise'] ||
      c.specifications?.['dBA'] ||
      c.specifications?.['dba'];

    if (noise) {
      noiseSet.add(String(noise));
    }
  });
  if (noiseSet.size > 0) {
    const options: FilterOption[] = Array.from(noiseSet)
      .sort((a, b) => {
        const aNum = parseFloat(a.replace(/[^\d.]/g, '')) || 0;
        const bNum = parseFloat(b.replace(/[^\d.]/g, '')) || 0;
        return aNum - bNum;
      })
      .map(val => ({
        id: `noiseLevel=${val}`,
        name: val,
      }));
    groups.push({
      title: 'specs.noiseLevel',
      type: 'noiseLevel',
      titleTranslationKey: 'filterGroups.noiseLevel',
      options,
    });
  }

  // TDP (Thermal Design Power)
  const tdpSet = new Set<string>();
  components.forEach(c => {
    const tdp =
      c.specifications?.['TDP'] ||
      c.specifications?.['tdp'] ||
      c.specifications?.['Thermal Design Power'] ||
      c.specifications?.['thermalDesignPower'] ||
      c.specifications?.['Max TDP'] ||
      c.specifications?.['maxTDP'];

    if (tdp) {
      tdpSet.add(String(tdp));
    }
  });
  if (tdpSet.size > 0) {
    const options: FilterOption[] = Array.from(tdpSet)
      .sort((a, b) => {
        const aNum = parseInt(a.replace(/\D/g, '')) || 0;
        const bNum = parseInt(b.replace(/\D/g, '')) || 0;
        return aNum - bNum;
      })
      .map(val => ({
        id: `tdp=${val}`,
        name: val,
      }));
    groups.push({
      title: 'specs.tdp',
      type: 'tdp',
      titleTranslationKey: 'filterGroups.tdp',
      options,
    });
  }

  // Material
  const materialSet = new Set<string>();
  components.forEach(c => {
    const material =
      c.specifications?.['Material'] ||
      c.specifications?.['material'] ||
      c.specifications?.['Construction'] ||
      c.specifications?.['construction'] ||
      c.specifications?.['Base Material'] ||
      c.specifications?.['baseMaterial'];

    if (material) {
      materialSet.add(String(material));
    }
  });
  if (materialSet.size > 0) {
    const options: FilterOption[] = Array.from(materialSet).map(val => ({
      id: `material=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.material',
      type: 'material',
      titleTranslationKey: 'filterGroups.material',
      options,
    });
  }

  // PWM Support
  const pwmSet = new Set<string>();
  components.forEach(c => {
    const pwm =
      c.specifications?.['PWM'] ||
      c.specifications?.['pwm'] ||
      c.specifications?.['PWM Support'] ||
      c.specifications?.['pwmSupport'];

    if (pwm) {
      const pwmValue = String(pwm).toLowerCase();
      if (
        pwmValue === 'yes' ||
        pwmValue === 'true' ||
        pwmValue === '1' ||
        pwmValue === 'supported'
      ) {
        pwmSet.add('PWM Supported');
      } else if (
        pwmValue === 'no' ||
        pwmValue === 'false' ||
        pwmValue === '0' ||
        pwmValue === 'not supported'
      ) {
        pwmSet.add('No PWM');
      }
    }
  });
  if (pwmSet.size > 0) {
    const options: FilterOption[] = Array.from(pwmSet).map(val => ({
      id: `pwm=${val}`,
      name: val,
    }));
    groups.push({
      title: 'specs.pwmSupport',
      type: 'pwmSupport',
      titleTranslationKey: 'filterGroups.pwmSupport',
      options,
    });
  }

  // Warranty
  const warrantySet = new Set<string>();
  components.forEach(c => {
    const warranty =
      c.specifications?.['Warranty'] ||
      c.specifications?.['warranty'] ||
      c.specifications?.['Warranty Period'] ||
      c.specifications?.['warrantyPeriod'];

    if (warranty) {
      warrantySet.add(String(warranty));
    }
  });
  if (warrantySet.size > 0) {
    const options: FilterOption[] = Array.from(warrantySet)
      .sort((a, b) => {
        const aNum = parseInt(a.replace(/\D/g, '')) || 0;
        const bNum = parseInt(b.replace(/\D/g, '')) || 0;
        return aNum - bNum;
      })
      .map(val => ({
        id: `warranty=${val}`,
        name: val,
      }));
    groups.push({
      title: 'specs.warranty',
      type: 'warranty',
      titleTranslationKey: 'filterGroups.warranty',
      options,
    });
  }

  return groups;
};
