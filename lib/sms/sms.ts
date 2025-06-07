import twilio from 'twilio';

export interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export async function sendPasswordResetSMS(
  to: string,
  code: string,
  config: SMSConfig
) {
  const client = twilio(config.accountSid, config.authToken);

  await client.messages.create({
    body: `Your password reset verification code is: ${code}. This code will expire in 15 minutes. If you did not request this, please ignore this message.`,
    from: config.fromNumber,
    to: to,
  });
}
