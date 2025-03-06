// app/page.js
import { redirect } from 'next/navigation';
import { i18nConfig } from './i18n/config';

export default function HomePage() {
  redirect(`/${i18nConfig.defaultLocale}`);
  return null;
}