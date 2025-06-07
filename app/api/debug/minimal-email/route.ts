import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { generateOrderPDF, cleanupPDF, OrderPDFData } from '@/lib/mail/pdf';
import { sendOrderConfirmationEmail } from '@/lib/mail/email';
import { getEmailConfig } from '@/lib/mail/emailConfig';

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    const { orderId, locale = 'lv' } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required', logs },
        { status: 400 }
      );
    }

    logs.push(`Starting minimal email test for order: ${orderId}`);

    // Step 1: Get order
    logs.push('Step 1: Fetching order...');
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: true,
      },
    });

    if (!order) {
      logs.push('ERROR: Order not found');
      return NextResponse.json(
        { error: 'Order not found', logs },
        { status: 404 }
      );
    }

    logs.push(`Order found: ${order.id}, email: ${order.shippingEmail}`); // Step 2: Prepare order data
    logs.push('Step 2: Preparing order data...');
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

    logs.push(`Items subtotal (raw): €${itemsSubtotal.toFixed(2)}`);
    logs.push(`Subtotal WITHOUT tax: €${subtotalWithoutTax.toFixed(2)}`);
    logs.push(`Tax amount (21%): €${taxAmount.toFixed(2)}`);
    logs.push(`Shipping: €${shippingCost.toFixed(2)}`);
    logs.push(`Discount: €${discount.toFixed(2)}`);
    logs.push(`Total: €${order.totalAmount.toFixed(2)}`);

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
    logs.push('Order data prepared successfully');

    // Step 3: Generate PDF
    logs.push('Step 3: Generating PDF...');
    const pdfPath = await generateOrderPDF(orderData);
    logs.push(`PDF generated: ${pdfPath}`);

    // Step 4: Get email config
    logs.push('Step 4: Getting email config...');
    const emailConfig = await getEmailConfig();
    logs.push('Email config retrieved successfully');

    if (!order.shippingEmail) {
      logs.push('ERROR: No shipping email');
      await cleanupPDF(pdfPath);
      return NextResponse.json(
        { error: 'No shipping email', logs },
        { status: 400 }
      );
    }

    // Step 5: Send email
    logs.push(`Step 5: Sending email to ${order.shippingEmail}...`);
    const customerName =
      order.shippingName ||
      (order.user
        ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
        : 'Customer') ||
      'Customer';

    await sendOrderConfirmationEmail(
      order.shippingEmail,
      orderData,
      pdfPath,
      emailConfig,
      locale,
      customerName
    );
    logs.push('Email sent successfully');

    // Step 6: Cleanup
    logs.push('Step 6: Cleaning up PDF...');
    await cleanupPDF(pdfPath);
    logs.push('PDF cleaned up');

    // Step 7: Skip audit log for now to isolate the issue
    logs.push('Step 7: Skipping audit log creation for testing');

    logs.push('All steps completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      logs,
    });
  } catch (error: any) {
    logs.push(`ERROR: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        logs,
      },
      { status: 500 }
    );
  }
}
