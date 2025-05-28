import { PrismaClient, RepairStatus, RepairPriority } from '@prisma/client';

export async function seedRepairs(prisma: PrismaClient) {
  // Get users for the repairs
  const users = await prisma.user.findMany({
    take: 8
  });
  
  // Get specialists (staff users) for assigning repairs
  const specialists = await prisma.user.findMany({
    where: {
      role: 'SPECIALIST'
    },
    take: 3
  });
  
  // If we don't have specialists, we can't continue
  if (specialists.length === 0) {
    console.log("No specialist users found. Skipping repair seeding.");
    return;
  }
  
  // Get components that might be used as repair parts
  const components = await prisma.component.findMany({
    take: 20
  });
  
  // Get peripherals that might need repair
  const peripherals = await prisma.peripheral.findMany({
    take: 15
  });
    // Repair statuses - match the RepairStatus enum in Prisma schema
  const repairStatuses = [
    'PENDING',
    'DIAGNOSING',
    'WAITING_FOR_PARTS',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
  ];
  
  // Common issues
  const commonIssues = [
    'Does not power on',
    'Blue screen errors',
    'Random shutdowns',
    'Overheating',
    'GPU artifacts',
    'Loud fan noise',
    'USB ports not working',
    'Slow performance',
    'Wi-Fi connection issues',
    'No display output',
    'Keyboard keys not responsive',
    'Mouse tracking issues',
    'Headphone jack not working',
    'Storage drive not detected',
    'RGB lighting not functioning'
  ];
  
  // Common diagnoses
  const commonDiagnoses = [
    'Faulty power supply',
    'RAM module failure',
    'GPU malfunction',
    'CPU overheating',
    'Corrupted operating system',
    'Failed SSD',
    'Motherboard capacitor issue',
    'Loose internal connection',
    'Driver conflict',
    'BIOS settings issue',
    'Dust accumulation causing overheating',
    'Broken USB header on motherboard',
    'Failed keyboard controller',
    'Mouse sensor failure',
    'Corrupted firmware'
  ];
  
  // Generate repairs
  const repairs = [];
  const repairCount = 15;
  
  const now = new Date();
  
  for (let i = 0; i < repairCount; i++) {
    // Select a random user
    const user = users[i % users.length];
    
    // Determine repair date (within the last 60 days)
    const daysAgo = Math.floor(Math.random() * 60);
    const repairDate = new Date(now);
    repairDate.setDate(repairDate.getDate() - daysAgo);
    
    // Determine if it's a peripheral repair
    const isPeripheralRepair = i % 3 === 0; // 1/3 of repairs are for peripherals
      // Status depends on the age of the repair
    let status;
    if (daysAgo < 3) {
      status = repairStatuses[Math.min(1, i % 2)]; // PENDING or DIAGNOSING for new repairs
    } else if (daysAgo < 10) {
      status = repairStatuses[Math.min(3, 2 + (i % 2))]; // WAITING_FOR_PARTS or IN_PROGRESS for recent repairs
    } else {
      status = repairStatuses[Math.min(5, 4 + (i % 2))]; // COMPLETED or CANCELLED for older repairs
    }
    
    // If the repair is completed, set completion date
    const estimatedCompletionDate = new Date(repairDate);
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + 3 + Math.floor(Math.random() * 7)); // 3-10 days after request
    
    let completionDate = null;
    if (status === 'COMPLETED') {
      completionDate = new Date(estimatedCompletionDate);
      // Some repairs are completed early, some late
      completionDate.setDate(completionDate.getDate() + (Math.random() > 0.7 ? 2 : -1));
    }
    
    // Select a random specialist
    const specialist = specialists[i % specialists.length];
      // Select a random issue and diagnosis
    const issue = commonIssues[i % commonIssues.length];
    const diagnosis = status !== 'PENDING' ? commonDiagnoses[i % commonDiagnoses.length] : null;
    
    // Determine repair details
    let deviceDetails;
    let peripheralId = null;
    
    if (isPeripheralRepair && peripherals.length > 0) {
      const peripheral = peripherals[i % peripherals.length];
      peripheralId = peripheral.id;
      deviceDetails = `${peripheral.name} (Issue: ${issue})`;
    } else {
      deviceDetails = `Custom PC Build (Issue: ${issue})`;
    }
    
    // Calculate repair cost
    const diagnosisFee = 2500; // €25
    let partsCost = 0;
    let laborCost = 5000; // €50 base labor
    
    // Add repair parts for repairs that are diagnosed or beyond
    const repairParts = [];
    if (status !== 'REQUESTED' && components.length > 0) {
      const partsNeeded = Math.floor(Math.random() * 2) + 1; // 1-2 parts needed
      
      for (let j = 0; j < partsNeeded; j++) {
        const component = components[(i + j) % components.length];
        const quantity = 1;
        const price = component.price * 0.8; // Parts at 80% of retail price
        partsCost += price * quantity;
        
        repairParts.push({
          componentId: component.id,
          quantity,
          price
        });
      }
    }
    
    // Total cost
    const totalCost = diagnosisFee + partsCost + laborCost;
      // Create the repair
    repairs.push({
      title: isPeripheralRepair ? `Repair for ${peripherals[i % peripherals.length].name}` : `Custom PC Repair #${i+1}`,
      description: `${issue}. ${diagnosis ? `Diagnosed: ${diagnosis}` : ''}`,
      status: status as RepairStatus,
      priority: i % 4 === 0 ? RepairPriority.HIGH : (i % 4 === 1 ? RepairPriority.URGENT : RepairPriority.NORMAL),
      userId: user.id,
      peripheralId,
      configurationId: null,
      createdAt: repairDate,
      updatedAt: status !== 'PENDING' ? new Date(repairDate.getTime() + 24 * 60 * 60 * 1000) : repairDate, // Updated 1 day later if not just pending
      estimatedCost: totalCost,
      finalCost: status === 'COMPLETED' || status === 'CANCELLED' ? totalCost : null,
      completionDate,
      diagnosticNotes: diagnosis ? `${diagnosis}. ${i % 5 === 0 ? 'Customer reported intermittent issues that couldn\'t be reproduced in the shop' : ''}` : null,
      repairParts,
      // Create specialist association
      specialist: {
        specialistId: specialist.id,
        assignedAt: status !== 'PENDING' ? new Date(repairDate.getTime() + 12 * 60 * 60 * 1000) : new Date(repairDate), // Assigned 12 hours later if not just pending
        notes: i % 3 === 0 ? 'Recommended preventative maintenance' : null
      }
    });
  }
  // Insert repairs
  for (const repair of repairs) {
    // Extract the properties we need separately, and collect the rest in repairData
    const { repairParts = [], specialist, ...repairData } = repair;
    
    const createdRepair = await prisma.repair.create({
      data: repairData
    });
    
    // Add repair specialist
    if (specialist) {
      await prisma.repairSpecialist.create({
        data: {
          repairId: createdRepair.id,
          specialistId: specialist.specialistId,
          assignedAt: specialist.assignedAt,
          notes: specialist.notes
        }
      });
    }
    
    // Add repair parts
    for (const part of repairParts) {
      await prisma.repairPart.create({
        data: {
          repairId: createdRepair.id,
          componentId: part.componentId,
          quantity: part.quantity || 1,
          price: part.price
        }
      });
    }
  }
}
