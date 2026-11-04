import React from 'react';
import { Gamepad2, Search, ChevronRight } from 'lucide-react';

interface GameCategoriesProps {
  onSelectCategory: (categoryKey: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
}

export const GameCategories: React.FC<GameCategoriesProps> = ({
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedGrade,
  onGradeChange
}) => {
  const categories = [
    {
      id: 'trac-nghiem',
      title: 'Game Trắc nghiệm Toán học',
      bgCard: 'bg-[#E0F2FE]',
      borderCard: 'border-[#7DD3FC]',
      buttonBg: 'bg-[#0284C7] hover:bg-[#0369A1]',
      iconRender: (
        <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 border border-blue-200">
          <svg viewBox="0 0 48 48" className="w-12 h-12">
            <rect x="8" y="6" width="32" height="36" rx="4" fill="#60A5FA" />
            <rect x="12" y="10" width="24" height="28" rx="2" fill="#FFFFFF" />
            <line x1="16" y1="16" x2="28" y2="16" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="16" y1="22" x2="28" y2="22" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="16" y1="28" x2="24" y2="28" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
            {/* Pencil */}
            <polygon points="34,22 38,18 42,22 38,26" fill="#F59E0B" />
            <polygon points="30,30 34,22 38,26 34,34" fill="#FBBF24" />
            <polygon points="28,36 30,30 34,34" fill="#D97706" />
            <circle cx="28" cy="36" r="1.5" fill="#1E293B" />
          </svg>
        </div>
      )
    },
    {
      id: 'tu-duy',
      title: 'Game Tư duy và Trí tuệ',
      bgCard: 'bg-[#DCFCE7]',
      borderCard: 'border-[#86EFAC]',
      buttonBg: 'bg-[#16A34A] hover:bg-[#15803D]',
      iconRender: (
        <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 border border-emerald-200">
          <svg viewBox="0 0 48 48" className="w-12 h-12">
            {/* Glowing Brain Lightbulb */}
            <circle cx="24" cy="20" r="14" fill="#FEF08A" />
            <path d="M16 20C16 15 19.5 11 24 11C28.5 11 32 15 32 20C32 24 29 27 27 29V33H21V29C19 27 16 24 16 20Z" fill="#F59E0B" opacity="0.3" />
            <path d="M21 33H27M22 36H26M23 39H25" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
            {/* Brain convolutions */}
            <path d="M20 16C18 18 19 22 22 23M28 16C30 18 29 22 26 23M24 14V26" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
            {/* Sparks */}
            <line x1="24" y1="2" x2="24" y2="5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="12" x2="11" y2="14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            <line x1="40" y1="12" x2="37" y2="14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )
    },
    {
      id: 'hinh-hoc',
      title: 'Game Hình học',
      bgCard: 'bg-[#F3E8FF]',
      borderCard: 'border-[#D8B4FE]',
      buttonBg: 'bg-[#7C3AED] hover:bg-[#6D28D9]',
      iconRender: (
        <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 border border-purple-200">
          <svg viewBox="0 0 48 48" className="w-12 h-12">
            {/* 3D Pyramid */}
            <polygon points="20,10 6,36 30,36" fill="#06B6D4" stroke="#0891B2" strokeWidth="1" />
            <polygon points="20,10 30,36 34,28" fill="#3B82F6" stroke="#2563EB" strokeWidth="1" />
            {/* Cube */}
            <polygon points="24,24 36,18 42,24 30,30" fill="#A855F7" />
            <polygon points="24,24 30,30 30,42 24,36" fill="#9333EA" />
            <polygon points="42,24 30,30 30,42 42,36" fill="#7E22CE" />
            {/* Sphere */}
            <circle cx="36" cy="38" r="7" fill="#F59E0B" />
            <circle cx="34" cy="36" r="2.5" fill="#FEF3C7" />
          </svg>
        </div>
      )
    },
    {
      id: 'vong-quay',
      title: 'Vòng quay may mắn',
      bgCard: 'bg-[#FFEDD5]',
      borderCard: 'border-[#FDBA74]',
      buttonBg: 'bg-[#D97706] hover:bg-[#B45309]',
      iconRender: (
        <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 border border-amber-200">
          <svg viewBox="0 0 48 48" className="w-12 h-12">
            {/* Colorful Wheel */}
            <circle cx="24" cy="24" r="18" fill="#FDE68A" stroke="#D97706" strokeWidth="2.5" />
            <path d="M24 24 L24 6 A18 18 0 0 1 39 15 Z" fill="#EF4444" />
            <path d="M24 24 L39 15 A18 18 0 0 1 42 24 Z" fill="#F59E0B" />
            <path d="M24 24 L42 24 A18 18 0 0 1 36 36 Z" fill="#10B981" />
            <path d="M24 24 L36 36 A18 18 0 0 1 24 42 Z" fill="#3B82F6" />
            <path d="M24 24 L24 42 A18 18 0 0 1 9 33 Z" fill="#8B5CF6" />
            <path d="M24 24 L9 33 A18 18 0 0 1 6 24 Z" fill="#EC4899" />
            <path d="M24 24 L6 24 A18 18 0 0 1 12 12 Z" fill="#14B8A6" />
            <path d="M24 24 L12 12 A18 18 0 0 1 24 6 Z" fill="#EAB308" />
            {/* Hub and pointer */}
            <circle cx="24" cy="24" r="5" fill="#FFFFFF" stroke="#D97706" strokeWidth="2" />
            <polygon points="24,3 27,8 21,8" fill="#B91C1C" />
          </svg>
        </div>
      )
    },
    {
      id: 'trieu-phu',
      title: 'Ai là triệu phú Toán học',
      bgCard: 'bg-[#CFFAFE]',
      borderCard: 'border-[#67E8F9]',
      buttonBg: 'bg-[#0891B2] hover:bg-[#0e7490]',
      iconRender: (
        <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 border border-cyan-200">
          <svg viewBox="0 0 48 48" className="w-12 h-12">
            {/* Podium */}
            <rect x="8" y="24" width="10" height="18" rx="2" fill="#0284C7" />
            <rect x="19" y="18" width="10" height="24" rx="2" fill="#0369A1" />
            <rect x="30" y="28" width="10" height="14" rx="2" fill="#0891B2" />
            {/* Number on podiums */}
            <text x="13" y="36" fill="#FFF" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
            <text x="24" y="32" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">1</text>
            <text x="35" y="38" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">3</text>
            {/* Golden Crown */}
            <polygon points="19,15 21,11 24,14 27,11 29,15 29,17 19,17" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
            <circle cx="21" cy="11" r="1" fill="#FEF3C7" />
            <circle cx="24" cy="14" r="1" fill="#FEF3C7" />
            <circle cx="27" cy="11" r="1" fill="#FEF3C7" />
          </svg>
        </div>
      )
    },
    {
      id: 'giai-tri',
      title: 'Game Giải trí Không giới hạn',
      bgCard: 'bg-[#EDE9FE]',
      borderCard: 'border-[#C4B5FD]',
      buttonBg: 'bg-[#6D28D9] hover:bg-[#5B21B6]',
      iconRender: (
        <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 border border-violet-200">
          <svg viewBox="0 0 48 48" className="w-12 h-12">
            {/* Game Controller */}
            <path d="M10 20C10 14 16 12 24 12C32 12 38 14 38 20C38 27 34 38 29 38C26 38 25 33 24 33C23 33 22 38 19 38C14 38 10 27 10 20Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
            {/* D-Pad */}
            <rect x="14" y="20" width="3" height="8" rx="1" fill="#FFFFFF" />
            <rect x="11.5" y="22.5" width="8" height="3" rx="1" fill="#FFFFFF" />
            {/* Buttons */}
            <circle cx="31" cy="21" r="1.8" fill="#EF4444" />
            <circle cx="34" cy="24" r="1.8" fill="#10B981" />
            <circle cx="28" cy="24" r="1.8" fill="#F59E0B" />
            <circle cx="31" cy="27" r="1.8" fill="#6366F1" />
          </svg>
        </div>
      )
    }
  ];

  return (
    <section className="w-full space-y-4">
      {/* Category Section Header with Search and Filter */}
      <div className="bg-[#0878DC] text-white rounded-xl px-4 py-3 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Gamepad2 className="w-6 h-6 text-[#FFDE59]" />
          <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-wide drop-shadow-sm">
            Danh mục trò chơi
          </h2>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm trò chơi..."
              className="w-full bg-white text-slate-800 text-sm sm:text-base rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00CFFF] shadow-inner font-serif"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Grade Selector */}
          <select
            value={selectedGrade}
            onChange={(e) => onGradeChange(e.target.value)}
            className="bg-white text-slate-800 text-sm sm:text-base rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00CFFF] shadow-inner font-serif font-medium cursor-pointer"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>
        </div>
      </div>

      {/* 6 Category Cards Grid matching reference layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`${cat.bgCard} ${cat.borderCard} border-2 rounded-2xl p-3.5 flex flex-col items-center justify-between text-center shadow-md card-tech-glow cursor-pointer min-h-[175px]`}
          >
            {/* Visual 3D Icon */}
            <div className="transform hover:scale-110 transition-transform duration-200">
              {cat.iconRender}
            </div>

            {/* Category Title */}
            <h3 className="font-bold text-[#063B8E] text-[16px] sm:text-[17px] font-serif leading-tight mt-2 px-1">
              {cat.title}
            </h3>

            {/* Action Button matching reference */}
            <button
              className={`w-full mt-2.5 ${cat.buttonBg} text-white font-bold text-sm sm:text-[15px] py-1.5 px-3 rounded-xl shadow flex items-center justify-center gap-1 transition-colors cursor-pointer`}
            >
              <span>Khám phá</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
