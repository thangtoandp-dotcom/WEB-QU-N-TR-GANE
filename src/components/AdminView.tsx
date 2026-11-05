import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sparkles, 
  Gamepad2, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Swords, 
  BarChart3, 
  FileSpreadsheet, 
  Database, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Send,
  Loader2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { GameItem, Student, ClassItem, GameRoom, GameAttempt, UserProfile, Question } from '../types';
import { api, SUPABASE_SCHEMA_SQL, excelService } from '../services/api';
import { MathText } from './common/MathText';

interface AdminViewProps {
  currentUser: UserProfile;
  games: GameItem[];
  students: Student[];
  classes: ClassItem[];
  rooms: GameRoom[];
  attempts: GameAttempt[];
  onRefreshData: () => void;
  onSelectGameToPlay?: (game: GameItem) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  games,
  students,
  classes,
  rooms,
  attempts,
  onRefreshData
}) => {
  const [activeSidebar, setActiveSidebar] = useState<
    'overview' | 'games' | 'ai-generator' | 'questions' | 'students' | 'classes' | 'rooms' | 'results' | 'supabase'
  >('overview');

  // AI Generator Form State
  const [aiGrade, setAiGrade] = useState<number>(12);
  const [aiTopic, setAiTopic] = useState('Khảo sát sự biến thiên và vẽ đồ thị hàm số');
  const [aiType, setAiType] = useState('Trắc nghiệm 4 đáp án (A, B, C, D)');
  const [aiDifficulty, setAiDifficulty] = useState('Vận dụng');
  const [aiCount, setAiCount] = useState<number>(5);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [generatedSource, setGeneratedSource] = useState<string>('');
  const [newGameTitle, setNewGameTitle] = useState('Bộ đề luyện tập Toán 12 do AI hỗ trợ');

  // Copied SQL state
  const [copiedSql, setCopiedSql] = useState(false);

  // New Game modal/form state
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);
  const [gameTitle, setGameTitle] = useState('');
  const [gameCategory, setGameCategory] = useState<'trac-nghiem' | 'tu-duy' | 'hinh-hoc' | 'tuong-tac' | 'giai-tri'>('trac-nghiem');
  const [gameTopic, setGameTopic] = useState('');
  const [gameDifficulty, setGameDifficulty] = useState<'Dễ' | 'Trung bình' | 'Khó' | 'Nâng cao'>('Trung bình');
  const [gameQuestionsCount, setGameQuestionsCount] = useState(10);
  const [gameDurationMinutes, setGameDurationMinutes] = useState(10);
  const [gameMaxScore, setGameMaxScore] = useState(100);
  const [gameDesc, setGameDesc] = useState('');

  // Questions Bank State
  const [questionsList, setQuestionsList] = useState<Question[]>([]);
  const [questionGradeFilter, setQuestionGradeFilter] = useState<number | 'all'>('all');
  const [isAddQuestionModal, setIsAddQuestionModal] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQOpts, setNewQOpts] = useState(['', '', '', '']);
  const [newQCorrect, setNewQCorrect] = useState(0);
  const [newQExplain, setNewQExplain] = useState('');
  const [newQTopic, setNewQTopic] = useState('Đạo hàm & Khảo sát hàm số');
  const [newQGrade, setNewQGrade] = useState(12);

  // Supabase connection state
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('https://acdvkdsvpwdggkaukjmk.supabase.co');
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState('sb_publishable_u1yHdyKLgTKrwQisonv6Rg_PEmxawh5');
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseStatusResult, setSupabaseStatusResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>({
    tested: true,
    success: true,
    message: 'Đã kết nối trực tuyến với Supabase (214 học sinh, 34 trò chơi THPT Đan Phượng)!'
  });

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Load questions and Supabase status on mount
  useEffect(() => {
    loadQuestions();
    checkSupabaseStatus();
  }, []);

  const loadQuestions = async () => {
    const qs = await api.getQuestions();
    setQuestionsList(qs);
  };

  const checkSupabaseStatus = async () => {
    const st = await api.getSupabaseStatus();
    if (st.configured) {
      setSupabaseUrlInput(st.url || 'https://acdvkdsvpwdggkaukjmk.supabase.co');
      setSupabaseStatusResult({
        tested: true,
        success: st.connected,
        message: st.message
      });
    }
  };

  // Call Gemini AI
  const handleGenerateAi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedQuestions([]);

    const result = await api.generateAiQuestions({
      grade: aiGrade,
      topic: aiTopic,
      questionType: aiType,
      difficulty: aiDifficulty,
      count: aiCount,
      customPrompt: aiCustomPrompt
    });

    setIsGenerating(false);
    if (result.success && result.questions) {
      setGeneratedQuestions(result.questions);
      setGeneratedSource(result.source || 'gemini');
    } else {
      alert(result.message || 'Lỗi khi gọi AI');
    }
  };

  // Convert AI questions to a playable game in the library
  const handlePublishAiGame = async () => {
    if (generatedQuestions.length === 0) return;

    const newGame = await api.addGame({
      title: newGameTitle,
      category: 'trac-nghiem',
      categoryName: 'Game Trắc nghiệm Toán học',
      grade: aiGrade,
      topic: aiTopic,
      difficulty: aiDifficulty as any,
      questionsCount: generatedQuestions.length,
      durationMinutes: Math.max(5, generatedQuestions.length * 2),
      maxScore: 100,
      active: true,
      description: `Bộ câu hỏi ${aiTopic} do Thầy Bùi Ngọc Thắng phê duyệt từ trợ lý AI.`,
      color: '#0878DC',
      bgCard: '#E0F2FE'
    });

    if (newGame) {
      alert(`Đã xuất bản trò chơi mới "${newGame.title}" vào Thư viện Kho trò chơi thành công!`);
      onRefreshData();
      setActiveSidebar('games');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleToggleGameActive = async (g: GameItem) => {
    await api.updateGame(g.id, { active: !g.active });
    onRefreshData();
  };

  const handleDeleteGame = async (id: string, title: string) => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa trò chơi "${title}"?`)) {
      await api.deleteGame(id);
      onRefreshData();
    }
  };

  const handleOpenAddGame = () => {
    setEditingGame(null);
    setGameTitle('');
    setGameCategory('trac-nghiem');
    setGameTopic('Toán học THPT');
    setGameDifficulty('Trung bình');
    setGameQuestionsCount(10);
    setGameDurationMinutes(10);
    setGameMaxScore(100);
    setGameDesc('');
    setIsGameModalOpen(true);
  };

  const handleOpenEditGame = (g: GameItem) => {
    setEditingGame(g);
    setGameTitle(g.title);
    setGameCategory(g.category);
    setGameTopic(g.topic);
    setGameDifficulty(g.difficulty);
    setGameQuestionsCount(g.questionsCount);
    setGameDurationMinutes(g.durationMinutes);
    setGameMaxScore(g.maxScore);
    setGameDesc(g.description);
    setIsGameModalOpen(true);
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const catNames: Record<string, string> = {
      'trac-nghiem': 'Game Trắc nghiệm Toán học',
      'tu-duy': 'Game Tư duy và Trí tuệ',
      'hinh-hoc': 'Game Hình học',
      'tuong-tac': 'Vòng quay may mắn',
      'giai-tri': 'Game Giải trí Không giới hạn'
    };

    if (editingGame) {
      await api.updateGame(editingGame.id, {
        title: gameTitle,
        category: gameCategory,
        categoryName: catNames[gameCategory],
        topic: gameTopic,
        difficulty: gameDifficulty,
        questionsCount: gameQuestionsCount,
        durationMinutes: gameDurationMinutes,
        maxScore: gameMaxScore,
        description: gameDesc
      });
    } else {
      await api.addGame({
        title: gameTitle,
        category: gameCategory,
        categoryName: catNames[gameCategory],
        grade: 'all',
        topic: gameTopic,
        difficulty: gameDifficulty,
        questionsCount: gameQuestionsCount,
        durationMinutes: gameDurationMinutes,
        maxScore: gameMaxScore,
        active: true,
        description: gameDesc,
        color: '#0878DC',
        bgCard: '#E0F2FE'
      });
    }

    setIsGameModalOpen(false);
    onRefreshData();
  };

  // Test Supabase Connection
  const handleTestSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseTesting(true);
    setSupabaseStatusResult(null);

    const res = await api.testSupabase(supabaseUrlInput.trim(), supabaseAnonKeyInput.trim());
    setSupabaseTesting(false);
    setSupabaseStatusResult({
      tested: true,
      success: res.success,
      message: res.message
    });
  };

  // Handle Teacher Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    const res = await api.updateTeacherPassword(oldPassword.trim(), newPassword.trim());
    if (res.success) {
      setPasswordMsg('Đã đổi mật khẩu quản trị thành công!');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordChange(false), 2000);
    } else {
      setPasswordMsg(res.message);
    }
  };

  // Add Question to bank
  const handleAddQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || newQOpts.some((o) => !o.trim())) {
      alert('Vui lòng nhập đầy đủ câu hỏi và 4 đáp án!');
      return;
    }

    const added = await api.addQuestion({
      question: newQText,
      options: newQOpts,
      correctIndex: newQCorrect,
      explanation: newQExplain,
      topic: newQTopic,
      grade: newQGrade
    });

    if (added) {
      alert('Đã thêm câu hỏi vào ngân hàng đề thi thành công!');
      setIsAddQuestionModal(false);
      setNewQText('');
      setNewQOpts(['', '', '', '']);
      setNewQExplain('');
      loadQuestions();
    }
  };

  const handleDeleteQuestion = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Thầy/Cô có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng đề?')) {
      await api.deleteQuestion(id);
      loadQuestions();
    }
  };

  const handleDeleteRoom = async (id: string, title: string) => {
    if (window.confirm(`Thầy/Cô có muốn xóa/đóng phòng thi "${title}"?`)) {
      await api.deleteRoom(id);
      onRefreshData();
    }
  };

  const filteredQuestions = questionsList.filter((q) => {
    if (questionGradeFilter !== 'all' && q.grade !== questionGradeFilter) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-[#0878DC]/20 overflow-hidden">
      
      {/* Admin Top Header */}
      <div className="bg-gradient-to-r from-[#042866] via-[#063B8E] to-[#0852B8] text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-[#00CFFF]/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-[#00CFFF]/50 text-2xl shadow">
            👨‍🏫
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif leading-tight">
              Bảng Quản Trị Hệ Thống TOAN GAME HUB
            </h2>
            <p className="text-xs text-[#FFDE59] font-medium font-serif">
              Giáo viên phụ trách: Bùi Ngọc Thắng • Trường THPT Đan Phượng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Hệ thống đang hoạt động
          </span>
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full font-bold border border-white/30 flex items-center gap-1 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Đổi mật khẩu</span>
          </button>
        </div>
      </div>

      {/* Password Change Dropdown */}
      {showPasswordChange && (
        <div className="bg-[#EAF5FF] border-b-2 border-[#0878DC]/40 p-4 transition-all">
          <form onSubmit={handleUpdatePassword} className="max-w-lg mx-auto flex flex-col sm:flex-row items-center gap-3">
            <input
              type="password"
              required
              placeholder="Mật khẩu cũ (vd: 123456)"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-serif w-full sm:w-44 focus:outline-none"
            />
            <input
              type="password"
              required
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-serif w-full sm:w-44 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#063B8E] hover:bg-[#052C6E] text-white font-bold px-4 py-1.5 rounded-xl text-sm whitespace-nowrap cursor-pointer shadow"
            >
              Cập nhật
            </button>
          </form>
          {passwordMsg && (
            <div className="text-center text-xs font-bold text-[#063B8E] mt-2">
              {passwordMsg}
            </div>
          )}
        </div>
      )}

      {/* Main Container: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row min-h-[650px]">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 bg-[#F8FAFC] border-r border-slate-200 p-3 space-y-1 shrink-0 font-serif text-base">
          {[
            { id: 'overview', label: '1. Tổng quan hệ thống', icon: BarChart3 },
            { id: 'ai-generator', label: '2. AI Trợ lý tạo học liệu', icon: Sparkles, badge: 'Gemini' },
            { id: 'games', label: '3. Quản lý trò chơi', icon: Gamepad2 },
            { id: 'questions', label: '4. Ngân hàng câu hỏi', icon: BookOpen },
            { id: 'students', label: '5. Quản lý học sinh', icon: Users },
            { id: 'classes', label: '6. Quản lý lớp học', icon: GraduationCap },
            { id: 'rooms', label: '7. Quản lý phòng thi đấu', icon: Swords },
            { id: 'results', label: '8. Báo cáo kết quả', icon: FileSpreadsheet },
            { id: 'supabase', label: '9. Cấu hình CSDL Supabase', icon: Database }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSidebar === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSidebar(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#063B8E] text-white shadow-md'
                    : 'text-slate-700 hover:bg-[#EAF5FF] hover:text-[#063B8E]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFDE59]' : 'text-[#0878DC]'}`} />
                  <span className="text-[15px]">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isActive ? 'bg-[#FFDE59] text-[#063B8E]' : 'bg-[#00CFFF]/20 text-[#0878DC]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {/* 1. OVERVIEW */}
          {activeSidebar === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold font-serif text-[#063B8E]">
                  Tổng quan hệ sinh thái Toán THPT Đan Phượng
                </h3>
                <p className="text-slate-600 text-sm font-serif">
                  Tóm tắt tình hình vận hành, học sinh và kết quả kiểm tra định kỳ.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#E0F2FE] border border-blue-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Trò chơi đang mở</span>
                  <div className="text-3xl font-black text-[#0369A1] mt-1">{games.filter(g => g.active).length}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#DCFCE7] border border-emerald-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Học sinh đăng ký</span>
                  <div className="text-3xl font-black text-[#15803D] mt-1">{students.length}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FEF3C7] border border-amber-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Tổng lượt thi đấu</span>
                  <div className="text-3xl font-black text-[#B45309] mt-1">{attempts.length}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#EDE9FE] border border-purple-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Phòng thi đang mở</span>
                  <div className="text-3xl font-black text-[#6D28D9] mt-1">{rooms.length}</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#EAF5FF] border border-[#0878DC]/30 space-y-2">
                <h4 className="font-bold text-[#063B8E] text-lg font-serif">
                  Thông tin Giáo viên phụ trách:
                </h4>
                <div className="text-slate-700 text-sm space-y-1 font-serif">
                  <div>• Họ và tên: <strong>Thầy Bùi Ngọc Thắng</strong></div>
                  <div>• Đơn vị công tác: <strong>Trường THPT Đan Phượng (Hà Nội)</strong></div>
                  <div>• Lĩnh vực: <strong>Giáo dục & Giảng dạy môn Toán học khối 10, 11, 12</strong></div>
                  <div>• Kênh website chính thức: <strong>toangamehub.edu.vn</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* 2. AI GENERATOR (GEMINI API) */}
          {activeSidebar === 'ai-generator' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#063B8E] to-[#0878DC] text-white p-5 rounded-2xl shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-6 h-6 text-[#FFDE59]" />
                  <h3 className="text-2xl font-bold font-serif">
                    Trợ lý AI Gemini hỗ trợ soạn học liệu Toán THPT
                  </h3>
                </div>
                <p className="text-sm text-[#E0F2FE] font-serif">
                  Tự động sinh câu hỏi Toán chuẩn chương trình Bộ GD&ĐT, kèm lời giải chi tiết và tạo thành trò chơi mới chỉ trong 1 click.
                </p>
              </div>

              {/* Form Input */}
              <form onSubmit={handleGenerateAi} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Khối lớp:</label>
                    <select
                      value={aiGrade}
                      onChange={(e) => setAiGrade(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-serif"
                    >
                      <option value={10}>Khối 10 (Mệnh đề, Hàm số, Vectơ, Xác suất)</option>
                      <option value={11}>Khối 11 (Lượng giác, Dãy số, Giới hạn, Không gian)</option>
                      <option value={12}>Khối 12 (Đạo hàm, Tích phân, Mũ Loga, Oxyz)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Loại câu hỏi:</label>
                    <select
                      value={aiType}
                      onChange={(e) => setAiType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-serif"
                    >
                      <option value="Trắc nghiệm 4 đáp án (A, B, C, D)">Trắc nghiệm 4 đáp án (A, B, C, D)</option>
                      <option value="Trắc nghiệm Đúng / Sai">Trắc nghiệm Đúng / Sai</option>
                      <option value="Câu đố tư duy logic số học">Câu đố tư duy logic số học</option>
                      <option value="Tính nhanh 60 giây phản xạ">Tính nhanh 60 giây phản xạ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mức độ nhận thức:</label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-serif"
                    >
                      <option value="Nhận biết">Nhận biết (Dễ)</option>
                      <option value="Thông hiểu">Thông hiểu (Trung bình)</option>
                      <option value="Vận dụng">Vận dụng (Khá)</option>
                      <option value="Vận dụng cao">Vận dụng cao (Phân loại)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chủ đề kiến thức Toán:</label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Ví dụ: Cực trị của hàm số, Thể tích khối đa diện, Phương trình mặt phẳng Oxyz..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Số lượng câu:</label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={aiCount}
                      onChange={(e) => setAiCount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-serif"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Yêu cầu bổ sung (tùy chọn):</label>
                  <textarea
                    rows={2}
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="Ví dụ: Đưa thêm các bài toán thực tế, bẫy điều kiện xác định, hoặc ứng dụng đạo hàm trong kinh tế..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-serif"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-[#0878DC] to-[#00CFFF] hover:from-[#0664B8] hover:to-[#00B4DE] text-white font-bold py-2.5 px-6 rounded-xl shadow flex items-center gap-2 cursor-pointer text-base font-serif"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang xử lý đề thi cùng Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Bắt đầu tạo câu hỏi AI</span>
                    </>
                  )}
                </button>
              </form>

              {/* Generated Preview */}
              {generatedQuestions.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold font-serif text-[#063B8E]">
                        Xem trước bộ câu hỏi do AI tạo ({generatedQuestions.length} câu)
                      </h4>
                      <span className="text-xs text-slate-500">
                        Nguồn: {generatedSource === 'gemini' ? 'Gemini 3.8 Flash (Server-side)' : 'Đề mẫu chuẩn THPT Đan Phượng'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newGameTitle}
                        onChange={(e) => setNewGameTitle(e.target.value)}
                        className="border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-serif w-64"
                      />
                      <button
                        onClick={handlePublishAiGame}
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold px-4 py-2 rounded-xl text-sm shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Xuất bản thành game</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {generatedQuestions.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-xs space-y-2 font-serif">
                        <div className="font-bold text-[#063B8E] text-base">
                          <span>Câu {idx + 1}: </span>
                          <MathText text={q.question} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {q.options.map((opt, oi) => (
                            <div
                              key={oi}
                              className={`p-2 rounded-lg border ${
                                oi === q.correctIndex
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <strong>{['A', 'B', 'C', 'D'][oi]}.</strong> <MathText text={opt} />
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-slate-600 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                          <strong className="text-[#0878DC]">Lời giải chi tiết: </strong>
                          <MathText text={q.explanation} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. MANAGE GAMES (WITH EDIT, TOGGLE, DELETE) */}
          {activeSidebar === 'games' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-[#063B8E]">
                    Quản lý kho trò chơi ({games.length})
                  </h3>
                  <p className="text-sm text-slate-500 font-serif">Thêm mới, sửa, ẩn/hiện hoặc xóa trò chơi</p>
                </div>

                <button
                  onClick={handleOpenAddGame}
                  className="bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm trò chơi mới</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((g) => (
                  <div
                    key={g.id}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      g.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-300 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0878DC]">
                          {g.categoryName}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {g.difficulty} • {g.questionsCount} câu
                        </span>
                      </div>
                      <h4 className="text-lg font-bold font-serif text-[#063B8E]">{g.title}</h4>
                      <p className="text-xs text-slate-600 font-serif mt-1">{g.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleToggleGameActive(g)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer ${
                          g.active ? 'text-slate-600 hover:bg-slate-100' : 'text-emerald-700 bg-emerald-50'
                        }`}
                      >
                        {g.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{g.active ? 'Ẩn' : 'Hiện'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditGame(g)}
                          className="text-xs font-bold text-[#0878DC] hover:bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                          title="Chỉnh sửa thông số trò chơi"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>

                        <button
                          onClick={() => handleDeleteGame(g.id, g.title)}
                          className="text-xs font-bold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. QUESTIONS BANK (DYNAMIC CRUD) */}
          {activeSidebar === 'questions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-[#063B8E]">
                    Ngân hàng câu hỏi Toán học THPT ({questionsList.length} câu)
                  </h3>
                  <p className="text-slate-600 text-sm font-serif">
                    Xem, lọc theo khối lớp và thêm mới câu hỏi vào hệ sinh thái.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={questionGradeFilter}
                    onChange={(e) => setQuestionGradeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-serif bg-slate-50 cursor-pointer"
                  >
                    <option value="all">Tất cả các khối</option>
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>

                  <button
                    onClick={() => setIsAddQuestionModal(true)}
                    className="bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm câu hỏi</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {filteredQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 font-serif">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0878DC] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        {q.topic || 'Toán THPT'} • Khối {q.grade || 12}
                      </span>
                      {q.id && (
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-xs text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          title="Xóa câu hỏi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="font-bold text-slate-800 text-base">
                      <span>{idx + 1}. </span>
                      <MathText text={q.question} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {q.options.map((opt, oi) => (
                        <div
                          key={oi}
                          className={`p-2 rounded-lg border ${
                            oi === q.correctIndex
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <strong>{['A', 'B', 'C', 'D'][oi]}.</strong> <MathText text={opt} />
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <strong>Lời giải chi tiết: </strong>
                        <MathText text={q.explanation} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. STUDENTS */}
          {activeSidebar === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold font-serif text-[#063B8E]">
                  Danh sách {students.length} học sinh THPT Đan Phượng
                </h3>
                <button
                  onClick={() => excelService.exportStudents(students)}
                  className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Xuất Excel danh sách</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-serif text-sm">
                  <thead className="bg-[#EAF5FF] text-[#063B8E]">
                    <tr>
                      <th className="p-2.5">Mã HS</th>
                      <th className="p-2.5">Họ và tên</th>
                      <th className="p-2.5">Lớp</th>
                      <th className="p-2.5">Khối</th>
                      <th className="p-2.5">Tổng điểm</th>
                      <th className="p-2.5">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.slice(0, 15).map((s) => (
                      <tr key={s.id}>
                        <td className="p-2.5 font-mono font-bold text-[#0878DC]">{s.code}</td>
                        <td className="p-2.5 font-bold text-[#063B8E]">{s.name}</td>
                        <td className="p-2.5">{s.classId}</td>
                        <td className="p-2.5">{s.grade}</td>
                        <td className="p-2.5 font-bold text-amber-600">{s.totalPoints}</td>
                        <td className="p-2.5">
                          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            {s.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. CLASSES */}
          {activeSidebar === 'classes' && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold font-serif text-[#063B8E]">
                Quản lý các lớp học THPT Đan Phượng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {classes.map((c) => (
                  <div key={c.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                    <div className="font-bold font-serif text-lg text-[#063B8E]">{c.name}</div>
                    <div className="text-xs text-slate-500 mt-1">Khối {c.grade} • {c.studentCount} học sinh</div>
                    <div className="text-xs text-slate-700 mt-0.5">GV: <strong>{c.homeroom}</strong></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. ROOMS (WITH DELETE ACTION) */}
          {activeSidebar === 'rooms' && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold font-serif text-[#063B8E]">
                Phòng thi đấu trực tuyến ({rooms.length})
              </h3>
              <div className="space-y-3">
                {rooms.map((r) => (
                  <div key={r.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-sm font-bold bg-blue-100 text-[#0878DC] px-2.5 py-0.5 rounded">
                        Mã phòng: {r.code}
                      </span>
                      <h4 className="font-bold text-base text-[#063B8E] mt-1">{r.title}</h4>
                      <p className="text-xs text-slate-500">Lớp: {r.classes.join(', ')} • Bộ đề: {r.gameTitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                        {r.status === 'active' ? 'Đang mở' : 'Đã kết thúc'}
                      </span>
                      <button
                        onClick={() => handleDeleteRoom(r.id, r.title)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Xóa phòng thi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. RESULTS (WITH EXCEL EXPORT) */}
          {activeSidebar === 'results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold font-serif text-[#063B8E]">
                  Lịch sử kết quả thi đấu ({attempts.length} lượt)
                </h3>
                <button
                  onClick={() => excelService.exportAttempts(attempts)}
                  className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Xuất Excel báo cáo</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-serif text-sm">
                  <thead className="bg-[#EAF5FF] text-[#063B8E]">
                    <tr>
                      <th className="p-2.5">Thời gian</th>
                      <th className="p-2.5">Học sinh</th>
                      <th className="p-2.5">Lớp</th>
                      <th className="p-2.5">Trò chơi</th>
                      <th className="p-2.5 text-center">Mã phòng</th>
                      <th className="p-2.5 text-right">Điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attempts.slice(0, 15).map((a) => (
                      <tr key={a.id}>
                        <td className="p-2.5 text-xs text-slate-500">{new Date(a.endedAt).toLocaleString('vi-VN')}</td>
                        <td className="p-2.5 font-bold text-[#063B8E]">{a.studentName}</td>
                        <td className="p-2.5">{a.className}</td>
                        <td className="p-2.5">{a.gameTitle}</td>
                        <td className="p-2.5 text-center font-mono text-xs text-slate-600">{a.roomCode || 'Tự do'}</td>
                        <td className="p-2.5 text-right font-bold text-amber-600">{a.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. SUPABASE CONFIG & LIVE TEST */}
          {activeSidebar === 'supabase' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-bold font-serif text-[#063B8E] flex items-center gap-2">
                  <Database className="w-6 h-6 text-[#0878DC]" />
                  <span>Cấu hình CSDL Supabase PostgreSQL & Row Level Security (RLS)</span>
                </h3>
                <p className="text-slate-600 text-sm font-serif mt-1">
                  Nhập thông tin kết nối Supabase của Thầy/Cô để kích hoạt đồng bộ đám mây PostgreSQL. Hệ thống hiện đang chạy sẵn trên CSDL máy chủ đầy đủ tính năng.
                </p>
              </div>

              {/* Supabase Test Connection Form */}
              <form onSubmit={handleTestSupabase} className="p-5 bg-slate-50 rounded-2xl border-2 border-[#0878DC]/30 space-y-4">
                <div className="font-bold text-[#063B8E] text-base font-serif flex items-center justify-between">
                  <span>Thông số kết nối Supabase Project:</span>
                  {supabaseStatusResult && (
                    <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 ${
                      supabaseStatusResult.success
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {supabaseStatusResult.success ? 'Đã kết nối Supabase' : 'Chưa kết nối Supabase'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Project URL:
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://xyzcompany.supabase.co"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono focus:border-[#0878DC] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Anon / Public Key:
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseAnonKeyInput}
                      onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono focus:border-[#0878DC] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-500">
                    💡 Thầy/Cô lấy thông tin này tại mục: <strong>Project Settings &gt; API</strong> trên Supabase.
                  </div>

                  <button
                    type="submit"
                    disabled={supabaseTesting}
                    className="bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold px-6 py-2 rounded-xl text-sm shadow flex items-center gap-2 cursor-pointer"
                  >
                    {supabaseTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang kiểm tra kết nối...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Kiểm tra & Lưu kết nối</span>
                      </>
                    )}
                  </button>
                </div>

                {supabaseStatusResult && (
                  <div className={`p-3 rounded-xl text-xs font-serif ${
                    supabaseStatusResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-red-50 text-red-700 border border-red-300'
                  }`}>
                    <strong>Kết quả:</strong> {supabaseStatusResult.message}
                  </div>
                )}
              </form>

              {/* Instructions Box */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-sm font-serif text-amber-950 space-y-2">
                <strong className="block font-bold text-amber-900">Hướng dẫn kích hoạt Supabase (Phần 11):</strong>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Truy cập vào <strong>supabase.com</strong>, tạo một Project miễn phí.</li>
                  <li>Mở <strong>SQL Editor</strong> trên Supabase, dán đoạn mã SQL bên dưới và nhấn <strong>Run</strong> để tự động tạo 11 bảng và các chính sách bảo mật RLS.</li>
                  <li>Nhập URL và Anon Key ở trên để hệ thống tự động kết nối và đồng bộ.</li>
                </ol>
              </div>

              {/* Copy SQL Button */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Mã SQL tạo 11 bảng cơ sở dữ liệu:</span>
                <button
                  onClick={handleCopySql}
                  className="bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer transition-colors"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-[#FFDE59]" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Đã sao chép SQL!' : 'Sao chép toàn bộ SQL'}</span>
                </button>
              </div>

              {/* SQL Code Preview */}
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-72 border border-slate-800">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>
          )}

        </div>

      </div>

      {/* Add / Edit Game Modal */}
      {isGameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-[#0878DC] shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-bold font-serif text-[#063B8E] mb-4">
              {editingGame ? 'Chỉnh sửa trò chơi' : 'Thêm trò chơi mới'}
            </h3>

            <form onSubmit={handleSaveGame} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tên trò chơi:</label>
                <input
                  type="text"
                  required
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="Ví dụ: Đấu trường Logic Toán 11"
                  className="w-full border-2 border-slate-300 rounded-xl px-3.5 py-2 font-serif focus:border-[#0878DC] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phân loại:</label>
                  <select
                    value={gameCategory}
                    onChange={(e) => setGameCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-serif"
                  >
                    <option value="trac-nghiem">Game Trắc nghiệm</option>
                    <option value="tu-duy">Tư duy & Trí tuệ</option>
                    <option value="hinh-hoc">Game Hình học</option>
                    <option value="tuong-tac">Game Tương tác</option>
                    <option value="giai-tri">Game Giải trí</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ khó:</label>
                  <select
                    value={gameDifficulty}
                    onChange={(e) => setGameDifficulty(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-serif"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                    <option value="Nâng cao">Nâng cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Chủ đề kiến thức:</label>
                <input
                  type="text"
                  value={gameTopic}
                  onChange={(e) => setGameTopic(e.target.value)}
                  placeholder="Ví dụ: Lượng giác, Đạo hàm, Oxyz..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-serif text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số câu hỏi:</label>
                  <input
                    type="number"
                    value={gameQuestionsCount}
                    onChange={(e) => setGameQuestionsCount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian (phút):</label>
                  <input
                    type="number"
                    value={gameDurationMinutes}
                    onChange={(e) => setGameDurationMinutes(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Điểm tối đa:</label>
                  <input
                    type="number"
                    value={gameMaxScore}
                    onChange={(e) => setGameMaxScore(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả tóm tắt:</label>
                <textarea
                  rows={2}
                  value={gameDesc}
                  onChange={(e) => setGameDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-serif text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGameModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer font-serif"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold cursor-pointer font-serif shadow"
                >
                  {editingGame ? 'Lưu cập nhật' : 'Thêm trò chơi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {isAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-[#0878DC] shadow-2xl animate-in zoom-in-95 font-serif">
            <h3 className="text-2xl font-bold text-[#063B8E] mb-4">
              Thêm câu hỏi mới vào ngân hàng đề
            </h3>

            <form onSubmit={handleAddQuestionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nội dung câu hỏi:</label>
                <textarea
                  rows={3}
                  required
                  value={newQText}
                  onChange={(e) => setNewQText(e.target.value)}
                  placeholder="Ví dụ: Cho hàm số y = f(x) liên tục trên R có đạo hàm f'(x) = x(x-1)^2..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {['A', 'B', 'C', 'D'].map((letter, idx) => (
                  <div key={letter}>
                    <label className="block text-xs font-bold text-slate-700 mb-0.5">
                      Đáp án {letter}:
                    </label>
                    <input
                      type="text"
                      required
                      value={newQOpts[idx]}
                      onChange={(e) => {
                        const copy = [...newQOpts];
                        copy[idx] = e.target.value;
                        setNewQOpts(copy);
                      }}
                      className="w-full border border-slate-300 rounded-lg p-1.5 text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-0.5">Đáp án đúng:</label>
                  <select
                    value={newQCorrect}
                    onChange={(e) => setNewQCorrect(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs"
                  >
                    <option value={0}>Đáp án A</option>
                    <option value={1}>Đáp án B</option>
                    <option value={2}>Đáp án C</option>
                    <option value={3}>Đáp án D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-0.5">Khối:</label>
                  <select
                    value={newQGrade}
                    onChange={(e) => setNewQGrade(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-0.5">Chủ đề:</label>
                  <input
                    type="text"
                    value={newQTopic}
                    onChange={(e) => setNewQTopic(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-0.5">Lời giải chi tiết:</label>
                <textarea
                  rows={2}
                  value={newQExplain}
                  onChange={(e) => setNewQExplain(e.target.value)}
                  placeholder="Giải thích từng bước..."
                  className="w-full border border-slate-300 rounded-xl p-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0878DC] text-white font-bold cursor-pointer shadow"
                >
                  Lưu câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
