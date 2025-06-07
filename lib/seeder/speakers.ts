import { PrismaClient } from '@prisma/client';

export async function seedSpeakers(prisma: PrismaClient) {
  // Get all peripherals with subType 'speakers'
  const speakerPeripherals = await prisma.peripheral.findMany({
    where: { subType: 'speakers' },
  });

  // Prepare Speaker entries
  const speakers = [];

  // For each Speaker peripheral, create a detailed Speaker entry
  for (let i = 0; i < speakerPeripherals.length; i++) {
    const peripheral = speakerPeripherals[i];

    // Parse existing specifications if available
    const specs = peripheral.specifications
      ? JSON.parse(peripheral.specifications.toString())
      : {};

    // Manufacturer
    const manufacturers = ['Logitech', 'Creative', 'Bose', 'Edifier', 'JBL'];
    const manufacturer =
      specs.manufacturer || manufacturers[i % manufacturers.length];

    // Types of speakers
    const types = [
      '2.0 Stereo',
      '2.1 Stereo',
      '5.1 Surround',
      '7.1 Surround',
      '2.0 Stereo',
    ];
    const type = specs.type || types[i % types.length];

    // Total wattage - convert from string to integer
    const wattageRanges = [10, 20, 40, 60, 120, 200];
    const totalWattage = specs.totalWattage
      ? parseInt(specs.totalWattage)
      : wattageRanges[i % wattageRanges.length];

    // Frequency response
    const frequencyResponses = [
      '50Hz - 20kHz',
      '35Hz - 20kHz',
      '20Hz - 20kHz',
      '20Hz - 22kHz',
      '30Hz - 20kHz',
    ];
    const frequency =
      specs.frequency ||
      specs.frequencyResponse ||
      frequencyResponses[i % frequencyResponses.length];

    // Connection types
    const connectionTypes = [
      '3.5mm',
      '3.5mm, RCA',
      '3.5mm, Bluetooth',
      'USB, 3.5mm',
      'USB, Bluetooth',
      'USB, 3.5mm, Bluetooth, Optical',
    ];
    const connections =
      specs.connections ||
      specs.connection ||
      connectionTypes[i % connectionTypes.length];

    // Has bluetooth?
    const hasBluetooth = connections.includes('Bluetooth');

    // For surround systems
    const hasSubwoofer =
      type.includes('2.1') || type.includes('5.1') || type.includes('7.1');

    // Additional specifications that don't match the schema
    const additionalSpecs = {
      hasSubwoofer,
      hasTweeter: i % 3 === 0,
      controls: [
        'Volume, Bass',
        'Volume, Treble, Bass',
        'Volume',
        'Full mixer',
      ][i % 4],
      dimensions: `${120 + (i % 10) * 20}mm x ${200 + (i % 8) * 20}mm x ${150 + (i % 5) * 20}mm`,
      rgb: i % 3 === 0,
      headphoneJack: i % 2 === 0,
      mountable: i % 4 === 0,
      impedance: `${4 + (i % 2) * 4} ohms`,
    };

    // Create speaker object with fields that match the schema
    speakers.push({
      peripheralId: peripheral.id,
      manufacturer,
      type,
      totalWattage,
      frequency,
      connections,
      bluetooth: hasBluetooth,
      remote: i % 2 === 0, // Adding remote field based on schema
      additionalSpecs, // This will be used to update the peripheral specifications later
    });
  }

  // Insert Speaker entries
  for (const speaker of speakers) {
    // Extract additionalSpecs before creating the speaker
    const { additionalSpecs, ...speakerData } = speaker;

    // Create or update the speaker with schema-compliant data
    await prisma.speakers.upsert({
      where: { peripheralId: speakerData.peripheralId },
      update: speakerData,
      create: speakerData,
    });

    // Update the peripheral with the additional specifications
    await prisma.peripheral.update({
      where: { id: speakerData.peripheralId },
      data: {
        specifications: JSON.stringify({
          manufacturer: speakerData.manufacturer,
          type: speakerData.type,
          totalWattage: speakerData.totalWattage,
          frequency: speakerData.frequency,
          connections: speakerData.connections,
          bluetooth: speakerData.bluetooth,
          remote: speakerData.remote,
          ...additionalSpecs,
        }),
      },
    });
  }
}
