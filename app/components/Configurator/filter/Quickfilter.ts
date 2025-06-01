export interface Filter {
  id: string
  name: string
  category: string
}

export const filters: Record<string, Filter[]> = {
  cpu: [
    //brand Intel
    { id: 'intel', name: 'Intel', category: 'cpu'},
    //Intel series
    { id: 'intel-core-i9', name: 'Core i9', category: 'cpu' },
    { id: 'intel-core-i7', name: 'Core i7', category: 'cpu' },
    { id: 'intel-core-i5', name: 'Core i5', category: 'cpu' },
    { id: 'intel-core-i3', name: 'Core i3', category: 'cpu' },
    //brand AMD
    { id: 'amd', name: 'AMD', category: 'cpu' },
    //AMD series
    { id: 'amd-ryzen-9', name: 'Ryzen 9', category: 'cpu' },
    { id: 'amd-ryzen-7', name: 'Ryzen 7', category: 'cpu' },
    { id: 'amd-ryzen-5', name: 'Ryzen 5', category: 'cpu' },
    { id: 'amd-threadripper', name: 'AMD Threadripper', category: 'cpu' },
  ],
  gpu: [
    //brand NVIDIA
    { id: 'nvidia', name: 'NVIDIA', category: 'gpu' },
    //NVIDIA architecture
    { id: 'nvidia-rtx-3050', name: 'RTX 3050', category: 'gpu' },
    { id: 'nvidia-rtx-4060', name: 'RTX 4060', category: 'gpu' },
    { id: 'nvidia-rtx-4060-ti', name: 'RTX 4060 Ti', category: 'gpu' },
    { id: 'nvidia-rtx-4070', name: 'RTX 4070', category: 'gpu' },
    { id: 'nvidia-rtx-4070-super', name: 'RTX 4070 Super', category: 'gpu' },
    { id: 'nvidia-rtx-4070-ti-super', name: 'RTX 4070 Ti Super', category: 'gpu' },
    { id: 'nvidia-rtx-4090', name: 'RTX 4090', category: 'gpu' },
    //brand AMD
    { id: 'amd', name: 'AMD', category: 'gpu' },
    //AMD architecture
    { id: 'amd-rx-6400', name: 'RX 6400', category: 'gpu' },
    { id: 'amd-rx-7600', name: 'RX 7600', category: 'gpu' },
    { id: 'amd-rx-7900-xtx', name: 'RX 7900 XTX', category: 'gpu' },
    //Brand Intel
    { id: 'intel', name: 'Intel', category: 'gpu' },
    //Intel architecture
    { id: 'intel-a580', name: 'A580', category: 'gpu' },
  ],
  motherboard: [
    //form factors
    { id: 'atx', name: 'ATX', category: 'motherboard' },
    { id: 'micro-atx', name: 'Micro-ATX', category: 'motherboard' },
    { id: 'mini-itx', name: 'Mini-ITX', category: 'motherboard' },
    //compatibility
    { id: 'intel-compatible', name: 'Intel Compatible', category: 'motherboard' },
    { id: 'amd-compatible', name: 'AMD Compatible', category: 'motherboard' },
  ],  ram: [
    //types
    { id: 'ddr4', name: 'DDR4', category: 'ram' },
    { id: 'ddr5', name: 'DDR5', category: 'ram' },
    //capacities
    { id: '16gb', name: '16GB', category: 'ram' },
    { id: '32gb', name: '32GB', category: 'ram' },
    { id: '64gb', name: '64GB', category: 'ram' },
    { id: '128gb', name: '128GB', category: 'ram' },
    { id: '256gb', name: '256GB', category: 'ram' },
  ],
  storage: [
    //types
    { id: 'nvme', name: 'NVMe SSD', category: 'storage' },
    { id: 'sata-ssd', name: 'SATA SSD', category: 'storage' },
    { id: 'hdd', name: 'HDD', category: 'storage' },
  ],
  cooling: [
    //types
    { id: 'air', name: 'Air cooling', category: 'cooling' },
    { id: 'fluid', name: 'Liquid cooling', category: 'cooling' },
  ],
  case: [
    //form factors
    { id: 'mini-itx', name: 'Mini-ITX', category: 'case' },
    { id: 'micro-atx', name: 'Micro-ATX', category: 'case' },
    { id: 'atx', name: 'ATX', category: 'case' },
    { id: 'eatx', name: 'eATX', category: 'case' },
  ],
  psu: [
    //certifications
    { id: '80+bronze', name: '80+ Bronze', category: 'psu' },
    { id: '80+gold', name: '80+ Gold', category: 'psu' },
    { id: '80+platinum', name: '80+ Platinum', category: 'psu' },
    { id: '80+titanium', name: '80+ Titanium', category: 'psu' },
  ],
  services: [
    // types of services
    { id: 'windows', name: 'Windows', category: 'services' },
    { id: 'wifi+bluetooth', name: 'WiFi + Bluetooth adapter', category: 'services' },
    { id: '4gpu', name: 'For GPU', category: 'services' },
    { id: 'sound', name: 'Sound Card', category: 'services' },
    { id: 'capture', name: 'Capture Card', category: 'services' },
  ],
}
