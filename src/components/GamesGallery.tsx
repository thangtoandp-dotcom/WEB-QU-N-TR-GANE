import React, { useState, useEffect } from 'react';
import { 
  Play, 
  HelpCircle, 
  Clock, 
  Award, 
  Layers, 
  BookOpen, 
  Search, 
  X,
  Compass,
  Sparkles,
  UploadCloud,
  Maximize2,
  Presentation,
  FileCode,
  Globe,
  Volume2,
  VolumeX
} from 'lucide-react';
import { GameItem, GameCategory } from '../types';
import { GameUploadModal } from './common/GameUploadModal';
import { soundService } from '../services/soundService';

interface GamesGalleryProps {
  games: GameItem[];
  onPlayGame: (game: GameItem) => void;
  activeCategoryFilter?: string;
  defaultUploadCategory?: 'math' | 'entertainment';
  onGameUploaded?: (newGame: GameItem) => void;
  titleOverride?: string;
  subtitleOverride?: string;
}

export const GamesGallery: React.FC<GamesGalleryProps> = ({
  games,
  onPlayGame,
  activeCategoryFilter = 'all',
  defaultUploadCategory,
  onGameUploaded,
  titleOverride,
  subtitleOverride
}) => {
  const [selectedCat, setSelectedCat] = useState<string>(activeCategoryFilter);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [guideModalGame, setGuideModalGame] = useState<GameItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.isMuted());

  // Listen to sound state
  useEffect(() => {
    return soundService.subscribe((muted) => setIsMuted(muted));
  }, []);

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'trac-nghiem', label: 'Trắc nghiệm Toán' },
    { id: 'tu-duy', label: 'Tư duy & Trí tuệ' },
    { id: 'hinh-hoc', label: 'Game Hình học' },
    { id: 'tuong-tac', label: 'Game Tương tác' },
    { id: 'giai-tri', label: 'Giải trí thư giãn' }
  ];

  const filteredGames = games.filter((g) => {
    if (selectedCat !== 'all' && g.category !== selectedCat && selectedCat !== 'all-games') {
      if (selectedCat === 'math-games' && g.category === 'giai-tri') return false;
      if (selectedCat === 'fun-games' && g.category !== 'giai-tri' && g.category !== 'tuong-tac') return false;
      if (selectedCat !== 'math-games' && selectedCat !== 'fun-games' && g.category !== selectedCat) return false;
    }
    if (selectedGrade !== 'all') {
      if (g.grade !== 'all' && g.grade.toString() !== selectedGrade) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.title.toLowerCase().includes(q) ||
        g.topic.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uploadCategoryToUse: GameCategory = 
    defaultUploadCategory === 'entertainment' || selectedCat === 'giai-tri' || selectedCat === 'fun-games'
      ? 'giai-tri'
      : 'trac-nghiem';

  return (
    <div className="space-y-6">
      
      {/* Title & Filter Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-[#0878DC]/20 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B8E] font-serif flex items-center gap-2">
              <Compass className="w-7 h-7 text-[#0878DC]" />
              <span>{titleOverride || 'Kho Trò Chơi Toán Học & Trí Tuệ'}</span>
            </h2>
            <p className="text-slate-600 font-serif text-base mt-0.5">
              {subtitleOverride || `Hệ thống ${filteredGames.length} trò chơi bám sát chương trình Toán THPT Đan Phượng`}
            </p>
          </div>

          {/* Action buttons: Search & Upload File */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm trò chơi, chuyên đề..."
                className="w-full bg-[#EAF5FF] border border-[#0878DC]/40 rounded-xl pl-10 pr-4 py-2 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0878DC] font-serif"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow hover:shadow-lg transition-all cursor-pointer font-serif text-sm sm:text-base active:scale-95"
              title="Tải tệp game PowerPoint (.pptx), tệp HTML5 hoặc liên kết tương tác"
            >
              <UploadCloud className="w-5 h-5" />
              <span>
                {selectedCat === 'giai-tri' || defaultUploadCategory === 'entertainment'
                  ? 'Tải Game Giải trí lên'
                  : 'Tải file Game lên'}
              </span>
            </button>
          </div>
        </div>

        {/* Categories Pills & Grade Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3.5 py-1.5 rounded-full font-serif text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  selectedCat === cat.id
                    ? 'bg-[#063B8E] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-[#EAF5FF] hover:text-[#063B8E]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <span>Khối lớp:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1 font-serif focus:outline-none focus:ring-2 focus:ring-[#0878DC] cursor-pointer"
            >
              <option value="all">Tất cả các khối</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
              <option value="12">Khối 12</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fullscreen & Sound Effects Notice Banner for Kho Trò Chơi */}
      <div className="bg-gradient-to-r from-[#063B8E] via-[#0878DC] to-[#063B8E] text-white rounded-2xl p-3.5 sm:p-4 shadow-md border-2 border-[#00CFFF]/40 flex flex-col md:flex-row items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#FFDE59] shrink-0 border border-white/20 shadow-inner">
            <Maximize2 className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-base sm:text-lg text-[#FFDE59] font-serif leading-tight flex items-center gap-2">
              <span>Chế Độ Mở Rộng Toàn Màn Hình & Âm Thanh Sinh Động</span>
              <span className="text-xs bg-emerald-400 text-slate-950 font-sans px-2 py-0.5 rounded-full font-bold">
                Mới
              </span>
            </h4>
            <p className="text-xs sm:text-sm text-blue-100 font-serif">
              Tất cả trò chơi đều tích hợp hiệu ứng âm thanh (chuông đúng, báo sai, nhạc chiến thắng, vòng quay) và hỗ trợ mở rộng 100% màn hình máy tính!
            </p>
          </div>
        </div>

        {/* Quick controls: Sound Toggle & Shortcut hint */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const newMuted = soundService.toggleMute();
              if (!newMuted) soundService.playCorrect();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-sm active:scale-95 ${
              isMuted
                ? 'bg-red-500/20 text-red-200 border-red-400/50 hover:bg-red-500/30'
                : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/60 hover:bg-emerald-500/40'
            }`}
            title="Bật hoặc tắt âm thanh cho tất cả trò chơi"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-300" /> : <Volume2 className="w-4 h-4 text-emerald-300 animate-pulse" />}
            <span>{isMuted ? 'Âm thanh: Đang tắt' : 'Âm thanh: Đang bật'}</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono bg-black/30 px-3 py-1.5 rounded-xl border border-white/20 text-[#00CFFF]">
            <span>Toàn màn hình: <strong>F11</strong></span>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow border border-slate-200">
          <div className="text-5xl mb-2">🔍</div>
          <h3 className="text-xl font-bold font-serif text-[#063B8E]">Không tìm thấy trò chơi phù hợp</h3>
          <p className="text-slate-500 mt-1">Hãy thử tìm với từ khóa khác hoặc đổi bộ lọc khối lớp</p>
          <button
            onClick={() => { setSelectedCat('all'); setSelectedGrade('all'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 bg-[#0878DC] text-white font-bold rounded-xl cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-2xl shadow-md border-2 border-slate-200 hover:border-[#0878DC] overflow-hidden flex flex-col justify-between transition-all transform hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Card Banner / Color Accent */}
              <div 
                className="p-4 text-white relative overflow-hidden"
                style={{ backgroundColor: game.color || '#0878DC' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider bg-black/25 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                    {game.categoryName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {game.fileType === 'powerpoint' && (
                      <span className="text-[11px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Presentation className="w-3 h-3" /> PPTX
                      </span>
                    )}
                    {game.fileType === 'html' && (
                      <span className="text-[11px] font-bold bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <FileCode className="w-3 h-3" /> HTML5
                      </span>
                    )}
                    {game.fileType === 'embed' && (
                      <span className="text-[11px] font-bold bg-cyan-300 text-cyan-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Globe className="w-3 h-3" /> Trực tuyến
                      </span>
                    )}
                    <span className="text-xs font-bold bg-white text-slate-900 px-2.5 py-0.5 rounded-full shadow-sm">
                      {game.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold font-serif mt-2 line-clamp-1 drop-shadow-sm">
                  {game.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-white/90 mt-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="truncate">{game.topic}</span>
                </div>
              </div>

              {/* Card Content Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-slate-600 text-sm font-serif line-clamp-2 leading-relaxed">
                  {game.description}
                </p>

                {/* Specs Pill List */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <span className="text-slate-500 block">Số câu / Mục</span>
                    <strong className="text-[#063B8E] text-sm">{game.questionsCount || 10}</strong>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <span className="text-slate-500 block">Thời gian</span>
                    <strong className="text-amber-600 text-sm">{game.durationMinutes || 15} ph</strong>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <span className="text-slate-500 block">Điểm tối đa</span>
                    <strong className="text-emerald-600 text-sm">{game.maxScore || 100}</strong>
                  </div>
                </div>

                {/* Buttons: BẮT ĐẦU & XEM HƯỚNG DẪN */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setGuideModalGame(game)}
                    className="py-2.5 px-3 rounded-xl border border-slate-300 hover:border-[#0878DC] hover:bg-[#EAF5FF] text-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-[#0878DC]" />
                    <span>Hướng dẫn</span>
                  </button>

                  <button
                    onClick={() => onPlayGame(game)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#063B8E] to-[#0878DC] hover:from-[#052C6E] hover:to-[#0664B8] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all transform active:scale-95 group"
                    title="Mở rộng hết toàn màn hình máy tính để chơi"
                  >
                    <Maximize2 className="w-4 h-4 text-[#FFDE59] group-hover:scale-110 transition-transform" />
                    <span>Mở toàn màn hình</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guide Modal (Xem hướng dẫn) */}
      {guideModalGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border-4 border-[#0878DC] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <h3 className="text-xl font-bold font-serif text-[#063B8E]">
                  Hướng dẫn chơi: {guideModalGame.title}
                </h3>
              </div>
              <button
                onClick={() => setGuideModalGame(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-slate-700 font-serif text-base leading-relaxed">
              <div className="bg-[#EAF5FF] p-3.5 rounded-xl border border-[#0878DC]/20">
                <strong className="text-[#063B8E] block mb-1">Mục tiêu bài học:</strong>
                <p className="text-sm">{guideModalGame.description}</p>
              </div>

              <div>
                <strong className="text-[#063B8E] block mb-1">Quy định luật chơi:</strong>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Tổng số câu hỏi / slide: <strong>{guideModalGame.questionsCount || 10}</strong>.</li>
                  <li>Thời gian chơi: <strong>{guideModalGame.durationMinutes || 15} phút</strong>.</li>
                  <li>Điểm tối đa có thể đạt: <strong>{guideModalGame.maxScore || 100} điểm</strong>.</li>
                  <li>Hỗ trợ <strong>mở rộng hết màn hình máy tính (Full Screen)</strong> để tăng trải nghiệm học tập và giải trí.</li>
                  <li>Sau khi hoàn thành, hệ thống sẽ lưu điểm vào hồ sơ và cập nhật Bảng xếp hạng.</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                💡 <em>Lời khuyên từ Thầy Bùi Ngọc Thắng:</em> Bạn có thể nhấn nút <strong>Mở toàn màn hình</strong> để có không gian quan sát rộng nhất trên máy tính khi thi đấu hoặc giải trí!
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setGuideModalGame(null)}
                className="px-5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer font-serif"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  const g = guideModalGame;
                  setGuideModalGame(null);
                  onPlayGame(g);
                }}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#063B8E] to-[#0878DC] hover:from-[#052C6E] hover:to-[#0664B8] text-white font-bold cursor-pointer font-serif shadow flex items-center gap-2"
              >
                <Maximize2 className="w-4 h-4 text-[#FFDE59]" />
                <span>Mở chơi toàn màn hình</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Game Modal */}
      <GameUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultCategory={uploadCategoryToUse}
        onGameUploaded={(newGame) => {
          setIsUploadModalOpen(false);
          onGameUploaded?.(newGame);
        }}
      />

    </div>
  );
};
