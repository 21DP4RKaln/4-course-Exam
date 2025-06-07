import { prisma } from '../prismaService';
import { generateOrderPDF, cleanupPDF, OrderPDFData } from './pdf';
import { sendOrderConfirmationEmail, sendOrderApprovalEmail } from './email';
import { getEmailConfig } from './emailConfig';

/**
 * Send an order confirmation email for the given order
 * @param orderId The ID of the order to send a confirmation email for
 * @param locale The locale to use for the email (defaults to 'en')
 * @returns True if the email was sent successfully, false otherwise
 */
export async function sendOrderReceipt(
  orderId: string,
  locale: string = 'en'
): Promise<boolean> {
  console.log(
    `sendOrderReceipt called for order: ${orderId}, locale: ${locale}`
  );
  try {
    console.log('Fetching order from database...');
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: true,
      },
    });

    if (!order) {
      console.error(`Could not find order with ID ${orderId}`);
      return false;
    }

    console.log(
      `Order found: ${order.id}, status: ${order.status}, email: ${order.shippingEmail}`
    );

    // Calculate subtotal from order items
    const itemsSubtotal = order.orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Use actual values from database
    const shippingCost = order.shippingCost || 10.0;
    const discount = order.discount || 0;

    // Calculate subtotal WITHOUT tax from the total amount
    // Formula: totalAmount = (subtotalWithoutTax + shipping - discount) * 1.21
    // So: subtotalWithoutTax = (totalAmount - shipping + discount) / 1.21
    const subtotalWithoutTax =
      (order.totalAmount - shippingCost + discount) / 1.21;

    // Calculate 21% tax from subtotal WITHOUT tax
    const taxAmount = subtotalWithoutTax * 0.21;

    // Debug logging
    console.log('=== ORDER CALCULATION DEBUG ===');
    console.log('Items subtotal (raw):', itemsSubtotal);
    console.log('Subtotal WITHOUT tax:', subtotalWithoutTax);
    console.log('Tax amount (21%):', taxAmount);
    console.log('Shipping from DB:', order.shippingCost);
    console.log('Shipping used:', shippingCost);
    console.log('Discount from DB:', order.discount);
    console.log('Final discount used:', discount);
    console.log('Total amount:', order.totalAmount);
    console.log('=== END DEBUG ===');

    const orderData: OrderPDFData = {
      id: order.id,
      createdAt: order.createdAt,
      shippingName: order.shippingName ?? 'N/A',
      shippingAddress: order.shippingAddress ?? 'N/A',
      shippingEmail: order.shippingEmail ?? 'N/A',
      shippingPhone: order.shippingPhone ?? 'N/A',
      paymentMethod: order.paymentMethod ?? 'N/A',
      shippingMethod: order.shippingMethod ?? 'N/A',
      items: order.orderItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        productType: item.productType,
      })),
      subtotal: subtotalWithoutTax,
      shippingCost,
      discount,
      taxAmount,
      totalAmount: order.totalAmount,
    };

    console.log('Generating PDF...');
    const pdfPath = await generateOrderPDF(orderData);
    console.log(`PDF generated at: ${pdfPath}`);

    console.log('Getting email config...');
    const emailConfig = await getEmailConfig();
    console.log('Email config retrieved successfully');

    if (order.shippingEmail) {
      console.log(`Sending email to: ${order.shippingEmail}`);
      const customerName =
        order.shippingName ||
        (order.user
          ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
          : 'Customer');

      console.log(`Customer name: ${customerName}`);

      await sendOrderConfirmationEmail(
        order.shippingEmail,
        orderData,
        pdfPath,
        emailConfig,
        locale,
        customerName || 'Customer'
      );

      console.log('Email sent successfully');
    } else {
      console.log(
        `No shipping email provided for order ${order.id}, skipping email sending`
      );
    }

    console.log('Cleaning up PDF...');
    await cleanupPDF(pdfPath);
    console.log('PDF cleaned up');

    // Skip audit logging for system-generated emails to avoid database dependency issues
    console.log('Skipping audit log for system-generated email');

    console.log('sendOrderReceipt completed successfully');
    return true;
  } catch (error: any) {
    console.error('Error sending order confirmation email:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    return false;
  }
}

/**
 * Send order approval email when specialist/admin approves an order
 * @param orderId The ID of the order that was approved
 * @param locale The locale to use for the email (defaults to 'en')
 * @returns True if the email was sent successfully, false otherwise
 */
export async function sendOrderApprovalReceipt(
  orderId: string,
  locale: string = 'en'
): Promise<boolean> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: true,
      },
    });

    if (!order) {
      console.error(`Could not find order with ID ${orderId}`);
      return false;
    }

    // Only send approval email if order status is PROCESSING
    if (order.status !== 'PROCESSING') {
      console.log(
        `Order ${orderId} is not in PROCESSING status, skipping approval email`
      );
      return false;
    }

    // Calculate subtotal from order items
    const itemsSubtotal = order.orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Use actual values from database
    const shippingCost = order.shippingCost || 10.0;
    const discount = order.discount || 0;

    // Calculate subtotal WITHOUT tax from the total amount
    // Formula: totalAmount = (subtotalWithoutTax + shipping - discount) * 1.21
    // So: subtotalWithoutTax = (totalAmount - shipping + discount) / 1.21
    const subtotalWithoutTax =
      (order.totalAmount - shippingCost + discount) / 1.21;

    // Calculate 21% tax from subtotal WITHOUT tax
    const taxAmount = subtotalWithoutTax * 0.21;

    // Debug logging
    console.log('=== ORDER APPROVAL CALCULATION DEBUG ===');
    console.log('Items subtotal (raw):', itemsSubtotal);
    console.log('Subtotal WITHOUT tax:', subtotalWithoutTax);
    console.log('Tax amount (21%):', taxAmount);
    console.log('Shipping from DB:', order.shippingCost);
    console.log('Shipping used:', shippingCost);
    console.log('Discount from DB:', order.discount);
    console.log('Final discount used:', discount);
    console.log('Total amount:', order.totalAmount);
    console.log('=== END DEBUG ===');

    const orderData: OrderPDFData = {
      id: order.id,
      createdAt: order.createdAt,
      shippingName: order.shippingName ?? 'N/A',
      shippingAddress: order.shippingAddress ?? 'N/A',
      shippingEmail: order.shippingEmail ?? 'N/A',
      shippingPhone: order.shippingPhone ?? 'N/A',
      paymentMethod: order.paymentMethod ?? 'N/A',
      shippingMethod: order.shippingMethod ?? 'N/A',
      items: order.orderItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        productType: item.productType,
      })),
      subtotal: subtotalWithoutTax,
      shippingCost,
      discount,
      taxAmount,
      totalAmount: order.totalAmount,
    };

    const emailConfig = await getEmailConfig();

    if (order.shippingEmail) {
      // Get customer name for email
      const customerName =
        order.shippingName ||
        (order.user
          ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
          : 'Customer');
      await sendOrderApprovalEmail(
        order.shippingEmail,
        orderData,
        emailConfig,
        locale,
        customerName || 'Customer'
      );

      // Skip audit log creation to avoid database dependency issues
      console.log('Approval email sent, skipping audit log');

      return true;
    } else {
      console.log(
        `No shipping email provided for order ${order.id}, skipping approval email sending`
      );
      return false;
    }
  } catch (error) {
    console.error('Error sending order approval email:', error);
    return false;
  }
}
