import { Component } from '../types';
import { FilterGroup, FilterOption } from '../filterInterfaces';
import { extractBrandOptions } from './brandUtils';

export const createMousePadFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const brandMap = extractBrandOptions(components);
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(
    ([value, label]) => ({
      id: `manufacturer=${value}`,
      name: label,
    })
  );

  // Surface type options (cloth, hard, hybrid, etc.)
  const surfaceSet = new Set<string>();
  components.forEach(c => {
    const surface =
      c.specifications['surface'] ||
      c.specifications['surfaceType'] ||
      c.specifications['material'];
    if (surface) surfaceSet.add(surface);
  });
  const surfaceOptions: FilterOption[] = Array.from(surfaceSet).map(v => ({
    id: `surface=${v}`,
    name: v,
  }));

  // Size options (small, medium, large, XL, etc.)
  const sizeSet = new Set<string>();
  components.forEach(c => {
    const size =
      c.specifications['size'] ||
      c.specifications['dimensions'] ||
      c.specifications['padSize'];
    if (size) sizeSet.add(size);
  });
  const sizeOptions: FilterOption[] = Array.from(sizeSet).map(v => ({
    id: `size=${v}`,
    name: v,
  }));

  // Thickness options
  const thicknessSet = new Set<string>();
  components.forEach(c => {
    const thickness =
      c.specifications['thickness'] ||
      c.specifications['height'] ||
      c.specifications['depth'];
    if (thickness) thicknessSet.add(thickness);
  });
  const thicknessOptions: FilterOption[] = Array.from(thicknessSet).map(v => ({
    id: `thickness=${v}`,
    name: v,
  }));

  // RGB/Lighting options
  const rgbSet = new Set<string>();
  components.forEach(c => {
    const rgb =
      c.specifications['rgb'] ||
      c.specifications['lighting'] ||
      c.specifications['led'];
    if (rgb) rgbSet.add(rgb);
  });
  const rgbOptions: FilterOption[] = Array.from(rgbSet).map(v => ({
    id: `rgb=${v}`,
    name: v,
  }));

  // Edge type options (stitched, molded, etc.)
  const edgeSet = new Set<string>();
  components.forEach(c => {
    const edge =
      c.specifications['edge'] ||
      c.specifications['edgeType'] ||
      c.specifications['border'];
    if (edge) edgeSet.add(edge);
  });
  const edgeOptions: FilterOption[] = Array.from(edgeSet).map(v => ({
    id: `edge=${v}`,
    name: v,
  }));

  // Base material options (rubber, foam, etc.)
  const baseSet = new Set<string>();
  components.forEach(c => {
    const base =
      c.specifications['base'] ||
      c.specifications['baseType'] ||
      c.specifications['backing'];
    if (base) baseSet.add(base);
  });
  const baseOptions: FilterOption[] = Array.from(baseSet).map(v => ({
    id: `base=${v}`,
    name: v,
  }));

  const filterGroups: FilterGroup[] = [
    { title: 'Brand', type: 'manufacturer', options: brandOptions },
  ];

  if (surfaceOptions.length > 0) {
    filterGroups.push({
      title: 'Surface Type',
      type: 'surface',
      options: surfaceOptions,
    });
  }

  if (sizeOptions.length > 0) {
    filterGroups.push({ title: 'Size', type: 'size', options: sizeOptions });
  }

  if (thicknessOptions.length > 0) {
    filterGroups.push({
      title: 'Thickness',
      type: 'thickness',
      options: thicknessOptions,
    });
  }

  if (rgbOptions.length > 0) {
    filterGroups.push({
      title: 'RGB Lighting',
      type: 'rgb',
      options: rgbOptions,
    });
  }

  if (edgeOptions.length > 0) {
    filterGroups.push({
      title: 'Edge Type',
      type: 'edge',
      options: edgeOptions,
    });
  }

  if (baseOptions.length > 0) {
    filterGroups.push({
      title: 'Base Material',
      type: 'base',
      options: baseOptions,
    });
  }

  return filterGroups;
};
