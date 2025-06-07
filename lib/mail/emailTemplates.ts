import { getTranslations } from 'next-intl/server';
import { OrderPDFData } from './pdf';

export interface EmailTemplateData {
  customerName: string;
  orderId: string;
  orderDate: string;
  orderData: OrderPDFData;
  locale?: string;
}

/**
 * Generate localized order confirmation email HTML
 */
export async function generateOrderConfirmationEmail(
  data: EmailTemplateData
): Promise<{ subject: string; html: string }> {
  const locale = data.locale || 'en';

  let subject: string;
  let headerTitle: string;
  let greeting: string;
  let thankYouMessage: string;
  let orderInfoTitle: string;
  let itemsTitle: string;
  let pricingTitle: string;
  let footerMessage: string;

  try {
    const t = await getTranslations({
      locale,
      namespace: 'emails.orderConfirmation',
    });

    subject = t('subject', { orderId: data.orderId });
    headerTitle = t('headerTitle');
    greeting = t('greeting', { customerName: data.customerName });
    thankYouMessage = t('thankYouMessage');
    orderInfoTitle = t('orderInfoTitle');
    itemsTitle = t('itemsTitle');
    pricingTitle = t('pricingTitle');
    footerMessage = t('footerMessage');
  } catch (error: any) {
    console.warn('Failed to load translations, using fallback:', error.message);
    // Fallback translations
    subject = `Order #${data.orderId} Confirmation - IvaPro`;
    headerTitle = 'Order Confirmation';
    greeting = `Dear ${data.customerName},`;
    thankYouMessage =
      'Thank you for your order! We have received your payment and are processing your order.';
    orderInfoTitle = 'Order Information';
    itemsTitle = 'Ordered Products';
    pricingTitle = 'Order Summary';
    footerMessage = 'Thank you for choosing IvaPro!';
  }

  // Build items HTML
  const itemsHtml = data.orderData.items
    .map(
      item =>
        `<tr>
      <td>${item.name}</td>
      <td>${item.productType}</td>
      <td>${item.quantity}</td>
      <td>€${item.price.toFixed(2)}</td>
      <td>€${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join('');

  // Build discount row if applicable
  const discountRow =
    data.orderData.discount > 0
      ? `<tr><td>Discount:</td><td>-€${data.orderData.discount.toFixed(2)}</td></tr>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      margin: 0; 
      padding: 0; 
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      color: #2c3e50;
      line-height: 1.6;
    }
    .email-wrapper { 
      width: 100%; 
      padding: 40px 20px; 
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
    .container { 
      max-width: 650px; 
      margin: 0 auto; 
      background-color: #ffffff; 
      border-radius: 16px; 
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #dc3545 0%, #c82333 50%, #1e40af 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDQwQzMxLjA0NTcgNDAgNDAgMzEuMDQ1NyA0MCAyMEM0MCA4Ljk1NDMgMzEuMDQ1NyAwIDIwIDBDOC45NTQzIDAgMCA4Ljk1NDMgMCAyMEMwIDMxLjA0NTcgOC45NTQzIDQwIDIwIDQwWiIgZmlsbD0iIzFFNDBBRiIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+') repeat;
      opacity: 0.1;
    }
    .logo { 
      width: 80px; 
      height: 80px; 
      margin: 0 auto 20px; 
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
      background: white;
      padding: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .header h1 { 
      margin: 0; 
      font-size: 32px; 
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      position: relative;
      z-index: 1;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 18px;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }
    .content { padding: 40px 30px; }
    .greeting { 
      font-size: 20px; 
      margin-bottom: 20px; 
      color: #2c3e50;
      font-weight: 600;
    }
    .thank-you { 
      font-size: 16px; 
      margin-bottom: 30px; 
      color: #6c757d;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #dc3545;
    }
    .section { 
      margin: 30px 0; 
      background: #fff;
      border-radius: 12px; 
      border: 1px solid #e9ecef;
      overflow: hidden;
    }
    .section-header { 
      background: linear-gradient(135deg, #dc3545, #1e40af);
      color: white;
      padding: 20px 25px;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .section-content { padding: 25px; }
    .info-grid { 
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }
    .info-row { 
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f8f9fa;
    }
    .info-row:last-child { border-bottom: none; }
    .label { 
      font-weight: 600; 
      color: #495057;
      min-width: 120px;
    }
    .value { 
      color: #2c3e50;
      font-weight: 500;
    }
    .items-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 0;
      border-radius: 8px;
      overflow: hidden;
    }
    .items-table th { 
      background: linear-gradient(135deg, #dc3545, #1e40af);
      color: white; 
      padding: 15px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table td { 
      padding: 15px 12px; 
      border-bottom: 1px solid #f8f9fa;
      color: #495057;
    }
    .items-table tbody tr:hover { background-color: #f8f9fa; }
    .total-row { 
      font-weight: 700; 
      font-size: 16px; 
      background: linear-gradient(135deg, #fff5f5, #eff6ff);
      color: #2c3e50;
    }
    .footer { 
      text-align: center; 
      margin-top: 40px; 
      padding: 30px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 12px;
      color: #6c757d;
      font-style: italic;
    }
    @media (max-width: 600px) {
      .email-wrapper { padding: 20px 10px; }
      .header { padding: 30px 20px; }
      .content { padding: 30px 20px; }
      .info-grid { grid-template-columns: 1fr; }
      .items-table th, .items-table td { padding: 10px 8px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">
          <img src="${process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'https://yourdomain.com'}/images/logo-removebg.png" alt="IvaPro Logo" />
        </div>
        <h1>${headerTitle}</h1>
        <p>IvaPro - Order #${data.orderId}</p>
      </div>
      
      <div class="content">
        <div class="greeting">${greeting}</div>
        <div class="thank-you">${thankYouMessage}</div>
        
        <div class="section">
          <h3 class="section-header">${orderInfoTitle}</h3>
          <div class="section-content">
            <div class="info-row"><span class="label">Order ID:</span><span class="value">${data.orderId}</span></div>
            <div class="info-row"><span class="label">Date:</span><span class="value">${data.orderDate}</span></div>
            <div class="info-row"><span class="label">Name:</span><span class="value">${data.orderData.shippingName}</span></div>
            <div class="info-row"><span class="label">Address:</span><span class="value">${data.orderData.shippingAddress}</span></div>
            <div class="info-row"><span class="label">Email:</span><span class="value">${data.orderData.shippingEmail}</span></div>
            <div class="info-row"><span class="label">Phone:</span><span class="value">${data.orderData.shippingPhone}</span></div>
            <div class="info-row"><span class="label">Payment:</span><span class="value">${data.orderData.paymentMethod}</span></div>
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-header">${itemsTitle}</h3>
          <div class="section-content">
            <table class="items-table">
              <thead>
                <tr><th>Item</th><th>Type</th><th>Qty</th><th>Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-header">${pricingTitle}</h3>
          <div class="section-content">
            <table class="items-table">
              <tr><td>Subtotal:</td><td>€${data.orderData.subtotal.toFixed(2)}</td></tr>
              <tr><td>Shipping:</td><td>€${data.orderData.shippingCost.toFixed(2)}</td></tr>
              ${discountRow}
              <tr><td>Tax (21%):</td><td>€${data.orderData.taxAmount.toFixed(2)}</td></tr>
              <tr class="total-row"><td>Total:</td><td>€${data.orderData.totalAmount.toFixed(2)}</td></tr>
            </table>
          </div>
        </div>
        
        <div class="footer">${footerMessage}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * Generate localized order approval email HTML
 */
export async function generateOrderApprovalEmail(
  data: EmailTemplateData
): Promise<{ subject: string; html: string }> {
  const locale = data.locale || 'en';

  let subject: string;
  let headerTitle: string;
  let greeting: string;
  let approvalMessage: string;
  let orderInfoTitle: string;
  let itemsTitle: string;
  let pricingTitle: string;
  let footerMessage: string;

  try {
    const t = await getTranslations({
      locale,
      namespace: 'emails.orderApproval',
    });

    subject = t('subject', { orderId: data.orderId });
    headerTitle = t('headerTitle');
    greeting = t('greeting', { customerName: data.customerName });
    approvalMessage = t('approvalMessage');
    orderInfoTitle = t('orderInfoTitle');
    itemsTitle = t('itemsTitle');
    pricingTitle = t('pricingTitle');
    footerMessage = t('footerMessage');
  } catch (error: any) {
    console.warn('Failed to load translations, using fallback:', error.message);
    // Fallback translations
    subject = `Order #${data.orderId} Approved - IvaPro`;
    headerTitle = 'Order Approved';
    greeting = `Dear ${data.customerName},`;
    approvalMessage =
      'Great news! Your order has been approved and is being prepared for shipment.';
    orderInfoTitle = 'Order Information';
    itemsTitle = 'Ordered Products';
    pricingTitle = 'Order Summary';
    footerMessage = 'Thank you for choosing IvaPro!';
  }

  // Build items HTML
  const itemsHtml = data.orderData.items
    .map(
      item =>
        `<tr>
      <td>${item.name}</td>
      <td>${item.productType}</td>
      <td>${item.quantity}</td>
      <td>€${item.price.toFixed(2)}</td>
      <td>€${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join('');

  // Build discount row if applicable
  const discountRow =
    data.orderData.discount > 0
      ? `<tr><td>Discount:</td><td>-€${data.orderData.discount.toFixed(2)}</td></tr>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      margin: 0; 
      padding: 0; 
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      color: #2c3e50;
      line-height: 1.6;
    }
    .email-wrapper { 
      width: 100%; 
      padding: 40px 20px; 
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
    .container { 
      max-width: 650px; 
      margin: 0 auto; 
      background-color: #ffffff; 
      border-radius: 16px; 
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #28a745 0%, #20c997 50%, #1e40af 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDQwQzMxLjA0NTcgNDAgNDAgMzEuMDQ1NyA0MCAyMEM0MCA4Ljk1NDMgMzEuMDQ1NyAwIDIwIDBDOC45NTQzIDAgMCA4Ljk1NDMgMCAyMEMwIDMxLjA0NTcgOC45NTQzIDQwIDIwIDQwWiIgZmlsbD0iIzFFNDBBRiIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+') repeat;
      opacity: 0.1;
    }
    .logo { 
      width: 80px; 
      height: 80px; 
      margin: 0 auto 20px; 
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
      background: white;
      padding: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .header h1 { 
      margin: 0; 
      font-size: 32px; 
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      position: relative;
      z-index: 1;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 18px;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }
    .content { padding: 40px 30px; }
    .greeting { 
      font-size: 20px; 
      margin-bottom: 20px; 
      color: #2c3e50;
      font-weight: 600;
    }
    .approval-notice { 
      background: linear-gradient(135deg, #d4edda, #c3e6cb);
      border: 1px solid #28a745;
      color: #155724;
      padding: 25px;
      border-radius: 12px;
      margin: 30px 0;
      text-align: center;
      font-weight: 600;
      font-size: 18px;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
    }
    .section { 
      margin: 30px 0; 
      background: #fff;
      border-radius: 12px; 
      border: 1px solid #e9ecef;
      overflow: hidden;
    }
    .section-header { 
      background: linear-gradient(135deg, #28a745, #1e40af);
      color: white;
      padding: 20px 25px;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .section-content { padding: 25px; }
    .info-grid { 
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }
    .info-row { 
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f8f9fa;
    }
    .info-row:last-child { border-bottom: none; }
    .label { 
      font-weight: 600; 
      color: #495057;
      min-width: 120px;
    }
    .value { 
      color: #2c3e50;
      font-weight: 500;
    }
    .items-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 0;
      border-radius: 8px;
      overflow: hidden;
    }
    .items-table th { 
      background: linear-gradient(135deg, #28a745, #1e40af);
      color: white; 
      padding: 15px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table td { 
      padding: 15px 12px; 
      border-bottom: 1px solid #f8f9fa;
      color: #495057;
    }
    .items-table tbody tr:hover { background-color: #f8f9fa; }
    .total-row { 
      font-weight: 700; 
      font-size: 16px; 
      background: linear-gradient(135deg, #f0fff4, #eff6ff);
      color: #2c3e50;
    }
    .footer { 
      text-align: center; 
      margin-top: 40px; 
      padding: 30px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 12px;
      color: #6c757d;
      font-style: italic;
    }
    @media (max-width: 600px) {
      .email-wrapper { padding: 20px 10px; }
      .header { padding: 30px 20px; }
      .content { padding: 30px 20px; }
      .info-grid { grid-template-columns: 1fr; }
      .items-table th, .items-table td { padding: 10px 8px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">
          <img src="${process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'https://4-course-exam.vercel.app'}/images/logo-removebg.png" alt="IvaPro Logo" />
        </div>
        <h1>${headerTitle}</h1>
        <p>IvaPro - Order #${data.orderId}</p>
      </div>
      
      <div class="content">
        <div class="greeting">${greeting}</div>
        
        <div class="approval-notice">
          ${approvalMessage}
        </div>
        
        <div class="section">
          <h3 class="section-header">${orderInfoTitle}</h3>
          <div class="section-content">
            <div class="info-row"><span class="label">Order ID:</span><span class="value">${data.orderId}</span></div>
            <div class="info-row"><span class="label">Date:</span><span class="value">${data.orderDate}</span></div>
            <div class="info-row"><span class="label">Name:</span><span class="value">${data.orderData.shippingName}</span></div>
            <div class="info-row"><span class="label">Address:</span><span class="value">${data.orderData.shippingAddress}</span></div>
            <div class="info-row"><span class="label">Email:</span><span class="value">${data.orderData.shippingEmail}</span></div>
            <div class="info-row"><span class="label">Phone:</span><span class="value">${data.orderData.shippingPhone}</span></div>
            <div class="info-row"><span class="label">Payment:</span><span class="value">${data.orderData.paymentMethod}</span></div>
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-header">${itemsTitle}</h3>
          <div class="section-content">
            <table class="items-table">
              <thead>
                <tr><th>Item</th><th>Type</th><th>Qty</th><th>Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-header">${pricingTitle}</h3>
          <div class="section-content">
            <table class="items-table">
              <tr><td>Subtotal:</td><td>€${data.orderData.subtotal.toFixed(2)}</td></tr>
              <tr><td>Shipping:</td><td>€${data.orderData.shippingCost.toFixed(2)}</td></tr>
              ${discountRow}
              <tr><td>Tax (21%):</td><td>€${data.orderData.taxAmount.toFixed(2)}</td></tr>
              <tr class="total-row"><td>Total:</td><td>€${data.orderData.totalAmount.toFixed(2)}</td></tr>
            </table>
          </div>
        </div>
        
        <div class="footer">${footerMessage}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}
