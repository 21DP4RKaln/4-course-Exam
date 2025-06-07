import { prisma } from './prismaService';
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

    const subtotal = order.orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const shippingCost = order.totalAmount * 0.05;
    const taxRate = 0.21;
    const preTaxAmount = order.totalAmount / (1 + taxRate);
    const taxAmount = order.totalAmount - preTaxAmount;
    const discount = subtotal + shippingCost - preTaxAmount;

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
      subtotal,
      shippingCost,
      discount,
      taxAmount,
      totalAmount: order.totalAmount,
    };

    const pdfPath = await generateOrderPDF(orderData);
    const emailConfig = await getEmailConfig();

    if (order.shippingEmail) {
      const customerName =
        order.shippingName ||
        (order.user
          ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
          : 'Customer');
      await sendOrderConfirmationEmail(
        order.shippingEmail,
        orderData,
        pdfPath,
        emailConfig,
        locale,
        customerName || 'Customer'
      );
    } else {
      console.log(
        `No shipping email provided for order ${order.id}, skipping email sending`
      );
    }

    await cleanupPDF(pdfPath);
    if (order.shippingEmail) {
      await prisma.auditLog.create({
        data: {
          action: 'EMAIL_SENT',
          entityType: 'ORDER',
          entityId: order.id,
          details: JSON.stringify({
            type: 'order_confirmation',
            recipient: order.shippingEmail,
            locale: locale,
            sentAt: new Date(),
          }),
          ipAddress: '',
          userAgent: '',
          user: { connect: { id: 'system' } },
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
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

    const subtotal = order.orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingCost = order.totalAmount * 0.05;
    const taxRate = 0.21;
    const preTaxAmount = order.totalAmount / (1 + taxRate);
    const taxAmount = order.totalAmount - preTaxAmount;
    const discount = subtotal + shippingCost - preTaxAmount;

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
      subtotal,
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

      await prisma.auditLog.create({
        data: {
          action: 'EMAIL_SENT',
          entityType: 'ORDER',
          entityId: order.id,
          details: JSON.stringify({
            type: 'order_approval',
            recipient: order.shippingEmail,
            locale: locale,
            sentAt: new Date(),
          }),
          ipAddress: '',
          userAgent: '',
          user: { connect: { id: 'system' } },
        },
      });

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
