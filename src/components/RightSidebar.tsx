import React from 'react';
import { 
  GraduationCap, 
  Users, 
  Star, 
  Gamepad2, 
  Award, 
  TrendingUp, 
  Zap, 
  FileSpreadsheet, 
  HelpCircle,
  LogOut,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types';

interface RightSidebarProps {
  currentUser: UserProfile;
  onOpenLogin: (role: 'teacher' | 'student') => void;
  onLogout: () => void;
  onNavigate: (target: string) => void;
  stats?: {
    totalPlays: number;
    totalStudents: number;
    avgScore: number;
  };
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onNavigate,
  stats = { totalPlays: 12568, totalStudents: 3421, avgScore: 8.7 }
}) => {
  return (
    <aside className="w-full flex flex-col gap-4">
      
      {/* 1. Đăng nhập hệ thống Card */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-[#0878DC]/20 p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-3 text-[#063B8E] font-bold text-lg border-b border-slate-100 pb-2">
          <UserCheck className="w-5 h-5 text-[#0878DC]" />
          <span>Đăng nhập hệ thống</span>
        </div>

        {currentUser.role !== 'guest' ? (
          <div className="bg-gradient-to-br from-[#EAF5FF] to-[#D0E7FF] rounded-xl p-3 border border-[#0878DC]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#063B8E] text-white">
                {currentUser.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
              </span>
              <button 
                onClick={onLogout}
                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
            <div className="font-bold text-[#063B8E] text-lg leading-tight">
              {currentUser.name}
            </div>
            {currentUser.className && (
              <div className="text-sm text-slate-600 font-medium">
                Lớp: <span className="font-bold text-[#0878DC]">{currentUser.className}</span>
              </div>
            )}
            {currentUser.school && (
              <div className="text-xs text-slate-500 mt-0.5">
                {currentUser.school}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Teacher login button */}
            <button
              onClick={() => onOpenLogin('teacher')}
              className="w-full bg-gradient-to-r from-[#063B8E] to-[#0878DC] hover:from-[#052C6E] hover:to-[#0664B8] text-white font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-[16px] transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <GraduationCap className="w-5 h-5 text-[#FFDE59]" />
              <span>Đăng nhập Giáo viên</span>
            </button>

            {/* Student login button */}
            <button
              onClick={() => onOpenLogin('student')}
              className="w-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-[16px] transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Users className="w-5 h-5 text-white" />
              <span>Đăng nhập Học sinh</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Thống kê nhanh Card */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-[#0878DC]/20 p-4">
        <div className="flex items-center gap-2 mb-3 text-[#B45309] font-bold text-lg border-b border-slate-100 pb-2">
          <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
          <span className="text-[#063B8E]">Thống kê nhanh</span>
        </div>

        <div className="space-y-2.5 text-base">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC]">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Gamepad2 className="w-4 h-4 text-[#0878DC]" />
              <span>Tổng lượt chơi:</span>
            </div>
            <span className="font-bold text-[#063B8E] text-lg">
              {stats.totalPlays.toLocaleString('vi-VN')}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC]">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Award className="w-4 h-4 text-[#16A34A]" />
              <span>Học sinh tham gia:</span>
            </div>
            <span className="font-bold text-[#063B8E] text-lg">
              {stats.totalStudents.toLocaleString('vi-VN')}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC]">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <TrendingUp className="w-4 h-4 text-[#EA580C]" />
              <span>Điểm trung bình:</span>
            </div>
            <span className="font-bold text-[#EA580C] text-lg">
              {stats.avgScore.toFixed(1).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Truy cập nhanh Card */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-[#0878DC]/20 p-4">
        <div className="flex items-center gap-2 mb-3 text-[#063B8E] font-bold text-lg border-b border-slate-100 pb-2">
          <Zap className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
          <span>Truy cập nhanh</span>
        </div>

        <div className="space-y-1.5 text-base">
          <button
            onClick={() => onNavigate('create-room')}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-[#063B8E] hover:bg-[#EAF5FF] rounded-xl font-medium transition-colors text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] flex items-center justify-center text-[#0878DC]">
              👥
            </div>
            <span>Tạo phòng chơi</span>
          </button>

          <button
            onClick={() => onNavigate('results')}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-[#063B8E] hover:bg-[#EAF5FF] rounded-xl font-medium transition-colors text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
              📊
            </div>
            <span>Xem kết quả</span>
          </button>

          <button
            onClick={() => onNavigate('leaderboard')}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-[#063B8E] hover:bg-[#EAF5FF] rounded-xl font-medium transition-colors text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
              🏆
            </div>
            <span>Bảng xếp hạng</span>
          </button>

          <button
            onClick={() => onNavigate('export')}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-[#063B8E] hover:bg-[#EAF5FF] rounded-xl font-medium transition-colors text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <span>Xuất báo cáo</span>
          </button>

          <button
            onClick={() => onNavigate('guide')}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-[#063B8E] hover:bg-[#EAF5FF] rounded-xl font-medium transition-colors text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span>Hướng dẫn sử dụng</span>
          </button>
        </div>
      </div>

    </aside>
  );
};
