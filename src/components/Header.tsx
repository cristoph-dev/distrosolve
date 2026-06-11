
import React from 'react';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <header className="bg-black text-white py-3 px-6 font-mono border-b border-zinc-800 w-full">
      <div className="flex justify-between items-center w-full">
        {/* Left Side */}
        <div className="flex items-center space-x-3">
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
          
          <div className="flex items-center space-x-3">
            <span className="text-lg font-bold tracking-tight">
              distrosolve<span className="text-zinc-500">.app</span>
            </span>
            <span className="text-zinc-600 font-light">|</span>
            <span className="text-[13px] text-zinc-400 hidden md:inline">
              Simulador de distribuciones de probabilidad
            </span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-6">
          {/* GitHub Icon */}
          <a 
            href="https://github.com/your-username/distrosolve" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <svg height="22" viewBox="0 0 16 16" version="1.1" width="22" aria-hidden="true" fill="currentColor">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </a>

          {/* Documentation Button */}
          <button className="flex items-center space-x-2.5 bg-[#111111] border border-zinc-800 px-4 py-1.5 rounded-full hover:bg-zinc-900 hover:border-zinc-700 transition-all text-[13px] font-medium group">
            <div className="w-[17px] h-[17px] bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center font-black text-[10px] leading-none group-hover:bg-zinc-700 group-hover:text-white transition-colors">
              !
            </div>
            <span className="text-zinc-400 group-hover:text-white transition-colors">Documentación</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
