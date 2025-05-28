import { PrismaClient } from '@prisma/client';

export async function seedPeripherals(prisma: PrismaClient) {
  // Get all peripheral categories
  const categories = await prisma.peripheralCategory.findMany();
  
  // Prepare peripheral entries
  const peripherals = [];
  
  // Number of peripherals per category
  const perCategoryCount = 8;
  
  // Generate peripherals for each category
  for (const category of categories) {    // Convert singular category slugs to plural subTypes
    let subType = category.slug.replace('-', '').toLowerCase();
    // Add 's' if not already plural
    if (!subType.endsWith('s')) {
      subType = subType + 's';
    }
    
    for (let i = 0; i < perCategoryCount; i++) {
      // Define manufacturers based on category
      let manufacturers = ['Logitech', 'Razer', 'Corsair', 'SteelSeries', 'HyperX'];
      
      // For monitors, use display manufacturers
      if (subType === 'monitors') {
        manufacturers = ['LG', 'Samsung', 'ASUS', 'Dell', 'Acer', 'BenQ', 'AOC'];
      }
      // For audio, use audio manufacturers
      else if (subType === 'headphones' || subType === 'speakers' || subType === 'microphones') {
        manufacturers = ['Audio-Technica', 'SteelSeries', 'HyperX', 'Razer', 'Logitech', 'Sennheiser', 'JBL'];
      }
      
      // For cameras, use camera manufacturers
      else if (subType === 'cameras') {
        manufacturers = ['Logitech', 'Razer', 'Elgato', 'AVerMedia', 'Microsoft', 'Canon', 'Sony'];
      }
      
      const manufacturer = manufacturers[i % manufacturers.length];
      
      // Generate a name based on manufacturer and category
      const series = ['Pro', 'Elite', 'Ultra', 'Gaming', 'Performance', 'Creator'];
      const name = `${manufacturer} ${category.name} ${series[i % series.length]} ${10 + i * 10}`;
      
      // Generate price based on quality tier
      const qualityTier = Math.floor(i / 2); // 0-4 range
      const basePrice = 30 + qualityTier * 40;
      const price = basePrice + (Math.random() * 20 - 10);
      
      // Random stock amount
      const stock = 10 + Math.floor(Math.random() * 90);
      
      // Generate SKU
      const sku = `P-${category.slug.substring(0, 3).toUpperCase()}-${manufacturer.substring(0, 3).toUpperCase()}-${1000 + i}`;
      
      // Some items have discounts
      const hasDiscount = i % 5 === 0;
      const discountPrice = hasDiscount ? price * 0.85 : null;
      const discountExpiresAt = hasDiscount 
        ? new Date(Date.now() + (30 + Math.floor(Math.random() * 60)) * 24 * 60 * 60 * 1000) 
        : null;
      
      // Sample specifications as JSON
      const specs = {
        manufacturer: manufacturer,
        connectivity: i % 3 === 0 ? 'Wireless' : 'Wired',
        interface: i % 3 === 0 ? '2.4GHz / Bluetooth' : 'USB',
        color: ['Black', 'White', 'Black/RGB', 'Gray', 'White/RGB'][i % 5],
        weight: `${100 + i * 50}g`,
        warranty: '2 years'
      };
      
      peripherals.push({
        name,
        description: `${name} - High quality ${category.name.toLowerCase()} designed for gaming and professional use. Features premium build quality and responsive performance.`,
        price,
        stock,
        categoryId: category.id,
        specifications: JSON.stringify(specs),
        sku,
        subType,
        discountPrice,
        discountExpiresAt,
        imageUrl: `/products/peripherals/${subType}${(i % 3) + 1}.jpg`,
      });
    }
  }
  
  // Insert peripheral entries
  for (const peripheral of peripherals) {
    await prisma.peripheral.upsert({
      where: { 
        sku: peripheral.sku 
      },
      update: peripheral,
      create: peripheral,
    });
  }
}
