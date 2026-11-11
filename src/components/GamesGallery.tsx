import React, { useState, useEffect, useMemo } from 'react';
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
  Video,
  Globe,
  Volume2,
  VolumeX,
  Star,
  Gamepad2,
  FolderOpen,
  CheckCircle2,
  Download,
  Trash2,
  Pencil,
  Save,
  Loader2,
  Film,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { GameItem, GameCategory, UserProfile } from '../types';
import { GameUploadModal } from './common/GameUploadModal';
import { soundService } from '../services/soundService';
import { api } from '../services/api';

interface GamesGalleryProps {
  games: GameItem[];
  currentUser?: UserProfile;
  onAdminLoginSuccess?: (profile: UserProfile) => void;
  onPlayGame: (game: GameItem) => void;
  activeCategoryFilter?: string;
  defaultUploadCategory?: 'math' | 'entertainment';
  onGameUploaded?: (newGame: GameItem) => void;
  onDeleteGame?: (gameId: string) => void;
  onUpdateGame?: (updated: GameItem) => void;
  titleOverride?: string;
  subtitleOverride?: string;
}

export type OriginFilterType = 'all' | 'default' | 'uploaded' | 'video' | 'powerpoint' | 'html';

export const GamesGallery: React.FC<GamesGalleryProps> = ({
  games,
  currentUser,
  onAdminLoginSuccess,
  onPlayGame,
  activeCategoryFilter = 'all',
  defaultUploadCategory,
  onGameUploaded,
  onDeleteGame,
  onUpdateGame,
  titleOverride,
  subtitleOverride
}) => {
  const [selectedCat, setSelectedCat] = useState<string>(activeCategoryFilter);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [originFilter, setOriginFilter] = useState<OriginFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [guideModalGame, setGuideModalGame] = useState<GameItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.isMuted());
  const [viewMode, setViewMode] = useState<'grouped' | 'grid'>('grouped');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Admin Verification State
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');
  const [pendingActionGame, setPendingActionGame] = useState<GameItem | null>(null);
  const [pendingActionType, setPendingActionType] = useState<'edit' | 'delete'>('edit');
  const [hasSessionAdmin, setHasSessionAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('toan_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const isUserAdmin = currentUser?.role === 'teacher' || hasSessionAdmin;

  // Edit Game Modal State
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<'Dễ' | 'Trung bình' | 'Khó' | 'Nâng cao'>('Trung bình');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Listen to sound state
  useEffect(() => {
    return soundService.subscribe((muted) => setIsMuted(muted));
  }, []);

  // Sync selected category whenever activeCategoryFilter prop changes (e.g. Tab navigation)
  useEffect(() => {
    setSelectedCat(activeCategoryFilter);
  }, [activeCategoryFilter]);

  const isMathModule = defaultUploadCategory === 'math' || (titleOverride && titleOverride.includes('Toán Học'));
  const isFunModule = defaultUploadCategory === 'entertainment' || (titleOverride && titleOverride.includes('Giải Trí'));

  const categories = isFunModule ? [
    { id: 'all', label: 'Tất cả chuyên mục giải trí' },
    { id: 'giai-tri', label: 'Giải trí & Phản xạ' },
    { id: 'tuong-tac', label: 'Tương tác & Đố vui' }
  ] : isMathModule ? [
    { id: 'all', label: 'Tất cả chuyên đề Toán' },
    { id: 'trac-nghiem', label: 'Trắc nghiệm Toán' },
    { id: 'tu-duy', label: 'Tư duy & Trí tuệ' },
    { id: 'hinh-hoc', label: 'Game Hình học' },
    { id: 'tuong-tac', label: 'Game Tương tác' }
  ] : [
    { id: 'all', label: 'Tất cả thể loại' },
    { id: 'trac-nghiem', label: 'Trắc nghiệm Toán' },
    { id: 'tu-duy', label: 'Tư duy & Trí tuệ' },
    { id: 'hinh-hoc', label: 'Game Hình học' },
    { id: 'tuong-tac', label: 'Game Tương tác' },
    { id: 'giai-tri', label: 'Giải trí thư giãn' }
  ];

  // Helper to determine if a game is built-in default
  const isDefaultGame = (g: GameItem): boolean => {
    if (g.isUploaded === true) return false;
    if (g.isDefault === false) return false;
    if (g.isDefault === true) return true;
    if (g.id.startsWith('game_upload_') || g.id.startsWith('game_custom_') || g.id.startsWith('game_') || g.id.startsWith('upload_')) return false;
    if (g.id.startsWith('g-uploaded-')) return false;
    if (g.fileUrl || g.fileName || g.fileType === 'powerpoint' || g.fileType === 'video') return false;
    return g.id.startsWith('g-');
  };

  const isVideoGame = (g: GameItem): boolean => {
    return g.fileType === 'video' || Boolean(g.fileUrl && /\.(mp4|webm|m4v)$/i.test(g.fileUrl)) || Boolean(g.fileName && /\.(mp4|webm|m4v)$/i.test(g.fileName));
  };

  const isPowerPointGame = (g: GameItem): boolean => {
    return g.fileType === 'powerpoint' || Boolean(g.fileUrl && /\.(ppt|pptx|ppsx)$/i.test(g.fileUrl)) || Boolean(g.fileName && /\.(ppt|pptx|ppsx)$/i.test(g.fileName));
  };

  const isHtmlGame = (g: GameItem): boolean => {
    if (isVideoGame(g) || isPowerPointGame(g)) return false;
    return g.fileType === 'html' || Boolean(g.embedCode) || Boolean(g.fileUrl && /\.(html|htm|htlm)$/i.test(g.fileUrl)) || Boolean(g.fileName && /\.(html|htm|htlm)$/i.test(g.fileName)) || g.id.startsWith('game_custom_');
  };

  // Counts for pills
  const totalDefaultCount = useMemo(() => games.filter(isDefaultGame).length, [games]);
  const totalUploadedCount = useMemo(() => games.filter((g) => !isDefaultGame(g)).length, [games]);
  const totalVideoCount = useMemo(() => games.filter(isVideoGame).length, [games]);
  const totalPptxCount = useMemo(() => games.filter(isPowerPointGame).length, [games]);
  const totalHtmlCount = useMemo(() => games.filter(isHtmlGame).length, [games]);

  // Main filter
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const isDef = isDefaultGame(g);

      // Origin Filter
      if (originFilter === 'default' && !isDef) return false;
      if (originFilter === 'uploaded' && isDef) return false;
      if (originFilter === 'video' && !isVideoGame(g)) return false;
      if (originFilter === 'powerpoint' && !isPowerPointGame(g)) return false;
      if (originFilter === 'html' && !isHtmlGame(g)) return false;

      // Category Filter
      if (selectedCat !== 'all' && g.category !== selectedCat && selectedCat !== 'all-games') {
        if (selectedCat === 'math-games' && g.category === 'giai-tri') return false;
        if (selectedCat === 'fun-games' && g.category !== 'giai-tri' && g.category !== 'tuong-tac') return false;
        if (selectedCat !== 'math-games' && selectedCat !== 'fun-games' && g.category !== selectedCat) return false;
      }

      // Grade Filter
      if (selectedGrade !== 'all') {
        if (g.grade !== 'all' && g.grade.toString() !== selectedGrade) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          g.title.toLowerCase().includes(q) ||
          g.topic.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          (g.authorName && g.authorName.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [games, originFilter, selectedCat, selectedGrade, searchQuery]);

  // Partition into default vs uploaded for grouped view
  const defaultFilteredGames = useMemo(() => filteredGames.filter(isDefaultGame), [filteredGames]);
  const uploadedFilteredGames = useMemo(() => filteredGames.filter(g => !isDefaultGame(g)), [filteredGames]);

  const uploadCategoryToUse: GameCategory = 
    defaultUploadCategory === 'entertainment' || selectedCat === 'giai-tri' || selectedCat === 'fun-games'
      ? 'giai-tri'
      : 'trac-nghiem';

  const handleRequestEdit = (game: GameItem) => {
    if (isUserAdmin) {
      setEditingGame(game);
      setEditTitle(game.title);
      setEditTopic(game.topic);
      setEditDifficulty(game.difficulty);
    } else {
      setPendingActionGame(game);
      setPendingActionType('edit');
      setAdminPasswordInput('');
      setShowAdminPassword(false);
      setAdminAuthError('');
      setIsAdminAuthModalOpen(true);
    }
  };

  const handleRequestDelete = (game: GameItem) => {
    if (isUserAdmin) {
      handleDeleteGame(game);
    } else {
      setPendingActionGame(game);
      setPendingActionType('delete');
      setAdminPasswordInput('');
      setShowAdminPassword(false);
      setAdminAuthError('');
      setIsAdminAuthModalOpen(true);
    }
  };

  const handleVerifyAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError('');
    const entered = adminPasswordInput.trim();
    if (!entered) {
      setAdminAuthError('Vui lòng nhập mật khẩu quản trị viên.');
      return;
    }

    let isSuccess = false;
    if (entered === '768306') {
      isSuccess = true;
    } else {
      try {
        const res = await api.teacherLogin(entered);
        if (res.success) {
          isSuccess = true;
        }
      } catch {}
    }

    if (isSuccess) {
      try {
        sessionStorage.setItem('toan_admin_auth', 'true');
      } catch {}
      setHasSessionAdmin(true);

      const adminProfile: UserProfile = {
        id: 'T-BNT',
        name: 'Thầy Bùi Ngọc Thắng',
        role: 'teacher',
        school: 'Trường THPT Đan Phượng'
      };
      if (onAdminLoginSuccess) {
        onAdminLoginSuccess(adminProfile);
      }

      soundService.playCorrect();
      setIsAdminAuthModalOpen(false);

      if (pendingActionType === 'edit' && pendingActionGame) {
        const g = pendingActionGame;
        setPendingActionGame(null);
        setEditingGame(g);
        setEditTitle(g.title);
        setEditTopic(g.topic);
        setEditDifficulty(g.difficulty);
      } else if (pendingActionType === 'delete' && pendingActionGame) {
        const toDel = pendingActionGame;
        setPendingActionGame(null);
        handleDeleteGame(toDel);
      }
    } else {
      setAdminAuthError('Mật khẩu quản trị viên chưa chính xác! Vui lòng nhập đúng mật khẩu.');
    }
  };

  const handleDeleteGame = async (game: GameItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa trò chơi "${game.title}" khỏi Kho trò chơi?`)) {
      return;
    }
    setDeletingId(game.id);
    try {
      const success = await api.deleteGame(game.id);
      if (success) {
        soundService.playCorrect();
        if (onDeleteGame) {
          onDeleteGame(game.id);
        }
      } else {
        alert('Không thể xóa trò chơi. Vui lòng thử lại!');
      }
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame || !editTitle.trim()) return;

    setIsSavingEdit(true);
    try {
      const updates: Partial<GameItem> = {
        title: editTitle.trim(),
        topic: editTopic.trim(),
        difficulty: editDifficulty
      };

      const updated = await api.updateGame(editingGame.id, updates);
      soundService.playCorrect();
      
      const mergedUpdated: GameItem = {
        ...editingGame,
        ...updates
      };

      if (onUpdateGame) {
        onUpdateGame(mergedUpdated);
      }
      setEditingGame(null);
    } catch (err: any) {
      alert('Lỗi cập nhật tên trò chơi: ' + err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Render a single game card
  const renderGameCard = (game: GameItem) => {
    const isDef = isDefaultGame(game);
    const isVid = isVideoGame(game);
    const isPpt = isPowerPointGame(game);
    const isHtm = isHtmlGame(game);

    const cardColor = isVid 
      ? '#7C3AED' 
      : isPpt 
      ? '#EA580C' 
      : isHtm
      ? '#059669'
      : game.color || (isDef ? '#0878DC' : '#0369A1');

    return (
      <div
        key={game.id}
        className={`bg-white rounded-2xl shadow-md overflow-hidden flex flex-col justify-between transition-all transform hover:-translate-y-1 hover:shadow-xl ${
          isDef 
            ? 'border-2 border-amber-400 ring-2 ring-amber-300/30' 
            : isVid
            ? 'border-2 border-purple-300 hover:border-purple-600'
            : isPpt
            ? 'border-2 border-orange-300 hover:border-orange-600'
            : isHtm
            ? 'border-2 border-emerald-300 hover:border-emerald-600'
            : 'border-2 border-slate-200 hover:border-[#0878DC]'
        }`}
      >
        {/* Card Header / Banner - Clickable to open game */}
        <div 
          onClick={() => onPlayGame(game)}
          className="p-4 text-white relative overflow-hidden cursor-pointer group/card transition-opacity hover:opacity-95"
          style={{ backgroundColor: cardColor }}
          title="Bấm để mở và chơi trò chơi này"
        >
          {/* Top badges */}
          <div className="flex items-center justify-between mb-1 gap-1 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider bg-black/30 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              {game.categoryName}
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Distinct Badge for Default vs Uploaded */}
              {isDef ? (
                <span className="text-[11px] font-extrabold bg-gradient-to-r from-amber-300 to-yellow-400 text-slate-950 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-amber-500/30">
                  <Star className="w-3 h-3 text-amber-950 fill-amber-950 animate-pulse" /> Mặc định hệ thống
                </span>
              ) : (
                <span className="text-[11px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <UploadCloud className="w-3 h-3" /> Tệp tải lên
                </span>
              )}

              {/* Format Badges: MP4, PPTX, HTML5 */}
              {isVid && (
                <span className="text-[11px] font-bold bg-purple-950/80 text-purple-200 border border-purple-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Video className="w-3 h-3 text-purple-300" /> MP4 Video
                </span>
              )}
              {isPpt && (
                <span className="text-[11px] font-bold bg-orange-950/80 text-orange-200 border border-orange-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Presentation className="w-3 h-3 text-orange-300" /> PPTX
                </span>
              )}
              {isHtm && (
                <span className="text-[11px] font-bold bg-emerald-950/80 text-emerald-200 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <FileCode className="w-3 h-3 text-emerald-300" /> HTML5
                </span>
              )}
              {game.fileType === 'embed' && (
                <span className="text-[11px] font-bold bg-cyan-300 text-cyan-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Globe className="w-3 h-3" /> Trực tuyến
                </span>
              )}

              {/* File size tag */}
              {game.fileSize && (
                <span className="text-[10px] font-mono bg-black/40 text-white/90 px-1.5 py-0.5 rounded">
                  {game.fileSize}
                </span>
              )}

              <span className="text-xs font-bold bg-white text-slate-900 px-2.5 py-0.5 rounded-full shadow-sm">
                {game.difficulty}
              </span>
            </div>
          </div>

          <h3 className="text-xl font-bold font-serif mt-2 line-clamp-1 drop-shadow-sm flex items-center gap-1.5 group-hover/card:text-[#FFDE59] transition-colors">
            {isDef && <Star className="w-4 h-4 text-[#FFDE59] fill-[#FFDE59] shrink-0" />}
            {isVid && <Video className="w-4 h-4 text-purple-200 shrink-0" />}
            {isPpt && <Presentation className="w-4 h-4 text-orange-200 shrink-0" />}
            <span title={game.title}>{game.title}</span>
          </h3>

          <div className="flex items-center justify-between text-xs text-white/90 mt-1">
            <div className="flex items-center gap-1.5 truncate max-w-[70%]">
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{game.topic}</span>
            </div>
            {game.grade && (
              <span className="bg-black/20 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">
                {game.grade === 'all' ? 'Khối 10-12' : `Khối ${game.grade}`}
              </span>
            )}
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
              <span className="text-slate-500 block text-[11px]">Số câu / Mục</span>
              <strong className="text-[#063B8E] text-sm">{game.questionsCount || 10}</strong>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Thời gian</span>
              <strong className="text-amber-600 text-sm">{game.durationMinutes || 15} ph</strong>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Điểm tối đa</span>
              <strong className="text-emerald-600 text-sm">{game.maxScore || 100}</strong>
            </div>
          </div>

          {/* Author info note & File actions */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Tác giả: <strong className="text-slate-700">{game.authorName || (isDef ? 'Hệ thống TOAN GAME HUB' : 'Thầy Bùi Ngọc Thắng')}</strong></span>
            
            <div className="flex items-center gap-1.5">
              {/* Edit game title button - Protected: Only Admin (Password 768306) */}
              <button
                onClick={() => handleRequestEdit(game)}
                className={`p-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  isUserAdmin
                    ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                    : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                }`}
                title={isUserAdmin ? "Chỉnh sửa trò chơi (Quyền Quản trị viên)" : "Chỉnh sửa trò chơi (Yêu cầu mật khẩu Quản trị viên)"}
              >
                <Pencil className="w-3.5 h-3.5" />
                {!isUserAdmin && <Lock className="w-2.5 h-2.5 text-amber-500" />}
              </button>

              {/* Download original file if available */}
              {game.fileUrl && (
                <a
                  href={game.fileUrl}
                  download={game.fileName || 'game-file'}
                  className="text-slate-600 hover:text-[#0878DC] p-1 rounded-md hover:bg-slate-100 transition-colors"
                  title="Tải file game này về máy tính"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Delete button if uploaded game - Protected */}
              {!isDef && (
                <button
                  onClick={() => handleRequestDelete(game)}
                  disabled={deletingId === game.id}
                  className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                  title={isUserAdmin ? "Xóa tệp game này khỏi Kho trò chơi" : "Xóa trò chơi (Yêu cầu Quản trị viên)"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {isDef && (
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Tích hợp sẵn
                </span>
              )}
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
              className={`py-2.5 px-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all transform active:scale-95 group ${
                isDef 
                  ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-[#0878DC] hover:from-amber-700 hover:to-[#052C6E]' 
                  : isVid
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700'
                  : isPpt
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
                  : isHtm
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  : 'bg-gradient-to-r from-[#063B8E] to-[#0878DC] hover:from-[#052C6E] hover:to-[#0664B8]'
              }`}
              title="Mở rộng hết toàn màn hình máy tính để chơi"
            >
              <Maximize2 className="w-4 h-4 text-[#FFDE59] group-hover:scale-110 transition-transform" />
              <span>{isVid ? 'Xem & Chơi Video' : isPpt ? 'Trình chiếu PowerPoint' : isHtm ? 'Chơi Game HTML5' : isDef ? 'Chơi Mặc Định' : 'Mở toàn màn hình'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Title & Filter Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-[#0878DC]/20 space-y-4">
        
        {/* Header row: Title & Action buttons */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B8E] font-serif flex items-center gap-2">
              <Compass className="w-7 h-7 text-[#0878DC]" />
              <span>{titleOverride || 'Kho Trò Chơi Toán Học & Trí Tuệ'}</span>
            </h2>
            <p className="text-slate-600 font-serif text-base mt-0.5">
              {subtitleOverride || `Hệ thống ${filteredGames.length} trò chơi bám sát chương trình Toán THPT Đan Phượng (${totalDefaultCount} game mặc định + ${totalUploadedCount} file tải lên)`}
            </p>
          </div>

          {/* Search Box & Upload Button */}
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
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow hover:shadow-lg transition-all cursor-pointer font-serif text-sm sm:text-base active:scale-95 shrink-0"
              title="Tải lên tệp Game định dạng .html (.htlm), .ppt, .pptx, hoặc .mp4"
            >
              <UploadCloud className="w-5 h-5" />
              <span>Tải file Game lên</span>
            </button>
          </div>
        </div>

        {/* Upload Success Alert Banner */}
        {uploadSuccessMsg && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-950 font-serif flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-base text-emerald-950">
                  {uploadSuccessMsg}
                </p>
                <p className="text-xs text-emerald-800 font-sans">
                  Tệp trò chơi đã được lưu vĩnh viễn vào hệ thống và hiển thị ngay tại mục <strong>Kho Tệp Game Đã Tải Lên & Lưu Trữ</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setUploadSuccessMsg('')}
              className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold font-sans cursor-pointer whitespace-nowrap"
            >
              Đóng ✕
            </button>
          </div>
        )}

        {/* Feature Notice Bar: Upload formats supported */}
        <div className="p-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs sm:text-sm font-serif">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-600 text-white font-bold text-xs">MỚI</span>
            <span className="text-slate-700">
              Phân hệ <strong>Kho trò chơi</strong> hỗ trợ tải lên và lưu trữ các tệp: 
              <span className="font-bold text-emerald-700 ml-1">.html (.htlm)</span>, 
              <span className="font-bold text-orange-700 ml-1">.ppt, .pptx</span> và 
              <span className="font-bold text-purple-700 ml-1">.mp4</span>. Mọi tệp tải lên được lưu giữ vĩnh viễn và trình chiếu toàn màn hình.
            </span>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer shrink-0"
          >
            + Tải file ngay
          </button>
        </div>

        {/* Origin / Source Selector (Default Games vs Uploaded Games) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-600 mr-1 flex items-center gap-1">
              <FolderOpen className="w-4 h-4 text-[#0878DC]" /> Phân loại nguồn:
            </span>

            {/* ALL */}
            <button
              onClick={() => setOriginFilter('all')}
              className={`px-3 py-1.5 rounded-full font-serif text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                originFilter === 'all'
                  ? 'bg-[#063B8E] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-[#EAF5FF] hover:text-[#063B8E]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tất cả ({games.length})</span>
            </button>

            {/* DEFAULT GAMES FILTER */}
            <button
              onClick={() => setOriginFilter('default')}
              className={`px-3.5 py-1.5 rounded-full font-serif text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                originFilter === 'default'
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-300 font-extrabold'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
              title="Hiển thị riêng các trò chơi mặc định có sẵn của hệ thống"
            >
              <Star className="w-3.5 h-3.5 text-amber-950 fill-amber-950" />
              <span>⭐ Trò chơi Mặc định ({totalDefaultCount})</span>
            </button>

            {/* UPLOADED GAMES FILTER */}
            <button
              onClick={() => setOriginFilter('uploaded')}
              className={`px-3 py-1.5 rounded-full font-serif text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                originFilter === 'uploaded'
                  ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-2 ring-teal-300 font-extrabold'
                  : 'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100'
              }`}
              title="Hiển thị tất cả các tệp trò chơi đã tải lên và lưu trữ trong Kho trò chơi"
            >
              <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
              <span>📁 File Game Tải lên ({totalUploadedCount})</span>
            </button>

            {/* VIDEO MP4 FILTER */}
            {totalVideoCount > 0 && (
              <button
                onClick={() => setOriginFilter('video')}
                className={`px-3 py-1.5 rounded-full font-serif text-xs sm:text-sm font-bold transition-all cursor-pointer items-center gap-1.5 border flex ${
                  originFilter === 'video'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300 font-extrabold'
                    : 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                }`}
                title="Lọc các tệp Video Game định dạng .mp4"
              >
                <Video className="w-3.5 h-3.5 text-purple-600" />
                <span>🎬 Video MP4 ({totalVideoCount})</span>
              </button>
            )}

            {/* PPTX FILTER */}
            {totalPptxCount > 0 && (
              <button
                onClick={() => setOriginFilter('powerpoint')}
                className={`px-3 py-1.5 rounded-full font-serif text-xs sm:text-sm font-bold transition-all cursor-pointer items-center gap-1.5 border flex ${
                  originFilter === 'powerpoint'
                    ? 'bg-orange-600 text-white border-orange-700 shadow-md ring-2 ring-orange-300 font-extrabold'
                    : 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100'
                }`}
                title="Lọc các tệp bài giảng PowerPoint (.ppt, .pptx)"
              >
                <Presentation className="w-3.5 h-3.5 text-orange-600" />
                <span>PowerPoint ({totalPptxCount})</span>
              </button>
            )}

            {/* HTML FILTER */}
            {totalHtmlCount > 0 && (
              <button
                onClick={() => setOriginFilter('html')}
                className={`px-3 py-1.5 rounded-full font-serif text-xs sm:text-sm font-bold transition-all cursor-pointer items-center gap-1.5 border flex ${
                  originFilter === 'html'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 font-extrabold'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                }`}
                title="Lọc các tệp trò chơi HTML (.html, .htlm)"
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>HTML5 ({totalHtmlCount})</span>
              </button>
            )}
          </div>

          {/* View Mode Toggle (Grouped vs Grid) */}
          {originFilter === 'all' && !searchQuery.trim() && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold font-serif">
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grouped'
                    ? 'bg-white text-[#063B8E] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hiển thị phân tách nhóm Game Mặc định và Game Tải lên"
              >
                Theo nhóm
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#063B8E] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hiển thị tất cả trên cùng một lưới"
              >
                Tất cả lưới
              </button>
            </div>
          )}
        </div>

        {/* Categories Pills & Grade Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1 rounded-full font-serif text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedCat === cat.id
                    ? 'bg-[#0878DC] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-[#EAF5FF] hover:text-[#063B8E]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
            <span>Khối lớp:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-serif focus:outline-none focus:ring-2 focus:ring-[#0878DC] cursor-pointer"
            >
              <option value="all">Tất cả các khối</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
              <option value="12">Khối 12</option>
            </select>
          </div>
        </div>

      </div>

      {/* 2. Fullscreen & Sound Effects Notice Banner for Kho Trò Chơi */}
      <div className="bg-gradient-to-r from-[#063B8E] via-[#0878DC] to-[#063B8E] text-white rounded-2xl p-3.5 sm:p-4 shadow-md border-2 border-[#00CFFF]/40 flex flex-col md:flex-row items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#FFDE59] shrink-0 border border-white/20 shadow-inner">
            <Maximize2 className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-base sm:text-lg text-[#FFDE59] font-serif leading-tight flex items-center gap-2">
              <span>Chế Độ Mở Rộng Toàn Màn Hình & Tương Tác Sống Động</span>
              <span className="text-xs bg-emerald-400 text-slate-950 font-sans px-2 py-0.5 rounded-full font-bold">
                Mới
              </span>
            </h4>
            <p className="text-xs sm:text-sm text-blue-100 font-serif">
              Tất cả các trò chơi mặc định và tệp tải lên (.html, .ppt, .pptx, .mp4) đều hỗ trợ mở rộng 100% màn hình máy tính và có âm thanh vui nhộn!
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

      {/* 3. Main Games Display (Grouped or Flat Grid) */}
      {filteredGames.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow border border-slate-200">
          <div className="text-5xl mb-2">🔍</div>
          <h3 className="text-xl font-bold font-serif text-[#063B8E]">Không tìm thấy trò chơi phù hợp</h3>
          <p className="text-slate-500 mt-1">Hãy thử đổi nguồn trò chơi (Mặc định / Tải lên / Video / PowerPoint / HTML) hoặc từ khóa tìm kiếm</p>
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => { 
                setOriginFilter('all'); 
                setSelectedCat('all'); 
                setSelectedGrade('all'); 
                setSearchQuery(''); 
              }}
              className="px-5 py-2.5 bg-[#0878DC] hover:bg-[#063B8E] text-white font-bold rounded-xl cursor-pointer transition-colors shadow"
            >
              Đặt lại tất cả bộ lọc
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer transition-colors shadow flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Tải file Game lên</span>
            </button>
          </div>
        </div>
      ) : originFilter === 'all' && !searchQuery.trim() && viewMode === 'grouped' ? (
        <div className="space-y-10">
          
          {/* SECTION 1: DEFAULT SYSTEM GAMES */}
          {defaultFilteredGames.length > 0 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 p-4 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-amber-950 shadow-sm shrink-0">
                    <Star className="w-6 h-6 fill-amber-950" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-serif flex items-center gap-2">
                      <span>Trò Chơi Mặc Định Hệ Thống</span>
                      <span className="text-xs bg-amber-600 text-white font-sans px-2.5 py-0.5 rounded-full font-bold">
                        {defaultFilteredGames.length} trò chơi
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-900 font-serif">
                      Các trò chơi tương tác tích hợp sẵn: Ai là triệu phú, Vòng quay may mắn, Trắc nghiệm 4 đáp án, Tính nhanh 60s, Sudoku, Hình học Oxyz, Video thử thách...
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOriginFilter('default')}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm font-serif cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
                >
                  Chỉ xem Game mặc định →
                </button>
              </div>

              {/* Grid of Default Games */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {defaultFilteredGames.map(renderGameCard)}
              </div>
            </div>
          )}

          {/* SECTION 2: UPLOADED GAMES (PowerPoint, HTML5, Video Game MP4) */}
          {uploadedFilteredGames.length > 0 && (
            <div className="space-y-4 pt-4 border-t-2 border-slate-200/80">
              <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-teal-100 p-4 rounded-2xl border-2 border-teal-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shrink-0">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-teal-950 font-serif flex items-center gap-2">
                      <span>Kho Tệp Game Đã Tải Lên & Lưu Trữ</span>
                      <span className="text-xs bg-teal-700 text-white font-sans px-2.5 py-0.5 rounded-full font-bold">
                        {uploadedFilteredGames.length} trò chơi
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-teal-900 font-serif">
                      Bao gồm tệp Video Game (.mp4), bài giảng PowerPoint (.ppt, .pptx) và trò chơi tương tác Web (.html, .htlm)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm font-serif cursor-pointer shadow-xs whitespace-nowrap active:scale-95 flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Tải thêm</span>
                  </button>
                  <button
                    onClick={() => setOriginFilter('uploaded')}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm font-serif cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
                  >
                    Chỉ xem Game tải lên →
                  </button>
                </div>
              </div>

              {/* Grid of Uploaded Games */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {uploadedFilteredGames.map(renderGameCard)}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Flat Grid View (When filtered or in grid mode) */
        <div className="space-y-4">
          {/* Filter Status Bar */}
          <div className="flex items-center justify-between text-sm font-serif text-slate-600 px-1">
            <span>
              Đang hiển thị <strong>{filteredGames.length}</strong> trò chơi
              {originFilter === 'default' && ' (Chỉ các Game mặc định hệ thống)'}
              {originFilter === 'uploaded' && ' (Chỉ các File game tải lên lưu trữ)'}
              {originFilter === 'video' && ' (Chỉ các Video Game định dạng .mp4)'}
              {originFilter === 'powerpoint' && ' (Chỉ các Game PowerPoint .ppt, .pptx)'}
              {originFilter === 'html' && ' (Chỉ các Game HTML .html, .htlm)'}
              {searchQuery && ` phù hợp với "${searchQuery}"`}
            </span>
            {originFilter !== 'all' && (
              <button
                onClick={() => setOriginFilter('all')}
                className="text-[#0878DC] hover:underline font-bold cursor-pointer text-xs sm:text-sm"
              >
                ← Xem tất cả các trò chơi ({games.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGames.map(renderGameCard)}
          </div>
        </div>
      )}

      {/* 4. Guide Modal (Xem hướng dẫn) */}
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
                  <li>Loại tệp: <strong>{isVideoGame(guideModalGame) ? 'Video MP4 Tương Tác' : isPowerPointGame(guideModalGame) ? 'Bài Giảng PowerPoint (.ppt, .pptx)' : 'Trò chơi Web HTML5'}</strong>.</li>
                  <li>Số mục / câu hỏi: <strong>{guideModalGame.questionsCount || 10}</strong>.</li>
                  <li>Thời gian chơi: <strong>{guideModalGame.durationMinutes || 15} phút</strong>.</li>
                  <li>Điểm tối đa có thể đạt: <strong>{guideModalGame.maxScore || 100} điểm</strong>.</li>
                  <li>Hỗ trợ <strong>mở rộng toàn màn hình máy tính</strong> để tăng trải nghiệm học tập và giải trí.</li>
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

      {/* 5. Upload Game Modal */}
      <GameUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onGameUploaded={(newGame) => {
          setIsUploadModalOpen(false);
          setOriginFilter('all');
          setSelectedCat('all');
          setSelectedGrade('all');
          setSearchQuery('');
          setUploadSuccessMsg(`Tải lên thành công! Tệp "${newGame.title}" đã được lưu an toàn vào Kho trò chơi.`);
          onGameUploaded?.(newGame);
        }}
      />

      {/* 6. Admin Password Verification Modal */}
      {isAdminAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs font-serif animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-[#0878DC] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#063B8E] via-[#0878DC] to-[#00CFFF] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-[#FFDE59]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-none">
                    Xác thực Quản trị viên
                  </h3>
                  <p className="text-xs text-[#E0F2FE] mt-1 font-sans">
                    Chỉ Quản trị viên mới có quyền chỉnh sửa
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAdminAuthModalOpen(false);
                  setPendingActionGame(null);
                }}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleVerifyAdmin} className="p-6 space-y-4">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong>Khu vực bảo vệ:</strong> Để {pendingActionType === 'edit' ? 'chỉnh sửa' : 'xóa'} trò chơi{' '}
                  {pendingActionGame && <span className="font-bold text-[#063B8E]">"{pendingActionGame.title}"</span>}, 
                  thầy/cô vui lòng nhập mật khẩu quản trị viên.
                </div>
              </div>

              {adminAuthError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminAuthError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Mật khẩu Quản trị viên:
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    autoFocus
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu quản trị viên"
                    className="w-full border-2 border-slate-300 rounded-xl pl-3.5 pr-11 py-2.5 text-base focus:border-[#0878DC] focus:outline-none font-sans tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showAdminPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 italic font-sans">
                  * Mật khẩu được ẩn ký tự để đảm bảo bảo mật an toàn.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminAuthModalOpen(false);
                    setPendingActionGame(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#063B8E] to-[#0878DC] hover:from-[#052C6E] hover:to-[#0659a8] text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md flex items-center gap-2 transition-transform transform active:scale-95 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-[#FFDE59]" />
                  <span>Xác nhận & Mở chỉnh sửa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Edit Game Modal */}
      {editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs font-serif">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-4 border-[#0878DC] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0878DC] flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#063B8E] leading-tight">
                    Chỉnh Sửa Trò Chơi
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-sans font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quản trị viên: Thầy Bùi Ngọc Thắng</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingGame(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Tên trò chơi: *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Nhập tên trò chơi..."
                  className="w-full border-2 border-slate-300 rounded-xl px-3.5 py-2 text-base focus:border-[#0878DC] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Chủ đề / Chuyên đề:
                </label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  placeholder="VD: Chuyên đề Toán THPT..."
                  className="w-full border-2 border-slate-300 rounded-xl px-3.5 py-2 text-base focus:border-[#0878DC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Mức độ khó:
                </label>
                <select
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(e.target.value as any)}
                  className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-base focus:border-[#0878DC] focus:outline-none cursor-pointer bg-white"
                >
                  <option value="Dễ">Dễ</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Khó">Khó</option>
                  <option value="Nâng cao">Nâng cao</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGame(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-[#0878DC] hover:bg-[#063B8E] text-white font-bold cursor-pointer shadow flex items-center gap-1.5"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
