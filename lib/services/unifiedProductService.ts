import { prisma } from '@/lib/prismaService';
import { ProductType } from '@prisma/client';

export interface ProductBase {
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
}

export interface ConfigurationType extends ProductBase {
  type: 'configuration';
  category: string;
  components: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
}

export interface ComponentType extends ProductBase {
  type: 'component' | 'peripheral';
  category: string;
  specifications: Record<string, string>;
}

export type Product = ConfigurationType | ComponentType;

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Get discount price if available and not expired
 */
export function getDiscountPrice(
  price: number,
  discountPrice: number | null,
  discountExpiresAt: Date | null
): number | null {
  if (!discountPrice) return null;
  if (discountExpiresAt && new Date() > discountExpiresAt) return null;
  return discountPrice;
}

/**
 * Calculate discount price for configurations
 */
export function calculateDiscountPrice(
  price: number,
  discountData: boolean | number | null,
  discountExpiresAt?: Date | null
): number | null {
  if (typeof discountData === 'boolean') {
    return discountData ? price * 0.9 : null;
  } else {
    return getDiscountPrice(price, discountData, discountExpiresAt || null);
  }
}

/**
 * Determine configuration category based on components
 */
export function getConfigCategory(specs: Record<string, string>): string {
  if (
    specs.gpu &&
    (specs.gpu.toLowerCase().includes('rtx') ||
      specs.gpu.toLowerCase().includes('geforce'))
  ) {
    return 'gaming';
  } else if (
    specs.cpu &&
    (specs.cpu.toLowerCase().includes('ryzen 9') ||
      specs.cpu.toLowerCase().includes('i9'))
  ) {
    return 'workstation';
  } else if (
    specs.cpu &&
    (specs.cpu.toLowerCase().includes('i3') ||
      specs.cpu.toLowerCase().includes('ryzen 3'))
  ) {
    return 'budget';
  } else {
    return 'office';
  }
}

/**
 * Extract specifications from a component including structured data from component tables
 */
export function extractComponentSpecifications(
  component: any
): Record<string, string> {
  const specifications: Record<string, string> = {};

  if (
    component.specifications &&
    typeof component.specifications === 'object'
  ) {
    Object.entries(component.specifications).forEach(([key, value]) => {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        specifications[key] = String(value);
      }
    });
  }
  if (component.cpu) {
    specifications['Brand'] = component.cpu.brand || '';

    // Extract series from CPU name if series field is empty
    let series = component.cpu.series || '';
    if (!series && component.name) {
      const name = component.name.toLowerCase();
      if (name.includes('core i3')) series = 'Core i3';
      else if (name.includes('core i5')) series = 'Core i5';
      else if (name.includes('core i7')) series = 'Core i7';
      else if (name.includes('core i9')) series = 'Core i9';
      else if (name.includes('ryzen 3')) series = 'Ryzen 3';
      else if (name.includes('ryzen 5')) series = 'Ryzen 5';
      else if (name.includes('ryzen 7')) series = 'Ryzen 7';
      else if (name.includes('ryzen 9')) series = 'Ryzen 9';
    }
    specifications['Series'] = series;

    specifications['Cores'] = String(component.cpu.cores || '');
    specifications['Multithreading'] = component.cpu.multithreading
      ? 'Yes'
      : 'No';
    specifications['Socket'] = component.cpu.socket || '';
    specifications['Base Frequency'] = `${component.cpu.frequency || 0} GHz`;
    specifications['Max RAM Capacity'] =
      `${component.cpu.maxRamCapacity || 0} GB`;
    specifications['Max RAM Frequency'] =
      `${component.cpu.maxRamFrequency || 0} MHz`;
    specifications['Integrated GPU'] = component.cpu.integratedGpu
      ? 'Yes'
      : 'No';
    // Power Consumption removed as requested
  }
  if (component.gpu) {
    specifications['Brand'] = component.gpu.brand || '';
    specifications['Video Memory'] =
      `${component.gpu.videoMemoryCapacity || 0} GB`;
    specifications['Memory Type'] = component.gpu.memoryType || '';
    specifications['Fan Count'] = String(component.gpu.fanCount || '');
    specifications['Chip Type'] = component.gpu.chipType || '';
    specifications['DVI Port'] = component.gpu.hasDVI ? 'Yes' : 'No';
    specifications['VGA Port'] = component.gpu.hasVGA ? 'Yes' : 'No';
    specifications['DisplayPort'] = component.gpu.hasDisplayPort ? 'Yes' : 'No';
    specifications['HDMI Port'] = component.gpu.hasHDMI ? 'Yes' : 'No';
    specifications['Sub Brand'] = component.gpu.subBrand || '';
    // Power Consumption removed as requested
  }
  if (component.ram) {
    specifications['Brand'] = component.ram.brand || '';
    specifications['Module Count'] = String(component.ram.moduleCount || '');
    specifications['Memory Type'] = component.ram.memoryType || '';
    specifications['Max Frequency'] = `${component.ram.maxFrequency || 0} MHz`;
    specifications['RGB Lighting'] = component.ram.backlighting ? 'Yes' : 'No';
    specifications['Voltage'] = `${component.ram.voltage || 0} V`;
    specifications['Capacity'] = `${component.ram.gb || 0} GB`;
    // Power Consumption removed as requested
  }
  if (component.storage) {
    specifications['Brand'] = component.storage.brand || '';
    specifications['Capacity'] = `${component.storage.volume || 0} GB`;
    specifications['Type'] = component.storage.type || '';
    specifications['NVMe'] = component.storage.nvme ? 'Yes' : 'No';
    specifications['Form Factor'] = component.storage.size || '';
    specifications['Interface'] = component.storage.compatibility || '';
    specifications['Write Speed'] = `${component.storage.writeSpeed || 0} MB/s`;
    specifications['Read Speed'] = `${component.storage.readSpeed || 0} MB/s`;
    // Power Consumption removed as requested
  }
  if (component.motherboard) {
    specifications['Brand'] = component.motherboard.brand || '';
    specifications['Socket'] = component.motherboard.socket || '';
    specifications['Memory Slots'] = String(
      component.motherboard.memorySlots || ''
    );
    specifications['Processor Support'] =
      component.motherboard.processorSupport || '';
    specifications['Memory Type'] =
      component.motherboard.memoryTypeSupported || '';
    specifications['Max RAM Capacity'] =
      `${component.motherboard.maxRamCapacity || 0} GB`;
    specifications['Max Memory Frequency'] =
      `${component.motherboard.maxMemoryFrequency || 0} MHz`;
    specifications['Max Video Cards'] = String(
      component.motherboard.maxVideoCards || ''
    );
    specifications['SATA Ports'] = String(
      component.motherboard.sataPorts || ''
    );
    specifications['M.2 Slots'] = String(component.motherboard.m2Slots || '');
    specifications['SLI/Crossfire'] = component.motherboard.sliCrossfireSupport
      ? 'Yes'
      : 'No';
    specifications['WiFi/Bluetooth'] = component.motherboard.wifiBluetooth
      ? 'Yes'
      : 'No';
    specifications['NVMe Support'] = component.motherboard.nvmeSupport
      ? 'Yes'
      : 'No';
    specifications['Form Factor'] = component.motherboard.form || '';
  }

  if (component.psu) {
    specifications['Brand'] = component.psu.brand || '';
    specifications['Power'] = `${component.psu.power || 0} W`;
    specifications['SATA Connections'] = String(
      component.psu.sataConnections || ''
    );
    specifications['PCIe Connections'] = String(
      component.psu.pciEConnections || ''
    );
    specifications['PFC'] = component.psu.pfc ? 'Yes' : 'No';
    specifications['Fan'] = component.psu.hasFan ? 'Yes' : 'No';
    specifications['Molex/PATA Connections'] = String(
      component.psu.molexPataConnections || ''
    );
  }

  if (component.cooling) {
    specifications['Brand'] = component.cooling.brand || '';
    specifications['Socket'] = component.cooling.socket || '';
    specifications['Fan Diameter'] = `${component.cooling.fanDiameter || 0} mm`;
    specifications['Fan Speed'] = `${component.cooling.fanSpeed || 0} RPM`;
  }
  if (component.caseModel) {
    specifications['Brand'] = component.caseModel.brand || '';
    specifications['PSU Included'] = component.caseModel.powerSupplyIncluded
      ? 'Yes'
      : 'No';
    specifications['Color'] = component.caseModel.color || '';
    specifications['Material'] = component.caseModel.material || '';
    specifications['Audio In'] = component.caseModel.audioIn ? 'Yes' : 'No';
    specifications['Audio Out'] = component.caseModel.audioOut ? 'Yes' : 'No';
    specifications['USB 2.0 Ports'] = String(component.caseModel.usb2 || '');
    specifications['USB 3.0 Ports'] = String(component.caseModel.usb3 || '');
    specifications['USB 3.2 Ports'] = String(component.caseModel.usb32 || '');
    specifications['USB Type-C Ports'] = String(
      component.caseModel.usbTypeC || ''
    );
    specifications['Form Factor'] = component.caseModel.form || '';
    specifications['USB Type-C Ports'] = String(
      component.caseModel.usbTypeC || ''
    );
    specifications['5.25" Slots'] = String(component.caseModel.slots525 || '');
    specifications['3.5" Slots'] = String(component.caseModel.slots35 || '');
    specifications['2.5" Slots'] = String(component.caseModel.slots25 || '');
    specifications['Water Cooling'] = component.caseModel.waterCoolingSupport
      ? 'Yes'
      : 'No';
  }

  return specifications;
}

/**
 * Extract specifications from a peripheral including structured data from peripheral tables
 */
export function extractPeripheralSpecifications(
  peripheral: any
): Record<string, string> {
  const specifications: Record<string, string> = {};

  if (peripheral.keyboard) {
    specifications['Brand'] = peripheral.keyboard.brand || '';
    specifications['Switch Type'] = peripheral.keyboard.switchType || '';
    specifications['Layout'] = peripheral.keyboard.layout || '';
    specifications['Form Factor'] = peripheral.keyboard.form || '';
    specifications['Connection'] = peripheral.keyboard.connection || '';
    specifications['RGB Lighting'] = peripheral.keyboard.rgb ? 'Yes' : 'No';
    specifications['Numpad'] = peripheral.keyboard.numpad ? 'Yes' : 'No';
  }

  if (peripheral.mouse) {
    specifications['Brand'] = peripheral.mouse.brand || '';
    specifications['Color'] = peripheral.mouse.color || '';
    specifications['Category'] = peripheral.mouse.category || '';
    specifications['DPI'] = String(peripheral.mouse.dpi || '');
    specifications['Buttons'] = String(peripheral.mouse.buttons || '');
    specifications['Connection'] = peripheral.mouse.connection || '';
    specifications['RGB Lighting'] = peripheral.mouse.rgb ? 'Yes' : 'No';
    specifications['Weight'] = `${peripheral.mouse.weight || 0} g`;
    specifications['Sensor'] = peripheral.mouse.sensor || '';
    specifications['Battery Type'] = peripheral.mouse.batteryType || '';
    specifications['Battery Life'] =
      `${peripheral.mouse.batteryLife || 0} hours`;
  }

  if (peripheral.monitor) {
    specifications['Brand'] = peripheral.monitor.brand || '';
    specifications['Size'] = `${peripheral.monitor.size || 0}"`;
    specifications['Resolution'] = peripheral.monitor.resolution || '';
    specifications['Refresh Rate'] =
      `${peripheral.monitor.refreshRate || 0} Hz`;
    specifications['Panel Type'] = peripheral.monitor.panelType || '';
    specifications['Response Time'] =
      `${peripheral.monitor.responseTime || 0} ms`;
    specifications['Brightness'] = `${peripheral.monitor.brightness || 0} nits`;
    specifications['HDR'] = peripheral.monitor.hdr ? 'Yes' : 'No';
    specifications['Ports'] = peripheral.monitor.ports || '';
    specifications['Speakers'] = peripheral.monitor.speakers ? 'Yes' : 'No';
    specifications['Curved'] = peripheral.monitor.curved ? 'Yes' : 'No';
  }

  if (peripheral.headphones) {
    specifications['Brand'] = peripheral.headphones.brand || '';
    specifications['Type'] = peripheral.headphones.type || '';
    specifications['Connection'] = peripheral.headphones.connection || '';
    specifications['Microphone'] = peripheral.headphones.microphone
      ? 'Yes'
      : 'No';
    specifications['Impedance'] = `${peripheral.headphones.impedance || 0} Ω`;
    specifications['Frequency'] = peripheral.headphones.frequency || '';
    specifications['Weight'] = `${peripheral.headphones.weight || 0} g`;
    specifications['Noise Cancelling'] = peripheral.headphones.noiseCancelling
      ? 'Yes'
      : 'No';
    specifications['RGB Lighting'] = peripheral.headphones.rgb ? 'Yes' : 'No';
  }

  if (peripheral.speakers) {
    specifications['Brand'] = peripheral.speakers.brand || '';
    specifications['Type'] = peripheral.speakers.type || '';
    specifications['Total Wattage'] =
      `${peripheral.speakers.totalWattage || 0} W`;
    specifications['Frequency'] = peripheral.speakers.frequency || '';
    specifications['Connections'] = peripheral.speakers.connections || '';
    specifications['Bluetooth'] = peripheral.speakers.bluetooth ? 'Yes' : 'No';
    specifications['Remote'] = peripheral.speakers.remote ? 'Yes' : 'No';
  }

  if (peripheral.microphone) {
    specifications['Brand'] = peripheral.microphone.brand || '';
    specifications['Type'] = peripheral.microphone.type || '';
    specifications['Pattern'] = peripheral.microphone.pattern || '';
    specifications['Frequency'] = `${peripheral.microphone.frequency || 0} Hz`;
    specifications['Sensitivity'] =
      `${peripheral.microphone.sensitivity || 0} dB`;
    specifications['Interface'] = peripheral.microphone.interface || '';
    specifications['Stand'] = peripheral.microphone.stand ? 'Yes' : 'No';
  }

  if (peripheral.camera) {
    specifications['Brand'] = peripheral.camera.brand || '';
    specifications['Resolution'] = peripheral.camera.resolution || '';
    specifications['FPS'] = `${peripheral.camera.fps || 0} fps`;
    specifications['FOV'] = `${peripheral.camera.fov || 0}°`;
    specifications['Microphone'] = peripheral.camera.microphone ? 'Yes' : 'No';
    specifications['Autofocus'] = peripheral.camera.autofocus ? 'Yes' : 'No';
    specifications['Connection'] = peripheral.camera.connection || '';
  }

  if (peripheral.gamepad) {
    specifications['Brand'] = peripheral.gamepad.brand || '';
    specifications['Connection'] = peripheral.gamepad.connection || '';
    specifications['Platform'] = peripheral.gamepad.platform || '';
    specifications['Layout'] = peripheral.gamepad.layout || '';
    specifications['Vibration'] = peripheral.gamepad.vibration ? 'Yes' : 'No';
    specifications['RGB Lighting'] = peripheral.gamepad.rgb ? 'Yes' : 'No';
    specifications['Battery Life'] =
      `${peripheral.gamepad.batteryLife || 0} hours`;
    specifications['Programmable'] = peripheral.gamepad.programmable
      ? 'Yes'
      : 'No';
  }

  if (peripheral.mousePad) {
    specifications['Brand'] = peripheral.mousePad.brand || '';
    specifications['Dimensions'] = peripheral.mousePad.dimensions || '';
    specifications['Thickness'] = `${peripheral.mousePad.thickness || 0} mm`;
    specifications['Material'] = peripheral.mousePad.material || '';
    specifications['RGB Lighting'] = peripheral.mousePad.rgb ? 'Yes' : 'No';
    specifications['Surface'] = peripheral.mousePad.surface || '';
  }

  return specifications;
}

/**
 * Get a product by ID - universal function that will fetch product details
 * regardless of whether it's a configuration, component, or peripheral
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const configuration = await prisma.configuration.findUnique({
      where: { id },
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
      const specs: Record<string, string> = {};
      configuration.components.forEach(configItem => {
        const categoryName = configItem.component.category.name.toLowerCase();
        specs[categoryName] = configItem.component.name;
      });
      const category = getConfigCategory(specs);
      const discountPrice =
        'discountPrice' in configuration && 'discountExpiresAt' in configuration
          ? getDiscountPrice(
              configuration.totalPrice as number,
              configuration.discountPrice as number,
              configuration.discountExpiresAt as Date | null
            )
          : null;

      return {
        id: configuration.id,
        type: 'configuration',
        category,
        name: configuration.name,
        description: configuration.description || '',
        longDescription: configuration.description || '',
        price: configuration.totalPrice,
        discountPrice,
        imageUrl: configuration.imageUrl,
        stock: 10,
        ratings: {
          average: 4.5,
          count: 15,
        },
        components,
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

      return {
        id: component.id,
        type: isPeripheral ? ('peripheral' as const) : ('component' as const),
        name: component.name,
        category: component.category.name,
        description: component.description || '',
        specifications,
        price: component.price,
        discountPrice: null,
        imageUrl: component.imagesUrl,
        stock: component.quantity,
        ratings: {
          average: 4.3,
          count: 18,
        },
      };
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

      const specs: Record<string, string> = {};
      userConfiguration.components.forEach(configItem => {
        const categoryName = configItem.component.category.name.toLowerCase();
        specs[categoryName] = configItem.component.name;
      });
      const category = getConfigCategory(specs);
      return {
        id: userConfiguration.id,
        type: 'configuration',
        category,
        name: userConfiguration.name,
        description: userConfiguration.description || '',
        longDescription: userConfiguration.description || '',
        price: userConfiguration.totalPrice,
        discountPrice: null,
        imageUrl: userConfiguration.imageUrl,
        stock: userConfiguration.status === 'APPROVED' ? 10 : 0,
        ratings: {
          average: 0,
          count: 0,
        },
        components,
      };
    }

    const peripheral = await prisma.peripheral.findUnique({
      where: { id },
      include: {
        category: true,
        keyboard: true,
        mouse: true,
        microphone: true,
        camera: true,
        monitor: true,
        headphones: true,
        speakers: true,
        gamepad: true,
        mousePad: true,
      },
    });

    if (peripheral) {
      const specifications = extractPeripheralSpecifications(peripheral);

      return {
        id: peripheral.id,
        type: 'peripheral' as const,
        name: peripheral.name,
        category: peripheral.category.name,
        description: peripheral.description || '',
        specifications,
        price: peripheral.price,
        discountPrice: null,
        imageUrl: peripheral.imagesUrl,
        stock: peripheral.quantity,
        ratings: {
          average: 4.1,
          count: 22,
        },
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get related products for a given product
 */
export async function getRelatedProducts(
  productId: string,
  productType: 'configuration' | 'component' | 'peripheral',
  categoryId?: string,
  limit: number = 3
): Promise<Product[]> {
  try {
    if (productType === 'configuration') {
      const relatedConfigs = await prisma.configuration.findMany({
        where: {
          isTemplate: true,
          id: { not: productId },
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
        take: limit,
      });
      return relatedConfigs.map((config: any) => {
        const components = config.components.map((item: any) => ({
          id: item.component.id,
          name: item.component.name,
          category: item.component.category.name,
          price: item.component.price,
          quantity: item.quantity,
        }));
        const specs: Record<string, string> = {};
        config.components.forEach((configItem: any) => {
          const categoryName = configItem.component.category.name.toLowerCase();
          specs[categoryName] = configItem.component.name;
        });
        const category = getConfigCategory(specs);
        const discountPrice =
          'discountPrice' in config && 'discountExpiresAt' in config
            ? getDiscountPrice(
                config.totalPrice as number,
                config.discountPrice as number,
                config.discountExpiresAt as Date | null
              )
            : (config as any).isPublic
              ? (config.totalPrice as number) * 0.9
              : null;

        return {
          id: config.id,
          type: 'configuration',
          category,
          name: config.name,
          description: config.description || '',
          price: config.totalPrice,
          discountPrice,
          imageUrl: config.imageUrl,
          stock: 10,
          ratings: {
            average: 4.5,
            count: 15,
          },
          components,
        };
      });
    } else {
      if (!categoryId) {
        const product = await prisma.component.findUnique({
          where: { id: productId },
          select: { categoryId: true },
        });
        categoryId = product?.categoryId;
      }

      if (!categoryId) return [];
      const relatedComponents = await prisma.component.findMany({
        where: {
          categoryId,
          id: { not: productId },
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
        take: limit,
      });

      return relatedComponents.map(component => {
        const specifications = extractComponentSpecifications(component);
        const isPeripheral = component.category.type === 'peripheral';
        return {
          id: component.id,
          type: (isPeripheral ? 'peripheral' : 'component') as
            | 'peripheral'
            | 'component',
          name: component.name,
          category: component.category.name,
          description: component.description || '',
          specifications,
          price: component.price,
          discountPrice: null,
          imageUrl: component.imagesUrl,
          stock: component.quantity,
          ratings: {
            average: 4.2,
            count: 12,
          },
        };
      });
    }
  } catch (error) {
    console.error(`Error fetching related products for ${productId}:`, error);
    return [];
  }
}

/**
 * Get all products with pagination
 */
export async function getAllProducts(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  type?: 'configuration' | 'component' | 'peripheral';
  inStock?: boolean;
}): Promise<PaginatedProducts> {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category,
      type,
      inStock = false,
    } = options;

    const skip = (page - 1) * limit;
    let products: Product[] = [];
    let total = 0;

    if (!type || type === 'configuration') {
      const configWhere: any = {
        isTemplate: true,
      };

      if (search) {
        configWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [configurations, configCount] = await prisma.$transaction([
        prisma.configuration.findMany({
          where: configWhere,
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
          skip: type ? skip : 0,
          take: type ? limit : Math.ceil(limit / 3),
        }),
        prisma.configuration.count({ where: configWhere }),
      ]);

      if (type === 'configuration') {
        total = configCount;
      }
      products = [
        ...products,
        ...configurations.map((config: any) => {
          const components = config.components.map((item: any) => ({
            id: item.component.id,
            name: item.component.name,
            category: item.component.category.name,
            price: item.component.price,
            quantity: item.quantity,
          }));
          const specs: Record<string, string> = {};
          config.components.forEach((configItem: any) => {
            const categoryName =
              configItem.component.category.name.toLowerCase();
            specs[categoryName] = configItem.component.name;
          });
          const category = getConfigCategory(specs);
          const discountPrice =
            'discountPrice' in config && 'discountExpiresAt' in config
              ? getDiscountPrice(
                  config.totalPrice as number,
                  config.discountPrice as number,
                  config.discountExpiresAt as Date | null
                )
              : (config as any).isPublic
                ? (config.totalPrice as number) * 0.9
                : null;

          return {
            id: config.id,
            type: 'configuration' as const,
            category,
            name: config.name,
            description: config.description || '',
            price: config.totalPrice,
            discountPrice,
            imageUrl: config.imageUrl,
            stock: 10,
            ratings: {
              average: 4.5,
              count: 15,
            },
            components,
          };
        }),
      ];
    }

    if (!type || type === 'component' || type === 'peripheral') {
      const componentWhere: any = {};

      if (type === 'component') {
        componentWhere.category = {
          type: 'component',
        };
      } else if (type === 'peripheral') {
        componentWhere.category = {
          type: 'peripheral',
        };
      }

      if (search) {
        componentWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (category) {
        componentWhere.category = {
          ...componentWhere.category,
          slug: category,
        };
      }
      if (inStock) {
        componentWhere.quantity = { gt: 0 };
      }
      const [components, componentCount] = await prisma.$transaction([
        prisma.component.findMany({
          where: componentWhere,
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
          skip: type ? skip : products.length,
          take: type ? limit : Math.ceil(limit / 3),
        }),
        prisma.component.count({ where: componentWhere }),
      ]);

      if (type === 'component' || type === 'peripheral') {
        total = componentCount;
      } else {
        total += componentCount;
      }

      products = [
        ...products,
        ...components.map(component => {
          const specifications = extractComponentSpecifications(component);
          const isPeripheral = component.category.type === 'peripheral';
          const productType = isPeripheral
            ? ('peripheral' as const)
            : ('component' as const);

          return {
            id: component.id,
            type: productType,
            name: component.name,
            category: component.category.name,
            description: component.description || '',
            specifications,
            price: component.price,
            discountPrice: null,
            imageUrl: component.imagesUrl,
            stock: component.quantity,
            ratings: {
              average: 4.2,
              count: 12,
            },
          };
        }),
      ];
    }

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  categorySlug: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    inStock?: boolean;
  } = {}
): Promise<PaginatedProducts> {
  try {
    if (['gaming', 'workstation', 'office', 'budget'].includes(categorySlug)) {
      return getAllProducts({
        ...options,
        type: 'configuration',
        category: categorySlug,
      });
    }

    return getAllProducts({
      ...options,
      category: categorySlug,
    });
  } catch (error) {
    console.error(
      `Error fetching products for category ${categorySlug}:`,
      error
    );
    throw error;
  }
}

/**
 * Increment view count for a product
 */
export async function incrementProductView(
  productId: string,
  productType: ProductType | string
): Promise<void> {
  try {
    if (productType === 'CONFIGURATION' || productType === 'configuration') {
      await prisma.configuration.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } },
      });
    } else if (productType === 'COMPONENT' || productType === 'component') {
      await prisma.component.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } },
      });
    } else if (productType === 'PERIPHERAL' || productType === 'peripheral') {
      await prisma.peripheral.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } },
      });
    }
  } catch (error) {
    console.error(
      `Error incrementing view count for ${productType} ${productId}:`,
      error
    );
  }
}

/**
 * Reset all product view counts (typically called monthly)
 */
export async function resetViewCounts(): Promise<{
  success: boolean;
  resetCounts: {
    configurations: number;
    components: number;
    peripherals: number;
  };
}> {
  try {
    const [configurationsResult, componentsResult, peripheralsResult] =
      await prisma.$transaction([
        prisma.configuration.updateMany({
          data: { viewCount: 0 },
        }),
        prisma.component.updateMany({
          data: { viewCount: 0 },
        }),
        prisma.peripheral.updateMany({
          data: { viewCount: 0 },
        }),
      ]);

    return {
      success: true,
      resetCounts: {
        configurations: configurationsResult.count,
        components: componentsResult.count,
        peripherals: peripheralsResult.count,
      },
    };
  } catch (error) {
    console.error('Error resetting view counts:', error);
    throw error;
  }
}
