// Specifikāciju atslēgu normalizēšanas funkcija
export const normalizeSpecKey = (key: string): string => {
  // Noņemam tukšumus un konvertējam uz mazajiem burtiem
  const normalized = key.trim().toLowerCase()
  
  // Speciālie aizvietojumi biežāk sastopamajām atslēgām
  const mappings: Record<string, string> = {
    // CPU atslēgas
    'processor': 'cpu',
    'processor model': 'model',
    'socket type': 'socket',
    'core count': 'cores',
    'thread count': 'threads',
    'base frequency': 'frequency',
    'max turbo frequency': 'boostclock',
    'tdp': 'cpu_tdp',
    'integrated graphics': 'integratedgraphics',
    'family': 'series',
    
    // GPU atslēgas
    'graphics card': 'gpu',
    'gpu model': 'model',
    'memory size': 'memorysize',
    'memory type': 'memorytype',
    'interface': 'gpu_interface',
    'memory interface': 'buswidth',
    'cuda cores': 'streamProcessors',
    'power consumption': 'gpu_tdp',
    
    // RAM atslēgas
    'memory': 'ram',
    'capacity': 'ram_capacity',
    'memory speed': 'speed',
    'latency': 'cas',
    
    // Citas biežas aizvietošanas
    'manufacturer': 'brand',
    'dimensions': 'size'
  }
  
  // Pārbaudām, vai normalizētā atslēga ir kādā no mūsu speciālajiem aizvietojumiem
  for (const [pattern, replacement] of Object.entries(mappings)) {
    if (normalized === pattern || normalized.includes(pattern)) {
      return replacement
    }
  }
  
  // Atgriežam sākotnējo atslēgu, ja nav atrasts aizvietojums
  return normalized
}
