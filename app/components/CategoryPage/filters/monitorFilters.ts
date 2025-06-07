import { Component } from '../types';
import { FilterGroup, FilterOption } from '../filterInterfaces';
import { extractBrandOptions } from './brandUtils';

export const createMonitorFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const brandMap = extractBrandOptions(components);
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(
    ([value, label]) => ({
      id: `manufacturer=${value}`,
      name: label,
    })
  );

  // Screen size options
  const sizeSet = new Set<number>();
  components.forEach(c => {
    const sizeSpec =
      c.specifications?.['screenSize'] ||
      c.specifications?.['Screen Size'] ||
      c.specifications?.['size'] ||
      c.specifications?.['displaySize'];
    if (sizeSpec) {
      const match = String(sizeSpec).match(/(\d+(\.\d+)?)/);
      if (match) {
        const sizeValue = parseFloat(match[1]);
        if (!isNaN(sizeValue)) sizeSet.add(sizeValue);
      }
    }
  });
  const sizeOptions: FilterOption[] = Array.from(sizeSet)
    .sort((a, b) => a - b)
    .map(s => ({ id: `screenSize=${s}`, name: `${s}"` }));

  // Resolution options
  const resolutionSet = new Set<string>();
  components.forEach(c => {
    const resSpec =
      c.specifications?.['resolution'] ||
      c.specifications?.['Resolution'] ||
      c.specifications?.['nativeResolution'] ||
      c.specifications?.['Native Resolution'];
    if (resSpec) resolutionSet.add(String(resSpec));
  });
  const resolutionOptions: FilterOption[] = Array.from(resolutionSet).map(
    r => ({ id: `resolution=${r}`, name: r })
  );

  // Panel type options (IPS, VA, TN, etc.)
  const panelSet = new Set<string>();
  components.forEach(c => {
    const panelSpec =
      c.specifications?.['panelType'] ||
      c.specifications?.['Panel Type'] ||
      c.specifications?.['displayType'] ||
      c.specifications?.['Display Type'];
    if (panelSpec) panelSet.add(String(panelSpec));
  });
  const panelOptions: FilterOption[] = Array.from(panelSet).map(p => ({
    id: `panelType=${p}`,
    name: p,
  }));

  // Refresh rate options
  const refreshSet = new Set<number>();
  components.forEach(c => {
    const refreshSpec =
      c.specifications?.['refreshRate'] ||
      c.specifications?.['Refresh Rate'] ||
      c.specifications?.['maxRefreshRate'] ||
      c.specifications?.['Max Refresh Rate'];
    if (refreshSpec) {
      const refreshValue = parseInt(
        String(refreshSpec).replace(/[^\d]/g, ''),
        10
      );
      if (!isNaN(refreshValue)) refreshSet.add(refreshValue);
    }
  });
  const refreshOptions: FilterOption[] = Array.from(refreshSet)
    .sort((a, b) => a - b)
    .map(r => ({ id: `refreshRate=${r}`, name: `${r} Hz` }));

  // Response time options
  const responseSet = new Set<number>();
  components.forEach(c => {
    const responseSpec =
      c.specifications?.['responseTime'] ||
      c.specifications?.['Response Time'] ||
      c.specifications?.['gtg'] ||
      c.specifications?.['GTG'];
    if (responseSpec) {
      const responseValue = parseInt(
        String(responseSpec).replace(/[^\d]/g, ''),
        10
      );
      if (!isNaN(responseValue)) responseSet.add(responseValue);
    }
  });
  const responseOptions: FilterOption[] = Array.from(responseSet)
    .sort((a, b) => a - b)
    .map(r => ({ id: `responseTime=${r}`, name: `${r} ms` }));

  // Adaptive sync options (FreeSync, G-Sync, etc.)
  const syncSet = new Set<string>();
  components.forEach(c => {
    const syncSpec =
      c.specifications?.['adaptiveSync'] ||
      c.specifications?.['Adaptive Sync'] ||
      c.specifications?.['vrr'] ||
      c.specifications?.['VRR'];
    if (syncSpec) syncSet.add(String(syncSpec));
  });
  const syncOptions: FilterOption[] = Array.from(syncSet).map(s => ({
    id: `adaptiveSync=${s}`,
    name: s,
  }));

  // Connectivity options
  const connSet = new Set<string>();
  components.forEach(c => {
    const connSpec =
      c.specifications?.['ports'] ||
      c.specifications?.['Ports'] ||
      c.specifications?.['connectivity'] ||
      c.specifications?.['connections'];
    if (connSpec) {
      const connStr = String(connSpec);
      if (connStr.includes('HDMI')) connSet.add('HDMI');
      if (connStr.includes('DisplayPort') || connStr.includes('DP'))
        connSet.add('DisplayPort');
      if (connStr.includes('USB-C') || connStr.includes('USB C'))
        connSet.add('USB-C');
      if (connStr.includes('DVI')) connSet.add('DVI');
      if (connStr.includes('VGA')) connSet.add('VGA');
    }
  });
  const connOptions: FilterOption[] = Array.from(connSet).map(c => ({
    id: `connectivity=${c}`,
    name: c,
  }));

  const filterGroups: FilterGroup[] = [
    { title: 'Brand', type: 'manufacturer', options: brandOptions },
  ];

  if (sizeOptions.length > 0) {
    filterGroups.push({
      title: 'Screen Size',
      type: 'screenSize',
      options: sizeOptions,
    });
  }

  if (resolutionOptions.length > 0) {
    filterGroups.push({
      title: 'Resolution',
      type: 'resolution',
      options: resolutionOptions,
    });
  }

  if (refreshOptions.length > 0) {
    filterGroups.push({
      title: 'Refresh Rate',
      type: 'refreshRate',
      options: refreshOptions,
    });
  }

  if (panelOptions.length > 0) {
    filterGroups.push({
      title: 'Panel Type',
      type: 'panelType',
      options: panelOptions,
    });
  }

  if (responseOptions.length > 0) {
    filterGroups.push({
      title: 'Response Time',
      type: 'responseTime',
      options: responseOptions,
    });
  }

  if (syncOptions.length > 0) {
    filterGroups.push({
      title: 'Adaptive Sync',
      type: 'adaptiveSync',
      options: syncOptions,
    });
  }

  if (connOptions.length > 0) {
    filterGroups.push({
      title: 'Connectivity',
      type: 'connectivity',
      options: connOptions,
    });
  }

  return filterGroups;
};
