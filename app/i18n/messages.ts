import { defaultLocale } from './config';

export type Messages = Record<string, Record<string, string>>;

export async function getMessages(locale: string): Promise<Messages> {
  try {
    return (await import(`../../lib/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);

    try {
      return (await import(`../../lib/messages/${defaultLocale}.json`)).default;
    } catch (fallbackError) {
      console.error(`Failed to load default messages too:`, fallbackError);
      return {};
    }
  }
}
