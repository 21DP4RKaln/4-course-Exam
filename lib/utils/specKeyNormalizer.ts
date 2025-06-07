export const normalizeSpecKey = (key: string): string => {
  const normalized = key.trim().toLowerCase();

  const mappings: Record<string, string> = {
    processor: 'cpu',
    'processor model': 'model',
    'socket type': 'socket',
    'core count': 'cores',
    'thread count': 'threads',
    'base frequency': 'frequency',
    'max turbo frequency': 'boostclock',
    tdp: 'cpu_tdp',
    'integrated graphics': 'integratedgraphics',
    family: 'series',

    'graphics card': 'gpu',
    'gpu model': 'model',
    'memory size': 'memorysize',
    'memory type': 'memorytype',
    interface: 'gpu_interface',
    'memory interface': 'buswidth',
    'cuda cores': 'streamProcessors',
    'power consumption': 'gpu_tdp',

    memory: 'ram',
    capacity: 'ram_capacity',
    'memory speed': 'speed',
    latency: 'cas',

    manufacturer: 'brand',
    dimensions: 'size',
  };

  for (const [pattern, replacement] of Object.entries(mappings)) {
    if (normalized === pattern || normalized.includes(pattern)) {
      return replacement;
    }
  }

  return normalized;
};
