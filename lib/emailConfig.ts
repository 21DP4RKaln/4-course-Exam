import { EmailConfig } from './email';

/**
 * Gets the email configuration from environment variables
 */
export async function getEmailConfig(): Promise<EmailConfig> {
  try {
    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',      auth: {
        user: process.env.SMTP_USER || '14dprkalninskvdarbs@gmail.com',
        pass: process.env.SMTP_PASS || '',
      },
      fromEmail: process.env.SMTP_FROM_EMAIL || '14dprkalninskvdarbs@gmail.com',
      fromName: process.env.SMTP_FROM_NAME || 'IvaPro Support'
    };
  } catch (error) {
    console.error('Error getting email config:', error);
    
    return {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,      auth: {
        user: '14dprkalninskvdarbs@gmail.com',
        pass: '',
      },
      fromEmail: '14dprkalninskvdarbs@gmail.com',
      fromName: 'IvaPro Support'
    };
  }
}
