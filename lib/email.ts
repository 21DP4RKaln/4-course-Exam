import nodemailer from 'nodemailer';
import { OrderPDFData } from './pdf';
import {
  generateOrderConfirmationEmail,
  generateOrderApprovalEmail,
  EmailTemplateData,
} from './emailTemplates';
import fs from 'fs';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromEmail?: string;
  fromName?: string;
}

export async function createEmailTransporter(config: EmailConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass,
    },
  });
}

export async function sendPasswordResetEmail(
  to: string,
  code: string,
  config: EmailConfig
) {
  try {
    console.log('Creating email transporter with config:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
      hasPassword: !!config.auth.pass,
    });

    const transporter = await createEmailTransporter(config);

    const mailOptions = {
      from: config.fromEmail
        ? `"${config.fromName || 'IvaPro Support'}" <${config.fromEmail}>`
        : config.auth.user,
      to,
      subject: 'Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>You have requested to reset your password. Please use the verification code below:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          
          <p>This code will expire in 15 minutes for security reasons.</p>
          <p>If you did not request this password reset, please ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px; text-align: center;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    };

    console.log('Sending email to:', to);
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully, messageId:', result.messageId);

    return result;
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    throw error;
  }
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderData: OrderPDFData,
  pdfPath: string,
  config: EmailConfig,
  locale: string = 'en',
  customerName: string = 'Customer'
) {
  const transporter = await createEmailTransporter(config);

  // Generate localized email content
  const templateData: EmailTemplateData = {
    customerName,
    orderId: orderData.id,
    orderDate: orderData.createdAt.toLocaleDateString(),
    orderData,
    locale,
  };

  const { subject, html } = await generateOrderConfirmationEmail(templateData);

  const mailOptions = {
    from: config.fromEmail
      ? `"${config.fromName || 'IvaPro Order System'}" <${config.fromEmail}>`
      : config.auth.user,
    to,
    subject,
    html,
    attachments: [
      {
        filename: `IvaPro_Order_${orderData.id}_Receipt.pdf`,
        content: fs.createReadStream(pdfPath),
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Send order approval/processing email
 */
export async function sendOrderApprovalEmail(
  to: string,
  orderData: OrderPDFData,
  config: EmailConfig,
  locale: string = 'en',
  customerName: string = 'Customer'
) {
  const transporter = await createEmailTransporter(config);

  const templateData: EmailTemplateData = {
    customerName,
    orderId: orderData.id,
    orderDate: orderData.createdAt.toLocaleDateString(),
    orderData,
    locale,
  };

  const { subject, html } = await generateOrderApprovalEmail(templateData);

  const mailOptions = {
    from: config.fromEmail
      ? `"${config.fromName || 'IvaPro Order System'}" <${config.fromEmail}>`
      : config.auth.user,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}

export interface RepairCompletionData {
  repairId: string;
  title: string;
  customerName: string;
  finalCost: number;
  completionNotes: string;
  completionImage?: string;
  parts: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  productName?: string;
  productType?: string;
}

export async function sendRepairCompletionEmail(
  to: string,
  repairData: RepairCompletionData,
  config: EmailConfig
) {
  const transporter = await createEmailTransporter(config);

  const partsHtml =
    repairData.parts.length > 0
      ? `
    <h3 style="color: #333; margin: 20px 0 10px 0;">Parts Used:</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
      <thead>
        <tr style="background-color: #f8f9fa;">
          <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Part Name</th>
          <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Quantity</th>
          <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
          <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${repairData.parts
          .map(
            part => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${part.name}</td>
            <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${part.quantity}</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">€${part.price.toFixed(2)}</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">€${(part.price * part.quantity).toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `
      : '';

  const completionImageHtml = repairData.completionImage
    ? `
    <div style="margin: 20px 0;">
      <h3 style="color: #333; margin: 10px 0;">Completion Image:</h3>
      <p>You can view the completion image <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}${repairData.completionImage}" style="color: #007bff; text-decoration: none;">here</a>.</p>
    </div>
  `
    : '';

  const mailOptions = {
    from: config.fromEmail
      ? `"${config.fromName || 'IvaPro Support'}" <${config.fromEmail}>`
      : config.auth.user,
    to,
    subject: `Repair Completed - ${repairData.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007bff; margin: 0;">IvaPro</h1>
          <p style="color: #666; margin: 5px 0;">Computer Repair & Configuration Services</p>
        </div>
        
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="color: #155724; margin: 0 0 10px 0; text-align: center;">✅ Repair Completed!</h2>
          <p style="color: #155724; margin: 0; text-align: center;">Your repair request has been successfully completed.</p>
        </div>
        
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Repair Details</h2>
        
        <table style="width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Customer Name:</td>
            <td style="padding: 8px 0;">${repairData.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Repair Title:</td>
            <td style="padding: 8px 0;">${repairData.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Repair ID:</td>
            <td style="padding: 8px 0; font-family: monospace;">#${repairData.repairId.slice(0, 8)}</td>
          </tr>
          ${
            repairData.productName
              ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Product:</td>
            <td style="padding: 8px 0;">${repairData.productName} (${repairData.productType})</td>
          </tr>
          `
              : ''
          }
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Final Cost:</td>
            <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #007bff;">€${repairData.finalCost.toFixed(2)}</td>
          </tr>
        </table>
        
        <h3 style="color: #333; margin: 20px 0 10px 0;">Completion Notes:</h3>
        <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 10px 0;">
          <p style="margin: 0; line-height: 1.6;">${repairData.completionNotes.replace(/\n/g, '<br>')}</p>
        </div>
        
        ${partsHtml}
        
        ${completionImageHtml}
        
        <div style="background-color: #e9ecef; border-radius: 8px; padding: 20px; margin: 30px 0;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Next Steps:</h3>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Your device is ready for pickup</li>
            <li>Please bring a valid ID when collecting your device</li>
            <li>Payment can be made at pickup (cash or card accepted)</li>
            <li>We provide a 30-day warranty on all repairs</li>
          </ul>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <div style="text-align: center;">
          <h3 style="color: #333; margin: 0 0 10px 0;">Thank you for choosing IvaPro!</h3>
          <p style="color: #666; margin: 0;">If you have any questions about your repair, please don't hesitate to contact us.</p>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">
            📧 Email: support@ivapro.com | 📞 Phone: +371 12345678
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export interface RepairRequestData {
  repairId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceType: string;
  issueDescription: string;
  estimatedCost: number;
  estimatedTime: string;
  hasImage: boolean;
  imageUrl?: string;
}

export async function sendRepairRequestNotification(
  to: string,
  repairData: RepairRequestData,
  config: EmailConfig
) {
  const transporter = await createEmailTransporter(config);

  const imageSection =
    repairData.hasImage && repairData.imageUrl
      ? `
    <div style="margin: 20px 0;">
      <h3 style="color: #333; margin: 10px 0;">Issue Image:</h3>
      <p>Customer provided image: <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}${repairData.imageUrl}" style="color: #007bff; text-decoration: none;">View Image</a></p>
    </div>
  `
      : '';

  const mailOptions = {
    from: config.fromEmail
      ? `"${config.fromName || 'IvaPro Support'}" <${config.fromEmail}>`
      : config.auth.user,
    to,
    subject: `New Repair Request - ${repairData.serviceType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007bff; margin: 0;">IvaPro</h1>
          <p style="color: #666; margin: 5px 0;">Computer Repair & Configuration Services</p>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="color: #856404; margin: 0 0 10px 0; text-align: center;">🔔 New Repair Request</h2>
          <p style="color: #856404; margin: 0; text-align: center;">A new repair request has been submitted and requires attention.</p>
        </div>
        
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Request Details</h2>
        
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333; border-bottom: 1px solid #eee;">Repair ID:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-family: monospace;">#${repairData.repairId.slice(0, 8)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333; border-bottom: 1px solid #eee;">Customer:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${repairData.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333; border-bottom: 1px solid #eee;">Email:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${repairData.customerEmail}" style="color: #007bff;">${repairData.customerEmail}</a></td>
          </tr>
          ${
            repairData.customerPhone
              ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333; border-bottom: 1px solid #eee;">Phone:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="tel:${repairData.customerPhone}" style="color: #007bff;">${repairData.customerPhone}</a></td>
          </tr>
          `
              : ''
          }
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333; border-bottom: 1px solid #eee;">Service Type:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${repairData.serviceType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333; border-bottom: 1px solid #eee;">Estimated Cost:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 16px; font-weight: bold; color: #007bff;">€${repairData.estimatedCost}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Estimated Time:</td>
            <td style="padding: 8px 0;">${repairData.estimatedTime}</td>
          </tr>
        </table>
        
        <h3 style="color: #333; margin: 20px 0 10px 0;">Issue Description:</h3>
        <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 10px 0;">
          <p style="margin: 0; line-height: 1.6;">${repairData.issueDescription.replace(/\n/g, '<br>')}</p>
        </div>
        
        ${imageSection}
        
        <div style="background-color: #e9ecef; border-radius: 8px; padding: 20px; margin: 30px 0;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Next Steps:</h3>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Review the repair request in the admin panel</li>
            <li>Contact the customer if more information is needed</li>
            <li>Assign a specialist to the repair</li>
            <li>Update the repair status as work progresses</li>
          </ul>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <div style="text-align: center;">
          <h3 style="color: #333; margin: 0 0 10px 0;">IvaPro Admin Panel</h3>
          <p style="color: #666; margin: 0;">Access the admin panel to manage this repair request.</p>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">
            🌐 <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/admin" style="color: #007bff;">Admin Dashboard</a>
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
