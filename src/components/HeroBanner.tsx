import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Compass, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onExploreGames: () => void;
  onJoinRoom: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreGames, onJoinRoom }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "TOAN GAME HUB",
      subtitle: "Khám phá Toán học qua những trò chơi hấp dẫn!",
      tagline: "Học mà chơi – Chơi mà học – Hiệu quả vượt trội!",
      highlight: "Chinh phục kỳ thi THPT với kho 500+ câu hỏi và trò chơi tương tác"
    },
    {
      title: "ĐẤU TRƯỜNG TOÁN HỌC",
      subtitle: "Tranh tài bảng vàng cùng bạn bè THPT Đan Phượng!",
      tagline: "Vào phòng thi đấu – Nhận mã phòng – Rinh huy hiệu Vô Địch!",
      highlight: "Hệ thống tự động chấm điểm và xếp hạng thời gian thực"
    },
    {
      title: "AI HỌC LIỆU TOÁN HỌC",
      subtitle: "Trợ lý thông minh hỗ trợ giải toán & luyện đề!",
      tagline: "Ôn tập chuyên đề: Hàm số, Tích phân, Hình Oxyz, Xác suất!",
      highlight: "Theo sát chương trình Toán THPT chuẩn Bộ Giáo dục & Đào tạo"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeSlide];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#052A68] via-[#084FA0] to-[#0D62C2] text-white shadow-xl border border-[#00CFFF]/40 min-h-[300px] sm:min-h-[330px] flex flex-col justify-between p-5 sm:p-7">
      
      {/* Mathematical Watermark Graphics Background */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        {/* Parabola Graph */}
        <svg className="absolute -top-4 left-4 w-52 h-44 text-white" viewBox="0 0 200 160" fill="none">
          <line x1="10" y1="140" x2="190" y2="140" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
          <line x1="80" y1="10" x2="80" y2="155" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M 20 20 Q 80 140 140 20" stroke="#00CFFF" strokeWidth="2.5" fill="none"/>
          <text x="70" y="24" fill="#00CFFF" fontSize="13" fontFamily="Times New Roman">y = ax² + bx + c</text>
        </svg>

        {/* Triangle ABC */}
        <svg className="absolute bottom-3 left-10 w-44 h-36 text-white" viewBox="0 0 160 120" fill="none">
          <polygon points="80,15 20,105 140,105" stroke="#FFFFFF" strokeWidth="1.5"/>
          <line x1="80" y1="15" x2="80" y2="105" stroke="#00CFFF" strokeWidth="1" strokeDasharray="2 2"/>
          <text x="76" y="12" fill="#FFFFFF" fontSize="12" fontFamily="Times New Roman">A</text>
          <text x="10" y="112" fill="#FFFFFF" fontSize="12" fontFamily="Times New Roman">B</text>
          <text x="145" y="112" fill="#FFFFFF" fontSize="12" fontFamily="Times New Roman">C</text>
        </svg>

        {/* Pi Symbol */}
        <div className="absolute top-6 right-36 text-[90px] font-serif text-white/20 select-none font-bold">
          π
        </div>

        {/* 3D Wireframe Cube */}
        <svg className="absolute bottom-6 right-12 w-32 h-32 text-cyan-300/30" viewBox="0 0 100 100" fill="none">
          <polygon points="20,40 50,20 80,40 50,60" stroke="currentColor" strokeWidth="1.5"/>
          <polygon points="20,40 50,60 50,90 20,70" stroke="currentColor" strokeWidth="1.5"/>
          <polygon points="80,40 50,60 50,90 80,70" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Text and CTA */}
        <div className="max-w-xl text-center lg:text-left space-y-3.5">
          <div className="inline-flex items-center gap-2 bg-[#00CFFF]/20 border border-[#00CFFF]/50 text-[#00CFFF] px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-[#FFDE59]" />
            <span>THPT Đan Phượng • Môn Toán</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-bold text-white tracking-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] leading-tight">
            {current.title}
          </h2>

          <p className="text-[#FFDE59] text-xl sm:text-2xl font-bold font-serif drop-shadow leading-snug">
            {current.subtitle}
          </p>

          {/* White Pill Highlight from Reference */}
          <div className="inline-block bg-white text-[#063B8E] font-bold text-base sm:text-lg px-5 py-2 rounded-full shadow-lg border border-cyan-100 hover:scale-105 transition-transform">
            {current.tagline}
          </div>

          <p className="text-[#E0F2FE] text-base italic hidden sm:block">
            {current.highlight}
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
            <button
              onClick={onExploreGames}
              className="bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#FFA726] hover:to-[#FB8C00] text-white font-bold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer text-base"
            >
              <Compass className="w-5 h-5" />
              <span>Khám phá ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onJoinRoom}
              className="bg-[#0878DC] hover:bg-[#0664B8] text-white border border-[#00CFFF]/80 font-bold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer text-base"
            >
              <Trophy className="w-5 h-5 text-[#FFDE59]" />
              <span>Vào phòng thi đấu</span>
            </button>
          </div>
        </div>

        {/* Right Side: High School Students Graphic matching reference image */}
        <div className="relative shrink-0 flex items-end justify-center w-64 sm:w-72 md:w-80 h-56 sm:h-64">
          {/* Glowing Aura */}
          <div className="absolute inset-0 bg-radial from-[#00CFFF]/40 to-transparent rounded-full blur-xl"></div>

          {/* Stylized Vietnamese High School Students Avatar Representation */}
          <div className="relative z-10 flex items-end justify-center gap-1 select-none">
            
            {/* Student 1 (Male student thumbs up in school uniform) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Cheerful face */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FFE0BD] border-4 border-[#0878DC] shadow-xl relative overflow-hidden flex flex-col items-center justify-center">
                  {/* Hair */}
                  <div className="absolute top-0 w-full h-11 bg-[#262626] rounded-t-full"></div>
                  {/* Eyes smiling */}
                  <div className="absolute top-11 flex gap-4">
                    <div className="w-2.5 h-2.5 bg-[#171717] rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-[#171717] rounded-full"></div>
                  </div>
                  {/* Smile */}
                  <div className="absolute top-16 w-5 h-2.5 border-b-2 border-[#E11D48] rounded-full"></div>
                </div>
                {/* Thumbs up badge */}
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-[#063B8E] text-xs font-black p-1.5 rounded-full shadow-md border-2 border-white">
                  👍 10
                </div>
              </div>
              {/* White High School Uniform with Blue Tie */}
              <div className="w-28 h-20 bg-white border-2 border-slate-200 rounded-t-2xl shadow-lg flex flex-col items-center pt-1.5 relative overflow-hidden">
                <div className="w-6 h-10 bg-[#063B8E] rounded-b-md shadow-sm"></div>
                <div className="text-[10px] font-bold text-[#063B8E] mt-1 uppercase">THPT ĐP</div>
              </div>
            </div>

            {/* Student 2 (Female student holding "Toán" book) */}
            <div className="flex flex-col items-center -ml-5 z-20">
              <div className="relative">
                <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-[#FFDFBA] border-4 border-[#00CFFF] shadow-xl relative overflow-hidden flex flex-col items-center justify-center">
                  {/* Girl hair */}
                  <div className="absolute top-0 w-full h-12 bg-[#3B2F2F] rounded-t-full"></div>
                  {/* Eyes */}
                  <div className="absolute top-10 flex gap-4">
                    <div className="w-2.5 h-2.5 bg-[#171717] rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-[#171717] rounded-full"></div>
                  </div>
                  {/* Smile */}
                  <div className="absolute top-15 w-4 h-2 border-b-2 border-[#E11D48] rounded-full"></div>
                </div>
                {/* Red ribbon */}
                <div className="absolute -top-1 right-2 text-xs">🎀</div>
              </div>

              {/* Girl uniform holding Math textbook */}
              <div className="w-26 h-20 bg-white border-2 border-slate-200 rounded-t-2xl shadow-lg flex flex-col items-center pt-1 relative">
                {/* Blue collar */}
                <div className="w-10 h-3 bg-[#0878DC] rounded-b-sm"></div>
                {/* "Toán" Textbook in hand */}
                <div className="absolute -bottom-1 bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white px-3 py-1 rounded shadow-md border border-white flex items-center gap-1 font-bold text-xs tracking-wider">
                  <span>📖</span>
                  <span>TOÁN</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Carousel Dots */}
      <div className="relative z-10 flex justify-center items-center gap-2 pt-4">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              activeSlide === idx ? 'w-8 bg-[#00CFFF]' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
};
