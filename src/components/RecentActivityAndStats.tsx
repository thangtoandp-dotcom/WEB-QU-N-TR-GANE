import React from 'react';
import { Trophy, Clock, CheckCircle2, Users } from 'lucide-react';
import { GameAttempt, Student, ClassItem } from '../types';

interface RecentActivityAndStatsProps {
  onViewAllLeaderboard: () => void;
  onViewAllActivities: () => void;
  recentAttempts?: GameAttempt[];
  students?: Student[];
  classes?: ClassItem[];
}

export const RecentActivityAndStats: React.FC<RecentActivityAndStatsProps> = ({
  onViewAllLeaderboard,
  onViewAllActivities,
  recentAttempts = [],
  students = [],
  classes = []
}) => {
  // Top 3 students for the left column (derived from real students list)
  const sortedStudents = students.length > 0
    ? [...students].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)).slice(0, 3)
    : [];

  const topStudents = sortedStudents.length >= 3 ? [
    { rank: 1, name: sortedStudents[0].name, class: sortedStudents[0].classId, score: sortedStudents[0].totalPoints || 100, medal: '🥇' },
    { rank: 2, name: sortedStudents[1].name, class: sortedStudents[1].classId, score: sortedStudents[1].totalPoints || 98, medal: '🥈' },
    { rank: 3, name: sortedStudents[2].name, class: sortedStudents[2].classId, score: sortedStudents[2].totalPoints || 96, medal: '🥉' }
  ] : [
    { rank: 1, name: 'Lê Duy Anh', class: '12A3', score: 100, medal: '🥇' },
    { rank: 2, name: 'Nguyễn Ngọc Anh', class: '12A3', score: 98, medal: '🥈' },
    { rank: 3, name: 'Nguyễn Phương Anh', class: '12A3', score: 96, medal: '🥉' }
  ];

  // Live activities from real attempts or recent student attempts
  const displayActivities = recentAttempts.length > 0 ? recentAttempts.slice(0, 4) : [
    { studentName: 'Bùi Gia Bảo', className: '12A3', score: 95, timeAgo: '2 phút trước' },
    { studentName: 'Trần Duy Anh', className: '12A3', score: 100, timeAgo: '5 phút trước' },
    { studentName: 'Nguyễn Quốc Anh', className: '12A4', score: 92, timeAgo: '7 phút trước' },
    { studentName: 'Nguyễn Thành Công', className: '12A14', score: 96, timeAgo: '10 phút trước' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
      
      {/* Col 1: Bảng xếp hạng xuất sắc (4 cols) */}
      <div className="lg:col-span-4 bg-white rounded-2xl shadow-md border-2 border-[#0878DC]/20 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063B8E] to-[#0878DC] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FFDE59]" />
            <h3 className="font-bold font-serif text-lg">Bảng xếp hạng xuất sắc</h3>
          </div>
          <span className="text-xl">👑</span>
        </div>

        {/* Table matching reference image */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold text-sm">
                <th className="pb-2 text-center w-12">Hạng</th>
                <th className="pb-2">Học sinh</th>
                <th className="pb-2 text-center">Lớp</th>
                <th className="pb-2 text-right">Điểm cao nhất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topStudents.map((s) => (
                <tr key={s.rank} className="hover:bg-[#EAF5FF] transition-colors">
                  <td className="py-2.5 text-center text-lg">{s.medal}</td>
                  <td className="py-2.5 font-bold text-[#063B8E]">{s.name}</td>
                  <td className="py-2.5 text-center font-semibold text-slate-600">{s.class}</td>
                  <td className="py-2.5 text-right font-bold text-[#EA580C] text-lg">{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={onViewAllLeaderboard}
            className="w-full mt-3 py-1.5 text-center text-sm font-bold text-[#0878DC] hover:text-[#063B8E] hover:bg-[#EAF5FF] rounded-lg transition-colors cursor-pointer border border-[#0878DC]/30"
          >
            Xem toàn bộ bảng vàng →
          </button>
        </div>
      </div>

      {/* Col 2: Thống kê tổng quan (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-2xl shadow-md border-2 border-[#0878DC]/20 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063B8E] to-[#0878DC] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3 className="font-bold font-serif text-lg">Thống kê tổng quan</h3>
          </div>
        </div>

        {/* Content: 4 Stat tiles + Donut chart */}
        <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Tile 1 */}
            <div className="bg-[#E0F2FE] border border-[#BAE6FD] rounded-xl p-2 text-center">
              <Users className="w-5 h-5 mx-auto text-[#0284C7] mb-1" />
              <div className="text-lg font-bold text-[#0369A1] leading-tight">
                {students.length > 0 ? students.length.toLocaleString('vi-VN') : '214'}
              </div>
              <div className="text-xs text-slate-600 font-medium">Học sinh tham gia</div>
            </div>

            {/* Tile 2 */}
            <div className="bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl p-2 text-center">
              <CheckCircle2 className="w-5 h-5 mx-auto text-[#16A34A] mb-1" />
              <div className="text-lg font-bold text-[#15803D] leading-tight">98%</div>
              <div className="text-xs text-slate-600 font-medium">Hoàn thành</div>
            </div>

            {/* Tile 3 */}
            <div className="bg-[#FCE7F3] border border-[#FBCFE8] rounded-xl p-2 text-center">
              <Trophy className="w-5 h-5 mx-auto text-[#DB2777] mb-1" />
              <div className="text-lg font-bold text-[#BE185D] leading-tight">8,7</div>
              <div className="text-xs text-slate-600 font-medium">Điểm trung bình</div>
            </div>

            {/* Tile 4 */}
            <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-2 text-center">
              <Clock className="w-5 h-5 mx-auto text-[#D97706] mb-1" />
              <div className="text-lg font-bold text-[#B45309] leading-tight">12 phút</div>
              <div className="text-xs text-slate-600 font-medium">Thời gian TB</div>
            </div>
          </div>

          {/* Donut Chart & Legend matching reference */}
          <div className="flex items-center justify-around bg-[#F8FAFC] rounded-xl p-2 border border-slate-100">
            {/* SVG Donut Chart */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                {/* 45% Toán học (#0878DC) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#0878DC" strokeWidth="6" strokeDasharray="45 55" strokeDashoffset="0" />
                {/* 30% Trí tuệ (#16A34A) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#16A34A" strokeWidth="6" strokeDasharray="30 70" strokeDashoffset="-45" />
                {/* 15% Giải trí (#F59E0B) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F59E0B" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="-75" />
                {/* 10% Khác (#EC4899) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#EC4899" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="-90" />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-bold text-[#063B8E]">Tỷ lệ</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0878DC]"></span>
                <span className="text-slate-700">Toán học: <strong className="text-[#0878DC]">45%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#16A34A]"></span>
                <span className="text-slate-700">Trí tuệ: <strong className="text-[#16A34A]">30%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                <span className="text-slate-700">Giải trí: <strong className="text-[#F59E0B]">15%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EC4899]"></span>
                <span className="text-slate-700">Khác: <strong className="text-[#EC4899]">10%</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Col 3: Hoạt động gần đây (3 cols) */}
      <div className="lg:col-span-3 bg-white rounded-2xl shadow-md border-2 border-[#0878DC]/20 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063B8E] to-[#0878DC] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#00CFFF]" />
            <h3 className="font-bold font-serif text-base sm:text-lg">Hoạt động gần đây</h3>
          </div>
          <button 
            onClick={onViewAllActivities}
            className="text-xs text-[#00CFFF] hover:text-white font-medium cursor-pointer"
          >
            Xem thêm →
          </button>
        </div>

        {/* Activity feed list */}
        <div className="p-3 flex-1 flex flex-col justify-around divide-y divide-slate-100">
          {displayActivities.map((act: any, idx) => (
            <div key={idx} className="py-2 flex items-start justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shrink-0"></span>
                <div>
                  <span className="font-bold text-[#063B8E]">{act.studentName}</span>
                  <span className="text-slate-500 font-medium ml-1">({act.className || '12A1'})</span>
                  <div className="text-xs text-slate-700">
                    {act.score ? `đạt ${act.score} điểm` : 'hoàn thành game'}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 mt-0.5">
                {act.timeAgo || (act.endedAt ? new Date(act.endedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong')}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
