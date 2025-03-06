'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Language {
  code: string;
  name: string;
  flagSrc: string;
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: Language[] = [
    { code: 'lv', name: 'LV', flagSrc: '/flags/lv.svg' },
    { code: 'en', name: 'EN', flagSrc: '/flags/gb.svg' },
    { code: 'ru', name: 'RU', flagSrc: '/flags/ru.svg' }
  ];

  const handleChange = (newLocale: string): void => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="flex items-center gap-2 text-gray-300 hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-5 h-3 relative overflow-hidden">
          <Image 
            src={currentLanguage?.flagSrc || ''} 
            alt={currentLanguage?.code || ''}
            width={17}
            height={10}
            style={{ objectFit: "cover" }}
          />
        </div>
        <span>{currentLanguage?.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-[#1a1b26] border border-gray-700 rounded-md shadow-lg overflow-hidden">
          <div className="flex flex-col">
            {languages.map((lang) => (
              currentLocale !== lang.code && (
                <button
                  key={lang.code}
                  onClick={() => handleChange(lang.code)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-[#E63946] hover:text-white transition-colors text-left w-full"
                >
                  <div className="w-5 h-3 relative overflow-hidden">
                    <Image 
                      src={lang.flagSrc}
                      alt={lang.code}
                      width={17}
                      height={20}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <span>{lang.name}</span>
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}