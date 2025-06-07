import fs from 'fs-extra';
import path from 'path';

export interface OrderPDFData {
  id: string;
  createdAt: Date;
  shippingName: string;
  shippingAddress: string;
  shippingEmail: string;
  shippingPhone: string;
  paymentMethod: string;
  shippingMethod: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    productType: string;
  }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
}

/**
 * Generates a professional text receipt for an order
 * @param orderData Order data to include in the receipt
 * @returns Path to the generated text file
 */
export async function generateOrderPDF(
  orderData: OrderPDFData
): Promise<string> {
  const tempDir = path.join(process.cwd(), 'tmp');
  await fs.ensureDir(tempDir);

  const filename = `order-receipt-${orderData.id}.txt`;
  const outputPath = path.join(tempDir, filename);

  // Format date and time professionally
  const formattedDate = orderData.createdAt.toLocaleDateString('lv-LV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = orderData.createdAt.toLocaleTimeString('lv-LV', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate line total for each item
  const formatItemLine = (item: any) => {
    const lineTotal = item.price * item.quantity;
    return `${item.name.padEnd(35)} ${item.quantity.toString().padStart(3)} x €${item.price.toFixed(2).padStart(8)} = €${lineTotal.toFixed(2).padStart(10)}`;
  };

  // Create professional receipt content
  const receiptContent = `
╔═══════════════════════════════════════════════════════════════════════╗
║                              IVAPRO                                   ║
║                           ORDER RECEIPT                               ║
╚═══════════════════════════════════════════════════════════════════════╝

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ORDER DETAILS:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Order ID:     ${orderData.id}
  Date:         ${formattedDate}
  Time:         ${formattedTime}

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  DELIVERY INFORMATION:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Name:               ${orderData.shippingName}
  Address:            ${orderData.shippingAddress}
  E-mail:             ${orderData.shippingEmail}
  Telephone:          ${orderData.shippingPhone}

  Payment method:     ${orderData.paymentMethod}
  Type of delivery:   ${orderData.shippingMethod}

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  THE GOODS ORDERED:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ${'Product'.padEnd(32)} ${'Count'.padStart(8)} ${'Price'.padStart(12)} ${'Total'.padStart(13)}
  ${'─'.repeat(32)} ${'─'.repeat(8)} ${'─'.repeat(12)} ${'─'.repeat(13)}
  ${orderData.items.map(formatItemLine).join('\n')}

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  APPROACH:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Amount of goods:                                       €${orderData.subtotal.toFixed(2).padStart(8)}
  Delivery costs:                                        €${orderData.shippingCost.toFixed(2).padStart(8)}
  ${orderData.discount > 0 ? `Discount:                                             -€${orderData.discount.toFixed(2).padStart(8)}` : ''}
  PVN (21%):                                             €${orderData.taxAmount.toFixed(2).padStart(8)}
  ${'─'.repeat(71)}
  TOTAL PAYMENTS:                                        €${orderData.totalAmount.toFixed(2).padStart(8)}

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Thank you for your order!

  If you have any questions about this order, please contact our customer 
  service team at with your order ID.

  Company details:
  SIA " "
  Reg. No.: 40003XXXXXX
  VAT code: LVXXXXXXX
  Address: Rīga, Latvija

  Receipt generated: ${new Date().toLocaleString('lv-LV')}

╔═══════════════════════════════════════════════════════════════════════╗
║                          Keep this receipt!                           ║
╚═══════════════════════════════════════════════════════════════════════╝
`;

  await fs.writeFile(outputPath, receiptContent, 'utf8');
  return outputPath;
}

/**
 * Delete the generated receipt file
 * @param filePath Path to the receipt file to delete
 */
export async function cleanupPDF(filePath: string): Promise<void> {
  try {
    await fs.remove(filePath);
  } catch (error) {
    console.error('Error cleaning up receipt file:', error);
  }
}
