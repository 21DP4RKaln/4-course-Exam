import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { createCpuFilterGroups } from '@/app/components/CategoryPage/filters/cpuFilters';
import { createGpuFilterGroups } from '@/app/components/CategoryPage/filters/gpuFilters';
import { createMotherboardFilterGroups } from '@/app/components/CategoryPage/filters/motherboardFilters';
import { createRamFilterGroups } from '@/app/components/CategoryPage/filters/ramFilters';
import { createStorageFilterGroups } from '@/app/components/CategoryPage/filters/storageFilters';
import { createPsuFilterGroups } from '@/app/components/CategoryPage/filters/psuFilters';
import { createCaseFilterGroups } from '@/app/components/CategoryPage/filters/caseFilters';
import { createCoolingFilterGroups } from '@/app/components/CategoryPage/filters/coolerFilters';

interface FormattedComponent {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  specifications: Record<string, string>;
  sku: string | null;
}

export async function GET(request: NextRequest) {  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');

    let whereClause: any = {
      category: {
        type: 'component'
      },
      quantity: { gt: 0 }
    };

    let category;
    if (categorySlug) {      category = await prisma.componentCategory.findFirst({
        where: { 
          slug: categorySlug
        }
      });
      
      if (!category) {
        return NextResponse.json(
          { error: `Category not found for slug: ${categorySlug}` },
          { status: 404 }
        );
      }      whereClause.categoryId = category.id;
    }

    const components = await prisma.component.findMany({
      where: whereClause,
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
    });    const formattedComponents = components.map((p: any) => {
      let specifications: Record<string, string> = {};
      
      if (p.subType) specifications['subType'] = p.subType;
        if (p.cpu) {
        specifications['brand'] = p.cpu.brand;
        specifications['series'] = p.cpu.series;
        specifications['cores'] = p.cpu.cores.toString();
        specifications['multithreading'] = p.cpu.multithreading ? 'Yes' : 'No';
        specifications['socket'] = p.cpu.socket;
        specifications['frequency'] = p.cpu.frequency.toString();
        specifications['maxRamCapacity'] = p.cpu.maxRamCapacity.toString();
        specifications['maxRamFrequency'] = p.cpu.maxRamFrequency.toString();
        specifications['integratedGpu'] = p.cpu.integratedGpu ? 'Yes' : 'No';
      } else if (p.gpu) {
        specifications['brand'] = p.gpu.brand;
        specifications['videoMemoryCapacity'] = p.gpu.videoMemoryCapacity.toString();
        specifications['memoryType'] = p.gpu.memoryType;
        specifications['fanCount'] = p.gpu.fanCount.toString();
        specifications['chipType'] = p.gpu.chipType;
        specifications['hasDVI'] = p.gpu.hasDVI ? 'Yes' : 'No';
        specifications['hasVGA'] = p.gpu.hasVGA ? 'Yes' : 'No';
        specifications['hasDisplayPort'] = p.gpu.hasDisplayPort ? 'Yes' : 'No';
        specifications['hasHDMI'] = p.gpu.hasHDMI ? 'Yes' : 'No';
      } else if (p.motherboard) {
        specifications['brand'] = p.motherboard.brand;
        specifications['socket'] = p.motherboard.socket;
        specifications['memorySlots'] = p.motherboard.memorySlots.toString();
        specifications['processorSupport'] = p.motherboard.processorSupport;
        specifications['memoryTypeSupported'] = p.motherboard.memoryTypeSupported;
        specifications['maxRamCapacity'] = p.motherboard.maxRamCapacity.toString();
        specifications['maxMemoryFrequency'] = p.motherboard.maxMemoryFrequency.toString();
        specifications['maxVideoCards'] = p.motherboard.maxVideoCards.toString();
        specifications['sataPorts'] = p.motherboard.sataPorts.toString();
        specifications['m2Slots'] = p.motherboard.m2Slots.toString();
        specifications['sliCrossfireSupport'] = p.motherboard.sliCrossfireSupport ? 'Yes' : 'No';
        specifications['wifiBluetooth'] = p.motherboard.wifiBluetooth ? 'Yes' : 'No';
        specifications['nvmeSupport'] = p.motherboard.nvmeSupport ? 'Yes' : 'No';
      } else if (p.ram) {
        specifications['brand'] = p.ram.brand;
        specifications['moduleCount'] = p.ram.moduleCount.toString();
        specifications['memoryType'] = p.ram.memoryType;
        specifications['maxFrequency'] = p.ram.maxFrequency.toString();
        specifications['backlighting'] = p.ram.backlighting ? 'Yes' : 'No';
        specifications['voltage'] = p.ram.voltage.toString();
      } else if (p.storage) {
        specifications['brand'] = p.storage.brand;
        specifications['volume'] = p.storage.volume.toString();
        specifications['type'] = p.storage.type;
        specifications['nvme'] = p.storage.nvme ? 'Yes' : 'No';
        specifications['size'] = p.storage.size;
        specifications['compatibility'] = p.storage.compatibility;
        specifications['writeSpeed'] = p.storage.writeSpeed.toString();
        specifications['readSpeed'] = p.storage.readSpeed.toString();
      } else if (p.psu) {
        specifications['brand'] = p.psu.brand;
        specifications['power'] = p.psu.power.toString();
        specifications['sataConnections'] = p.psu.sataConnections.toString();
        specifications['pciEConnections'] = p.psu.pciEConnections.toString();
        specifications['pfc'] = p.psu.pfc ? 'Yes' : 'No';
        specifications['hasFan'] = p.psu.hasFan ? 'Yes' : 'No';
        specifications['molexPataConnections'] = p.psu.molexPataConnections.toString();
      } else if (p.cooling) {
        specifications['brand'] = p.cooling.brand;
        specifications['socket'] = p.cooling.socket;
        specifications['fanDiameter'] = p.cooling.fanDiameter.toString();
        specifications['fanSpeed'] = p.cooling.fanSpeed.toString();
      } else if (p.caseModel) {
        specifications['brand'] = p.caseModel.brand;
        specifications['powerSupplyIncluded'] = p.caseModel.powerSupplyIncluded ? 'Yes' : 'No';
        specifications['color'] = p.caseModel.color;
        specifications['material'] = p.caseModel.material;
        specifications['audioIn'] = p.caseModel.audioIn ? 'Yes' : 'No';
        specifications['audioOut'] = p.caseModel.audioOut ? 'Yes' : 'No';
        specifications['usb2'] = p.caseModel.usb2.toString();
        specifications['usb3'] = p.caseModel.usb3.toString();
        specifications['usb32'] = p.caseModel.usb32.toString();
        specifications['usbTypeC'] = p.caseModel.usbTypeC.toString();
        specifications['slots525'] = p.caseModel.slots525.toString();
        specifications['slots35'] = p.caseModel.slots35.toString();
        specifications['slots25'] = p.caseModel.slots25.toString();
        specifications['waterCoolingSupport'] = p.caseModel.waterCoolingSupport ? 'Yes' : 'No';
      }

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.quantity,
        imageUrl: p.imagesUrl, 
        categoryId: p.categoryId,
        categoryName: p.category.name,
        specifications,
        sku: p.sku,
        rating: p.rating || 0,
        ratingCount: p.ratingCount || 0,
        cpu: p.cpu,
        gpu: p.gpu,
        motherboard: p.motherboard,
        ram: p.ram,
        storage: p.storage,
        psu: p.psu,
        cooling: p.cooling,
        caseModel: p.caseModel,
      };
    });    const categories = categorySlug 
      ? [category!]
      : await prisma.componentCategory.findMany({
          where: {
            type: 'component'
          }
        });      let filterGroups: any[] = [];
    if (category && formattedComponents.length > 0) {
      switch (category.slug) {
        case 'cpu':
        case 'processors':
          filterGroups = createCpuFilterGroups(formattedComponents);
          break;
        case 'gpu':
        case 'graphics-cards':
          filterGroups = createGpuFilterGroups(formattedComponents);
          break;
        case 'motherboard':
        case 'motherboards':
          filterGroups = createMotherboardFilterGroups(formattedComponents);
          break;
        case 'ram':
        case 'memory':
          filterGroups = createRamFilterGroups(formattedComponents);
          break;
        case 'storage':
          filterGroups = createStorageFilterGroups(formattedComponents);
          break;
        case 'psu':
        case 'power-supplies':
          filterGroups = createPsuFilterGroups(formattedComponents);
          break;
        case 'case':
        case 'cases':
          filterGroups = createCaseFilterGroups(formattedComponents);
          break;
        case 'cooling':
        case 'coolers':
          filterGroups = createCoolingFilterGroups(formattedComponents);
          break;
        default:
          // For other categories (peripherals), don't create filter groups yet
          // They can be added later if needed
          filterGroups = [];
          break;
      }
    }

    return NextResponse.json({
      categories: categories || [],
      components: formattedComponents || [],
      specifications: [],
      filterGroups: filterGroups
    });
  } catch (error) {
    console.error('Error in components API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}