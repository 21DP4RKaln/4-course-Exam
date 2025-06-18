import { EmailConfig } from './email';

/**
 * Gets the email configuration from environment variables
 */
export async function getEmailConfig(): Promise<EmailConfig> {
  try {
    console.log('Getting email configuration...');
    console.log('Environment variables:', {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS ? '***' : 'not set',
      SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
      SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
      SMTP_SECURE: process.env.SMTP_SECURE,
    });

    // Check for required environment variables
    const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.warn('Missing required environment variables:', missingVars);
      console.log('Using fallback configuration...');
    }

    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER || '14dprkalninskvdarbs@gmail.com',
        pass: process.env.SMTP_PASS || 'egku zbeo xaao xcsj',
      },
      fromEmail: process.env.SMTP_FROM_EMAIL || '14dprkalninskvdarbs@gmail.com',
      fromName: process.env.SMTP_FROM_NAME || 'IvaPro Support',
    };

    console.log('Email config created:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
      hasPassword: !!config.auth.pass,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
    });

    return config;
  } catch (error) {
    console.error('Error getting email config:', error);

    // Enhanced fallback config with multiple Gmail options
    const fallbackConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: '14dprkalninskvdarbs@gmail.com',
        pass: 'egku zbeo xaao xcsj',
      },
      fromEmail: '14dprkalninskvdarbs@gmail.com',
      fromName: 'IvaPro Support',
    };

    console.log('Using fallback email config');
    return fallbackConfig;
  }
}
