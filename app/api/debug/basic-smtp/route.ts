import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      );
    }

    logs.push('Starting basic SMTP test...');

    // Test with direct nodemailer configuration
    const transporterConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: '14dprkalninskvdarbs@gmail.com',
        pass: 'egku zbeo xaao xcsj',
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    logs.push(
      `Creating transporter with config: ${JSON.stringify({
        host: transporterConfig.host,
        port: transporterConfig.port,
        user: transporterConfig.auth.user,
        hasPassword: !!transporterConfig.auth.pass,
      })}`
    );

    const transporter = nodemailer.createTransport(transporterConfig);
    logs.push('Transporter created successfully');

    // Test connection
    logs.push('Testing SMTP connection...');
    try {
      await transporter.verify();
      logs.push('SMTP connection verified successfully');
    } catch (verifyError: any) {
      logs.push(`SMTP verification failed: ${verifyError.message}`);
      logs.push(`Error code: ${verifyError.code || 'N/A'}`);
      logs.push(`Error response: ${verifyError.response || 'N/A'}`);

      // Continue anyway to see if sending works
      logs.push('Continuing with email send despite verification failure...');
    }

    // Send test email
    logs.push(`Sending test email to ${testEmail}...`);
    const mailOptions = {
      from: '"IvaPro Support" <14dprkalninskvdarbs@gmail.com>',
      to: testEmail,
      subject: 'Basic SMTP Test - IvaPro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #007bff;">Basic SMTP Test Email</h2>
          <p>This is a basic test email to verify SMTP functionality.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> 14dprkalninskvdarbs@gmail.com</p>
          <p><strong>To:</strong> ${testEmail}</p>
          <hr>
          <p style="color: #666; font-size: 14px;">
            If you received this email, the basic SMTP configuration is working.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    logs.push(`Email sent successfully, messageId: ${result.messageId}`);
    logs.push(`Accepted: ${JSON.stringify(result.accepted)}`);
    logs.push(`Rejected: ${JSON.stringify(result.rejected)}`);

    return NextResponse.json({
      success: true,
      message: 'Basic SMTP test completed successfully',
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      testEmail,
      logs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logs.push(`ERROR: ${error.message}`);
    if (error.code) logs.push(`Error code: ${error.code}`);
    if (error.response) logs.push(`Error response: ${error.response}`);
    if (error.responseCode) logs.push(`Response code: ${error.responseCode}`);

    console.error('Basic SMTP test error:', error);

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
