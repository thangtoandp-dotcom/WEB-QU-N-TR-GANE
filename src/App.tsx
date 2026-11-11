import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { HeroBanner } from './components/HeroBanner';
import { RightSidebar } from './components/RightSidebar';
import { GameCategories } from './components/GameCategories';
import { RecentActivityAndStats } from './components/RecentActivityAndStats';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { GamesGallery } from './components/GamesGallery';
import { RoomsView } from './components/RoomsView';
import { ClassesView } from './components/ClassesView';
import { LeaderboardView } from './components/LeaderboardView';
import { StatisticsView } from './components/StatisticsView';
import { AdminView } from './components/AdminView';

// Interactive Game Players
import { QuizGamePlayer } from './components/games/QuizGamePlayer';
import { MillionaireGamePlayer } from './components/games/MillionaireGamePlayer';
import { LuckyWheelGamePlayer } from './components/games/LuckyWheelGamePlayer';
import { SudokuGamePlayer } from './components/games/SudokuGamePlayer';
import { GeometryGamePlayer } from './components/games/GeometryGamePlayer';
import { MemoryCardGamePlayer } from './components/games/MemoryCardGamePlayer';
import { FullScreenGameViewer } from './components/games/FullScreenGameViewer';
import { FullScreenGameContainer } from './components/games/FullScreenGameContainer';

import { 
  UserProfile, 
  GameItem, 
  Student, 
  ClassItem, 
  GameRoom, 
  GameAttempt 
} from './types';
import { api, excelService } from './services/api';
import { BookOpen, HelpCircle, X, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('toan_hub_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'GUEST',
      name: 'Khách tham quan',
      role: 'guest',
      school: 'Trường THPT Đan Phượng'
    };
  });

  // Database state
  const [games, setGames] = useState<GameItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [attempts, setAttempts] = useState<GameAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Home search & grade filters
  const [homeSearch, setHomeSearch] = useState('');
  const [homeGrade, setHomeGrade] = useState('all');

  // Login Modal
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<'teacher' | 'student'>('student');

  // Active game playing state
  const [activePlayingGame, setActivePlayingGame] = useState<GameItem | null>(null);
  const [activePlayingRoomCode, setActivePlayingRoomCode] = useState<string>('');

  // Guide Modal State
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Fetch initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [g, s, c, r, a] = await Promise.all([
        api.getGames(),
        api.getStudents(),
        api.getClasses(),
        api.getRooms(),
        api.getAttempts()
      ]);
      if (g && g.length > 0) setGames(g);
      if (s && s.length > 0) setStudents(s);
      if (c && c.length > 0) setClasses(c);
      if (r) setRooms(r);
      if (a) setAttempts(a);
    } catch (e) {
      console.warn('Lỗi loadData, thử getDb:', e);
      const db = await api.getDb();
      if (db) {
        if (db.games) setGames(db.games);
        if (db.students) setStudents(db.students);
        if (db.classes) setClasses(db.classes);
        if (db.rooms) setRooms(db.rooms);
        if (db.attempts) setAttempts(db.attempts);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenLogin = (role: 'teacher' | 'student') => {
    setLoginRole(role);
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    try {
      localStorage.setItem('toan_hub_user', JSON.stringify(profile));
    } catch {}
  };

  const handleLogout = () => {
    const guestUser: UserProfile = {
      id: 'GUEST',
      name: 'Khách tham quan',
      role: 'guest',
      school: 'Trường THPT Đan Phượng'
    };
    setCurrentUser(guestUser);
    try {
      localStorage.removeItem('toan_hub_user');
      sessionStorage.removeItem('toan_admin_auth');
    } catch {}
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  const handleStartGame = (game: GameItem, roomCode = '') => {
    setActivePlayingGame(game);
    setActivePlayingRoomCode(roomCode);
  };

  const handleExitGame = () => {
    setActivePlayingGame(null);
    setActivePlayingRoomCode('');
    loadData(); // reload attempts and scores
  };

  const handleCategorySelect = (categoryKey: string) => {
    if (categoryKey === 'vong-quay') {
      const g = games.find((item) => item.id === 'g-vong-quay-may-man') || games[0];
      handleStartGame(g);
      return;
    }
    if (categoryKey === 'trieu-phu') {
      const g = games.find((item) => item.id === 'g-trieu-phu-toan') || games[0];
      handleStartGame(g);
      return;
    }
    if (categoryKey === 'hinh-hoc') {
      const g = games.find((item) => item.category === 'hinh-hoc') || games[0];
      handleStartGame(g);
      return;
    }
    if (categoryKey === 'tu-duy') {
      const g = games.find((item) => item.id === 'g-sudoku-toan') || games[0];
      handleStartGame(g);
      return;
    }
    if (categoryKey === 'giai-tri') {
      const g = games.find((item) => item.category === 'giai-tri') || games[0];
      handleStartGame(g);
      return;
    }
    setActiveTab('all-games');
  };

  const handleGameUploaded = (newGame: GameItem) => {
    // 1. Immediately prepend to state so it renders without delay
    setGames((prev) => [newGame, ...prev.filter((g) => g.id !== newGame.id)]);
    // 2. Refresh from backend to ensure persistent ordering
    api.getGames().then((refreshed) => {
      if (refreshed && refreshed.length > 0) {
        setGames(refreshed);
      }
    }).catch((e) => console.warn('Refetch games error:', e));
  };

  const renderActiveGamePlayer = () => {
    if (!activePlayingGame) return null;

    const props = {
      game: activePlayingGame,
      currentUser,
      roomCode: activePlayingRoomCode,
      onExit: handleExitGame,
      onFinished: () => loadData()
    };

    // If game is an uploaded file (PowerPoint, HTML, Video MP4, embed) or teacher uploaded game
    if (
      activePlayingGame.isUploaded ||
      activePlayingGame.fileUrl ||
      activePlayingGame.embedCode ||
      activePlayingGame.fileType === 'video' ||
      activePlayingGame.fileType === 'powerpoint' ||
      activePlayingGame.fileType === 'html' ||
      activePlayingGame.fileType === 'embed' ||
      activePlayingGame.id.startsWith('game_custom_') ||
      activePlayingGame.id.startsWith('g-uploaded-')
    ) {
      return <FullScreenGameViewer {...props} />;
    }

    let innerContent: React.ReactNode = null;

    if (activePlayingGame.id === 'g-trieu-phu-toan' || activePlayingGame.categoryName.includes('triệu phú')) {
      innerContent = <MillionaireGamePlayer {...props} />;
    } else if (activePlayingGame.id === 'g-vong-quay-may-man' || activePlayingGame.categoryName.includes('Vòng quay')) {
      innerContent = <LuckyWheelGamePlayer {...props} />;
    } else if (activePlayingGame.id === 'g-sudoku-toan' || activePlayingGame.title.includes('Sudoku')) {
      innerContent = <SudokuGamePlayer {...props} />;
    } else if (activePlayingGame.category === 'hinh-hoc' || activePlayingGame.title.includes('Hình học')) {
      innerContent = <GeometryGamePlayer {...props} />;
    } else if (activePlayingGame.category === 'giai-tri' || activePlayingGame.title.includes('Lật thẻ')) {
      innerContent = <MemoryCardGamePlayer {...props} />;
    } else {
      innerContent = <QuizGamePlayer {...props} />;
    }

    return (
      <FullScreenGameContainer game={activePlayingGame} onExit={handleExitGame}>
        {innerContent}
      </FullScreenGameContainer>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EAF5FF] font-serif text-slate-800">
      
      {/* 1. Header (Brand, Teacher Bùi Ngọc Thắng, THPT Đan Phượng) */}
      <Header onNavigateHome={() => { setActivePlayingGame(null); setActiveTab('home'); }} />

      {/* 2. Top Glossy Navigation Bar (9 Tabs + Mobile Drawer) */}
      <Navigation
        activeTab={activePlayingGame ? ('all-games' as NavTab) : activeTab}
        currentUserRole={currentUser.role}
        onTabChange={(tab) => {
          setActivePlayingGame(null);
          // Security Check: Only teacher can access admin tab
          if (tab === 'admin' && currentUser.role !== 'teacher') {
            handleOpenLogin('teacher');
            return;
          }
          setActiveTab(tab);
        }}
      />

      {/* 3. Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-4 py-4 sm:py-6 space-y-6">
        
        {/* If a game is actively playing, render the game player screen */}
        {activePlayingGame ? (
          <div className="py-2 animate-in fade-in duration-200">
            {renderActiveGamePlayer()}
          </div>
        ) : (
          <>
            {/* TAB: HOME (Matching exact reference image layout) */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                
                {/* Upper Section: Hero Banner (75%) + Right Sidebar (25%) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  
                  {/* Left 75%: Hero Banner */}
                  <div className="lg:col-span-8 xl:col-span-9">
                    <HeroBanner
                      onExploreGames={() => setActiveTab('all-games')}
                      onJoinRoom={() => setActiveTab('rooms')}
                    />
                  </div>

                  {/* Right 25%: Sidebar with Login, Stats, Quick Access */}
                  <div className="lg:col-span-4 xl:col-span-3">
                    <RightSidebar
                      currentUser={currentUser}
                      onOpenLogin={handleOpenLogin}
                      onLogout={handleLogout}
                      onNavigate={(target) => {
                        if (target === 'create-room') {
                          if (currentUser.role === 'teacher') {
                            setActiveTab('rooms');
                          } else {
                            handleOpenLogin('teacher');
                          }
                        } else if (target === 'results') {
                          setActiveTab('statistics');
                        } else if (target === 'leaderboard') {
                          setActiveTab('leaderboard');
                        } else if (target === 'export') {
                          excelService.exportAttempts(attempts);
                        } else if (target === 'guide') {
                          setIsGuideOpen(true);
                        }
                      }}
                      stats={{
                        totalPlays: 12568 + attempts.length,
                        totalStudents: students.length > 0 ? students.length : 214,
                        avgScore: 8.7
                      }}
                    />
                  </div>

                </div>

                {/* Center Section: 6 Game Category Cards with Search and Grade Dropdown */}
                <GameCategories
                  onSelectCategory={handleCategorySelect}
                  searchQuery={homeSearch}
                  onSearchChange={setHomeSearch}
                  selectedGrade={homeGrade}
                  onGradeChange={setHomeGrade}
                />

                {/* Lower Section: 3 Columns matching reference image */}
                <RecentActivityAndStats
                  onViewAllLeaderboard={() => setActiveTab('leaderboard')}
                  onViewAllActivities={() => setActiveTab('statistics')}
                  recentAttempts={attempts}
                  students={students}
                  classes={classes}
                />

              </div>
            )}

            {/* TAB: Kho trò chơi (All Games - 44 games) */}
            {activeTab === 'all-games' && (
              <GamesGallery
                games={games}
                currentUser={currentUser}
                onAdminLoginSuccess={handleLoginSuccess}
                onPlayGame={(g) => handleStartGame(g)}
                activeCategoryFilter="all"
                onGameUploaded={handleGameUploaded}
                onDeleteGame={(id) => setGames((prev) => prev.filter((g) => g.id !== id))}
                onUpdateGame={(updated) => setGames((prev) => prev.map((g) => g.id === updated.id ? { ...g, ...updated } : g))}
              />
            )}

            {/* TAB: Trò chơi Toán học (Math Games - 27 games) */}
            {activeTab === 'math-games' && (
              <GamesGallery
                games={games.filter((g) => g.category !== 'giai-tri')}
                currentUser={currentUser}
                onAdminLoginSuccess={handleLoginSuccess}
                onPlayGame={(g) => handleStartGame(g)}
                activeCategoryFilter="all"
                defaultUploadCategory="math"
                titleOverride="Phân Hệ: Trò Chơi Toán Học THPT"
                subtitleOverride="Trắc nghiệm chuyên đề, đồ thị, hình học và các tệp trò chơi PowerPoint/HTML5 bám sát chương trình"
                onGameUploaded={handleGameUploaded}
                onDeleteGame={(id) => setGames((prev) => prev.filter((g) => g.id !== id))}
                onUpdateGame={(updated) => setGames((prev) => prev.map((g) => g.id === updated.id ? { ...g, ...updated } : g))}
              />
            )}

            {/* TAB: Trò chơi giải trí (Fun Games - 17 games) */}
            {activeTab === 'fun-games' && (
              <GamesGallery
                games={games.filter((g) => g.category === 'giai-tri' || g.category === 'tuong-tac')}
                currentUser={currentUser}
                onAdminLoginSuccess={handleLoginSuccess}
                onPlayGame={(g) => handleStartGame(g)}
                activeCategoryFilter="all"
                defaultUploadCategory="entertainment"
                titleOverride="Phân Hệ: Trò Chơi Giải Trí & Thư Giãn"
                subtitleOverride="Game bóng bóng toán học, đố vui trí tuệ, phản xạ và các tệp game PowerPoint/HTML tương tác"
                onGameUploaded={handleGameUploaded}
                onDeleteGame={(id) => setGames((prev) => prev.filter((g) => g.id !== id))}
                onUpdateGame={(updated) => setGames((prev) => prev.map((g) => g.id === updated.id ? { ...g, ...updated } : g))}
              />
            )}

            {/* TAB: Phòng thi đấu (Online Rooms) */}
            {activeTab === 'rooms' && (
              <RoomsView
                rooms={rooms}
                games={games}
                classes={classes}
                currentUser={currentUser}
                onJoinRoomGame={(room, game) => handleStartGame(game, room.code)}
                onRoomCreated={(newRoom) => setRooms([newRoom, ...rooms])}
              />
            )}

            {/* TAB: Lớp học & Học sinh */}
            {activeTab === 'classes' && (
              <ClassesView
                students={students}
                classes={classes}
                currentUser={currentUser}
                onRefreshData={loadData}
              />
            )}

            {/* TAB: Bảng xếp hạng */}
            {activeTab === 'leaderboard' && (
              <LeaderboardView
                students={students}
                classes={classes}
              />
            )}

            {/* TAB: Thống kê & Phân tích */}
            {activeTab === 'statistics' && (
              <StatisticsView
                attempts={attempts}
                students={students}
                classes={classes}
                games={games}
              />
            )}

            {/* TAB: Quản trị (Teacher Admin) */}
            {activeTab === 'admin' && (
              <AdminView
                currentUser={currentUser}
                games={games}
                students={students}
                classes={classes}
                rooms={rooms}
                attempts={attempts}
                onRefreshData={loadData}
                onSelectGameToPlay={(g) => handleStartGame(g)}
                onAdminLoginSuccess={handleLoginSuccess}
              />
            )}
          </>
        )}

      </main>

      {/* 4. Footer Bar */}
      <Footer />

      {/* 5. Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        defaultRole={loginRole}
        onLoginSuccess={handleLoginSuccess}
        studentsList={students}
      />

      {/* 6. User Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-4 border-[#0878DC] shadow-2xl animate-in zoom-in-95 font-serif max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">📖</span>
                <div>
                  <h3 className="text-2xl font-bold text-[#063B8E]">
                    Hướng Dẫn Sử Dụng TOAN GAME HUB
                  </h3>
                  <span className="text-xs text-slate-500">Trường THPT Đan Phượng • Giáo viên: Bùi Ngọc Thắng</span>
                </div>
              </div>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
              <div className="p-3.5 bg-[#EAF5FF] rounded-2xl border border-[#0878DC]/30">
                <strong className="text-[#063B8E] text-base block mb-1">1. Dành cho Học sinh (Khối 10, 11, 12):</strong>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Đăng nhập:</strong> Bấm <em>"Đăng nhập Học sinh"</em> tại thanh bên phải, chọn đúng tên và mã học sinh của mình để tích lũy điểm vào bảng vàng.</li>
                  <li><strong>Chơi game tự do:</strong> Vào <em>"Kho trò chơi"</em> hoặc chọn trực tiếp 6 thẻ màu ở Trang chủ để rèn luyện (Trắc nghiệm, Ai là triệu phú, Vòng quay, Sudoku...).</li>
                  <li><strong>Vào phòng thi đấu:</strong> Vào mục <em>"Phòng thi đấu"</em>, nhập mã 6 số do Thầy Bùi Ngọc Thắng cung cấp để làm bài kiểm tra chung cùng cả lớp.</li>
                  <li><strong>Theo dõi bảng vàng:</strong> Xem thứ hạng, điểm tích lũy và huy hiệu của mình tại mục <em>"Bảng xếp hạng"</em>.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-300">
                <strong className="text-emerald-900 text-base block mb-1">2. Dành cho Giáo viên (Thầy Bùi Ngọc Thắng):</strong>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Đăng nhập Quản trị:</strong> Bấm <em>"Đăng nhập Giáo viên"</em> (Mật khẩu mặc định: <span className="font-mono font-bold">thptdanphuong</span> hoặc <span className="font-mono font-bold">123456</span>). Có thể đổi mật khẩu bất kỳ lúc nào trong trang Quản trị.</li>
                  <li><strong>Soạn câu hỏi bằng AI:</strong> Vào <em>"Quản trị &gt; AI Trợ lý tạo học liệu"</em>, chọn khối lớp và chủ đề. AI Gemini sẽ tự động tạo bộ đề kèm lời giải chi tiết và cho phép xuất bản thành game chỉ với 1 click.</li>
                  <li><strong>Tổ chức thi đấu:</strong> Tạo phòng thi mới, đặt hạn chót và phát mã phòng cho học sinh.</li>
                  <li><strong>Quản lý học sinh & xuất Excel:</strong> Thêm, sửa, xóa, khóa tài khoản hoặc nhập/xuất danh sách lớp ra file Excel (.xlsx).</li>
                  <li><strong>Theo dõi kết quả:</strong> Xem phổ điểm, điểm trung bình từng lớp và danh sách các bạn chưa làm bài để nhắc nhở kịp thời.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsGuideOpen(false)}
                className="px-6 py-2.5 bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold rounded-xl cursor-pointer shadow text-base"
              >
                Đã hiểu (Đóng)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
