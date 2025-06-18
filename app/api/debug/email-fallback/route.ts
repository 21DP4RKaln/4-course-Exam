import { NextRequest, NextResponse } from 'next/server';
import { getEmailConfig } from '@/lib/mail/emailConfig';

export async function POST(request: NextRequest) {
  try {
    const { orderId, testEmail } = await request.json();

    if (!testEmail && !orderId) {
      return NextResponse.json(
        { error: 'Either orderId or testEmail is required' },
        { status: 400 }
      );
    }

    // For now, let's simulate email sending and return detailed info
    // This is useful for debugging hosting issues
    const emailConfig = await getEmailConfig();

    const emailInfo = {
      timestamp: new Date().toISOString(),
      config: {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        user: emailConfig.auth.user,
        hasPassword: !!emailConfig.auth.pass,
        fromEmail: emailConfig.fromEmail,
        fromName: emailConfig.fromName,
      },
      target: testEmail || 'order-email',
      orderId: orderId || 'test',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    // Log the attempt for debugging
    console.log('Email simulation attempt:', emailInfo);

    // Try to actually send the email but catch any hosting-related errors
    let actualSendResult = null;
    let actualSendError = null;

    try {
      // Import dynamically to avoid build issues
      const { sendOrderReceipt } = await import('@/lib/mail/orderEmail');

      if (orderId) {
        actualSendResult = await sendOrderReceipt(orderId);
      } else if (testEmail) {
        // Send a simple test email
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.default.createTransport({
          host: emailConfig.host,
          port: emailConfig.port,
          secure: emailConfig.secure,
          auth: emailConfig.auth,
          connectionTimeout: 10000,
          socketTimeout: 10000,
        });

        const result = await transporter.sendMail({
          from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
          to: testEmail,
          subject: 'IvaPro - Simple Test Email',
          html: `
            <h2>Test Email from IvaPro</h2>
            <p>This email was sent at: ${new Date().toLocaleString()}</p>
            <p>If you receive this, the email system is working.</p>
          `,
        });

        actualSendResult = !!result.messageId;
      }
    } catch (error: any) {
      actualSendError = {
        message: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        hostname: error.hostname,
        responseCode: error.responseCode,
        response: error.response,
      };
      console.error('Actual email send error:', actualSendError);
    }

    // Return comprehensive debugging information
    return NextResponse.json({
      success: !!actualSendResult,
      message: actualSendResult
        ? 'Email sent successfully'
        : 'Email sending failed - check logs for details',
      emailInfo,
      actualSendResult,
      actualSendError,
      troubleshooting: {
        commonIssues: [
          'Hosting provider blocks SMTP connections (port 25, 587, 465)',
          'Gmail app password expired or incorrect',
          'Firewall blocking outgoing connections',
          'Rate limiting by email provider',
          'DNS resolution issues',
        ],
        solutions: [
          'Contact hosting provider about SMTP support',
          'Use email service like SendGrid, Mailgun, or AWS SES',
          'Verify Gmail app password is correct and recent',
          'Check hosting control panel for email settings',
          'Try different SMTP ports (587, 465, 25)',
        ],
        nextSteps: actualSendError
          ? [
              'Check hosting provider documentation for email support',
              'Consider using alternative email service',
              'Verify environment variables are set correctly',
              'Contact hosting support if needed',
            ]
          : [
              'Email system appears to be working',
              'Check spam/junk folders if emails are not received',
              'Verify email addresses are correct',
            ],
      },
    });
  } catch (error: any) {
    console.error('Email fallback error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        troubleshooting: {
          message: 'Complete email system failure',
          possibleCauses: [
            'Hosting environment does not support email sending',
            'Missing required dependencies',
            'Network connectivity issues',
            'Configuration errors',
          ],
          recommendedActions: [
            'Contact hosting provider support',
            'Use external email service (SendGrid, etc.)',
            'Check application logs for detailed errors',
            'Verify all environment variables are set',
          ],
        },
      },
      { status: 500 }
    );
  }
}
