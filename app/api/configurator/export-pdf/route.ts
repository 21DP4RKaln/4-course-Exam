import { NextRequest, NextResponse } from 'next/server';
import {
  generateConfigurationPDF,
  cleanupConfigurationPDF,
} from '@/lib/services/configurationPDF';
import fs from 'fs-extra';

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
    ); // Generate PDF
    const pdfPath = await generateConfigurationPDF(configData);

    // Read the file content as buffer
    const fileBuffer = await fs.readFile(pdfPath);

    // Clean up the temporary file
    await cleanupConfigurationPDF(pdfPath);

    // Return the file as a downloadable response
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${configData.name.replace(/[^a-zA-Z0-9]/g, '_')}_configuration.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating configuration PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate configuration PDF' },
      { status: 500 }
    );
  }
}
