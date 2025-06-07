import { NextRequest, NextResponse } from 'next/server';
import { getEmailConfig } from '@/lib/mail/emailConfig';
import { createEmailTransporter } from '@/lib/mail/email';

export async function GET() {
  try {
    console.log('Testing email configuration...');

    // Test email config
    const config = await getEmailConfig();
    console.log('Email config loaded:', {
      host: config.host,
      port: config.port,
      user: config.auth.user,
      hasPassword: !!config.auth.pass,
      fromEmail: config.fromEmail,
    });

    // Test transporter creation
    const transporter = await createEmailTransporter(config);
    console.log('Email transporter created successfully');

    // Test transporter connection
    try {
      await transporter.verify();
      console.log('Email transporter verified successfully');

      return NextResponse.json({
        success: true,
        message: 'Email configuration is working',
        config: {
          host: config.host,
          port: config.port,
          user: config.auth.user,
          fromEmail: config.fromEmail,
        },
      });
    } catch (verifyError: any) {
      console.error('Email transporter verification failed:', verifyError);
      return NextResponse.json(
        {
          success: false,
          error: 'Email verification failed',
          details: verifyError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Email debug error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Email configuration error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
