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
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  ShieldCheck, 
  Trophy,
  Sparkles,
  HelpCircle,
  Repeat
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
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [keyCounter, setKeyCounter] = useState(0);
  const [timeLeft, setTimeLeft] = useState((game.durationMinutes || 15) * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(game.maxScore || 100);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.isMuted());
  const [showChallengeOverlay, setShowChallengeOverlay] = useState(false);
  const [selectedChallengeAnswer, setSelectedChallengeAnswer] = useState<number | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Detect file type
  const isVideo = game.fileType === 'video' || (game.fileUrl && /\.(mp4|webm|m4v)$/i.test(game.fileUrl)) || (game.fileName && /\.(mp4|webm|m4v)$/i.test(game.fileName));
  const isPowerPoint = game.fileType === 'powerpoint' || (game.fileName && /\.(pptx|ppt|ppsx)$/i.test(game.fileName));
  const isHtml = game.fileType === 'html' || (game.fileName && /\.(html|htm|htlm)$/i.test(game.fileName));

  // Sync with soundService
  useEffect(() => {
    return soundService.subscribe((muted) => {
      setIsMuted(muted);
      if (videoRef.current) {
        videoRef.current.muted = muted;
      }
    });
  }, []);

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

  // Keyboard shortcut: F11 or Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.code === 'Space' && isVideo && e.target === document.body) {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isPlaying, isVideo]);

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
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      soundService.playClick();
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      soundService.playClick();
    }
  };

  const seekVideo = (secondsDelta: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + secondsDelta));
    soundService.playClick();
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    soundService.playClick();
  };

  const toggleMute = () => {
    const newMuted = soundService.toggleMute();
    setIsMuted(newMuted);
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
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
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine iframe source URL
  let iframeSrc = game.fileUrl || '';
  if (isPowerPoint && iframeSrc.startsWith('http')) {
    iframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(iframeSrc)}`;
  }

  // Interactive checkpoint question sample
  const checkpoint = {
    question: `Câu hỏi tương tác từ bài giảng ${game.title}: Điểm cực trị và đạo hàm của hàm số đạt giá trị gì?`,
    options: [
      'A. y\' = 0 hoặc đạo hàm không xác định tại điểm đó',
      'B. y\' luôn dương trên toàn tập xác định',
      'C. y\' luôn âm trên toàn tập xác định',
      'D. Đạo hàm luôn bằng 1'
    ],
    correctIndex: 0
  };

  const handleAnswerChallenge = (index: number) => {
    setSelectedChallengeAnswer(index);
    if (index === checkpoint.correctIndex) {
      setChallengeFeedback('correct');
      soundService.playCorrect();
      setScore(Math.min(game.maxScore || 100, score + 10));
    } else {
      setChallengeFeedback('wrong');
      soundService.playWrong();
    }
  };

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
              {isVideo ? (
                <span className="bg-purple-600 text-white text-xs px-2.5 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shrink-0 shadow-sm border border-purple-400">
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Game (.MP4)</span>
                </span>
              ) : isPowerPoint ? (
                <span className="bg-orange-600 text-white text-xs px-2.5 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shrink-0 shadow-sm border border-orange-400">
                  <Presentation className="w-3.5 h-3.5" />
                  <span>PowerPoint Game</span>
                </span>
              ) : (
                <span className="bg-emerald-600 text-white text-xs px-2.5 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shrink-0 shadow-sm border border-emerald-400">
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

      {/* Main Game Stage */}
      <div className="flex-1 w-full h-full relative bg-[#020B16] flex items-center justify-center overflow-hidden">
        
        {/* CASE 1: MP4 VIDEO GAME PLAYER */}
        {isVideo && game.fileUrl ? (
          <div className="w-full h-full flex flex-col justify-between relative bg-black">
            {/* Video Element */}
            <div 
              className="flex-1 relative flex items-center justify-center cursor-pointer group"
              onClick={togglePlayPause}
            >
              <video
                ref={videoRef}
                src={game.fileUrl}
                autoPlay
                playsInline
                loop={isLooping}
                muted={isMuted}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setVideoCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setVideoDuration(videoRef.current.duration);
                  }
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  setShowChallengeOverlay(true);
                }}
                className="max-h-full max-w-full object-contain mx-auto"
              />

              {/* Big Center Play/Pause Indicator on hover/pause */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-2xs transition-opacity">
                  <div className="w-20 h-20 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-2xl border-4 border-white/80 transform hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 ml-1.5" />
                  </div>
                </div>
              )}

              {/* Floating Challenge trigger button on the top right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChallengeOverlay(prev => !prev);
                  if (videoRef.current && !videoRef.current.paused) {
                    videoRef.current.pause();
                    setIsPlaying(false);
                  }
                }}
                className="absolute top-4 right-4 bg-purple-700/85 hover:bg-purple-600 text-white px-3.5 py-1.5 rounded-xl font-bold font-serif text-xs sm:text-sm flex items-center gap-1.5 border border-purple-400 shadow-lg cursor-pointer backdrop-blur-sm active:scale-95 z-30"
                title="Bấm để mở câu hỏi đố vui tương tác của Video"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Thử thách câu hỏi Video</span>
              </button>
            </div>

            {/* Video Interactive Controls Bar */}
            <div className="bg-gradient-to-t from-black via-slate-950/90 to-transparent p-3 sm:p-4 text-white space-y-2 z-20">
              {/* Timeline Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#00CFFF] min-w-[45px]">
                  {formatTime(videoCurrentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={videoDuration || 100}
                  step="0.1"
                  value={videoCurrentTime}
                  onChange={(e) => {
                    const time = Number(e.target.value);
                    setVideoCurrentTime(time);
                    if (videoRef.current) {
                      videoRef.current.currentTime = time;
                    }
                  }}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
                />
                <span className="text-xs font-mono text-slate-400 min-w-[45px] text-right">
                  {formatTime(videoDuration)}
                </span>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {/* Play, Rewind, Forward */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow cursor-pointer transition-transform active:scale-95"
                    title={isPlaying ? 'Tạm dừng (Space)' : 'Phát tiếp (Space)'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => seekVideo(-10)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    title="Tua lùi 10 giây"
                  >
                    <Rewind className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => seekVideo(10)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    title="Tua tới 10 giây"
                  >
                    <FastForward className="w-4 h-4" />
                  </button>

                  {/* Sound Toggle */}
                  <button
                    onClick={toggleMute}
                    className={`p-2 rounded-xl border cursor-pointer ${
                      isMuted 
                        ? 'bg-red-500/20 text-red-300 border-red-400/50' 
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                    }`}
                    title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Speed & Loop & Fullscreen */}
                <div className="flex items-center gap-2">
                  {/* Speed options */}
                  <div className="flex items-center bg-white/10 rounded-xl p-0.5 text-xs font-bold font-sans">
                    {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          playbackSpeed === speed ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  {/* Loop toggle */}
                  <button
                    onClick={() => setIsLooping(prev => !prev)}
                    className={`p-2 rounded-xl border cursor-pointer ${
                      isLooping 
                        ? 'bg-purple-600/40 text-purple-300 border-purple-400' 
                        : 'bg-white/10 text-slate-400 border-transparent hover:bg-white/20'
                    }`}
                    title={isLooping ? 'Đang lặp lại video' : 'Không lặp video'}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>

                  {/* Fullscreen button */}
                  <button
                    onClick={toggleFullscreen}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Toàn màn hình</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Challenge Modal Overlay on Video */}
            {showChallengeOverlay && (
              <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 max-w-lg w-full border-4 border-purple-600 shadow-2xl text-slate-800 space-y-4 font-serif">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h4 className="text-xl font-bold text-[#063B8E]">
                        Thử Thách Video Toán Học
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowChallengeOverlay(false)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer font-sans font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-sm font-bold text-slate-700">
                    {checkpoint.question}
                  </p>

                  <div className="space-y-2">
                    {checkpoint.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerChallenge(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-sm font-serif transition-all cursor-pointer ${
                          selectedChallengeAnswer === idx
                            ? idx === checkpoint.correctIndex
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold'
                              : 'bg-red-100 border-red-500 text-red-900 font-bold'
                            : 'bg-slate-50 border-slate-200 hover:bg-purple-50 hover:border-purple-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {challengeFeedback === 'correct' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Chính xác tuyệt vời! Bạn được cộng thêm 10 điểm thưởng!</span>
                    </div>
                  )}

                  {challengeFeedback === 'wrong' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
                      Chưa chính xác! Hãy quan sát kỹ lại nội dung video để tìm đáp án đúng nhé!
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowChallengeOverlay(false);
                        if (videoRef.current) {
                          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                        }
                      }}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm cursor-pointer shadow"
                    >
                      Tiếp tục xem Video
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : game.embedCode && !game.embedCode.includes('<iframe') ? (
          /* CASE 2: DIRECT HTML DOCUMENT */
          <iframe
            key={keyCounter}
            srcDoc={game.embedCode}
            title={game.title}
            className="w-full h-full border-0 select-none bg-white"
            allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
          />
        ) : game.embedCode && game.embedCode.includes('<iframe') ? (
          /* CASE 3: EMBED CODE WITH IFRAME */
          <div 
            key={keyCounter}
            className="w-full h-full flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: game.embedCode }}
          />
        ) : iframeSrc ? (
          /* CASE 4: IFRAME URL (HTML or Office Online PowerPoint) */
          <iframe
            key={keyCounter}
            src={iframeSrc}
            title={game.title}
            className="w-full h-full border-0 select-none"
            allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
          />
        ) : (
          /* FALLBACK BANNER */
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
