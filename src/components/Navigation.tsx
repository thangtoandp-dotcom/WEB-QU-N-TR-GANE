import React, { useState } from 'react';
import { 
  Home, 
  Gamepad2, 
  GraduationCap, 
  Trophy, 
  Swords, 
  Users, 
  BarChart3, 
  PieChart, 
  Settings,
  Menu,
  X
} from 'lucide-react';

export type NavTab = 
  | 'home'
  | 'all-games'
  | 'math-games'
  | 'fun-games'
  | 'rooms'
  | 'classes'
  | 'leaderboard'
  | 'statistics'
  | 'admin';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUserRole?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, currentUserRole }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as NavTab, label: 'Trang chủ', icon: Home },
    { id: 'all-games' as NavTab, label: 'Kho trò chơi', icon: Gamepad2 },
    { id: 'math-games' as NavTab, label: 'Trò chơi Toán học', icon: GraduationCap },
    { id: 'fun-games' as NavTab, label: 'Trò chơi giải trí', icon: Trophy },
    { id: 'rooms' as NavTab, label: 'Phòng thi đấu', icon: Swords },
    { id: 'classes' as NavTab, label: 'Lớp học', icon: Users },
    { id: 'leaderboard' as NavTab, label: 'Bảng xếp hạng', icon: BarChart3 },
    { id: 'statistics' as NavTab, label: 'Thống kê', icon: PieChart },
    { id: 'admin' as NavTab, label: 'Quản trị', icon: Settings },
  ];

  const handleSelectTab = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="w-full bg-[#052C6E] border-b border-[#0878DC]/60 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        
        {/* Desktop and Scrollable Row */}
        <div className="flex items-center justify-between py-1.5 gap-2">
          
          {/* Scrollable Tab Pills */}
          <div className="flex items-center overflow-x-auto scrollbar-none gap-1 sm:gap-2 text-[15px] sm:text-[17px] font-semibold py-0.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00CFFF] to-[#0878DC] text-white shadow-[0_2px_12px_rgba(0,207,255,0.45)] font-bold scale-[1.02] border border-white/40'
                      : 'text-[#D0E7FF] hover:text-white hover:bg-[#07479F]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white drop-shadow' : 'text-[#85BFFF]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-white bg-blue-900/60 hover:bg-blue-800 border border-[#00CFFF]/40 cursor-pointer shrink-0"
            title="Mở danh mục menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#FFDE59]" /> : <Menu className="w-5 h-5 text-[#00CFFF]" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-blue-800 grid grid-cols-2 gap-1.5 animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl font-bold font-serif text-sm text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#0878DC] text-white'
                      : 'text-[#D0E7FF] bg-blue-950/40 hover:bg-blue-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#00CFFF]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </nav>
  );
};
