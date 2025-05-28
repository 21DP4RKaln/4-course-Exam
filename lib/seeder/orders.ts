import { PrismaClient, OrderStatus, ProductType } from '@prisma/client';

export async function seedOrders(prisma: PrismaClient) {
  // Get users to assign orders to
  const users = await prisma.user.findMany({
    take: 10
  });
  
  // Get products to include in orders
  const components = await prisma.component.findMany({
    take: 30
  });
  
  const peripherals = await prisma.peripheral.findMany({
    take: 20
  });
  
  // Get configurations
  const configurations = await prisma.configuration.findMany({
    where: { isTemplate: true },
    take: 5
  });
  
  // Get promo codes
  const promoCodes = await prisma.promoCode.findMany({
    where: { isActive: true },
    take: 5
  });
    // Order statuses and their weights (higher = more common)
  const orderStatuses = [
    { status: OrderStatus.PENDING, weight: 2 },
    { status: OrderStatus.PROCESSING, weight: 3 },
    { status: OrderStatus.COMPLETED, weight: 12 }, // Combining SHIPPED and DELIVERED into COMPLETED
    { status: OrderStatus.CANCELLED, weight: 2 }
  ];
  
  // Calculate total weight for weighted random selection
  const totalWeight = orderStatuses.reduce((sum, status) => sum + status.weight, 0);
    // Function to select random status based on weight
  function getRandomStatus(): OrderStatus {
    let random = Math.random() * totalWeight;
    
    for (const status of orderStatuses) {
      random -= status.weight;
      if (random <= 0) {
        return status.status;
      }
    }
    
    return OrderStatus.COMPLETED; // fallback
  }
  
  // Payment methods
  const paymentMethods = ['CREDIT_CARD', 'BANK_TRANSFER', 'PAYPAL'];
  
  // Shipping methods
  const shippingMethods = ['STANDARD', 'EXPRESS', 'IN_STORE_PICKUP'];
  
  // Generate orders
  const orders = [];
  const orderCount = 25; // Generate 25 orders
  
  const now = new Date();
  
  for (let i = 0; i < orderCount; i++) {
    // Select a random user
    const user = users[i % users.length];
    
    // Determine order date (within the last 90 days)
    const daysAgo = Math.floor(Math.random() * 90);
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);
      // Get a random status as an OrderStatus enum value
    const status: OrderStatus = getRandomStatus();
    
    // Determine if a promo code is used
    const usePromoCode = Math.random() > 0.7; // 30% chance of using a promo code
    const promoCode = usePromoCode ? promoCodes[i % promoCodes.length] : null;
    
    // Payment details
    const paymentMethod = paymentMethods[i % paymentMethods.length];
    const shippingMethod = shippingMethods[i % shippingMethods.length];
    
    // Select random items for this order
    const itemCount = 1 + Math.floor(Math.random() * 4); // 1-4 items per order
    const orderItems = [];
    let subtotal = 0;
    
    // Decide if this order will include a configuration
    const includeConfiguration = i % 5 === 0; // 20% of orders include a full configuration
    
    if (includeConfiguration && configurations.length > 0) {
      // Add a configuration to the order
      const config = configurations[i % configurations.length];
      subtotal += config.totalPrice;
        orderItems.push({
        productType: ProductType.CONFIGURATION,
        productId: config.id,
        quantity: 1,
        price: config.totalPrice,
        name: config.name
      });
    } else {
      // Add individual items
      for (let j = 0; j < itemCount; j++) {
        if (j % 2 === 0 && components.length > 0) {      // Add a component
      const component = components[(i + j) % components.length];
      const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
      const price = component.price;
      subtotal += price * quantity;
      
      orderItems.push({
        productType: ProductType.COMPONENT,
        productId: component.id,
        quantity,
        price,
        name: component.name
      });
    } else if (peripherals.length > 0) {
      // Add a peripheral
      const peripheral = peripherals[(i + j) % peripherals.length];
      const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
      const price = peripheral.price;
      subtotal += price * quantity;
      
      orderItems.push({
        productType: ProductType.PERIPHERAL,
        productId: peripheral.id,
        quantity,
        price,
        name: peripheral.name
      });
        }
      }
    }
    
    // Calculate shipping, tax, and discounts
    const shippingCost = shippingMethod === 'EXPRESS' ? 1500 : (shippingMethod === 'STANDARD' ? 800 : 0);
    const taxRate = 0.21; // 21% tax
    const taxAmount = Math.round(subtotal * taxRate);
      // Apply discount if promo code is used
    let discountAmount = 0;
    if (usePromoCode && promoCode) {
      if (promoCode.discountPercentage) {
        discountAmount = Math.min(
          Math.round(subtotal * (promoCode.discountPercentage / 100)),
          promoCode.maxDiscountAmount || Infinity
        );
      } else if (promoCode.maxDiscountAmount) {
        discountAmount = promoCode.maxDiscountAmount;
      }
    }
    
    // Calculate total
    const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;    // Create the order - make sure it matches the schema structure
    orders.push({
      userId: user.id,
      status, // status is already an OrderStatus enum value
      totalAmount, // This is the only amount field in the schema
      shippingAddress: (user.shippingAddress || '123 Main St') + 
        ', ' + (user.shippingCity || 'Vilnius') + 
        ', ' + (user.shippingPostalCode || '01234') + 
        ', ' + (user.shippingCountry || 'Lithuania'),
      paymentMethod,
      shippingMethod,
      isGuestOrder: false,
      shippingEmail: user.email || 'customer@example.com',
      shippingName: (user.firstName || 'Customer') + ' ' + (user.lastName || 'User'),
      shippingPhone: user.phone || '+37112345678',
      createdAt: orderDate,
      updatedAt: orderDate,
      items: orderItems
    });
  }
    // Insert orders
  for (const order of orders) {
    // Extract items and userId using destructuring
    const { items: orderItems, userId, ...orderData } = order;
    
    // Create order with proper nested user relation
    const createdOrder = await prisma.order.create({
      data: {
        ...orderData,
        user: userId ? { connect: { id: userId } } : undefined
      }
    });
    
    // Add order items
    for (const item of orderItems) {
      await prisma.orderItem.create({
        data: {
          orderId: createdOrder.id,
          ...item
        }
      });
    }
  }
}
