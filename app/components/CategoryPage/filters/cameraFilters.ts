import { Component } from '../types';
import { FilterGroup, FilterOption } from '../filterInterfaces';
import { extractBrandOptions } from './brandUtils';

export const createCameraFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const brandMap = extractBrandOptions(components);
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(
    ([value, label]) => ({
      id: `manufacturer=${value}`,
      name: label,
    })
  );

  // Resolution options
  const resolutionSet = new Set<string>();
  components.forEach(c => {
    const resolution =
      c.specifications['resolution'] ||
      c.specifications['maxResolution'] ||
      c.specifications['videoResolution'];
    if (resolution) resolutionSet.add(resolution);
  });
  const resolutionOptions: FilterOption[] = Array.from(resolutionSet).map(
    v => ({ id: `resolution=${v}`, name: v })
  );

  // Frame rate options
  const frameRateSet = new Set<string>();
  components.forEach(c => {
    const frameRate =
      c.specifications['frameRate'] ||
      c.specifications['fps'] ||
      c.specifications['maxFps'];
    if (frameRate) frameRateSet.add(frameRate);
  });
  const frameRateOptions: FilterOption[] = Array.from(frameRateSet).map(v => ({
    id: `frameRate=${v}`,
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

  // Autofocus options
  const autofocusSet = new Set<string>();
  components.forEach(c => {
    const autofocus =
      c.specifications['autofocus'] ||
      c.specifications['focus'] ||
      c.specifications['focusType'];
    if (autofocus) autofocusSet.add(autofocus);
  });
  const autofocusOptions: FilterOption[] = Array.from(autofocusSet).map(v => ({
    id: `autofocus=${v}`,
    name: v,
  }));

  // Field of view options
  const fovSet = new Set<string>();
  components.forEach(c => {
    const fov =
      c.specifications['fieldOfView'] ||
      c.specifications['fov'] ||
      c.specifications['viewAngle'];
    if (fov) fovSet.add(fov);
  });
  const fovOptions: FilterOption[] = Array.from(fovSet).map(v => ({
    id: `fieldOfView=${v}`,
    name: v,
  }));

  const filterGroups: FilterGroup[] = [
    { title: 'Brand', type: 'manufacturer', options: brandOptions },
  ];

  if (resolutionOptions.length > 0) {
    filterGroups.push({
      title: 'Resolution',
      type: 'resolution',
      options: resolutionOptions,
    });
  }

  if (frameRateOptions.length > 0) {
    filterGroups.push({
      title: 'Frame Rate',
      type: 'frameRate',
      options: frameRateOptions,
    });
  }

  if (connectionOptions.length > 0) {
    filterGroups.push({
      title: 'Connection',
      type: 'connection',
      options: connectionOptions,
    });
  }

  if (autofocusOptions.length > 0) {
    filterGroups.push({
      title: 'Autofocus',
      type: 'autofocus',
      options: autofocusOptions,
    });
  }

  if (fovOptions.length > 0) {
    filterGroups.push({
      title: 'Field of View',
      type: 'fieldOfView',
      options: fovOptions,
    });
  }

  return filterGroups;
};
