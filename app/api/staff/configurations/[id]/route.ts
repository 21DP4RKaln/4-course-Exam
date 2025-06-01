import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { 
  createNotFoundResponse, 
  createBadRequestResponse, 
  createServerErrorResponse 
} from '@/lib/apiErrors';
import { authenticateStaff, authenticateAdmin } from '@/lib/middleware/authMiddleware';
import { z } from 'zod';

const updateConfigurationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']).optional(),
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  components: z.array(z.object({
    componentId: z.string(),
    quantity: z.number().min(1)
  })).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateStaff(request);
    if (authResult instanceof Response) {
      return authResult;
    }    const configuration = await prisma.configuration.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        components: {
          include: {
            component: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    if (!configuration) {
      return createNotFoundResponse('Configuration not found');
    }

    const formattedConfiguration = {
      id: configuration.id,
      name: configuration.name,
      description: configuration.description,
      status: configuration.status,
      isTemplate: configuration.isTemplate,
      isPublic: configuration.isPublic,
      totalPrice: configuration.totalPrice,
      user: configuration.user ? {
        id: configuration.user.id,
        name: configuration.user.name,
        email: configuration.user.email,
        phone: configuration.user.phone
      } : null,      components: configuration.components.map(item => {
        return {
          id: item.component.id,
          name: item.component.name,
          category: item.component.category.name,
          quantity: item.quantity,
          price: item.component.price,
          stock: item.component.quantity,
          imageUrl: item.component.imagesUrl,
          specifications: {} 
        };
      }),
      createdAt: configuration.createdAt.toISOString(),
      updatedAt: configuration.updatedAt.toISOString()
    };

    return NextResponse.json(formattedConfiguration);
  } catch (error) {
    console.error('Error fetching configuration:', error);
    return createServerErrorResponse('Failed to fetch configuration');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateStaff(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const body = await request.json();
    const validationResult = updateConfigurationSchema.safeParse(body);

    if (!validationResult.success) {
      return createBadRequestResponse('Invalid update data', validationResult.error.flatten());
    }

    const { name, description, status, isTemplate, isPublic, components } = validationResult.data;

    const existingConfig = await prisma.configuration.findUnique({
      where: { id: params.id }
    });

    if (!existingConfig) {
      return createNotFoundResponse('Configuration not found');
    }

    const updatedConfiguration = await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (isTemplate !== undefined) updateData.isTemplate = isTemplate;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      updateData.updatedAt = new Date();

      let totalPrice = existingConfig.totalPrice;
      
      if (components) {
        const componentIds = components.map(c => c.componentId);
        const componentPrices = await tx.component.findMany({
          where: {
            id: {
              in: componentIds
            }
          },
          select: {
            id: true,
            price: true
          }
        });

        const priceMap = new Map(componentPrices.map(c => [c.id, c.price]));
        totalPrice = components.reduce((total, item) => {
          const price = priceMap.get(item.componentId) || 0;
          return total + (price * item.quantity);
        }, 0);

        updateData.totalPrice = totalPrice;

        await tx.configItem.deleteMany({
          where: { configurationId: params.id }
        });

        await tx.configItem.createMany({
          data: components.map(item => ({
            configurationId: params.id,
            componentId: item.componentId,
            quantity: item.quantity
          }))
        });
      }

      return await tx.configuration.update({
        where: { id: params.id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          components: {
            include: {
              component: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });
    });

    return NextResponse.json({
      id: updatedConfiguration.id,
      name: updatedConfiguration.name,
      description: updatedConfiguration.description,
      status: updatedConfiguration.status,
      isTemplate: updatedConfiguration.isTemplate,
      isPublic: updatedConfiguration.isPublic,
      totalPrice: updatedConfiguration.totalPrice,
      user: updatedConfiguration.user ? {
        id: updatedConfiguration.user.id,
        name: updatedConfiguration.user.name,
        email: updatedConfiguration.user.email
      } : null,
      components: updatedConfiguration.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        quantity: item.quantity,
        price: item.component.price
      })),
      updatedAt: updatedConfiguration.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    return createServerErrorResponse('Failed to update configuration');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const configuration = await prisma.configuration.findUnique({
      where: { id: params.id }
    });

    if (!configuration) {
      return createNotFoundResponse('Configuration not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.configItem.deleteMany({
        where: { configurationId: params.id }
      });
      
      await tx.configuration.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ 
      success: true,
      message: 'Configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return createServerErrorResponse('Failed to delete configuration');
  }
}