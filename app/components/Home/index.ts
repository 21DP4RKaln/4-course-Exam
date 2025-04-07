// app/components/Home/index.ts - Export all Home components
export * from './Hero';
export * from './Features';
export * from './ProcessSteps';
export * from './TelegramSection';

// app/[locale]/page.tsx - Streamlined Home page with consolidated components
'use client';

import { useState } from 'react';
import { Hero, Features, ProcessSteps, TelegramSection } from '@/app/components/Home';
import { ContactModal } from '@/app/components/ui';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="bg-[#1A1A1A]">
      <Hero />
      <Features />
      <ProcessSteps />
      <TelegramSection />

      {/* Contact button */}
      <button
        onClick={() => setIsModalOpen(true)} 
        className="fixed bottom-8 right-8 z-40 bg-[#E63946] hover:bg-[#FF4D5A] text-white p-4 rounded-full shadow-lg transition-colors duration-200"
        aria-label="Contact us"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
      </button>

      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}