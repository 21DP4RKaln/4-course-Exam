import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * This script updates component categories to ensure peripheral categories 
 * have the correct type value (peripheral).
 */
async function updatePeripheralCategories() {
  try {
    console.log('Starting update of peripheral categories...');

    // List of categories that should be marked as peripherals
    const peripheralCategoryNames = [
      'Keyboard', 'Mouse', 'Headphones', 
      'Monitor', 'Speakers', 'Camera', 
      'Microphone', 'Gamepad', 'MousePad'
    ];

    // Update records in database
    const result = await prisma.componentCategory.updateMany({
      where: {
        name: {
          in: peripheralCategoryNames
        }
      },
      data: {
        type: 'peripheral'
      }
    });

    console.log(`Successfully updated ${result.count} peripheral categories`);
    
    // Verify the update
    const updatedCategories = await prisma.componentCategory.findMany({
      where: {
        type: 'peripheral'
      }
    });
    
    console.log('Peripheral categories after update:');
    updatedCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`);
    });

    return result;
  } catch (error) {
    console.error('Error updating peripheral categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updatePeripheralCategories()
  .then(() => {
    console.log('Peripheral category update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to update peripheral categories:', error);
    process.exit(1);
  });
