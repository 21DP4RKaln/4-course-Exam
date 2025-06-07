// filepath: lib/seeder/repairs.ts
import { PrismaClient, RepairStatus, RepairPriority } from '@prisma/client';
import { priceWith99 } from './utils';

export async function seedRepairs(prisma: PrismaClient): Promise<void> {
  // Get sample users, peripherals, and configurations for repairs
  const users = await prisma.user.findMany({ take: 5 });
  const peripherals = await prisma.peripheral.findMany({ take: 5 });
  const configurations = await prisma.configuration.findMany({ take: 5 });

  if (users.length === 0) {
    throw new Error('Users not found. Please seed users first.');
  }

  const repairs = [
    {
      title: 'Monitor Screen Flickering',
      description:
        'Customer reports screen flickering issues on gaming monitor',
      status: RepairStatus.PENDING,
      priority: RepairPriority.NORMAL,
      userId: users[0]?.id || '',
      peripheralId: peripherals[0]?.id,
      estimatedCost: priceWith99(75, 125),
      diagnosticNotes:
        'Initial assessment required to determine cause of flickering',
    },
    {
      title: 'Keyboard Key Replacement',
      description: 'Multiple keys not responding on mechanical keyboard',
      status: RepairStatus.IN_PROGRESS,
      priority: RepairPriority.NORMAL,
      userId: users[1]?.id || '',
      peripheralId: peripherals[1]?.id,
      estimatedCost: priceWith99(25, 50),
      finalCost: priceWith99(35, 45),
      diagnosticNotes: 'Switch replacement needed for W, A, S, D keys',
    },
    {
      title: 'Gaming PC Overheating',
      description: 'Computer shuts down during intensive gaming sessions',
      status: RepairStatus.COMPLETED,
      priority: RepairPriority.HIGH,
      userId: users[2]?.id || '',
      configurationId: configurations[0]?.id,
      estimatedCost: priceWith99(100, 200),
      finalCost: priceWith99(149, 179),
      completionDate: new Date('2025-05-20'),
      diagnosticNotes:
        'Thermal paste replacement and additional case fans installed',
    },
    {
      title: 'Mouse Sensor Malfunction',
      description: 'Gaming mouse cursor movement erratic and inconsistent',
      status: RepairStatus.PENDING,
      priority: RepairPriority.NORMAL,
      userId: users[3]?.id || '',
      peripheralId: peripherals[2]?.id,
      estimatedCost: priceWith99(40, 80),
      diagnosticNotes: 'Sensor cleaning or replacement may be required',
    },
    {
      title: 'Headset Audio Issues',
      description: 'Left ear audio cutting out intermittently',
      status: RepairStatus.IN_PROGRESS,
      priority: RepairPriority.NORMAL,
      userId: users[4]?.id || '',
      peripheralId: peripherals[3]?.id,
      estimatedCost: priceWith99(60, 100),
      diagnosticNotes:
        'Cable connection issue suspected, replacement cable ordered',
    },
    {
      title: "PC Won't Boot",
      description: 'System powers on but no display output',
      status: RepairStatus.IN_PROGRESS,
      priority: RepairPriority.URGENT,
      userId: users[0]?.id || '',
      configurationId: configurations[1]?.id,
      estimatedCost: priceWith99(150, 300),
      diagnosticNotes: 'Testing RAM and GPU components for failure',
    },
    {
      title: 'Webcam Not Detected',
      description: 'USB webcam not recognized by operating system',
      status: RepairStatus.COMPLETED,
      priority: RepairPriority.LOW,
      userId: users[1]?.id || '',
      peripheralId: peripherals[4]?.id,
      estimatedCost: priceWith99(20, 40),
      finalCost: priceWith99(25, 35),
      completionDate: new Date('2025-05-18'),
      diagnosticNotes:
        'Driver reinstallation and USB port cleaning resolved issue',
    },
    {
      title: 'Speaker Distortion',
      description: 'Audio distortion at high volumes from desktop speakers',
      status: RepairStatus.PENDING,
      priority: RepairPriority.NORMAL,
      userId: users[2]?.id || '',
      peripheralId: peripherals[0]?.id,
      estimatedCost: priceWith99(50, 90),
      diagnosticNotes:
        'Driver damage suspected, replacement parts being sourced',
    },
    {
      title: 'Custom Build Assembly',
      description:
        'Customer requesting professional assembly of purchased components',
      status: RepairStatus.COMPLETED,
      priority: RepairPriority.NORMAL,
      userId: users[3]?.id || '',
      configurationId: configurations[2]?.id,
      estimatedCost: priceWith99(100, 150),
      finalCost: priceWith99(125, 145),
      completionDate: new Date('2025-05-22'),
      diagnosticNotes:
        'Full system assembly with cable management and testing completed',
    },
    {
      title: 'Gamepad Stick Drift',
      description: 'Left analog stick registering movement when not touched',
      status: RepairStatus.CANCELLED,
      priority: RepairPriority.NORMAL,
      userId: users[4]?.id || '',
      peripheralId: peripherals[1]?.id,
      estimatedCost: priceWith99(30, 60),
      diagnosticNotes:
        'Customer decided to purchase replacement instead of repair',
    },
  ];

  await prisma.repair.createMany({ data: repairs, skipDuplicates: true });
}
