"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useSidebarContext } from './SidebarContext';

const Header: React.FC = () => {
  const { toggleMobile } = useSidebarContext();

  return (
    <header className="bg-black text-white py-3 px-4 md:px-6 font-mono border-b border-zinc-800 w-full">
      <div className="relative flex items-center w-full">
        {/* Left Side */}
        <div className="flex min-w-0 items-center space-x-3 pr-10 md:pr-0">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobile}
            className="md:hidden text-zinc-400 hover:text-white p-2 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex min-w-0 items-center space-x-3 hover:opacity-90 transition-opacity" aria-label="Ir a inicio">
            {/* Logo */}
            <div className="flex items-center justify-center overflow-hidden">
              <Image
                src="/fino-app-logo-white.png"
                alt="distrosolve logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>

            <span className="truncate text-lg font-bold tracking-tight">
              distrosolve<span className="text-zinc-500">.app</span>
            </span>
          </Link>

          <div className="hidden items-center space-x-3 md:flex">
            <span className="text-zinc-600 font-light">|</span>
            <span className="text-[13px] text-zinc-400">
              Simulador de distribuciones de probabilidad
            </span>
          </div>
        </div>

        {/* Right Side */}
        <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center md:static md:ml-auto md:translate-y-0">
          {/* GitHub Icon */}
          <a
            href="https://github.com/cristoph-dev/distrosolve"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <svg height="22" viewBox="0 0 16 16" version="1.1" width="22" aria-hidden="true" fill="currentColor">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
