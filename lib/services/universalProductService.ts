import { prisma } from '@/lib/prismaService';

export interface ProductCommonProps {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  stock: number;
  ratings?: {
    average: number;
    count: number;
  };
  longDescription?: string;
  related?: Product[];
}

export interface ConfigurationProduct extends ProductCommonProps {
  type: 'configuration';
  components: any[];
}

export interface ComponentProduct extends ProductCommonProps {
  type: 'component';
  category: string;
  specifications: Record<string, string>;
}

export interface PeripheralProduct extends ProductCommonProps {
  type: 'peripheral';
  category: string;
  specifications: Record<string, string>;
}

type Product = ConfigurationProduct | ComponentProduct | PeripheralProduct;

function extractComponentSpecifications(
  component: any
): Record<string, string> {
  const specifications: Record<string, string> = {};
  // CPU Specifikācijas
  if (component.cpu) {
    const cpu = component.cpu;
    if (cpu.brand) specifications['Brand'] = cpu.brand;
    if (cpu.series) specifications['Series'] = cpu.series;
    if (cpu.cores) specifications['Cores'] = String(cpu.cores);
    if (cpu.multithreading !== null)
      specifications['Multithreading'] = cpu.multithreading ? 'Yes' : 'No';
    if (cpu.socket) specifications['Socket'] = cpu.socket;
    if (cpu.frequency)
      specifications['Base Frequency'] = `${cpu.frequency} GHz`;
    if (cpu.maxRamCapacity)
      specifications['Max RAM Capacity'] = `${cpu.maxRamCapacity} GB`;
    if (cpu.maxRamFrequency)
      specifications['Max RAM Frequency'] = `${cpu.maxRamFrequency} MHz`;
    if (cpu.integratedGpu !== null)
      specifications['Integrated GPU'] = cpu.integratedGpu ? 'Yes' : 'No';
  }

  // GPU Specifikācijas
  if (component.gpu) {
    const gpu = component.gpu;
    if (gpu.brand) specifications['Brand'] = gpu.brand;
    if (gpu.videoMemoryCapacity)
      specifications['Video Memory'] = `${gpu.videoMemoryCapacity} GB`;
    if (gpu.memoryType) specifications['Memory Type'] = gpu.memoryType;
    if (gpu.fanCount) specifications['Fan Count'] = String(gpu.fanCount);
    if (gpu.chipType) specifications['Chip Type'] = gpu.chipType;
    if (gpu.hasDVI !== null)
      specifications['DVI Port'] = gpu.hasDVI ? 'Yes' : 'No';
    if (gpu.hasVGA !== null)
      specifications['VGA Port'] = gpu.hasVGA ? 'Yes' : 'No';
    if (gpu.hasDisplayPort !== null)
      specifications['DisplayPort'] = gpu.hasDisplayPort ? 'Yes' : 'No';
    if (gpu.hasHDMI !== null)
      specifications['HDMI Port'] = gpu.hasHDMI ? 'Yes' : 'No';
  }

  // RAM Specifikācijas
  if (component.ram) {
    const ram = component.ram;
    if (ram.brand) specifications['Brand'] = ram.brand;
    if (ram.moduleCount)
      specifications['Module Count'] = String(ram.moduleCount);
    if (ram.memoryType) specifications['Memory Type'] = ram.memoryType;
    if (ram.maxFrequency)
      specifications['Max Frequency'] = `${ram.maxFrequency} MHz`;
    if (ram.backlighting !== null)
      specifications['RGB Lighting'] = ram.backlighting ? 'Yes' : 'No';
    if (ram.voltage) specifications['Voltage'] = `${ram.voltage} V`;
  }

  // Datu krātuves specifikācijas
  if (component.storage) {
    const storage = component.storage;
    if (storage.brand) specifications['Brand'] = storage.brand;
    if (storage.volume) specifications['Capacity'] = `${storage.volume} GB`;
    if (storage.type) specifications['Type'] = storage.type;
    if (storage.nvme !== null)
      specifications['NVMe'] = storage.nvme ? 'Yes' : 'No';
    if (storage.size) specifications['Form Factor'] = storage.size;
    if (storage.compatibility)
      specifications['Interface'] = storage.compatibility;
    if (storage.writeSpeed)
      specifications['Write Speed'] = `${storage.writeSpeed} MB/s`;
    if (storage.readSpeed)
      specifications['Read Speed'] = `${storage.readSpeed} MB/s`;
  }

  // PSU (Barošanas bloka) specifikācijas
  if (component.psu) {
    const psu = component.psu;
    if (psu.brand) specifications['Brand'] = psu.brand;
    if (psu.power) specifications['Power'] = `${psu.power} W`;
    if (psu.sataConnections)
      specifications['SATA Connections'] = String(psu.sataConnections);
    if (psu.pciEConnections)
      specifications['PCIe Connections'] = String(psu.pciEConnections);
    if (psu.pfc !== null)
      specifications['Power Factor Correction'] = psu.pfc ? 'Yes' : 'No';
    if (psu.hasFan !== null) specifications['Fan'] = psu.hasFan ? 'Yes' : 'No';
    if (psu.molexPataConnections)
      specifications['Molex/PATA Connections'] = String(
        psu.molexPataConnections
      );
  }

  // Mātesplates specifikācijas
  if (component.motherboard) {
    const mb = component.motherboard;
    if (mb.brand) specifications['Brand'] = mb.brand;
    if (mb.socket) specifications['Socket'] = mb.socket;
    if (mb.memorySlots) specifications['Memory Slots'] = String(mb.memorySlots);
    if (mb.processorSupport)
      specifications['Processor Support'] = mb.processorSupport;
    if (mb.memoryTypeSupported)
      specifications['Memory Type'] = mb.memoryTypeSupported;
    if (mb.maxRamCapacity)
      specifications['Max RAM Capacity'] = `${mb.maxRamCapacity} GB`;
    if (mb.maxMemoryFrequency)
      specifications['Max Memory Frequency'] = `${mb.maxMemoryFrequency} MHz`;
    if (mb.maxVideoCards)
      specifications['Max Video Cards'] = String(mb.maxVideoCards);
    if (mb.sataPorts) specifications['SATA Ports'] = String(mb.sataPorts);
    if (mb.m2Slots) specifications['M.2 Slots'] = String(mb.m2Slots);
    if (mb.sliCrossfireSupport !== null)
      specifications['SLI/Crossfire Support'] = mb.sliCrossfireSupport
        ? 'Yes'
        : 'No';
    if (mb.wifiBluetooth !== null)
      specifications['WiFi/Bluetooth'] = mb.wifiBluetooth ? 'Yes' : 'No';
    if (mb.nvmeSupport !== null)
      specifications['NVMe Support'] = mb.nvmeSupport ? 'Yes' : 'No';
  }

  // Dzesēšanas specifikācijas
  if (component.cooling) {
    const cooling = component.cooling;
    if (cooling.brand) specifications['Brand'] = cooling.brand;
    if (cooling.socket) specifications['Socket Compatibility'] = cooling.socket;
    if (cooling.fanDiameter)
      specifications['Fan Diameter'] = `${cooling.fanDiameter} mm`;
    if (cooling.fanSpeed)
      specifications['Fan Speed'] = `${cooling.fanSpeed} RPM`;
  }

  // Korpusa specifikācijas
  if (component.caseModel) {
    const caseModel = component.caseModel;
    if (caseModel.brand) specifications['Brand'] = caseModel.brand;
    if (caseModel.powerSupplyIncluded !== null)
      specifications['PSU Included'] = caseModel.powerSupplyIncluded
        ? 'Yes'
        : 'No';
    if (caseModel.color) specifications['Color'] = caseModel.color;
    if (caseModel.material) specifications['Material'] = caseModel.material;
    if (caseModel.audioIn !== null)
      specifications['Audio In'] = caseModel.audioIn ? 'Yes' : 'No';
    if (caseModel.audioOut !== null)
      specifications['Audio Out'] = caseModel.audioOut ? 'Yes' : 'No';
    if (caseModel.usb2)
      specifications['USB 2.0 Ports'] = String(caseModel.usb2);
    if (caseModel.usb3)
      specifications['USB 3.0 Ports'] = String(caseModel.usb3);
    if (caseModel.usb32)
      specifications['USB 3.2 Ports'] = String(caseModel.usb32);
    if (caseModel.usbTypeC)
      specifications['USB Type-C Ports'] = String(caseModel.usbTypeC);
    if (caseModel.slots525)
      specifications['5.25" Bays'] = String(caseModel.slots525);
    if (caseModel.slots35)
      specifications['3.5" Bays'] = String(caseModel.slots35);
    if (caseModel.slots25)
      specifications['2.5" Bays'] = String(caseModel.slots25);
    if (caseModel.waterCoolingSupport !== null)
      specifications['Water Cooling Support'] = caseModel.waterCoolingSupport
        ? 'Yes'
        : 'No';
  }

  // Perifērijas ierīču specifikācijas
  if (component.keyboard) {
    const keyboard = component.keyboard;
    if (keyboard.brand) specifications['Brand'] = keyboard.brand;
    if (keyboard.switchType)
      specifications['Switch Type'] = keyboard.switchType;
    if (keyboard.backlighting !== null)
      specifications['Backlighting'] = keyboard.backlighting ? 'Yes' : 'No';
    if (keyboard.size) specifications['Size'] = keyboard.size;
    if (keyboard.isWireless !== null)
      specifications['Wireless'] = keyboard.isWireless ? 'Yes' : 'No';
  }

  if (component.mouse) {
    const mouse = component.mouse;
    if (mouse.brand) specifications['Brand'] = mouse.brand;
    if (mouse.dpi) specifications['DPI'] = String(mouse.dpi);
    if (mouse.buttons) specifications['Buttons'] = String(mouse.buttons);
    if (mouse.isWireless !== null)
      specifications['Wireless'] = mouse.isWireless ? 'Yes' : 'No';
    if (mouse.sensorType) specifications['Sensor Type'] = mouse.sensorType;
  }

  if (component.microphone) {
    const microphone = component.microphone;
    if (microphone.brand) specifications['Brand'] = microphone.brand;
    if (microphone.frequencyResponse)
      specifications['Frequency Response'] = microphone.frequencyResponse;
    if (microphone.pattern) specifications['Pattern'] = microphone.pattern;
    if (microphone.isWireless !== null)
      specifications['Wireless'] = microphone.isWireless ? 'Yes' : 'No';
  }

  if (component.camera) {
    const camera = component.camera;
    if (camera.brand) specifications['Brand'] = camera.brand;
    if (camera.resolution) specifications['Resolution'] = camera.resolution;
    if (camera.frameRate)
      specifications['Frame Rate'] = `${camera.frameRate} fps`;
    if (camera.fieldOfView)
      specifications['Field of View'] = `${camera.fieldOfView}°`;
    if (camera.autofocus !== null)
      specifications['Autofocus'] = camera.autofocus ? 'Yes' : 'No';
  }

  if (component.monitor) {
    const monitor = component.monitor;
    if (monitor.brand) specifications['Brand'] = monitor.brand;
    if (monitor.screenSize)
      specifications['Screen Size'] = `${monitor.screenSize}"`;
    if (monitor.resolution) specifications['Resolution'] = monitor.resolution;
    if (monitor.refreshRate)
      specifications['Refresh Rate'] = `${monitor.refreshRate} Hz`;
    if (monitor.panelType) specifications['Panel Type'] = monitor.panelType;
    if (monitor.curvature) specifications['Curvature'] = monitor.curvature;
  }

  if (component.headphones) {
    const headphones = component.headphones;
    if (headphones.brand) specifications['Brand'] = headphones.brand;
    if (headphones.type) specifications['Type'] = headphones.type;
    if (headphones.frequencyResponse)
      specifications['Frequency Response'] = headphones.frequencyResponse;
    if (headphones.impedance)
      specifications['Impedance'] = `${headphones.impedance} Ω`;
    if (headphones.isWireless !== null)
      specifications['Wireless'] = headphones.isWireless ? 'Yes' : 'No';
  }

  if (component.speakers) {
    const speakers = component.speakers;
    if (speakers.brand) specifications['Brand'] = speakers.brand;
    if (speakers.totalPower)
      specifications['Total Power'] = `${speakers.totalPower} W`;
    if (speakers.frequencyResponse)
      specifications['Frequency Response'] = speakers.frequencyResponse;
    if (speakers.connectivity)
      specifications['Connectivity'] = speakers.connectivity;
    if (speakers.isWireless !== null)
      specifications['Wireless'] = speakers.isWireless ? 'Yes' : 'No';
  }

  if (component.gamepad) {
    const gamepad = component.gamepad;
    if (gamepad.brand) specifications['Brand'] = gamepad.brand;
    if (gamepad.compatibility)
      specifications['Compatibility'] = gamepad.compatibility;
    if (gamepad.isWireless !== null)
      specifications['Wireless'] = gamepad.isWireless ? 'Yes' : 'No';
    if (gamepad.batteryLife)
      specifications['Battery Life'] = `${gamepad.batteryLife} hours`;
    if (gamepad.vibration !== null)
      specifications['Vibration'] = gamepad.vibration ? 'Yes' : 'No';
  }

  if (component.mousePad) {
    const mousePad = component.mousePad;
    if (mousePad.brand) specifications['Brand'] = mousePad.brand;
    if (mousePad.material) specifications['Material'] = mousePad.material;
    if (mousePad.size) specifications['Size'] = mousePad.size;
    if (mousePad.thickness)
      specifications['Thickness'] = `${mousePad.thickness} mm`;
    if (mousePad.ledLighting !== null)
      specifications['LED Lighting'] = mousePad.ledLighting ? 'Yes' : 'No';
  }

  return specifications;
}

/**
 * Get product by ID - This is a universal function that will fetch product details
 * regardless of whether it's a configuration, component, or peripheral
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const configuration = await prisma.configuration.findUnique({
      where: {
        id,
        isTemplate: true,
      },
      include: {
        components: {
          include: {
            component: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (configuration) {
      const components = configuration.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      }));

      const discountPrice = configuration.isPublic
        ? Math.round(configuration.totalPrice * 0.9 * 100) / 100
        : null;

      const relatedConfigurations = await prisma.configuration.findMany({
        where: {
          isTemplate: true,
          id: { not: id },
        },
        include: {
          components: {
            include: {
              component: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        take: 3,
      });

      const relatedProducts = relatedConfigurations.map(config => {
        return {
          id: config.id,
          type: 'configuration' as const,
          name: config.name,
          description: config.description || '',
          price: config.totalPrice,
          discountPrice: config.isPublic
            ? Math.round(config.totalPrice * 0.9 * 100) / 100
            : null,
          imageUrl: null,
          stock: 10,
          ratings: {
            average: 4.5,
            count: 15,
          },
          components: config.components.map(item => ({
            id: item.component.id,
            name: item.component.name,
            category: item.component.category.name,
            price: item.component.price,
            quantity: item.quantity,
          })),
        };
      });

      return {
        id: configuration.id,
        type: 'configuration',
        name: configuration.name,
        description: configuration.description || '',
        longDescription: configuration.description || '',
        price: configuration.totalPrice,
        discountPrice,
        imageUrl: null,
        stock: 10,
        ratings: {
          average: 4.5,
          count: 15,
        },
        components,
        related: relatedProducts,
      };
    }

    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        category: true,
        cpu: true,
        gpu: true,
        motherboard: true,
        ram: true,
        storage: true,
        psu: true,
        cooling: true,
        caseModel: true,
      },
    });
    if (component) {
      const specifications = extractComponentSpecifications(component);

      const isPeripheral = component.category.type === 'peripheral';
      const productType = isPeripheral ? 'peripheral' : 'component';

      const relatedComponents = await prisma.component.findMany({
        where: {
          categoryId: component.categoryId,
          id: { not: id },
        },
        include: {
          category: true,
          cpu: true,
          gpu: true,
          motherboard: true,
          ram: true,
          storage: true,
          psu: true,
          cooling: true,
          caseModel: true,
        },
        take: 3,
      });
      const relatedProducts: Product[] = relatedComponents.map(relComp => {
        const relSpecs = extractComponentSpecifications(relComp);

        const relatedProductType =
          relComp.category.type === 'peripheral' ? 'peripheral' : 'component';

        if (relatedProductType === 'peripheral') {
          return {
            id: relComp.id,
            type: 'peripheral',
            name: relComp.name,
            category: relComp.category.name,
            description: relComp.description || '',
            specifications: relSpecs,
            price: relComp.price,
            discountPrice: relComp.discountPrice || null,
            imageUrl: relComp.imagesUrl || null,
            stock: relComp.quantity,
            ratings: { average: 4.2, count: 12 },
          };
        } else {
          return {
            id: relComp.id,
            type: 'component',
            name: relComp.name,
            category: relComp.category.name,
            description: relComp.description || '',
            specifications: relSpecs,
            price: relComp.price,
            discountPrice: relComp.discountPrice || null,
            imageUrl: relComp.imagesUrl || null,
            stock: relComp.quantity,
            ratings: { average: 4.2, count: 12 },
          };
        }
      });

      if (productType === 'peripheral') {
        return {
          id: component.id,
          type: 'peripheral',
          name: component.name,
          category: component.category.name,
          description: component.description || '',
          specifications,
          price: component.price,
          discountPrice: component.discountPrice || null,
          imageUrl: component.imagesUrl || null,
          stock: component.quantity,
          ratings: { average: 4.3, count: 18 },
          related: relatedProducts,
        };
      } else {
        return {
          id: component.id,
          type: 'component',
          name: component.name,
          category: component.category.name,
          description: component.description || '',
          specifications,
          price: component.price,
          discountPrice: component.discountPrice || null,
          imageUrl: component.imagesUrl || null,
          stock: component.quantity,
          ratings: { average: 4.3, count: 18 },
          related: relatedProducts,
        };
      }
    }

    const userConfiguration = await prisma.configuration.findUnique({
      where: {
        id,
        isTemplate: false,
      },
      include: {
        components: {
          include: {
            component: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (userConfiguration) {
      const components = userConfiguration.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      }));

      return {
        id: userConfiguration.id,
        type: 'configuration',
        name: userConfiguration.name,
        description: userConfiguration.description || '',
        longDescription: userConfiguration.description || '',
        price: userConfiguration.totalPrice,
        discountPrice: null,
        imageUrl: null,
        stock: userConfiguration.status === 'APPROVED' ? 10 : 0,
        ratings: {
          average: 0,
          count: 0,
        },
        components,
        related: [],
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get all products - returns configurations, components, and peripherals
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const products: Product[] = [];

    const configurations = await prisma.configuration.findMany({
      where: {
        isTemplate: true,
      },
      include: {
        components: {
          include: {
            component: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    for (const config of configurations) {
      const components = config.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      }));

      const discountPrice = config.isPublic
        ? Math.round(config.totalPrice * 0.9 * 100) / 100
        : null;

      products.push({
        id: config.id,
        type: 'configuration',
        name: config.name,
        description: config.description || '',
        price: config.totalPrice,
        discountPrice,
        imageUrl: null,
        stock: 10,
        ratings: {
          average: 4.5,
          count: 15,
        },
        components,
      });
    }
    const components = await prisma.component.findMany({
      include: {
        category: true,
        cpu: true,
        gpu: true,
        motherboard: true,
        ram: true,
        storage: true,
        psu: true,
        cooling: true,
        caseModel: true,
      },
      where: {
        quantity: {
          gt: 0,
        },
      },
      take: 50,
    });
    for (const component of components) {
      const specifications = extractComponentSpecifications(component);

      const isPeripheral = component.category.type === 'peripheral';
      const productType = isPeripheral ? 'peripheral' : 'component';

      products.push({
        id: component.id,
        type: productType as 'component' | 'peripheral',
        name: component.name,
        category: component.category.name,
        description: component.description || '',
        specifications,
        price: component.price,
        discountPrice: component.discountPrice || null,
        imageUrl: component.imagesUrl || null,
        stock: component.quantity,
        ratings: {
          average: 4.2,
          count: 12,
        },
      });
    }

    return products;
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

/**
 * Get products by category (like 'gaming', 'workstation', 'cpu', 'gpu', etc.)
 */
export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  try {
    const products: Product[] = [];

    const category = await prisma.componentCategory.findUnique({
      where: {
        slug: categorySlug,
      },
    });

    if (!category) {
      if (
        ['gaming', 'workstation', 'office', 'budget'].includes(categorySlug)
      ) {
        const configurations = await prisma.configuration.findMany({
          where: {
            isTemplate: true,
          },
          include: {
            components: {
              include: {
                component: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        });
        const filteredConfigs = configurations.filter(config => {
          const hasRTX = config.components.some(item =>
            item.component.name.toLowerCase().includes('rtx')
          );
          const hasRyzen9 = config.components.some(item =>
            item.component.name.toLowerCase().includes('ryzen 9')
          );

          if (categorySlug === 'gaming' && hasRTX) return true;
          if (categorySlug === 'workstation' && hasRyzen9) return true;
          if (categorySlug === 'budget' && config.totalPrice < 1000)
            return true;
          if (
            categorySlug === 'office' &&
            !hasRTX &&
            !hasRyzen9 &&
            config.totalPrice < 1500
          )
            return true;

          return false;
        });

        for (const config of filteredConfigs) {
          const components = config.components.map(item => ({
            id: item.component.id,
            name: item.component.name,
            category: item.component.category.name,
            price: item.component.price,
            quantity: item.quantity,
          }));

          const discountPrice = config.isPublic
            ? Math.round(config.totalPrice * 0.9 * 100) / 100
            : null;

          products.push({
            id: config.id,
            type: 'configuration',
            name: config.name,
            description: config.description || '',
            price: config.totalPrice,
            discountPrice,
            imageUrl: null,
            stock: 10,
            ratings: {
              average: 4.5,
              count: 15,
            },
            components,
          });
        }
      }
    } else {
      const components = await prisma.component.findMany({
        where: {
          categoryId: category.id,
          quantity: {
            gt: 0,
          },
        },
        include: {
          category: true,
          cpu: true,
          gpu: true,
          motherboard: true,
          ram: true,
          storage: true,
          psu: true,
          cooling: true,
          caseModel: true,
        },
      });
      for (const component of components) {
        const specifications = extractComponentSpecifications(component);

        const isPeripheral = component.category.type === 'peripheral';
        const productType = isPeripheral ? 'peripheral' : 'component';

        products.push({
          id: component.id,
          type: productType as 'component' | 'peripheral',
          name: component.name,
          category: component.category.name,
          description: component.description || '',
          specifications,
          price: component.price,
          discountPrice: component.discountPrice || null,
          imageUrl: component.imagesUrl || null,
          stock: component.quantity,
          ratings: {
            average: 4.2,
            count: 12,
          },
        });
      }
    }

    return products;
  } catch (error) {
    console.error(
      `Error fetching products for category ${categorySlug}:`,
      error
    );
    return [];
  }
}
