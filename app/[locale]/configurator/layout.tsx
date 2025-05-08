import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function ConfiguratorLayout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
        {children}
    </div>
  );
}