import { EmailConfig } from './email';

/**
 * Gets the email configuration from environment variables
 */
export async function getEmailConfig(): Promise<EmailConfig> {
  try {
    console.log('Getting email configuration...');
    
    // Check if required environment variables are present
    const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('Missing required environment variables:', missingVars);
    }
    
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '14dprkalninskvdarbs@gmail.com',
        pass: process.env.SMTP_PASS || '',
      },
      fromEmail: process.env.SMTP_FROM_EMAIL || '14dprkalninskvdarbs@gmail.com',
      fromName: process.env.SMTP_FROM_NAME || 'IvaPro Support'
    };
    
    console.log('Email config created:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
      hasPassword: !!config.auth.pass,
      fromEmail: config.fromEmail,
      fromName: config.fromName
    });
    
    return config;
  } catch (error) {
    console.error('Error getting email config:', error);
    
    const fallbackConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: '14dprkalninskvdarbs@gmail.com',
        pass: '',
      },
      fromEmail: '14dprkalninskvdarbs@gmail.com',
      fromName: 'IvaPro Support'
    };
    
    console.log('Using fallback email config');
    return fallbackConfig;
  }
}
