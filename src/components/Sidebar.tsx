"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      id: 'simulator',
      label: 'Simulador de distribuciones',
      href: '/simulator',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 20-3.5-7h-3l-2.5 5-2.5-12h-3"/>
          <path d="M2 20h20"/>
        </svg>
      )
    },
    {
      id: 'queues',
      label: 'Teoria de colas',
      href: '/queues',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 15 2 9l5-6"/>
          <path d="M2 9h20"/>
          <path d="m17 9 5 6-5 6"/>
        </svg>
      )
    },
    {
      id: 'montecarlo',
      label: 'Simulación de Montecarlo',
      href: '/montecarlo',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="16" r="1.5" fill="currentColor" />
          <circle cx="16" cy="8" r="1.5" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'glossary',
      label: 'Glosario',
      href: '/glossary',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      )
    }
  ];

  return (
    <aside
      className={`bg-black border-r border-zinc-800 transition-all duration-300 ease-in-out flex flex-col h-full overflow-visible ${
        isOpen ? 'w-72' : 'w-20'
      }`}
    >
      {/* Toggle Button Container */}
      <div className="h-16 flex items-center justify-center w-20 flex-shrink-0">
        <button
          onClick={toggleSidebar}
          className="text-zinc-400 hover:text-white hover:bg-zinc-900 p-2 rounded-lg transition-colors"
          aria-label={isOpen ? "Colapsar menu" : "Expandir menu"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-2 mt-2">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center w-full h-12 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all group overflow-visible relative"
          >
            {/* Icon Container - Fixed 80px width to match collapsed sidebar */}
            <div className="w-20 h-12 flex-shrink-0 flex items-center justify-center">
              <div className="transition-transform group-hover:scale-110">
                {item.icon}
              </div>
            </div>

            {/* Label - Absolute positioning or opacity transition to prevent layout shifts */}
            <span
              className={`text-[14px] font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
                isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
              }`}
            >
              {item.label}
            </span>

            {/* Tooltip (Burbujita) - Only visible when sidebar is closed */}
            {!isOpen && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-800/90 backdrop-blur-sm text-zinc-200 text-[13px] font-medium rounded-xl opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-zinc-700/50">
                {item.label}
                {/* Arrow (Rabito) */}
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-zinc-800/90 border-l border-b border-zinc-700/50 rotate-45 backdrop-blur-sm"></div>
              </div>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
