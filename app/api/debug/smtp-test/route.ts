import { NextRequest, NextResponse } from 'next/server';
import { getEmailConfig } from '@/lib/mail/emailConfig';
import { createEmailTransporter } from '@/lib/mail/email';

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

    logs.push('Starting SMTP test...');

    // Step 1: Get email config
    logs.push('Step 1: Getting email configuration...');
    const emailConfig = await getEmailConfig();
    logs.push(
      `Email config loaded: host=${emailConfig.host}, port=${emailConfig.port}, user=${emailConfig.auth.user}`
    );

    // Step 2: Create transporter
    logs.push('Step 2: Creating email transporter...');
    const transporter = await createEmailTransporter(emailConfig);
    logs.push('Transporter created successfully');

    // Step 3: Verify connection
    logs.push('Step 3: Verifying SMTP connection...');
    try {
      await transporter.verify();
      logs.push('SMTP connection verified successfully');
    } catch (verifyError: any) {
      logs.push(`SMTP verification failed: ${verifyError.message}`);
      throw new Error(`SMTP verification failed: ${verifyError.message}`);
    }

    // Step 4: Send test email
    logs.push(`Step 4: Sending test email to ${testEmail}...`);
    const mailOptions = {
      from: emailConfig.fromEmail
        ? `"${emailConfig.fromName || 'IvaPro Support'}" <${emailConfig.fromEmail}>`
        : emailConfig.auth.user,
      to: testEmail,
      subject: 'SMTP Test Email - IvaPro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #007bff;">SMTP Test Email</h2>
          <p>This is a test email to verify that the SMTP configuration is working correctly.</p>
          <p><strong>Time sent:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Configuration used:</strong></p>
          <ul>
            <li>Host: ${emailConfig.host}</li>
            <li>Port: ${emailConfig.port}</li>
            <li>Secure: ${emailConfig.secure}</li>
            <li>User: ${emailConfig.auth.user}</li>
          </ul>
          <hr>
          <p style="color: #666; font-size: 14px;">
            If you received this email, your SMTP configuration is working correctly.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    logs.push(`Test email sent successfully, messageId: ${result.messageId}`);

    return NextResponse.json({
      success: true,
      message: 'SMTP test completed successfully',
      messageId: result.messageId,
      testEmail,
      logs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logs.push(`ERROR: ${error.message}`);
    console.error('SMTP test error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        logs,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
