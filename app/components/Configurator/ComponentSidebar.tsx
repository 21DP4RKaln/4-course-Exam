'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

interface SidebarProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export default function ComponentSidebar({ selectedCategory, onCategorySelect }: SidebarProps) {
  const t = useTranslations('configurator');
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale || 'lv';
  
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const categories = [
    { key: 'CPU', label: 'CPU', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
        <rect x="9" y="9" width="6" height="6"></rect>
        <line x1="9" y1="1" x2="9" y2="4"></line>
        <line x1="15" y1="1" x2="15" y2="4"></line>
        <line x1="9" y1="20" x2="9" y2="23"></line>
        <line x1="15" y1="20" x2="15" y2="23"></line>
        <line x1="20" y1="9" x2="23" y2="9"></line>
        <line x1="20" y1="14" x2="23" y2="14"></line>
        <line x1="1" y1="9" x2="4" y2="9"></line>
        <line x1="1" y1="14" x2="4" y2="14"></line>
      </svg>
    )},
    { key: 'GPU', label: 'GPU', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
        <line x1="6" y1="12" x2="10" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
      </svg>
    )},
    { key: 'RAM', label: 'RAM', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 19v-3"></path>
        <path d="M10 19v-3"></path>
        <path d="M14 19v-3"></path>
        <path d="M18 19v-3"></path>
        <rect x="4" y="4" width="16" height="12" rx="2"></rect>
      </svg>
    )},
    { key: 'Motherboard', label: 'Motherboard', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
        <rect x="9" y="9" width="6" height="6"></rect>
        <path d="M15 2v2"></path>
        <path d="M15 20v2"></path>
        <path d="M2 15h2"></path>
        <path d="M20 15h2"></path>
      </svg>
    )},
    { key: 'Storage', label: 'Storage', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      </svg>
    )},
    { key: 'Cooling', label: 'Cooling', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
        <path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"></path>
        <path d="M14.5 9.5l-5 5"></path>
        <path d="M9.5 9.5l5 5"></path>
      </svg>
    )},
    { key: 'PSU', label: 'PSU', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 4V20a2 2 0 01-2 2h-3a2 2 0 01-2-2v-5a2 2 0 012-2h5V4a2 2 0 00-2-2H6a2 2 0 00-2 2v16a2 2 0 002 2h12"></path>
        <path d="M14 12h4"></path>
        <path d="M12 15v2"></path>
      </svg>
    )},
    { key: 'Case', label: 'Case', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="14" x2="12" y2="14"></line>
      </svg>
    )},
    { key: 'Accessories', label: 'Accessories', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    )}
  ];
  
  const mainMenuItems = [
    { path: `/${locale}`, label: 'HOME' },
    { path: `/${locale}/ready-configs`, label: 'Ready-made PCs' },
    { path: `/${locale}/configurator`, label: 'Configurator' },
    { path: `/${locale}/dashboard`, label: 'Dashboard' }
  ];

  return (
    <aside className={`bg-[#1E2039] h-full min-h-screen transition-all duration-300 
      ${collapsed ? 'w-16' : 'w-64'} 
      flex flex-col text-white z-10 shadow-lg`}>
      
      {/* Logo section */}
      <div className="p-4 flex justify-center md:justify-start items-center border-b border-gray-700 mb-2">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#E63946] rounded-lg flex items-center justify-center font-bold">AP</div>
          {!collapsed && <span className="text-white font-bold">APIROQ PC</span>}
        </Link>
      </div>
      
      {/* Main navigation */}
      {!isMobile && (
        <div className="mb-4 px-2">
          {!collapsed && <h3 className="text-xs uppercase text-gray-500 px-3 mb-2">Menu</h3>}
          {mainMenuItems.map((item) => (
            <Link 
              href={item.path}
              key={item.path}
              className={`flex items-center gap-2 p-3 rounded-lg mb-1 text-gray-300 hover:bg-[#2A2C4A] hover:text-white ${
                pathname === item.path ? 'bg-[#2A2C4A] text-white' : ''
              }`}
            >
              {item.path.includes('configurator') ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              ) : item.path.includes('dashboard') ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : item.path.includes('ready-configs') ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              )}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      )}
      
      {/* Components section */}
      <div className="flex-1 px-2 overflow-y-auto">
        {!collapsed && <h3 className="text-xs uppercase text-gray-500 px-3 mb-2">Components</h3>}
        {categories.map((category) => (
          <button 
            key={category.key}
            className={`flex items-center gap-2 p-3 rounded-lg mb-2 hover:bg-[#2A2C4A] text-left ${
              selectedCategory === category.key ? 'bg-[#4E4B8E] bg-opacity-70' : ''
            } ${collapsed ? 'justify-center' : ''}`}
            onClick={() => onCategorySelect(category.key)}
          >
            <div className={`flex-shrink-0 ${
              category.key === 'CPU' ? 'p-2 rounded-lg bg-[#674E9E]' : ''
            }`}>
              {category.icon}
            </div>
            {!collapsed && <span className="text-sm">{category.label}</span>}
          </button>
        ))}
      </div>
      
      {/* Collapse button */}
      <div className="mt-auto border-t border-gray-700 pt-2 px-2 pb-4">
        <button 
          className={`flex items-center gap-2 p-3 rounded-lg w-full text-gray-400 hover:text-gray-200 ${collapsed ? 'justify-center' : ''}`}
          onClick={() => setCollapsed(!collapsed)}
        >
          <svg 
            className={`w-5 h-5 transform transition-transform ${collapsed ? 'rotate-0' : 'rotate-180'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}