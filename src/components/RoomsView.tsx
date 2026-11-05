import React, { useState } from 'react';
import { 
  Swords, 
  Plus, 
  KeyRound, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Trophy
} from 'lucide-react';
import { GameRoom, GameItem, UserProfile, ClassItem, GameAttempt } from '../types';
import { api } from '../services/api';

interface RoomsViewProps {
  rooms: GameRoom[];
  games: GameItem[];
  classes: ClassItem[];
  currentUser: UserProfile;
  onJoinRoomGame: (room: GameRoom, game: GameItem) => void;
  onRoomCreated: (newRoom: GameRoom) => void;
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  rooms,
  games,
  classes,
  currentUser,
  onJoinRoomGame,
  onRoomCreated
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedRoom, setVerifiedRoom] = useState<GameRoom | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRoomForLeaderboard, setSelectedRoomForLeaderboard] = useState<{
    room: GameRoom;
    leaderboard: GameAttempt[];
  } | null>(null);

  // New room form state
  const [newTitle, setNewTitle] = useState('');
  const [selectedGameId, setSelectedGameId] = useState(games[0]?.id || '');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['12A3', '12A4', '12A14']);
  const [startTime, setStartTime] = useState(new Date().toISOString().substring(0, 16));
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 16)
  );
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [allowReplay, setAllowReplay] = useState(false);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setVerifiedRoom(null);

    if (!inputCode.trim()) {
      setErrorMsg('Vui lòng nhập mã phòng 6 chữ số.');
      return;
    }

    const res = await api.verifyRoom(inputCode.trim());
    if (res.success && res.room) {
      setVerifiedRoom(res.room);
    } else {
      setErrorMsg(res.message || 'Mã phòng không hợp lệ hoặc đã kết thúc!');
    }
  };

  const handleEnterRoom = (room: GameRoom) => {
    const game = games.find((g) => g.id === room.gameId) || games[0];
    onJoinRoomGame(room, game);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Vui lòng nhập tên phòng thi!');
      return;
    }

    const game = games.find((g) => g.id === selectedGameId);

    const created = await api.createRoom({
      title: newTitle,
      gameId: selectedGameId,
      gameTitle: game ? game.title : 'Trò chơi Toán học',
      classes: selectedClasses,
      startTime,
      endTime,
      maxAttempts,
      allowReplay,
      status: 'active',
      createdBy: currentUser.name || 'Thầy Bùi Ngọc Thắng'
    });

    if (created) {
      onRoomCreated(created);
      setIsCreating(false);
      setNewTitle('');
      alert(`Đã tạo phòng thi thành công! Mã phòng là: ${created.code}`);
    }
  };

  const toggleClassSelect = (clsId: string) => {
    if (selectedClasses.includes(clsId)) {
      setSelectedClasses(selectedClasses.filter((c) => c !== clsId));
    } else {
      setSelectedClasses([...selectedClasses, clsId]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Room Search */}
      <div className="bg-gradient-to-r from-[#063B8E] via-[#0878DC] to-[#063B8E] text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-[#00CFFF]/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#00CFFF]/20 border border-[#00CFFF]/50 text-[#00CFFF] px-3 py-1 rounded-full text-sm font-semibold tracking-wide mb-2">
            <Swords className="w-4 h-4 text-[#FFDE59]" />
            <span>Đấu trường trực tuyến • THPT Đan Phượng</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">
            Phòng Thi Đấu & Kiểm Tra Trực Tuyến
          </h2>
          <p className="text-[#E0F2FE] text-base sm:text-lg font-serif mt-1">
            Nhập mã phòng từ giáo viên để tham gia tranh tài cùng bạn bè cùng lớp!
          </p>
        </div>

        {/* Action Button for Teacher */}
        {currentUser.role === 'teacher' && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-[#FF9800] hover:bg-[#F57C00] text-white font-bold px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 shrink-0 cursor-pointer text-base transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo phòng thi mới</span>
          </button>
        )}
      </div>

      {/* Student Enter Code Box */}
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border-4 border-[#0878DC] p-6 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#EAF5FF] mx-auto flex items-center justify-center text-[#0878DC] mb-3">
          <KeyRound className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold font-serif text-[#063B8E] mb-1">
          Tham gia bằng mã phòng
        </h3>
        <p className="text-slate-600 text-sm font-serif mb-5">
          Nhập mã 6 chữ số do Thầy Bùi Ngọc Thắng hoặc giáo viên bộ môn cung cấp
        </p>

        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="flex gap-2 justify-center">
            <input
              type="text"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Ví dụ: 864219"
              className="text-center tracking-widest text-2xl sm:text-3xl font-mono font-bold w-64 py-2.5 px-4 rounded-xl border-2 border-slate-300 focus:border-[#0878DC] focus:outline-none bg-slate-50 shadow-inner"
            />
            <button
              type="submit"
              className="bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold px-6 rounded-xl shadow cursor-pointer text-base font-serif"
            >
              Vào phòng
            </button>
          </div>

          {errorMsg && (
            <div className="text-red-600 text-sm font-bold flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>

        {/* Verified Room Preview Modal/Card */}
        {verifiedRoom && (
          <div className="mt-6 p-5 bg-[#EAF5FF] rounded-2xl border-2 border-[#00CFFF] text-left animate-in fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#063B8E] text-white px-2.5 py-0.5 rounded-full">
                Mã phòng: {verifiedRoom.code}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hợp lệ
              </span>
            </div>

            <h4 className="text-xl font-bold font-serif text-[#063B8E]">
              {verifiedRoom.title}
            </h4>
            <div className="text-sm text-slate-700 mt-1 space-y-1 font-serif">
              <div>🎯 Trò chơi: <strong>{verifiedRoom.gameTitle}</strong></div>
              <div>👥 Dành cho lớp: <strong>{verifiedRoom.classes.join(', ')}</strong></div>
              <div>📅 Hạn chót: <strong>{new Date(verifiedRoom.endTime).toLocaleString('vi-VN')}</strong></div>
              <div>🔄 Lượt chơi cho phép: <strong>{verifiedRoom.maxAttempts} lần</strong></div>
            </div>

            <button
              onClick={() => handleEnterRoom(verifiedRoom)}
              className="w-full mt-4 bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer font-serif text-lg"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Bắt đầu thi đấu ngay</span>
            </button>
          </div>
        )}
      </div>

      {/* List of Active Rooms */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#0878DC]/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Swords className="w-6 h-6 text-[#0878DC]" />
            <h3 className="text-2xl font-bold font-serif text-[#063B8E]">
              Danh sách phòng thi đấu đang mở ({rooms.length})
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="p-5 rounded-2xl border-2 border-slate-200 hover:border-[#0878DC] bg-slate-50/50 hover:bg-white transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg text-[#0878DC] bg-blue-100 px-3 py-1 rounded-xl">
                  Mã: {room.code}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  {room.status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'}
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold font-serif text-[#063B8E] leading-snug">
                  {room.title}
                </h4>
                <p className="text-sm text-slate-600 font-medium mt-0.5">
                  Bộ đề: {room.gameTitle}
                </p>
              </div>

              <div className="text-xs text-slate-500 space-y-1 font-serif">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lớp: {room.classes.join(', ')} • {room.participantsCount || 0} học sinh đã nộp bài</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hạn kết thúc: {new Date(room.endTime).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={async () => {
                    const ldr = await api.getRoomLeaderboard(room.code);
                    setSelectedRoomForLeaderboard({ room, leaderboard: ldr });
                  }}
                  className="py-2.5 px-3 border border-[#0878DC] text-[#0878DC] hover:bg-blue-50 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Bảng điểm ({room.participantsCount || 0})</span>
                </button>

                <button
                  onClick={() => handleEnterRoom(room)}
                  className="py-2.5 px-3 bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Vào thi đấu</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Leaderboard Modal */}
      {selectedRoomForLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-[#0878DC] shadow-2xl animate-in zoom-in-95 font-serif">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-xl font-bold text-[#063B8E]">
                  Bảng điểm: {selectedRoomForLeaderboard.room.title}
                </h3>
                <span className="text-xs text-slate-500">Mã phòng: {selectedRoomForLeaderboard.room.code}</span>
              </div>
              <button
                onClick={() => setSelectedRoomForLeaderboard(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {selectedRoomForLeaderboard.leaderboard.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                Chưa có học sinh nào hoàn thành bài thi trong phòng này.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2">
                {selectedRoomForLeaderboard.leaderboard.map((a, i) => (
                  <div key={a.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#063B8E] text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-bold text-[#063B8E]">{a.studentName}</div>
                        <div className="text-xs text-slate-500">{a.className} • {a.durationSeconds}s</div>
                      </div>
                    </div>
                    <span className="font-bold text-amber-600 text-base">{a.score} điểm</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRoomForLeaderboard(null)}
                className="px-5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm cursor-pointer hover:bg-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Room (Giáo viên) */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border-4 border-[#0878DC] shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-bold font-serif text-[#063B8E] mb-4">
              Tạo phòng thi đấu Toán học mới
            </h3>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Tên phòng thi / đợt kiểm tra:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Thi đấu giải toán trắc nghiệm tuần 12 - Khối 11"
                  className="w-full border-2 border-slate-300 rounded-xl px-3.5 py-2 text-base focus:border-[#0878DC] focus:outline-none font-serif"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Chọn trò chơi / bộ đề thi:
                </label>
                <select
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-base focus:border-[#0878DC] focus:outline-none font-serif cursor-pointer"
                >
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.questionsCount} câu - {g.durationMinutes} phút)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Chọn các lớp tham gia:
                </label>
                <div className="flex flex-wrap gap-2">
                  {classes.map((cls) => {
                    const cKey = cls.name || cls.id;
                    return (
                      <button
                        type="button"
                        key={cKey}
                        onClick={() => toggleClassSelect(cKey)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          selectedClasses.includes(cKey)
                            ? 'bg-[#063B8E] text-white border-[#063B8E]'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {cls.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bắt đầu:
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kết thúc:
                  </label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-sm font-bold text-slate-700">
                  Cho phép học sinh chơi lại:
                </div>
                <input
                  type="checkbox"
                  checked={allowReplay}
                  onChange={(e) => setAllowReplay(e.target.checked)}
                  className="w-5 h-5 text-[#0878DC] rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer font-serif"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold cursor-pointer font-serif shadow"
                >
                  Tạo phòng & Lấy mã
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
