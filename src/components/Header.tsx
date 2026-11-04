import React from 'react';

interface HeaderProps {
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateHome }) => {
  return (
    <header className="w-full bg-gradient-to-r from-[#042866] via-[#063B8E] to-[#0852B8] text-white shadow-lg border-b-2 border-[#00CFFF]/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Brand Identity */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3.5 cursor-pointer group transition-transform hover:scale-[1.01]"
        >
          {/* Glowing Animated Icon */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00CFFF] to-[#0878DC] rounded-2xl rotate-6 opacity-80 blur-[2px] group-hover:rotate-12 transition-transform duration-300"></div>
            <div className="relative w-full h-full bg-[#063B8E] border-2 border-[#00CFFF] rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
              {/* SVG Open Book & Graduation Cap */}
              <svg viewBox="0 0 64 64" className="w-10 h-10 text-white drop-shadow-[0_2px_8px_rgba(0,207,255,0.8)]" fill="none">
                {/* Book Pages */}
                <path d="M12 44C20 40 28 40 32 43C36 40 44 40 52 44V20C44 16 36 16 32 19C28 16 20 16 12 20V44Z" fill="#00CFFF" fillOpacity="0.3" stroke="#00CFFF" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M32 19V43" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
                {/* Graduation cap */}
                <polygon points="32,8 52,17 32,26 12,17" fill="#FFD700" stroke="#FFF" strokeWidth="1.5"/>
                <path d="M50 18V28" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
                {/* Magic spark */}
                <circle cx="20" cy="12" r="2" fill="#FFF" className="animate-ping"/>
                <circle cx="45" cy="11" r="1.5" fill="#FFD700"/>
              </svg>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-normal text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-tight uppercase font-serif">
              TOAN GAME HUB
            </h1>
            <p className="text-[#FFDE59] text-base sm:text-lg italic font-medium tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              Học Toán thật vui – Vững vàng tương lai
            </p>
          </div>
        </div>

        {/* Center / Right: Teacher & School Info + Photo Badge */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center md:justify-end">
          {/* Vertical Separator */}
          <div className="hidden sm:block h-12 w-[2px] bg-gradient-to-b from-transparent via-[#00CFFF] to-transparent"></div>

          {/* Teacher Info */}
          <div className="text-center sm:text-left">
            <div className="text-white text-lg sm:text-xl font-bold tracking-wide drop-shadow-sm">
              Giáo viên: <span className="text-[#E0F2FE]">Bùi Ngọc Thắng</span>
            </div>
            <div className="text-[#FFDE59] text-base sm:text-lg italic font-semibold tracking-wide">
              Trường THPT Đan Phượng
            </div>
          </div>

          {/* School Badge / Photo Frame matching the reference */}
          <div className="relative rounded-lg overflow-hidden border-2 border-white/80 shadow-md bg-white max-w-[210px] hidden lg:block">
            {/* Red school banner on top */}
            <div className="bg-[#B91C1C] text-white text-[10px] font-bold text-center py-0.5 tracking-wider uppercase px-2 shadow">
              TRƯỜNG THPT ĐAN PHƯỢNG
            </div>
            {/* School facade graphic */}
            <div className="relative h-12 w-48 bg-gradient-to-b from-[#FEF3C7] to-[#FDE68A] flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 200 50" className="w-full h-full opacity-90">
                {/* Trees */}
                <circle cx="20" cy="38" r="14" fill="#15803D"/>
                <circle cx="32" cy="36" r="12" fill="#16A34A"/>
                <circle cx="175" cy="38" r="14" fill="#15803D"/>
                <circle cx="185" cy="36" r="12" fill="#16A34A"/>
                {/* Traditional Vietnamese high school building */}
                <rect x="45" y="14" width="110" height="34" fill="#FBBF24" stroke="#B45309" strokeWidth="1"/>
                <polygon points="40,14 100,4 160,14" fill="#DC2626" stroke="#991B1B" strokeWidth="1"/>
                {/* Windows and pillars */}
                <rect x="52" y="20" width="8" height="12" fill="#1E3A8A"/>
                <rect x="66" y="20" width="8" height="12" fill="#1E3A8A"/>
                <rect x="80" y="20" width="8" height="12" fill="#1E3A8A"/>
                <rect x="94" y="22" width="12" height="24" fill="#991B1B"/>
                <rect x="112" y="20" width="8" height="12" fill="#1E3A8A"/>
                <rect x="126" y="20" width="8" height="12" fill="#1E3A8A"/>
                <rect x="140" y="20" width="8" height="12" fill="#1E3A8A"/>
                {/* Clock tower */}
                <rect x="92" y="6" width="16" height="10" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8"/>
                <circle cx="100" cy="11" r="3" fill="#FFF"/>
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
