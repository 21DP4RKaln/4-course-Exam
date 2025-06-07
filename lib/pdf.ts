import fs from 'fs-extra';
import path from 'path';
import PDFDocument from 'pdfkit';

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
 * Generates a PDF receipt for an order
 * @param orderData Order data to include in the receipt
 * @returns Path to the generated PDF file
 */
export async function generateOrderPDF(
  orderData: OrderPDFData
): Promise<string> {
  const tempDir = path.join(process.cwd(), 'tmp');
  await fs.ensureDir(tempDir);

  const filename = `order-receipt-${orderData.id}.pdf`;
  const outputPath = path.join(tempDir, filename);

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);

  doc.fontSize(20).text('IvaPro', { align: 'center' });
  doc.fontSize(16).text('Order Receipt', { align: 'center' });
  doc.moveDown();

  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke();
  doc.moveDown();

  doc.fontSize(14).text('Order Information', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`Order ID: ${orderData.id}`);
  doc.text(`Date: ${orderData.createdAt.toLocaleDateString()}`);
  doc.text(`Payment Method: ${orderData.paymentMethod}`);
  doc.text(`Shipping Method: ${orderData.shippingMethod}`);
  doc.moveDown();

  doc.fontSize(14).text('Customer Information', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`Name: ${orderData.shippingName}`);
  doc.text(`Email: ${orderData.shippingEmail}`);
  doc.text(`Phone: ${orderData.shippingPhone}`);
  doc.text(`Address: ${orderData.shippingAddress}`);
  doc.moveDown();

  doc.fontSize(14).text('Order Items', { underline: true });
  doc.moveDown(0.5);

  const itemsTableTop = doc.y;
  let itemsTableY = itemsTableTop;

  const columns = {
    item: { x: 50, width: 250 },
    qty: { x: 300, width: 50 },
    price: { x: 350, width: 100 },
    total: { x: 450, width: 100 },
  };

  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Item', columns.item.x, itemsTableY);
  doc.text('Qty', columns.qty.x, itemsTableY, {
    width: columns.qty.width,
    align: 'center',
  });
  doc.text('Price', columns.price.x, itemsTableY, {
    width: columns.price.width,
    align: 'right',
  });
  doc.text('Total', columns.total.x, itemsTableY, {
    width: columns.total.width,
    align: 'right',
  });

  itemsTableY += 20;
  doc
    .moveTo(50, itemsTableY)
    .lineTo(doc.page.width - 50, itemsTableY)
    .stroke();
  itemsTableY += 10;

  doc.font('Helvetica');
  for (const item of orderData.items) {
    if (itemsTableY > doc.page.height - 150) {
      doc.addPage();
      itemsTableY = 50;
    }

    doc.text(item.name, columns.item.x, itemsTableY, {
      width: columns.item.width,
    });
    doc.text(item.quantity.toString(), columns.qty.x, itemsTableY, {
      width: columns.qty.width,
      align: 'center',
    });
    doc.text(`€${item.price.toFixed(2)}`, columns.price.x, itemsTableY, {
      width: columns.price.width,
      align: 'right',
    });
    doc.text(
      `€${(item.price * item.quantity).toFixed(2)}`,
      columns.total.x,
      itemsTableY,
      { width: columns.total.width, align: 'right' }
    );

    itemsTableY += 20;
  }

  doc
    .moveTo(50, itemsTableY)
    .lineTo(doc.page.width - 50, itemsTableY)
    .stroke();
  itemsTableY += 10;

  doc.font('Helvetica');
  doc.text('Subtotal:', columns.price.x, itemsTableY, {
    width: columns.price.width,
    align: 'right',
  });
  doc.text(`€${orderData.subtotal.toFixed(2)}`, columns.total.x, itemsTableY, {
    width: columns.total.width,
    align: 'right',
  });

  itemsTableY += 20;
  doc.text('Shipping:', columns.price.x, itemsTableY, {
    width: columns.price.width,
    align: 'right',
  });
  doc.text(
    `€${orderData.shippingCost.toFixed(2)}`,
    columns.total.x,
    itemsTableY,
    { width: columns.total.width, align: 'right' }
  );

  if (orderData.discount > 0) {
    itemsTableY += 20;
    doc.text('Discount:', columns.price.x, itemsTableY, {
      width: columns.price.width,
      align: 'right',
    });
    doc.text(
      `-€${orderData.discount.toFixed(2)}`,
      columns.total.x,
      itemsTableY,
      { width: columns.total.width, align: 'right' }
    );
  }

  itemsTableY += 20;
  doc.text('Tax:', columns.price.x, itemsTableY, {
    width: columns.price.width,
    align: 'right',
  });
  doc.text(`€${orderData.taxAmount.toFixed(2)}`, columns.total.x, itemsTableY, {
    width: columns.total.width,
    align: 'right',
  });

  itemsTableY += 20;
  doc.font('Helvetica-Bold');
  doc.text('Total:', columns.price.x, itemsTableY, {
    width: columns.price.width,
    align: 'right',
  });
  doc.text(
    `€${orderData.totalAmount.toFixed(2)}`,
    columns.total.x,
    itemsTableY,
    { width: columns.total.width, align: 'right' }
  );

  doc.moveDown(2);

  doc.font('Helvetica');
  doc.fontSize(10).text('Thank you for your order!', { align: 'center' });
  doc.text('If you have any questions, please contact our customer support.', {
    align: 'center',
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      resolve(outputPath);
    });
    stream.on('error', reject);
  });
}

/**
 * Cleans up a PDF file after it's been sent
 * @param filePath Path to the PDF file to clean up
 */
export async function cleanupPDF(filePath: string): Promise<void> {
  try {
    await fs.remove(filePath);
  } catch (error) {
    console.error('Error cleaning up PDF file:', error);
  }
}
