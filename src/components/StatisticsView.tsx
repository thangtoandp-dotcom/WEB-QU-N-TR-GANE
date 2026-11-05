import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Search, 
  Calendar, 
  Users, 
  Award, 
  Clock, 
  CheckCircle2, 
  Gamepad2, 
  TrendingUp,
  Filter
} from 'lucide-react';
import { GameAttempt, Student, ClassItem, GameItem } from '../types';
import { excelService } from '../services/api';

interface StatisticsViewProps {
  attempts: GameAttempt[];
  students: Student[];
  classes: ClassItem[];
  games: GameItem[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  attempts,
  students,
  classes,
  games
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'attempts' | 'by-class' | 'not-participated'>('attempts');

  const isMatchClass = (sClass: string, tClass: string) => {
    if (!tClass || tClass === 'all') return true;
    if (!sClass) return false;
    const s = sClass.trim().toLowerCase().replace(/^c/, '');
    const t = tClass.trim().toLowerCase().replace(/^c/, '');
    return s === t || sClass === tClass;
  };

  // Filtered attempts
  const filteredAttempts = attempts.filter((a) => {
    if (selectedClass !== 'all' && !isMatchClass(a.className, selectedClass)) return false;
    if (selectedGame !== 'all' && a.gameId !== selectedGame) return false;
    if (searchStudent.trim()) {
      const q = searchStudent.toLowerCase();
      return (
        a.studentName.toLowerCase().includes(q) ||
        a.studentCode.toLowerCase().includes(q) ||
        (a.roomCode && a.roomCode.includes(q))
      );
    }
    return true;
  });

  // Calculate statistics
  const totalPlays = attempts.length;
  const participatedStudents = new Set(attempts.map((a) => a.studentCode));
  const totalStudentsCount = students.length;
  const participationRate = totalStudentsCount > 0 ? Math.round((participatedStudents.size / totalStudentsCount) * 100) : 0;
  
  const avgScore = totalPlays > 0
    ? (attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalPlays).toFixed(1)
    : '0';

  const avgDuration = totalPlays > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.durationSeconds || 0), 0) / totalPlays)
    : 0;

  // Students who have NOT participated yet
  const notParticipatedStudents = students.filter((s) => !participatedStudents.has(s.code));

  // Class scores summary
  const classStats = classes.map((cls) => {
    const classAttempts = attempts.filter((a) => isMatchClass(a.className, cls.name) || isMatchClass(a.className, cls.id));
    const count = classAttempts.length;
    const avg = count > 0
      ? (classAttempts.reduce((sum, a) => sum + a.score, 0) / count).toFixed(1)
      : '0';
    return {
      classId: cls.name || cls.id,
      className: cls.name,
      totalAttempts: count,
      avgScore: Number(avg)
    };
  });

  const handleExportExcel = () => {
    excelService.exportAttempts(filteredAttempts);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#0878DC]/20 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B8E] font-serif flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-[#0878DC]" />
              <span>Thống Kê & Phân Tích Kết Quả Học Tập</span>
            </h2>
            <p className="text-slate-600 font-serif text-base mt-0.5">
              Dữ liệu thời gian thực bám sát từng lượt thi đấu của học sinh THPT Đan Phượng
            </p>
          </div>

          <button
            onClick={handleExportExcel}
            className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo Excel</span>
          </button>
        </div>

        {/* 8 Metric KPI Cards from Prompt Section 8 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
          <div className="bg-[#E0F2FE] p-3 rounded-2xl border border-blue-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Tổng học sinh</span>
            <strong className="text-xl font-bold text-[#0369A1]">{totalStudentsCount}</strong>
          </div>

          <div className="bg-[#DCFCE7] p-3 rounded-2xl border border-emerald-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Tổng số lớp</span>
            <strong className="text-xl font-bold text-[#15803D]">{classes.length}</strong>
          </div>

          <div className="bg-[#EDE9FE] p-3 rounded-2xl border border-purple-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Tổng số game</span>
            <strong className="text-xl font-bold text-[#6D28D9]">{games.length}</strong>
          </div>

          <div className="bg-[#FEF3C7] p-3 rounded-2xl border border-amber-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Tổng lượt chơi</span>
            <strong className="text-xl font-bold text-[#B45309]">{totalPlays}</strong>
          </div>

          <div className="bg-[#CFFAFE] p-3 rounded-2xl border border-cyan-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">HS đã tham gia</span>
            <strong className="text-xl font-bold text-[#0891B2]">{participatedStudents.size}</strong>
          </div>

          <div className="bg-[#FCE7F3] p-3 rounded-2xl border border-pink-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Tỷ lệ tham gia</span>
            <strong className="text-xl font-bold text-[#BE185D]">{participationRate}%</strong>
          </div>

          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Điểm trung bình</span>
            <strong className="text-xl font-bold text-[#0878DC]">{avgScore.replace('.', ',')}</strong>
          </div>

          <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Thời gian TB</span>
            <strong className="text-xl font-bold text-slate-700">{Math.floor(avgDuration / 60)}p {avgDuration % 60}s</strong>
          </div>
        </div>
      </div>

      {/* Interactive Charts Visual Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Average Score by Class (SVG Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#0878DC]/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-serif text-lg text-[#063B8E] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0878DC]" />
              <span>Điểm trung bình theo từng lớp</span>
            </h3>
            <span className="text-xs text-slate-500">Thang điểm 100</span>
          </div>

          <div className="space-y-3 pt-2">
            {classStats.map((item) => (
              <div key={item.classId} className="space-y-1">
                <div className="flex justify-between text-sm font-serif">
                  <span className="font-bold text-slate-700">{item.className}</span>
                  <span className="font-bold text-[#0878DC]">{item.avgScore} điểm ({item.totalAttempts} lượt)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00CFFF] to-[#0878DC] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, item.avgScore)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Grade distribution & Score Spectrum */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#0878DC]/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-serif text-lg text-[#063B8E] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#F59E0B]" />
              <span>Phân bố phổ điểm (Học lực)</span>
            </h3>
            <span className="text-xs text-slate-500">Toàn trường</span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center pt-4">
            {[
              { label: 'Xuất sắc (90-100)', count: attempts.filter((a) => a.score >= 90).length, color: 'bg-emerald-500' },
              { label: 'Giỏi (80-89)', count: attempts.filter((a) => a.score >= 80 && a.score < 90).length, color: 'bg-blue-500' },
              { label: 'Khá (65-79)', count: attempts.filter((a) => a.score >= 65 && a.score < 80).length, color: 'bg-cyan-500' },
              { label: 'TB (50-64)', count: attempts.filter((a) => a.score >= 50 && a.score < 65).length, color: 'bg-amber-500' },
              { label: 'Yếu (<50)', count: attempts.filter((a) => a.score < 50).length, color: 'bg-red-400' }
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-32 w-full flex items-end justify-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                  <div
                    className={`${b.color} w-8 rounded-t-lg transition-all duration-500 flex items-center justify-center text-white text-xs font-bold`}
                    style={{ height: `${Math.max(15, (b.count / Math.max(1, attempts.length)) * 100)}%` }}
                  >
                    {b.count}
                  </div>
                </div>
                <div className="text-[11px] font-bold text-slate-600 mt-2 leading-tight">{b.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tabs: Lịch sử từng lượt chơi / Chưa tham gia */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#0878DC]/20 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('attempts')}
              className={`px-4 py-2 rounded-xl font-bold font-serif text-sm cursor-pointer transition-all ${
                activeTab === 'attempts' ? 'bg-[#063B8E] text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-[#EAF5FF]'
              }`}
            >
              Lịch sử chi tiết lượt chơi ({filteredAttempts.length})
            </button>
            <button
              onClick={() => setActiveTab('not-participated')}
              className={`px-4 py-2 rounded-xl font-bold font-serif text-sm cursor-pointer transition-all ${
                activeTab === 'not-participated' ? 'bg-[#063B8E] text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-[#EAF5FF]'
              }`}
            >
              Học sinh chưa tham gia ({notParticipatedStudents.length})
            </button>
          </div>

          {/* Filter options */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1 text-sm bg-slate-50 font-serif"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map((c) => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1 text-sm bg-slate-50 font-serif max-w-[160px] truncate"
            >
              <option value="all">Tất cả trò chơi</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>

            <div className="relative w-44">
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Tìm tên, mã HS..."
                className="w-full bg-[#EAF5FF] border border-[#0878DC]/30 rounded-xl pl-8 pr-2 py-1 text-xs focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>
        </div>

        {/* Attempts Table */}
        {activeTab === 'attempts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-serif text-base">
              <thead className="bg-[#EAF5FF] text-[#063B8E] font-bold text-sm border-b-2 border-[#0878DC]/20">
                <tr>
                  <th className="py-3 px-3">Thời gian</th>
                  <th className="py-3 px-3">Mã HS</th>
                  <th className="py-3 px-3">Họ và tên</th>
                  <th className="py-3 px-3 text-center">Lớp</th>
                  <th className="py-3 px-3">Tên trò chơi</th>
                  <th className="py-3 px-3 text-center">Mã phòng</th>
                  <th className="py-3 px-3 text-center">Đúng/Sai</th>
                  <th className="py-3 px-3 text-center">Thời gian làm</th>
                  <th className="py-3 px-3 text-right">Điểm số</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAttempts.map((a) => (
                  <tr key={a.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3 text-slate-500 text-xs">
                      {new Date(a.endedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0878DC]">{a.studentCode}</td>
                    <td className="py-2.5 px-3 font-bold text-[#063B8E]">{a.studentName}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{a.className}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{a.gameTitle}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-xs text-slate-600">
                      {a.roomCode ? <span className="bg-blue-100 text-[#0878DC] px-2 py-0.5 rounded">{a.roomCode}</span> : 'Tự do'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-emerald-600 font-bold">{a.correctCount}</span> / <span className="text-red-500 font-bold">{a.incorrectCount}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{a.durationSeconds}s</td>
                    <td className="py-2.5 px-3 text-right font-black text-amber-600 text-base">{a.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Not Participated Table */}
        {activeTab === 'not-participated' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-serif text-base">
              <thead className="bg-red-50 text-red-900 font-bold text-sm border-b-2 border-red-200">
                <tr>
                  <th className="py-3 px-4">STT</th>
                  <th className="py-3 px-4">Mã học sinh</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4 text-center">Lớp</th>
                  <th className="py-3 px-4 text-center">Khối</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Nhắc nhở</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notParticipatedStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 text-sm">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{s.code}</td>
                    <td className="py-3 px-4 font-bold text-[#063B8E]">{s.name}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{s.classId}</td>
                    <td className="py-3 px-4 text-center">{s.grade}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        Chưa làm bài
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Đã gửi thông báo nhắc nhở làm bài đến học sinh ${s.name} (${s.classId})!`)}
                        className="text-xs bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold px-3 py-1 rounded-lg cursor-pointer shadow-xs"
                      >
                        Gửi nhắc nhở
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
