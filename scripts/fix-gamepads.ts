// Fix the gamepad model definitions in the addMoreGamepads function
import { PrismaClient } from '@prisma/client';

async function fixGamepadModels() {
  const prisma = new PrismaClient();
  
  try {
    // Get the current seeder data
    const gamepads = await prisma.gamepad.findMany();
    console.log(`Found ${gamepads.length} existing gamepads in database`);
    
    // Update each gamepad to only include supported fields
    for (const gamepad of gamepads) {
      await prisma.gamepad.update({
        where: { id: gamepad.id },
        data: {
          manufacturer: gamepad.manufacturer,
          connection: gamepad.connection,
          platform: gamepad.platform,
          layout: gamepad.layout,
          vibration: gamepad.vibration,
          programmable: gamepad.programmable,
          batteryLife: gamepad.batteryLife,
          rgb: gamepad.rgb
        }
      });
      console.log(`Updated gamepad: ${gamepad.id}`);
    }
    
    console.log('All gamepads updated successfully');
  } catch (error) {
    console.error('Error fixing gamepads:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixGamepadModels()
  .catch(console.error);
