import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { defaultLocale } from './i18n/config';

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  redirect(`/${defaultLocale}`);

  return <>{children}</>;
}