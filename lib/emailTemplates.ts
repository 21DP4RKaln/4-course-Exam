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
  const t = await getTranslations({
    locale,
    namespace: 'emails.orderConfirmation',
  });

  const subject = t('subject', { orderId: data.orderId });

  const html = `
    <!DOCTYPE html>
    <html lang="${locale}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #333;
        }
        .thank-you {
          font-size: 16px;
          margin-bottom: 30px;
          color: #666;
        }
        .order-info {
          background-color: #f8f9fa;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .order-info h3 {
          margin-top: 0;
          color: #007bff;
          font-size: 18px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
        }
        .info-label {
          font-weight: bold;
          color: #333;
        }
        .info-value {
          color: #666;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .items-table th {
          background-color: #007bff;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        .items-table tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .total-section {
          background-color: #f8f9fa;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 4px 0;
        }
        .total-row.grand {
          font-weight: bold;
          font-size: 18px;
          color: #007bff;
          border-top: 2px solid #007bff;
          padding-top: 12px;
          margin-top: 12px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #eee;
        }
        .footer p {
          margin: 5px 0;
          color: #666;
        }
        .support-text {
          background-color: #e7f3ff;
          border-left: 4px solid #007bff;
          padding: 15px;
          margin: 20px 0;
          font-style: italic;
        }
        @media (max-width: 600px) {
          .container {
            margin: 10px;
            border-radius: 0;
          }
          .info-row, .total-row {
            flex-direction: column;
          }
          .info-label {
            margin-bottom: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>IvaPro</h1>
          <p>${t('thankYou')}</p>
        </div>
        
        <div class="content">
          <div class="greeting">${t('greeting', { customerName: data.customerName })}</div>
          <div class="thank-you">${t('thankYou')}</div>
          
          <div class="order-info">
            <h3>${t('orderDetails')}</h3>
            <div class="info-row">
              <span class="info-label">${t('orderId')}:</span>
              <span class="info-value">${data.orderId}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t('orderDate')}:</span>
              <span class="info-value">${data.orderDate}</span>
            </div>
          </div>

          <div class="order-info">
            <h3>${t('shippingInfo')}</h3>
            <div class="info-row">
              <span class="info-label">${t('name')}:</span>
              <span class="info-value">${data.orderData.shippingName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t('address')}:</span>
              <span class="info-value">${data.orderData.shippingAddress}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t('phone')}:</span>
              <span class="info-value">${data.orderData.shippingPhone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t('email')}:</span>
              <span class="info-value">${data.orderData.shippingEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t('paymentMethod')}:</span>
              <span class="info-value">${data.orderData.paymentMethod}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t('shippingMethod')}:</span>
              <span class="info-value">${data.orderData.shippingMethod}</span>
            </div>
          </div>

          <h3>${t('itemsOrdered')}</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>${t('name')}</th>
                <th>${t('quantity')}</th>
                <th>${t('price')}</th>
                <th>${t('total')}</th>
              </tr>
            </thead>
            <tbody>
              ${data.orderData.items
                .map(
                  item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>€${item.price.toFixed(2)}</td>
                  <td>€${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>${t('subtotal')}:</span>
              <span>€${data.orderData.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>${t('shipping')}:</span>
              <span>€${data.orderData.shippingCost.toFixed(2)}</span>
            </div>
            ${
              data.orderData.discount > 0
                ? `
            <div class="total-row">
              <span>${t('discount')}:</span>
              <span>-€${data.orderData.discount.toFixed(2)}</span>
            </div>
            `
                : ''
            }
            <div class="total-row">
              <span>${t('tax')}:</span>
              <span>€${data.orderData.taxAmount.toFixed(2)}</span>
            </div>
            <div class="total-row grand">
              <span>${t('grandTotal')}:</span>
              <span>€${data.orderData.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="support-text">
            <p>${t('attachedReceipt')}</p>
            <p>${t('support')}</p>
          </div>
        </div>

        <div class="footer">
          <p>${t('footer')}</p>
          <p><strong>IvaPro</strong></p>
          <p>Brīvības iela 123, Riga, LV-1001, Latvia</p>
          <p>+371 29 123 456 | info@ivapro.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

/**
 * Generate localized order approval email HTML
 */
export async function generateOrderApprovalEmail(
  data: EmailTemplateData
): Promise<{ subject: string; html: string }> {
  const locale = data.locale || 'en';
  const t = await getTranslations({
    locale,
    namespace: 'emails.orderApproval',
  });

  const subject = t('subject', { orderId: data.orderId });

  const html = `
    <!DOCTYPE html>
    <html lang="${locale}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #333;
        }
        .approval-message {
          background-color: #d4edda;
          border-left: 4px solid #28a745;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .next-steps {
          background-color: #f8f9fa;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
        .next-steps h3 {
          margin-top: 0;
          color: #28a745;
          font-size: 18px;
        }
        .next-steps ul {
          margin: 0;
          padding-left: 20px;
        }
        .next-steps li {
          margin-bottom: 8px;
          color: #666;
        }
        .delivery-info {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          text-align: center;
          font-weight: bold;
          color: #856404;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #eee;
        }
        .footer p {
          margin: 5px 0;
          color: #666;
        }
        @media (max-width: 600px) {
          .container {
            margin: 10px;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ ${t('subject', { orderId: data.orderId })}</h1>
        </div>
        
        <div class="content">
          <div class="greeting">${t('greeting', { customerName: data.customerName })}</div>
          
          <div class="approval-message">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">${t('approvedMessage')}</p>
          </div>

          <div class="next-steps">
            <h3>${t('nextSteps')}</h3>
            <ul>
              <li>${t('processing')}</li>
              <li>${t('shipping')}</li>
              <li>${t('tracking')}</li>
            </ul>
          </div>

          <div class="delivery-info">
            ${t('estimatedDelivery')}
          </div>
        </div>

        <div class="footer">
          <p><strong>IvaPro</strong></p>
          <p>Brīvības iela 123, Riga, LV-1001, Latvia</p>
          <p>+371 29 123 456 | info@ivapro.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
