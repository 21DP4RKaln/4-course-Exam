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
    // Authenticate user
    const authResult = await authenticateStaff(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const configuration = await prisma.configuration.findUnique({
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
                category: true,
                specValues: {
                  include: {
                    specKey: true
                  }
                }
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
      } : null,
      components: configuration.components.map(item => {
        const specs: Record<string, string> = {};
        
        // Extract specifications
        if (item.component.specifications && typeof item.component.specifications === 'object') {
          Object.entries(item.component.specifications).forEach(([key, value]) => {
            specs[key] = String(value);
          });
        }
        
        // Add spec values
        item.component.specValues.forEach(specValue => {
          specs[specValue.specKey.name] = specValue.value;
        });
        
        return {
          id: item.component.id,
          name: item.component.name,
          category: item.component.category.name,
          quantity: item.quantity,
          price: item.component.price,
          stock: item.component.stock,
          imageUrl: item.component.imageUrl,
          specifications: specs
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
    // Authenticate user
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

    // Check if configuration exists
    const existingConfig = await prisma.configuration.findUnique({
      where: { id: params.id }
    });

    if (!existingConfig) {
      return createNotFoundResponse('Configuration not found');
    }

    // Use a transaction to ensure atomicity when updating components
    const updatedConfiguration = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (isTemplate !== undefined) updateData.isTemplate = isTemplate;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      updateData.updatedAt = new Date();

      // If components are provided, calculate new total price
      let totalPrice = existingConfig.totalPrice;
      
      if (components) {
        // Calculate new total price
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

        // Delete existing components
        await tx.configItem.deleteMany({
          where: { configurationId: params.id }
        });

        // Create new components
        await tx.configItem.createMany({
          data: components.map(item => ({
            configurationId: params.id,
            componentId: item.componentId,
            quantity: item.quantity
          }))
        });
      }

      // Update the configuration
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

    // Format the response
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
    // Only admin can delete configurations
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

    // Use transaction to ensure all related records are deleted properly
    await prisma.$transaction(async (tx) => {
      // Delete related configuration items first
      await tx.configItem.deleteMany({
        where: { configurationId: params.id }
      });
      
      // Delete the configuration
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