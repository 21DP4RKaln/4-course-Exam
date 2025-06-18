import { NextRequest, NextResponse } from 'next/server';
import { getEmailConfig } from '@/lib/mail/emailConfig';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    const { action, testEmail } = await request.json();

    logs.push(`Starting email diagnostic with action: ${action}`);

    if (action === 'config') {
      // Test email configuration
      logs.push('Testing email configuration...');

      const emailConfig = await getEmailConfig();
      logs.push(
        `Email config loaded: host=${emailConfig.host}, port=${emailConfig.port}, user=${emailConfig.auth.user}`
      );

      // Test multiple configurations
      const configs = [
        // Current config
        {
          name: 'Current Config',
          ...emailConfig,
        },
        // Alternative Gmail config with different settings
        {
          name: 'Gmail Alternative',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: '14dprkalninskvdarbs@gmail.com',
            pass: 'egku zbeo xaao xcsj',
          },
          fromEmail: '14dprkalninskvdarbs@gmail.com',
          fromName: 'IvaPro Support',
        },
      ];

      const results = [];

      for (const config of configs) {
        logs.push(`Testing ${config.name}...`);
        try {
          const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: config.auth,
            connectionTimeout: 30000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
          });

          await transporter.verify();
          logs.push(`✅ ${config.name} - Connection successful`);
          results.push({ name: config.name, status: 'success', config });
        } catch (error: any) {
          logs.push(`❌ ${config.name} - Connection failed: ${error.message}`);
          results.push({
            name: config.name,
            status: 'failed',
            error: error.message,
            config,
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Email configuration test completed',
        results,
        logs,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'send' && testEmail) {
      // Test sending actual email
      logs.push(`Testing email send to: ${testEmail}`);

      const emailConfig = await getEmailConfig();

      const transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: emailConfig.auth,
        connectionTimeout: 30000,
        greetingTimeout: 15000,
        socketTimeout: 30000,
        tls: {
          rejectUnauthorized: false,
        },
      });

      logs.push('Verifying SMTP connection...');
      await transporter.verify();
      logs.push('SMTP connection verified');

      const mailOptions = {
        from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
        to: testEmail,
        subject: 'IvaPro - Email Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #007bff;">Email Test from IvaPro</h2>
            <p>This is a test email to verify email functionality.</p>
            <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Configuration:</strong></p>
            <ul>
              <li>Host: ${emailConfig.host}</li>
              <li>Port: ${emailConfig.port}</li>
              <li>Secure: ${emailConfig.secure}</li>
              <li>User: ${emailConfig.auth.user}</li>
            </ul>
            <hr>
            <p style="color: #666;">If you received this email, the email system is working correctly.</p>
          </div>
        `,
      };

      logs.push('Sending test email...');
      const result = await transporter.sendMail(mailOptions);
      logs.push(`Email sent successfully - Message ID: ${result.messageId}`);

      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
        logs,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action or missing parameters',
        logs,
      },
      { status: 400 }
    );
  } catch (error: any) {
    logs.push(`ERROR: ${error.message}`);
    if (error.code) logs.push(`Error code: ${error.code}`);
    if (error.response) logs.push(`Error response: ${error.response}`);

    console.error('Email diagnostic error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorCode: error.code,
        errorResponse: error.response,
        logs,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
