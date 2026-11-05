import React, { useState } from 'react';
import { Trophy, Medal, Crown, Star, Zap, Shield, Brain, Search, Award } from 'lucide-react';
import { Student, ClassItem } from '../types';

interface LeaderboardViewProps {
  students: Student[];
  classes: ClassItem[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ students, classes }) => {
  const [filterTab, setFilterTab] = useState<'all' | 'by-grade' | 'by-class' | 'week' | 'month'>('all');
  const [selectedGrade, setSelectedGrade] = useState<number>(12);
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.name || '12A3');
  const [searchName, setSearchName] = useState('');

  const isMatchClass = (sClass: string, tClass: string) => {
    if (!tClass || tClass === 'all') return true;
    if (!sClass) return false;
    const s = sClass.trim().toLowerCase().replace(/^c/, '');
    const t = tClass.trim().toLowerCase().replace(/^c/, '');
    return s === t || sClass === tClass;
  };

  // Sort students descending by total points
  const sortedStudents = [...students].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

  const filteredStudents = sortedStudents.filter((s) => {
    if (filterTab === 'by-grade' && s.grade !== selectedGrade) return false;
    if (filterTab === 'by-class' && !isMatchClass(s.classId, selectedClass)) return false;
    if (searchName.trim()) {
      return s.name.toLowerCase().includes(searchName.toLowerCase());
    }
    return true;
  });

  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case 'Vô địch':
        return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold"><Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Vô địch</span>;
      case 'Xuất sắc':
        return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-0.5 rounded-full text-xs font-bold"><Star className="w-3.5 h-3.5 text-blue-600 fill-blue-500" /> Xuất sắc</span>;
      case 'Tài năng Toán học':
        return <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded-full text-xs font-bold"><Brain className="w-3.5 h-3.5 text-purple-600" /> Tài năng Toán học</span>;
      case 'Siêu tốc':
        return <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 border border-orange-300 px-2.5 py-0.5 rounded-full text-xs font-bold"><Zap className="w-3.5 h-3.5 text-orange-600 fill-orange-500" /> Siêu tốc</span>;
      case 'Kiên trì':
        return <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-bold"><Shield className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" /> Kiên trì</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium">Tân thủ</span>;
    }
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return <div className="text-2xl">🥇</div>;
    if (rank === 2) return <div className="text-2xl">🥈</div>;
    if (rank === 3) return <div className="text-2xl">🥉</div>;
    return <span className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-sm">{rank}</span>;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Gold Banner */}
      <div className="bg-gradient-to-r from-[#063B8E] via-[#0878DC] to-[#063B8E] text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-[#FFD700]/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#FFD700]/20 border border-[#FFD700]/50 text-[#FFD700] px-3.5 py-1 rounded-full text-sm font-bold tracking-wide mb-2">
            <Trophy className="w-4 h-4 fill-[#FFD700]" />
            <span>Bảng Vàng Danh Dự • THPT Đan Phượng</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">
            Bảng Xếp Hạng Thành Tích Toán Học
          </h2>
          <p className="text-[#E0F2FE] text-base sm:text-lg font-serif mt-1">
            Vinh danh những kiện tướng giải toán xuất sắc khối 10, 11 và 12
          </p>
        </div>

        {/* Top 3 Podium Visual Display */}
        <div className="flex items-end justify-center gap-2 sm:gap-3 shrink-0">
          {/* Rank 2 */}
          {sortedStudents[1] && (
            <div className="flex flex-col items-center">
              <div className="text-xs font-bold text-slate-200 truncate max-w-[80px]">{sortedStudents[1].name}</div>
              <div className="text-sm font-black text-amber-300">{sortedStudents[1].totalPoints}đ</div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-300/40 rounded-t-2xl border-2 border-white/60 flex items-center justify-center text-2xl shadow">
                🥈
              </div>
            </div>
          )}

          {/* Rank 1 */}
          {sortedStudents[0] && (
            <div className="flex flex-col items-center -mb-2">
              <Crown className="w-6 h-6 text-[#FFD700] fill-[#FFD700] animate-bounce" />
              <div className="text-xs font-bold text-white truncate max-w-[90px]">{sortedStudents[0].name}</div>
              <div className="text-base font-black text-[#FFD700]">{sortedStudents[0].totalPoints}đ</div>
              <div className="w-20 h-24 sm:w-24 sm:h-28 bg-gradient-to-t from-[#B45309] to-[#F59E0B] rounded-t-2xl border-2 border-[#FFD700] flex items-center justify-center text-3xl shadow-lg">
                🥇
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {sortedStudents[2] && (
            <div className="flex flex-col items-center">
              <div className="text-xs font-bold text-slate-200 truncate max-w-[80px]">{sortedStudents[2].name}</div>
              <div className="text-sm font-black text-amber-300">{sortedStudents[2].totalPoints}đ</div>
              <div className="w-16 h-12 sm:w-20 sm:h-14 bg-amber-800/40 rounded-t-2xl border-2 border-white/60 flex items-center justify-center text-2xl shadow">
                🥉
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-[#0878DC]/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl font-bold font-serif text-sm transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-[#063B8E] text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-[#EAF5FF]'
            }`}
          >
            Toàn trường (Top 10)
          </button>

          <button
            onClick={() => setFilterTab('by-grade')}
            className={`px-4 py-2 rounded-xl font-bold font-serif text-sm transition-all cursor-pointer ${
              filterTab === 'by-grade'
                ? 'bg-[#063B8E] text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-[#EAF5FF]'
            }`}
          >
            Theo Khối lớp
          </button>

          <button
            onClick={() => setFilterTab('by-class')}
            className={`px-4 py-2 rounded-xl font-bold font-serif text-sm transition-all cursor-pointer ${
              filterTab === 'by-class'
                ? 'bg-[#063B8E] text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-[#EAF5FF]'
            }`}
          >
            Theo Lớp
          </button>

          <button
            onClick={() => setFilterTab('week')}
            className={`px-4 py-2 rounded-xl font-bold font-serif text-sm transition-all cursor-pointer ${
              filterTab === 'week'
                ? 'bg-[#063B8E] text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-[#EAF5FF]'
            }`}
          >
            Bảng vàng tuần này
          </button>

          <button
            onClick={() => setFilterTab('month')}
            className={`px-4 py-2 rounded-xl font-bold font-serif text-sm transition-all cursor-pointer ${
              filterTab === 'month'
                ? 'bg-[#063B8E] text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-[#EAF5FF]'
            }`}
          >
            Bảng vàng tháng này
          </button>
        </div>

        {/* Sub-selector for Grade / Class */}
        {filterTab === 'by-grade' && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">Chọn khối:</span>
            {[10, 11, 12].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1 rounded-lg text-sm font-bold cursor-pointer ${
                  selectedGrade === g ? 'bg-[#0878DC] text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Khối {g}
              </button>
            ))}
          </div>
        )}

        {filterTab === 'by-class' && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">Chọn lớp:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1 text-sm bg-slate-50 font-serif"
            >
              {classes.map((c) => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Tìm tên học sinh..."
            className="w-full bg-[#EAF5FF] border border-[#0878DC]/30 rounded-xl pl-9 pr-3 py-1.5 text-sm focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl shadow-md border-2 border-[#0878DC]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-serif text-base">
            <thead className="bg-[#EAF5FF] text-[#063B8E] font-bold text-sm border-b-2 border-[#0878DC]/20">
              <tr>
                <th className="py-3 px-4 text-center w-16">Thứ hạng</th>
                <th className="py-3 px-4">Họ và tên thí sinh</th>
                <th className="py-3 px-4 text-center">Lớp</th>
                <th className="py-3 px-4 text-center">Khối</th>
                <th className="py-3 px-4 text-center">Số trận đã đấu</th>
                <th className="py-3 px-4 text-center">Huy hiệu danh dự</th>
                <th className="py-3 px-4 text-right">Tổng điểm tích lũy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">{getRankMedal(idx + 1)}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#063B8E] text-lg">
                    {s.name}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    {s.classId}
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-slate-600">
                    Khối {s.grade}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {s.gamesPlayed || 0} trận
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getBadgeIcon(s.badge)}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-amber-600 text-xl font-mono">
                    {s.totalPoints || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
