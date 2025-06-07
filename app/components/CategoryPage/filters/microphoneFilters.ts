import { Component } from '../types';
import { FilterGroup, FilterOption } from '../filterInterfaces';
import { extractBrandOptions } from './brandUtils';

export const createMicrophoneFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const brandMap = extractBrandOptions(components);
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(
    ([value, label]) => ({
      id: `manufacturer=${value}`,
      name: label,
    })
  );

  // Microphone type options (condenser, dynamic, ribbon, etc.)
  const typeSet = new Set<string>();
  components.forEach(c => {
    const type =
      c.specifications['type'] ||
      c.specifications['micType'] ||
      c.specifications['microphoneType'];
    if (type) typeSet.add(type);
  });
  const typeOptions: FilterOption[] = Array.from(typeSet).map(v => ({
    id: `type=${v}`,
    name: v,
  }));

  // Polar pattern options (cardioid, omnidirectional, etc.)
  const patternSet = new Set<string>();
  components.forEach(c => {
    const pattern =
      c.specifications['polarPattern'] ||
      c.specifications['pattern'] ||
      c.specifications['directivity'];
    if (pattern) patternSet.add(pattern);
  });
  const patternOptions: FilterOption[] = Array.from(patternSet).map(v => ({
    id: `pattern=${v}`,
    name: v,
  }));

  // Connection type options
  const connectionSet = new Set<string>();
  components.forEach(c => {
    const connection =
      c.specifications['connection'] ||
      c.specifications['interface'] ||
      c.specifications['connectivity'];
    if (connection) connectionSet.add(connection);
  });
  const connectionOptions: FilterOption[] = Array.from(connectionSet).map(
    v => ({ id: `connection=${v}`, name: v })
  );

  // Frequency response options
  const frequencySet = new Set<string>();
  components.forEach(c => {
    const frequency =
      c.specifications['frequencyResponse'] ||
      c.specifications['frequency'] ||
      c.specifications['range'];
    if (frequency) frequencySet.add(frequency);
  });
  const frequencyOptions: FilterOption[] = Array.from(frequencySet).map(v => ({
    id: `frequency=${v}`,
    name: v,
  }));

  // Usage type options (streaming, recording, gaming, etc.)
  const usageSet = new Set<string>();
  components.forEach(c => {
    const usage =
      c.specifications['usage'] ||
      c.specifications['application'] ||
      c.specifications['purpose'];
    if (usage) usageSet.add(usage);
  });
  const usageOptions: FilterOption[] = Array.from(usageSet).map(v => ({
    id: `usage=${v}`,
    name: v,
  }));

  // Phantom power requirement options
  const phantomSet = new Set<string>();
  components.forEach(c => {
    const phantom =
      c.specifications['phantomPower'] ||
      c.specifications['powerRequirement'] ||
      c.specifications['power'];
    if (phantom) phantomSet.add(phantom);
  });
  const phantomOptions: FilterOption[] = Array.from(phantomSet).map(v => ({
    id: `phantom=${v}`,
    name: v,
  }));

  const filterGroups: FilterGroup[] = [
    { title: 'Brand', type: 'manufacturer', options: brandOptions },
  ];

  if (typeOptions.length > 0) {
    filterGroups.push({
      title: 'Microphone Type',
      type: 'type',
      options: typeOptions,
    });
  }

  if (patternOptions.length > 0) {
    filterGroups.push({
      title: 'Polar Pattern',
      type: 'pattern',
      options: patternOptions,
    });
  }

  if (connectionOptions.length > 0) {
    filterGroups.push({
      title: 'Connection',
      type: 'connection',
      options: connectionOptions,
    });
  }

  if (frequencyOptions.length > 0) {
    filterGroups.push({
      title: 'Frequency Response',
      type: 'frequency',
      options: frequencyOptions,
    });
  }

  if (usageOptions.length > 0) {
    filterGroups.push({
      title: 'Usage Type',
      type: 'usage',
      options: usageOptions,
    });
  }

  if (phantomOptions.length > 0) {
    filterGroups.push({
      title: 'Phantom Power',
      type: 'phantom',
      options: phantomOptions,
    });
  }

  return filterGroups;
};
