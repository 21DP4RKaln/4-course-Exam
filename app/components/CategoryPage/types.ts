/* Component specifications */
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
  manufacturer?: string;
  rating?: number;
  ratingCount?: number;
  cpu?: {
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
  // Peripheral properties
  keyboard?: {
    brand: string;
    switchType: string;
    layout: string;
    form: string;
    connection: string;
    rgb: boolean;
    numpad: boolean;
  };
  mouse?: {
    brand: string;
    color: string;
    category: string;
    dpi: number;
    buttons: number;
    connection: string;
    rgb: boolean;
    weight: number;
    sensor: string;
    batteryType: string;
    batteryLife: number;
  };
  microphone?: {
    brand: string;
    type: string;
    pattern: string;
    frequency: number;
    sensitivity: number;
    interface: string;
    stand: boolean;
  };
  camera?: {
    brand: string;
    resolution: string;
    fps: number;
    fov: number;
    microphone: boolean;
    autofocus: boolean;
    connection: string;
  };
  monitor?: {
    brand: string;
    size: number;
    resolution: string;
    refreshRate: number;
    panelType: string;
    responseTime: number;
    brightness: number;
    hdr: boolean;
    ports: string;
    speakers: boolean;
    curved: boolean;
  };
  headphones?: {
    brand: string;
    type: string;
    connection: string;
    microphone: boolean;
    impedance: number;
    frequency: string;
    weight: number;
    noiseCancelling: boolean;
    rgb: boolean;
  };
  speakers?: {
    brand: string;
    type: string;
    totalWattage: number;
    frequency: string;
    connections: string;
    bluetooth: boolean;
    remote: boolean;
  };
  gamepad?: {
    brand: string;
    connection: string;
    platform: string;
    layout: string;
    vibration: boolean;
    rgb: boolean;
    batteryLife: number;
    programmable: boolean;
  };
  mousePad?: {
    brand: string;
    dimensions: string;
    thickness: number;
    material: string;
    rgb: boolean;
    surface: string;
  };
}

/* Peripheral specifications */
export interface peripheral {
  keyboard?: {
    brand: string;
    switchType: string;
    layout: string;
    form: string;
    connection: string;
    rgb: boolean;
    numpad: boolean;
  };
  mouse?: {
    brand: string;
    color: string;
    category: string;
    dpi: number;
    buttons: number;
    connection: string;
    rgb: boolean;
    weight: number;
    sensor: string;
    batteryType: string;
    batteryLife: number;
  };
  microphone?: {
    brand: string;
    type: string;
    pattern: string;
    frequency: number;
    sensitivity: number;
    interface: string;
    stand: boolean;
  };
  camera?: {
    brand: string;
    resolution: string;
    fps: number;
    fov: number;
    microphone: boolean;
    autofocus: boolean;
    connection: string;
  };
  monitor?: {
    brand: string;
    size: number;
    resolution: string;
    refreshRate: number;
    panelType: string;
    responseTime: number;
    brightness: number;
    hdr: boolean;
    ports: string;
    speakers: boolean;
    curved: boolean;
  };
  headphones?: {
    brand: string;
    type: string;
    connection: string;
    microphone: boolean;
    impedance: number;
    frequency: string;
    weight: number;
    noiseCancelling: boolean;
    rgb: boolean;
  };
  speakers?: {
    brand: string;
    type: string;
    totalWattage: number;
    frequency: string;
    connections: string;
    bluetooth: boolean;
    remote: boolean;
  };
  gamepad?: {
    brand: string;
    connection: string;
    platform: string;
    layout: string;
    vibration: boolean;
    rgb: boolean;
    batteryLife: number;
    programmable: boolean;
  };
  mousePad?: {
    brand: string;
    dimensions: string;
    thickness: number;
    material: string;
    rgb: boolean;
    surface: string;
  };
}

export interface Specification {
  id: string;
  name: string;
  displayName: string;
  values: string[];
  multiSelect?: boolean;
}

export interface CategoryPageProps {
  params: Promise<{ category?: string }>;
  type: 'peripheral' | 'component';
}
