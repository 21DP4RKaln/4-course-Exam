import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
    </div>
  );
}
