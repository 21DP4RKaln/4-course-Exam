import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log("Fetching product with ID:", id);
  
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
      console.log("Found configuration:", configuration.name);
      const components = configuration.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      }));
      
      const discountPrice = configuration.isPublic ? Math.round(configuration.totalPrice * 0.9 * 100) / 100 : null;

      return NextResponse.json({
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
      });
    }
  
    const component = await prisma.component.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        specValues: {
          include: {
            specKey: true
          }
        }
      }
    });

    if (component) {
      console.log("Found component:", component.name);
      const specifications: Record<string, string> = {};

      if (component.specifications && typeof component.specifications === 'object') {
        Object.entries(component.specifications as any).forEach(([key, value]) => {
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            specifications[key] = String(value);
          }
        });
      }
 
      if (component.specValues && Array.isArray(component.specValues)) {
        component.specValues.forEach(specValue => {
          if (specValue.specKey && specValue.specKey.name) {
            specifications[specValue.specKey.name] = specValue.value;
          }
        });
      }

      const isPeripheral = component.category.type === 'peripheral';
      const productType = isPeripheral ? 'peripheral' : 'component';

      return NextResponse.json({
        id: component.id,
        type: productType,
        name: component.name,
        category: component.category.name,
        description: component.description || '',
        specifications,
        price: component.price,
        discountPrice: null,
        imageUrl: component.imageUrl,
        stock: component.stock,
        ratings: {
          average: 4.3,
          count: 18,
        }
      });
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
      console.log("Found user configuration:", userConfiguration.name);
      const components = userConfiguration.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      }));
      
      return NextResponse.json({
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
      });
    }

    console.log("Product not found with ID:", id);
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error(`Error fetching product with ID ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}