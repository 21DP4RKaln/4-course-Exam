import { NextRequest, NextResponse } from 'next/server';
import { generateConfigurationPDF } from '@/lib/services/configurationPDF';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      configName,
      selectedComponents,
      componentCategories,
      totalPrice,
      totalPowerConsumption,
      recommendedPsuWattage,
    } = body; // Validate that all required components are selected
    const requiredCategories = [
      'cpu',
      'gpu',
      'motherboard',
      'ram',
      'storage',
      'psu',
      'case',
      'cooling',
    ];
    const missingCategories = requiredCategories.filter(
      categoryId => !selectedComponents[categoryId]
    );

    if (missingCategories.length > 0) {
      return NextResponse.json(
        { error: 'Missing required components', missingCategories },
        { status: 400 }
      );
    } // Create PDF data structure
    const configData: {
      id: string;
      name: string;
      createdAt: Date;
      totalPrice: number;
      totalPowerConsumption: number;
      recommendedPsuWattage: string;
      components: {
        categoryName: string;
        componentName: string;
        price: number;
        specifications: Record<string, string>;
      }[];
    } = {
      id: `CONFIG-${Date.now()}`,
      name: configName || 'Custom PC Configuration',
      createdAt: new Date(),
      totalPrice,
      totalPowerConsumption,
      recommendedPsuWattage,
      components: [],
    };

    // Convert selected components to PDF format
    Object.entries(selectedComponents).forEach(
      ([categoryId, component]: [string, any]) => {
        if (!component) return;

        const category = componentCategories.find(
          (cat: any) => cat.id === categoryId
        );
        const categoryName = category?.name || categoryId;

        if (Array.isArray(component)) {
          // Handle services (array of components)
          component.forEach((c: any) => {
            configData.components.push({
              categoryName,
              componentName: c.name,
              price: c.price,
              specifications: c.specifications || {},
            });
          });
        } else {
          // Handle single component
          configData.components.push({
            categoryName,
            componentName: component.name,
            price: component.price,
            specifications: component.specifications || {},
          });
        }
      }
    ); // Generate PDF buffer directly
    const pdfBuffer = await generateConfigurationPDF(configData);

    // Return the PDF buffer as a downloadable response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${configData.name.replace(/[^a-zA-Z0-9]/g, '_')}_configuration.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating configuration PDF:', error);
    // Log more details for debugging
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('API Error details:', {
      message: errorMessage,
      stack: errorStack,
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      region: process.env.VERCEL_REGION,
    });
    return NextResponse.json(
      { error: 'Failed to generate configuration PDF', details: errorMessage },
      { status: 500 }
    );
  }
}
