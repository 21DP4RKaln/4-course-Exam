export interface Component {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  specifications: Record<string, string>;
  sku: string;
  brand?: string;
  manufacturer?: string;  cpu?: {
    brand: string;
    series: string;
    cores: number;
    multithreading: boolean;
    socket: string;
    frequency: number;
    maxRamCapacity: number;
    maxRamFrequency: number;
    integratedGpu: boolean;
  };
  gpu?: {
    brand: string;
    videoMemoryCapacity: number;
    memoryType: string;
    fanCount: number;
    chipType: string;
    hasDVI: boolean;
    hasVGA: boolean;
    hasDisplayPort: boolean;
    hasHDMI: boolean;
  };
  motherboard?: {
    brand: string;
    socket: string;
    memorySlots: number;
    processorSupport: string;
    memoryTypeSupported: string;
    maxRamCapacity: number;
    maxMemoryFrequency: number;
    maxVideoCards: number;
    sataPorts: number;
    m2Slots: number;
    sliCrossfireSupport: boolean;
    wifiBluetooth: boolean;
    nvmeSupport: boolean;
  };
  ram?: {
    brand: string;
    moduleCount: number;
    memoryType: string;
    maxFrequency: number;
    backlighting: boolean;
    voltage: number;
  };
  storage?: {
    brand: string;
    volume: number;
    type: string;
    nvme: boolean;
    size: string;
    compatibility: string;
    writeSpeed: number;
    readSpeed: number;
  };
  psu?: {
    brand: string;
    power: number;
    sataConnections: number;
    pciEConnections: number;
    pfc: boolean;
    hasFan: boolean;
    molexPataConnections: number;
  };
  cooling?: {
    brand: string;
    socket: string;
    fanDiameter: number;
    fanSpeed: number;
  };
  caseModel?: {
    brand: string;
    powerSupplyIncluded: boolean;
    color: string;
    material: string;
    audioIn: boolean;
    audioOut: boolean;
    usb2: number;
    usb3: number;
    usb32: number;
    usbTypeC: number;
    slots525: number;
    slots35: number;
    slots25: number;
    waterCoolingSupport: boolean;
  };
}
