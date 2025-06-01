import { prisma } from '@/lib/prismaService'

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  specs: Record<string, string>;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  stock: number;
  ratings?: {
    average: number;
    count: number;
  };
  longDescription?: string;
  related?: string[] | Product[];
}

export interface ProductWithRelated extends Product {
  related: Product[];
}

/**
 * Extract component specifications from structured tables
 */
function extractComponentSpecifications(component: any): Record<string, string> {
  const specs: Record<string, string> = {};
  
  if (component.cpu) {
    specs['CPU Model'] = component.cpu.model;
    specs['CPU Cores'] = component.cpu.cores?.toString() || '';
    specs['CPU Base Clock'] = component.cpu.baseClock?.toString() + ' GHz' || '';
    specs['CPU Boost Clock'] = component.cpu.boostClock?.toString() + ' GHz' || '';
  }
  
  if (component.gpu) {
    specs['GPU Model'] = component.gpu.model;
    specs['GPU Memory'] = component.gpu.memorySize?.toString() + ' GB' || '';
    specs['GPU Memory Type'] = component.gpu.memoryType || '';
    specs['GPU Base Clock'] = component.gpu.baseClock?.toString() + ' MHz' || '';
    specs['GPU Boost Clock'] = component.gpu.boostClock?.toString() + ' MHz' || '';
  }
  
  if (component.motherboard) {
    specs['Motherboard Model'] = component.motherboard.model;
    specs['Socket'] = component.motherboard.socket || '';
    specs['Form Factor'] = component.motherboard.formFactor || '';
    specs['Memory Slots'] = component.motherboard.memorySlots?.toString() || '';
    specs['Max Memory'] = component.motherboard.maxMemory?.toString() + ' GB' || '';
  }
  
  if (component.ram) {
    specs['RAM Capacity'] = component.ram.capacity?.toString() + ' GB' || '';
    specs['RAM Type'] = component.ram.memoryType || '';
    specs['RAM Speed'] = component.ram.speed?.toString() + ' MHz' || '';
    specs['RAM Latency'] = component.ram.latency || '';
  }
  
  if (component.storage) {
    specs['Storage Capacity'] = component.storage.capacity?.toString() + ' GB' || '';
    specs['Storage Type'] = component.storage.storageType || '';
    specs['Storage Interface'] = component.storage.interface || '';
    specs['Read Speed'] = component.storage.readSpeed?.toString() + ' MB/s' || '';
    specs['Write Speed'] = component.storage.writeSpeed?.toString() + ' MB/s' || '';
  }
  
  if (component.psu) {
    specs['PSU Wattage'] = component.psu.wattage?.toString() + ' W' || '';
    specs['PSU Efficiency'] = component.psu.efficiency || '';
    specs['PSU Modular'] = component.psu.modular ? 'Yes' : 'No';
  }
  
  if (component.cooling) {
    specs['Cooling Type'] = component.cooling.coolingType || '';
    specs['Fan Speed'] = component.cooling.fanSpeed?.toString() + ' RPM' || '';
    specs['Noise Level'] = component.cooling.noiseLevel?.toString() + ' dB' || '';
  }
  
  if (component.caseModel) {
    specs['Case Type'] = component.caseModel.caseType || '';
    specs['Form Factor Support'] = component.caseModel.formFactorSupport || '';
    specs['Front Ports'] = component.caseModel.frontPorts || '';
  }
  
  return specs;
}

/**
 * Extract peripheral specifications from structured tables
 */
function extractPeripheralSpecifications(peripheral: any): Record<string, string> {
  const specs: Record<string, string> = {};
  
  if (peripheral.keyboard) {
    specs['Switch Type'] = peripheral.keyboard.switchType || '';
    specs['Layout'] = peripheral.keyboard.layout || '';
    specs['Backlight'] = peripheral.keyboard.backlight ? 'Yes' : 'No';
    specs['Wireless'] = peripheral.keyboard.wireless ? 'Yes' : 'No';
  }
  
  if (peripheral.mouse) {
    specs['DPI'] = peripheral.mouse.dpi?.toString() || '';
    specs['Sensor Type'] = peripheral.mouse.sensorType || '';
    specs['Buttons'] = peripheral.mouse.buttons?.toString() || '';
    specs['Wireless'] = peripheral.mouse.wireless ? 'Yes' : 'No';
  }
  
  if (peripheral.monitor) {
    specs['Screen Size'] = peripheral.monitor.screenSize?.toString() + '"' || '';
    specs['Resolution'] = peripheral.monitor.resolution || '';
    specs['Refresh Rate'] = peripheral.monitor.refreshRate?.toString() + ' Hz' || '';
    specs['Panel Type'] = peripheral.monitor.panelType || '';
    specs['Response Time'] = peripheral.monitor.responseTime?.toString() + ' ms' || '';
  }
  
  if (peripheral.headphones) {
    specs['Driver Size'] = peripheral.headphones.driverSize?.toString() + ' mm' || '';
    specs['Frequency Response'] = peripheral.headphones.frequencyResponse || '';
    specs['Impedance'] = peripheral.headphones.impedance?.toString() + ' Ω' || '';
    specs['Wireless'] = peripheral.headphones.wireless ? 'Yes' : 'No';
  }
  
  if (peripheral.speakers) {
    specs['Power'] = peripheral.speakers.power?.toString() + ' W' || '';
    specs['Frequency Response'] = peripheral.speakers.frequencyResponse || '';
    specs['Channels'] = peripheral.speakers.channels || '';
    specs['Wireless'] = peripheral.speakers.wireless ? 'Yes' : 'No';
  }
  
  if (peripheral.microphone) {
    specs['Frequency Response'] = peripheral.microphone.frequencyResponse || '';
    specs['Polar Pattern'] = peripheral.microphone.polarPattern || '';
    specs['Connectivity'] = peripheral.microphone.connectivity || '';
  }
  
  if (peripheral.camera) {
    specs['Resolution'] = peripheral.camera.resolution || '';
    specs['Frame Rate'] = peripheral.camera.frameRate?.toString() + ' fps' || '';
    specs['Field of View'] = peripheral.camera.fieldOfView?.toString() + '°' || '';
    specs['Auto Focus'] = peripheral.camera.autoFocus ? 'Yes' : 'No';
  }
  
  if (peripheral.gamepad) {
    specs['Connectivity'] = peripheral.gamepad.connectivity || '';
    specs['Battery Life'] = peripheral.gamepad.batteryLife?.toString() + ' hours' || '';
    specs['Vibration'] = peripheral.gamepad.vibration ? 'Yes' : 'No';
    specs['Wireless'] = peripheral.gamepad.wireless ? 'Yes' : 'No';
  }
  
  if (peripheral.mousePad) {
    specs['Dimensions'] = peripheral.mousePad.dimensions || '';
    specs['Material'] = peripheral.mousePad.material || '';
    specs['Thickness'] = peripheral.mousePad.thickness?.toString() + ' mm' || '';
    specs['RGB'] = peripheral.mousePad.rgb ? 'Yes' : 'No';
  }
  
  return specs;
}

/**
 * Helper to determine PC category based on component specs
 */
function getConfigCategory(specs: Record<string, string>): string {
  if (specs.gpu && (specs.gpu.toLowerCase().includes('rtx') || specs.gpu.toLowerCase().includes('geforce'))) {
    return 'gaming';
  } else if (specs.cpu && (specs.cpu.toLowerCase().includes('ryzen 9') || specs.cpu.toLowerCase().includes('i9'))) {
    return 'workstation';
  } else if (specs.cpu && (specs.cpu.toLowerCase().includes('i3') || specs.cpu.toLowerCase().includes('ryzen 3'))) {
    return 'budget';
  } else {
    return 'office';
  }
}

/**
 * Get a product by ID with related products
 */
export async function getProductById(id: string): Promise<ProductWithRelated | null> {
  try {    const configuration = await prisma.configuration.findUnique({
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
                cpu: true,
                gpu: true,
                motherboard: true,
                ram: true,
                storage: true,
                psu: true,
                cooling: true,
                caseModel: true,
              },
            },
          },
        },
      },
    });    if (configuration) {
      const specs: Record<string, string> = {};
      configuration.components.forEach((configItem) => {
        const categoryName = configItem.component.category.name.toLowerCase();
        specs[categoryName] = configItem.component.name;
      });
    
      const discountPrice = configuration.isPublic ? Math.round(configuration.totalPrice * 0.9 * 100) / 100 : null;
  
      const category = getConfigCategory(specs);
    
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
    
      const relatedProducts = relatedConfigurations.map((config) => {
        const relatedSpecs: Record<string, string> = {};
        config.components.forEach((configItem) => {
          const categoryName = configItem.component.category.name.toLowerCase();
          relatedSpecs[categoryName] = configItem.component.name;
        });        return {
          id: config.id,
          name: config.name,
          category: getConfigCategory(relatedSpecs),
          description: config.description || '',
          specs: relatedSpecs,
          price: config.totalPrice,
          discountPrice: config.isPublic ? Math.round(config.totalPrice * 0.9 * 100) / 100 : null,
          imageUrl: null,
          stock: 10,
          ratings: {
            average: 4.5,
            count: 15,
          },
        };
      });
      return {
        id: configuration.id,
        name: configuration.name,
        category,
        description: configuration.description || '',
        longDescription: configuration.description || '', 
        specs,
        price: configuration.totalPrice,
        discountPrice,
        imageUrl: null,
        stock: 10,
        ratings: {
          average: 4.5,
          count: 15,
        },
        related: relatedProducts,
      };
    }   
    const component = await prisma.component.findUnique({
      where: {
        id,
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
      }
    });

    if (component) {
      const specs = extractComponentSpecifications(component);

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

      const relatedProducts = relatedComponents.map((relComp) => {
        const relSpecs = extractComponentSpecifications(relComp);        return {
          id: relComp.id,
          name: relComp.name,
          category: relComp.category.name,
          description: relComp.description || '',
          specs: relSpecs,
          price: relComp.price,
          discountPrice: relComp.discountPrice, 
          imageUrl: relComp.imagesUrl,
          stock: relComp.quantity,
          ratings: {
            average: 4.2,
            count: 12,
          },
        };
      });

      return {
        id: component.id,
        name: component.name,
        category: component.category.name,
        description: component.description || '',        specs,
        price: component.price,
        discountPrice: component.discountPrice, 
        imageUrl: component.imagesUrl,
        stock: component.quantity,
        ratings: {
          average: 4.3,
          count: 18,
        },
        related: relatedProducts,
      };
    }    
    const peripheral = await prisma.peripheral.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        keyboard: true,
        mouse: true,
        monitor: true,
        headphones: true,
        speakers: true,
        microphone: true,
        camera: true,
        gamepad: true,
        mousePad: true,
      }
    });

    if (peripheral) {
      const specs = extractPeripheralSpecifications(peripheral);

      const relatedPeripherals = await prisma.peripheral.findMany({
        where: {
          categoryId: peripheral.categoryId,
          id: { not: id },
        },
        include: {
          category: true,
          keyboard: true,
          mouse: true,
          monitor: true,
          headphones: true,
          speakers: true,
          microphone: true,
          camera: true,
          gamepad: true,
          mousePad: true,
        },
        take: 3,
      });

      const relatedProducts = relatedPeripherals.map((relPeriph) => {
        const relSpecs = extractPeripheralSpecifications(relPeriph);        return {
          id: relPeriph.id,
          name: relPeriph.name,
          category: relPeriph.category.name,
          description: relPeriph.description || '',
          specs: relSpecs,
          price: relPeriph.price,
          discountPrice: relPeriph.discountPrice, 
          imageUrl: relPeriph.imagesUrl,
          stock: relPeriph.quantity,
          ratings: {
            average: 4.2,
            count: 12,
          },
        };
      });

      return {
        id: peripheral.id,
        name: peripheral.name,        category: peripheral.category.name,
        description: peripheral.description || '',
        specs,
        price: peripheral.price,
        discountPrice: peripheral.discountPrice, 
        imageUrl: peripheral.imagesUrl,
        stock: peripheral.quantity,
        ratings: {
          average: 4.3,
          count: 18,
        },
        related: relatedProducts,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get all products (both PCs and components)
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
      const specs: Record<string, string> = {};
      config.components.forEach((configItem) => {
        const categoryName = configItem.component.category.name.toLowerCase();
        specs[categoryName] = configItem.component.name;
      });
    
      const discountPrice = config.isPublic ? Math.round(config.totalPrice * 0.9 * 100) / 100 : null;      products.push({
        id: config.id,
        name: config.name,
        category: getConfigCategory(specs),
        description: config.description || '',
        specs,
        price: config.totalPrice,
        discountPrice,
        imageUrl: null,
        stock: 10,
        ratings: {
          average: 4.5,
          count: 15,
        },
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
          gt: 0
        }
      },
      take: 20 
    });

    for (const component of components) {
      const specs = extractComponentSpecifications(component);

      products.push({
        id: component.id,        name: component.name,
        category: component.category.name,
        description: component.description || '',
        specs,
        price: component.price,
        discountPrice: component.discountPrice, 
        imageUrl: component.imagesUrl,
        stock: component.quantity,
        ratings: {
          average: 4.2,
          count: 12,
        },
      });
    }

    const peripherals = await prisma.peripheral.findMany({
      include: {
        category: true,
        keyboard: true,
        mouse: true,
        monitor: true,
        headphones: true,
        speakers: true,
        microphone: true,
        camera: true,
        gamepad: true,
        mousePad: true,
      },
      where: {
        quantity: {
          gt: 0
        }
      },
      take: 20 
    });

    for (const peripheral of peripherals) {
      const specs = extractPeripheralSpecifications(peripheral);

      products.push({
        id: peripheral.id,
        name: peripheral.name,        category: peripheral.category.name,
        description: peripheral.description || '',
        specs,
        price: peripheral.price,
        discountPrice: peripheral.discountPrice, 
        imageUrl: peripheral.imagesUrl,
        stock: peripheral.quantity,
        ratings: {
          average: 4.2,
          count: 12,
        },
      });
    }

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {  if (category === 'peripheral') {
    const peripheralProducts = await prisma.peripheral.findMany({
      where: {
        quantity: { gt: 0 }
      },
      include: {
        category: true,
        keyboard: true,
        mouse: true,
        monitor: true,
        headphones: true,
        speakers: true,
        microphone: true,
        camera: true,
        gamepad: true,
        mousePad: true,
      }
    });    
    return peripheralProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category.name,
      description: p.description || '',
      specs: extractPeripheralSpecifications(p),
      price: p.price,
      discountPrice: p.discountPrice,
      imageUrl: p.imagesUrl,
      stock: p.quantity
    }));
  }

  try {
    const products: Product[] = [];

    if (category === 'pc' || category === 'gaming' || category === 'workstation' || category === 'office' || category === 'budget') {
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
        const specs: Record<string, string> = {};
        config.components.forEach((configItem) => {
          const categoryName = configItem.component.category.name.toLowerCase();
          specs[categoryName] = configItem.component.name;
        });
        
        const configCategory = getConfigCategory(specs);

        if (category === 'pc' || configCategory.toLowerCase() === category.toLowerCase()) {
          const discountPrice = config.isPublic ? Math.round(config.totalPrice * 0.9 * 100) / 100 : null;          products.push({
            id: config.id,
            name: config.name,
            category: configCategory,
            description: config.description || '',
            specs,
            price: config.totalPrice,
            discountPrice,
            imageUrl: config.imageUrl || `/images/pcs/${configCategory.toLowerCase()}.jpg`,
            stock: 10,
            ratings: {
              average: 4.5,
              count: 15,
            },
          });
        }
      }    } else if (category === 'peripheral') {
      const peripherals = await prisma.peripheral.findMany({
        where: {
          quantity: {
            gt: 0
          }
        },
        include: {
          category: true,
          keyboard: true,
          mouse: true,
          monitor: true,
          headphones: true,
          speakers: true,
          microphone: true,
          camera: true,
          gamepad: true,
          mousePad: true,
        }
      });

      for (const peripheral of peripherals) {
        const specs = extractPeripheralSpecifications(peripheral);        products.push({
          id: peripheral.id,
          name: peripheral.name,
          category: peripheral.category.name,
          description: peripheral.description || '',
          specs,
          price: peripheral.price,
          discountPrice: peripheral.discountPrice,
          imageUrl: peripheral.imagesUrl,
          stock: peripheral.quantity,
          ratings: {
            average: 4.2,
            count: 12,
          },
        });
      }    } else {
      const components = await prisma.component.findMany({
        where: {
          category: {
            OR: [
              { slug: category },
              { name: category }
            ]
          },
          quantity: {
            gt: 0
          }
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
        }
      });

      for (const component of components) {
        const specs = extractComponentSpecifications(component);

        products.push({
          id: component.id,
          name: component.name,
          category: component.category.name,          description: component.description || '',
          specs,
          price: component.price,
          discountPrice: component.discountPrice, 
          imageUrl: component.imagesUrl,
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
    console.error(`Error fetching products for category ${category}:`, error);
    return [];
  }
}