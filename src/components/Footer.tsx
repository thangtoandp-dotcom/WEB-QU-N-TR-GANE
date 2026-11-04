import React from 'react';
import { Globe, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#042866] text-white border-t-2 border-[#00CFFF]/40 mt-8 py-4 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-sm sm:text-base font-serif">
        
        {/* Left: School & Teacher */}
        <div className="flex items-center gap-2.5 text-center md:text-left">
          <span className="text-xl">🎓</span>
          <div>
            <span className="font-bold text-white">Trường THPT Đan Phượng</span>
            <span className="mx-2 text-[#00CFFF]">|</span>
            <span className="text-[#FFDE59] font-medium">Giáo viên: Bùi Ngọc Thắng</span>
          </div>
        </div>

        {/* Center: Educational Motto */}
        <div className="text-[#E0F2FE] italic font-medium text-center tracking-wide">
          Toán học – Kết nối tri thức, kiến tạo tương lai
        </div>

        {/* Right: Web & Contact */}
        <div className="flex items-center gap-4 text-xs sm:text-sm text-[#D0E7FF] font-medium">
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Globe className="w-4 h-4 text-[#00CFFF]" />
            <span>toangamehub.edu.vn</span>
          </div>
          <span className="text-[#00CFFF]">|</span>
          <a href="tel:0904545748" className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" title="Gọi số điện thoại thầy Bùi Ngọc Thắng">
            <Phone className="w-4 h-4 text-[#FFDE59]" />
            <span>0904.545.748</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
