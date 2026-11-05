import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Download, 
  ArrowLeft, 
  Award, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Presentation,
  FileCode,
  ShieldCheck,
  Trophy
} from 'lucide-react';
import { GameItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { soundService } from '../../services/soundService';

interface FullScreenGameViewerProps {
  game: GameItem;
  currentUser: UserProfile;
  roomCode?: string;
  onExit: () => void;
  onFinished?: () => void;
}

export const FullScreenGameViewer: React.FC<FullScreenGameViewerProps> = ({
  game,
  currentUser,
  roomCode = '',
  onExit,
  onFinished
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [keyCounter, setKeyCounter] = useState(0);
  const [timeLeft, setTimeLeft] = useState((game.durationMinutes || 15) * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(game.maxScore || 100);
  const [showControls, setShowControls] = useState(true);

  // Listen to browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Toggle fullscreen mode
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          if (containerRef.current.requestFullscreen) {
            await containerRef.current.requestFullscreen();
          } else if ((containerRef.current as any).webkitRequestFullscreen) {
            await (containerRef.current as any).webkitRequestFullscreen();
          }
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  const handleReload = () => {
    setKeyCounter((prev) => prev + 1);
  };

  const handleFinish = async () => {
    setIsCompleted(true);
    soundService.playVictory();
    try {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
    } catch {}

    // Save attempt to backend
    await api.saveAttempt({
      studentCode: currentUser.code || 'HS1001',
      studentName: currentUser.name || 'Học sinh',
      className: currentUser.className || '12A1',
      gameId: game.id,
      gameTitle: game.title,
      score: score,
      durationSeconds: ((game.durationMinutes || 15) * 60) - timeLeft,
      startedAt: new Date(Date.now() - (((game.durationMinutes || 15) * 60) - timeLeft) * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      totalQuestions: game.questionsCount || 10,
      correctCount: Math.round(((score / (game.maxScore || 100)) * (game.questionsCount || 10))),
      incorrectCount: Math.max(0, (game.questionsCount || 10) - Math.round(((score / (game.maxScore || 100)) * (game.questionsCount || 10)))),
      status: 'completed',
      roomCode: roomCode || undefined
    });

    if (onFinished) onFinished();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine iframe source URL
  let iframeSrc = game.fileUrl || '';
  const isPowerPoint = game.fileType === 'powerpoint' || (game.fileName && /\.(pptx|ppt|ppsx)$/i.test(game.fileName));
  const isHtml = game.fileType === 'html' || (game.fileName && /\.(html|htm)$/i.test(game.fileName));

  // If PowerPoint file is hosted publicly, use Microsoft Office Online Viewer
  if (isPowerPoint && iframeSrc.startsWith('http')) {
    iframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(iframeSrc)}`;
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-[#030D1A] flex flex-col transition-all overflow-hidden ${
        isFullscreen 
          ? 'fixed inset-0 z-50 h-screen w-screen' 
          : 'rounded-3xl shadow-2xl border-4 border-[#0878DC] min-h-[680px] h-[78vh]'
      }`}
    >
      
      {/* Top Floating / Fixed Toolbar */}
      <div className="bg-gradient-to-r from-[#063B8E] via-[#0878DC] to-[#063B8E] text-white px-4 py-3 flex items-center justify-between border-b-2 border-[#00CFFF]/40 z-20 shrink-0 font-serif shadow-md">
        
        {/* Left: Game Info & Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-sm"
            title="Thoát trò chơi"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <div className="h-5 w-[1px] bg-white/30 hidden sm:block"></div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-white line-clamp-1">
                {game.title}
              </span>
              {isPowerPoint ? (
                <span className="bg-rose-600 text-white text-xs px-2.5 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shrink-0">
                  <Presentation className="w-3.5 h-3.5" />
                  <span>PowerPoint Game</span>
                </span>
              ) : (
                <span className="bg-cyan-500 text-[#041E42] text-xs px-2.5 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shrink-0">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>HTML5 Web Game</span>
                </span>
              )}
            </div>
            <div className="text-xs text-[#E0F2FE]">
              {game.topic} • Khối {game.grade === 'all' ? '10-11-12' : game.grade} • Thầy Bùi Ngọc Thắng (THPT Đan Phượng)
            </div>
          </div>
        </div>

        {/* Center / Right: Timer & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Countdown Timer */}
          <div className="hidden md:flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl border border-white/20 text-sm font-mono font-bold text-[#FFDE59]">
            <Clock className="w-4 h-4 text-[#FFDE59]" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Download Original File Button (if uploaded) */}
          {game.fileUrl && (
            <a
              href={game.fileUrl}
              download={game.fileName || 'game-file'}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-bold"
              title="Tải tệp game gốc về máy tính"
            >
              <Download className="w-4 h-4 text-[#FFDE59]" />
              <span>Tải file</span>
            </a>
          )}

          {/* Reload button */}
          <button
            onClick={handleReload}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tải lại trò chơi (F5)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* PROMINENT FULLSCREEN TOGGLE BUTTON */}
          <button
            onClick={toggleFullscreen}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg transition-transform transform active:scale-95 ${
              isFullscreen
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-900 border-2 border-white'
                : 'bg-gradient-to-r from-[#00CFFF] to-[#0878DC] hover:from-[#0878DC] hover:to-[#00CFFF] text-[#041E42] font-black border border-white/40'
            }`}
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to hết màn hình máy tính'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Thu nhỏ</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Mở rộng toàn màn hình</span>
              </>
            )}
          </button>

          {/* Finish & Record Score */}
          {!isCompleted ? (
            <button
              onClick={handleFinish}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow"
              title="Hoàn thành bài chơi và lưu điểm vào bảng vàng"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">Hoàn thành</span>
            </button>
          ) : (
            <div className="bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[#FFDE59]" />
              <span>Đã lưu điểm</span>
            </div>
          )}
        </div>

      </div>

      {/* Main Game Stage / Iframe Screen */}
      <div className="flex-1 w-full h-full relative bg-[#020B16] flex items-center justify-center overflow-hidden">
        
        {/* If direct HTML document provided (from Supabase html_content or uploaded HTML) */}
        {game.embedCode && !game.embedCode.includes('<iframe') ? (
          <iframe
            key={keyCounter}
            srcDoc={game.embedCode}
            title={game.title}
            className="w-full h-full border-0 select-none bg-white"
            allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
          />
        ) : game.embedCode && game.embedCode.includes('<iframe') ? (
          <div 
            key={keyCounter}
            className="w-full h-full flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: game.embedCode }}
          />
        ) : iframeSrc ? (
          <iframe
            key={keyCounter}
            src={iframeSrc}
            title={game.title}
            className="w-full h-full border-0 select-none"
            allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
          />
        ) : (
          <div className="text-center p-8 text-white space-y-4 max-w-md">
            <Presentation className="w-16 h-16 text-[#00CFFF] mx-auto animate-pulse" />
            <h3 className="text-2xl font-bold font-serif text-[#FFDE59]">{game.title}</h3>
            <p className="text-slate-300 text-base font-serif leading-relaxed">
              Trò chơi PowerPoint / Interactive Game đã sẵn sàng khởi động trên nền tảng TOAN GAME HUB.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={toggleFullscreen}
                className="px-6 py-2.5 rounded-xl bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold cursor-pointer font-serif flex items-center gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Trình chiếu toàn màn hình</span>
              </button>
            </div>
          </div>
        )}

        {/* Completion Modal Overlay */}
        {isCompleted && (
          <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-[#0878DC] shadow-2xl text-center space-y-4 font-serif text-slate-800">
              <div className="text-5xl">🎉</div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#063B8E]">
                Chúc mừng hoàn thành!
              </h3>
              <p className="text-slate-600 text-base leading-relaxed">
                Bạn đã hoàn thành trò chơi <strong>{game.title}</strong>! Điểm số đã được ghi nhận tự động vào học bạ học tập THPT Đan Phượng.
              </p>
              
              <div className="bg-[#EAF5FF] p-4 rounded-2xl border border-[#0878DC]/30 max-w-xs mx-auto">
                <div className="text-xs uppercase text-[#0878DC] font-bold">Điểm đạt được</div>
                <div className="text-4xl font-black text-[#063B8E] mt-1">{score} điểm</div>
                <div className="text-xs text-slate-500 mt-1">Thời gian: {formatTime(((game.durationMinutes || 15) * 60) - timeLeft)}</div>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setIsCompleted(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-300 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
                >
                  Chơi tiếp
                </button>
                <button
                  onClick={onExit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#063B8E] to-[#0878DC] text-white font-bold shadow-lg hover:shadow-xl cursor-pointer"
                >
                  Về kho trò chơi
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
