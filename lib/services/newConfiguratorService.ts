import { prisma } from '@/lib/prismaService';

/**
 * Save configuration
 */
export async function saveConfiguration(
  userId: string,
  data: {
    name: string;
    description?: string;
    imageUrl?: string;
    components: { id: string; quantity: number }[];
  }
) {
  try {
    console.log('🔍 Save configuration service called:', { userId, data });

    const componentIds = data.components.map(c => c.id);
    console.log('📝 Component IDs:', componentIds);

    const components = await prisma.component.findMany({
      where: { id: { in: componentIds } },
    });

    console.log(
      '✅ Found components:',
      components.map(c => ({ id: c.id, name: c.name, price: c.price }))
    );

    const totalPrice = data.components.reduce((total, item) => {
      const component = components.find(c => c.id === item.id);
      return total + (component?.price || 0) * item.quantity;
    }, 0);

    console.log('💰 Total price calculated:', totalPrice);

    const configuration = await prisma.configuration.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        totalPrice,
        userId,
        status: 'DRAFT',
        isTemplate: false,
        isPublic: false,
        components: {
          create: data.components.map(item => ({
            componentId: item.id,
            quantity: item.quantity,
          })),
        },
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

    console.log('✅ Configuration created successfully:', {
      id: configuration.id,
      name: configuration.name,
    });
    return configuration;
  } catch (error) {
    console.error('🚨 Error creating configuration:', error);
    throw error;
  }
}
