'use client';

import Navigation from './Navigation';
import TopBar from './TopBar';
import { ReactNode } from 'react';

interface HeaderProps {
  children?: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return (
    <header>
      <TopBar />
      <Navigation />
      {children}
    </header>
  );
}