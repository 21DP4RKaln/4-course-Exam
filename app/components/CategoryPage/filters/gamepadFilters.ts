import { Component } from '../types';
import { FilterGroup, FilterOption } from '../filterInterfaces';
import { extractBrandOptions } from './brandUtils';

export const createGamepadFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const brandMap = extractBrandOptions(components);
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(
    ([value, label]) => ({
      id: `manufacturer=${value}`,
      name: label,
    })
  );

  // Connection type options
  const connectionSet = new Set<string>();
  components.forEach(c => {
    const connection =
      c.gamepad?.connection ||
      c.specifications?.['connection'] ||
      c.specifications?.['connectivity'];
    if (connection) connectionSet.add(connection);
  });
  const connectionOptions: FilterOption[] = Array.from(connectionSet).map(
    conn => ({
      id: `connection=${conn}`,
      name: conn,
    })
  );

  // Platform compatibility options
  const platformSet = new Set<string>();
  components.forEach(c => {
    const platform =
      c.gamepad?.platform ||
      c.specifications?.['platform'] ||
      c.specifications?.['compatibility'];
    if (platform) platformSet.add(platform);
  });
  const platformOptions: FilterOption[] = Array.from(platformSet).map(
    platform => ({
      id: `platform=${platform}`,
      name: platform,
    })
  );

  // Layout type options
  const layoutSet = new Set<string>();
  components.forEach(c => {
    const layout =
      c.gamepad?.layout ||
      c.specifications?.['layout'] ||
      c.specifications?.['type'];
    if (layout) layoutSet.add(layout);
  });
  const layoutOptions: FilterOption[] = Array.from(layoutSet).map(layout => ({
    id: `layout=${layout}`,
    name: layout,
  }));

  // RGB lighting options
  const rgbSet = new Set<string>();
  components.forEach(c => {
    const rgb =
      c.gamepad?.rgb ||
      c.specifications?.['rgb'] ||
      c.specifications?.['lighting'];
    if (rgb !== undefined) rgbSet.add(String(rgb));
  });
  const rgbOptions: FilterOption[] = Array.from(rgbSet).map(rgb => ({
    id: `rgb=${rgb}`,
    name: rgb === 'true' ? 'RGB Lighting' : 'No RGB',
  }));

  // Vibration/Haptic feedback options
  const vibrationSet = new Set<string>();
  components.forEach(c => {
    const vibration =
      c.gamepad?.vibration ||
      c.specifications?.['vibration'] ||
      c.specifications?.['haptic'];
    if (vibration !== undefined) vibrationSet.add(String(vibration));
  });
  const vibrationOptions: FilterOption[] = Array.from(vibrationSet).map(
    vib => ({
      id: `vibration=${vib}`,
      name: vib === 'true' ? 'Vibration Support' : 'No Vibration',
    })
  );

  // Programmable options
  const programmableSet = new Set<string>();
  components.forEach(c => {
    const programmable =
      c.gamepad?.programmable ||
      c.specifications?.['programmable'] ||
      c.specifications?.['customizable'];
    if (programmable !== undefined) programmableSet.add(String(programmable));
  });
  const programmableOptions: FilterOption[] = Array.from(programmableSet).map(
    prog => ({
      id: `programmable=${prog}`,
      name: prog === 'true' ? 'Programmable' : 'Not Programmable',
    })
  );

  const filterGroups: FilterGroup[] = [
    { title: 'Brand', type: 'manufacturer', options: brandOptions },
  ];

  if (connectionOptions.length > 0) {
    filterGroups.push({
      title: 'Connection',
      type: 'connection',
      options: connectionOptions,
    });
  }

  if (platformOptions.length > 0) {
    filterGroups.push({
      title: 'Platform',
      type: 'platform',
      options: platformOptions,
    });
  }

  if (layoutOptions.length > 0) {
    filterGroups.push({
      title: 'Layout',
      type: 'layout',
      options: layoutOptions,
    });
  }

  if (rgbOptions.length > 0) {
    filterGroups.push({
      title: 'RGB Lighting',
      type: 'rgb',
      options: rgbOptions,
    });
  }

  if (vibrationOptions.length > 0) {
    filterGroups.push({
      title: 'Vibration',
      type: 'vibration',
      options: vibrationOptions,
    });
  }

  if (programmableOptions.length > 0) {
    filterGroups.push({
      title: 'Programmable',
      type: 'programmable',
      options: programmableOptions,
    });
  }

  return filterGroups;
};
