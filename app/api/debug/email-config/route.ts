import { NextRequest, NextResponse } from 'next/server';
import { getEmailConfig } from '@/lib/emailConfig';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Checking email configuration...');
    
    // Check environment variables
    const envVars = {
      SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
      SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
      SMTP_USER: process.env.SMTP_USER || 'NOT SET',
      SMTP_PASS: process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET',
      SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'NOT SET',
      SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'NOT SET',
      SMTP_SECURE: process.env.SMTP_SECURE || 'NOT SET'
    };
    
    console.log('Environment variables:', envVars);
    
    // Try to get email config
    let emailConfig;
    let configError = null;
    
    try {
      emailConfig = await getEmailConfig();
    } catch (error) {
      configError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    return NextResponse.json({
      environmentVariables: envVars,
      emailConfig: emailConfig ? {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        user: emailConfig.auth.user,
        hasPassword: !!emailConfig.auth.pass,
        fromEmail: emailConfig.fromEmail,
        fromName: emailConfig.fromName
      } : null,
      configError,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
