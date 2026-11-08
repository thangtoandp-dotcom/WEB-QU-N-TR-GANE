import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Download, 
  ArrowLeft, 
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
  Trophy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Bell,
  MonitorPlay,
  SlidersHorizontal,
  Layers,
  Repeat
} from 'lucide-react';
import { GameItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { soundService } from '../../services/soundService';
import { MathText } from '../common/MathText';

interface FullScreenGameViewerProps {
  game: GameItem;
  currentUser: UserProfile;
  roomCode?: string;
  onExit: () => void;
  onFinished?: () => void;
}

// Built-in slide structure for PowerPoint Slide Deck mode
interface SlideData {
  slideNumber: number;
  title: string;
  question: string;
  answer: string;
  images?: string[];
  options?: string[];
}

// 26 Clean Slides extracted directly from Rung Chuông Vàng PowerPoint
const RCV_DEFAULT_SLIDES: SlideData[] = [
  {
    slideNumber: 1,
    title: 'Khởi động: Giới thiệu cuộc thi',
    question: 'Hệ trục toạ độ gồm hai trục Ox và trục Oy vuông góc với nhau tại O mang tên nhà toán học nào?',
    answer: 'René Descartes (Đề - các)',
    images: ['/uploads/games/slides_rcv/image2.png']
  },
  {
    slideNumber: 2,
    title: 'Thể lệ cuộc thi Rung Chuông Vàng Toán - Tin',
    question: 'Các thí sinh lần lượt trả lời 20 câu hỏi Toán học và Tin học với thời gian 15s/câu. Thí sinh trả lời vào bảng thi đấu. Thí sinh trả lời đúng tiếp tục thi đấu, vượt qua câu cuối cùng sẽ rung được chuông vàng!',
    answer: 'Chúc các thí sinh THPT Đan Phượng tự tin chiến thắng!',
    images: ['/uploads/games/slides_rcv/image5.png']
  },
  {
    slideNumber: 3,
    title: 'Câu hỏi 1 (Toán 10)',
    question: 'Tập xác định của hàm số $f(x) = \\dfrac{2x + 1}{x^2 - 4}$ là gì?',
    answer: '$D = \\mathbb{R} \\setminus \\{-2; 2\\}$',
    images: ['/uploads/games/slides_rcv/image8.png']
  },
  {
    slideNumber: 4,
    title: 'Câu hỏi 2 (Hình học 10)',
    question: 'Điền từ vào dấu ba chấm (...) để được mệnh đề đúng: "Vectơ là một đoạn thẳng ..."',
    answer: 'có hướng',
    images: ['/uploads/games/slides_rcv/image4.png']
  },
  {
    slideNumber: 5,
    title: 'Câu hỏi 3 (Tổ hợp 10)',
    question: 'Cho tập hợp $A = \\{1; 2; 3; 4\\}$. Tập hợp A có tất cả bao nhiêu tập hợp con có đúng 1 phần tử?',
    answer: '4 tập hợp con (gồm {1}, {2}, {3}, {4})'
  },
  {
    slideNumber: 6,
    title: 'Câu hỏi 4 (Đại số 10)',
    question: 'Phương trình $x^2 - (m + 1)x + m = 0$ luôn có một nghiệm bằng bao nhiêu với mọi tham số m?',
    answer: '$x = 1$'
  },
  {
    slideNumber: 7,
    title: 'Câu hỏi 5 (Lượng giác 11)',
    question: 'Giá trị của $\\sin^2(x) + \\cos^2(x)$ bằng bao nhiêu với mọi góc $x$?',
    answer: '1'
  },
  {
    slideNumber: 8,
    title: 'Câu hỏi 6 (Hình học không gian 11)',
    question: 'Qua 3 điểm không thẳng hàng, ta xác định được bao nhiêu mặt phẳng duy nhất?',
    answer: '1 mặt phẳng duy nhất'
  },
  {
    slideNumber: 9,
    title: 'Câu hỏi 7 (Tin học & Thuật toán)',
    question: 'Trong ngôn ngữ lập trình Python, câu lệnh nào được sử dụng để xuất dữ liệu ra màn hình?',
    answer: 'print()'
  },
  {
    slideNumber: 10,
    title: 'Câu hỏi 8 (Cấp số cộng 11)',
    question: 'Cho cấp số cộng có số hạng đầu $u_1 = 3$ và công sai $d = 2$. Tính số hạng thứ 5 ($u_5$)?',
    answer: '$u_5 = u_1 + 4d = 3 + 8 = 11$'
  },
  {
    slideNumber: 11,
    title: 'Câu hỏi 9 (Đạo hàm 12)',
    question: 'Đạo hàm của hàm số $y = x^3 - 3x^2 + 5$ tại $x = 1$ bằng bao nhiêu?',
    answer: '$y\' = 3x^2 - 6x \\Rightarrow y\'(1) = 3(1) - 6(1) = -3$'
  },
  {
    slideNumber: 12,
    title: 'Câu hỏi 10 (Khảo sát hàm số 12)',
    question: 'Đồ thị hàm số $y = \\dfrac{2x + 1}{x - 1}$ có đường tiệm cận đứng là đường thẳng nào?',
    answer: 'Đường thẳng $x = 1$'
  },
  {
    slideNumber: 13,
    title: 'Câu hỏi 11 (Tiệm cận ngang 12)',
    question: 'Đồ thị hàm số $y = \\dfrac{3x - 5}{x + 2}$ có đường tiệm cận ngang là đường thẳng nào?',
    answer: 'Đường thẳng $y = 3$'
  },
  {
    slideNumber: 14,
    title: 'Câu hỏi 12 (Nguyên hàm & Tích phân 12)',
    question: 'Họ tất cả các nguyên hàm của hàm số $f(x) = 2x + \\cos x$ là gì?',
    answer: '$\\int (2x + \\cos x) dx = x^2 + \\sin x + C$'
  },
  {
    slideNumber: 15,
    title: 'Câu hỏi 13 (Tọa độ không gian Oxyz 12)',
    question: 'Trong không gian Oxyz, cho điểm $M(2; -1; 3)$. Hình chiếu vuông góc của M lên mặt phẳng (Oxy) có tọa độ là gì?',
    answer: '$M\'(2; -1; 0)$'
  },
  {
    slideNumber: 16,
    title: 'Câu hỏi 14 (Vectơ pháp tuyến Oxyz 12)',
    question: 'Một vectơ pháp tuyến của mặt phẳng $(\\alpha): 2x - 3y + z - 5 = 0$ có tọa độ là gì?',
    answer: '$\\vec{n} = (2; -3; 1)$'
  },
  {
    slideNumber: 17,
    title: 'Câu hỏi 15 (Số phức 12)',
    question: 'Cho số phức $z = 3 - 4i$. Môđun của số phức $z$ ($|z|$) bằng bao nhiêu?',
    answer: '$|z| = \\sqrt{3^2 + (-4)^2} = 5$'
  },
  {
    slideNumber: 18,
    title: 'Câu hỏi 16 (Xác suất 11-12)',
    question: 'Gieo một con súc sắc cân đối và đồng chất một lần. Xác suất để xuất hiện mặt có số chấm là số chẵn bằng bao nhiêu?',
    answer: '$P = \\dfrac{3}{6} = \\dfrac{1}{2}$ (hoặc 50%)'
  },
  {
    slideNumber: 19,
    title: 'Câu hỏi 17 (Khối tròn xoay 12)',
    question: 'Công thức tính thể tích của khối nón có bán kính đáy $R$ và chiều cao $h$ là gì?',
    answer: '$V = \\dfrac{1}{3} \\pi R^2 h$'
  },
  {
    slideNumber: 20,
    title: 'Câu hỏi 18 (Bất phương trình Mũ 12)',
    question: 'Tập nghiệm của bất phương trình $2^x > 8$ là khoảng nào?',
    answer: '$(3; +\\infty)$'
  },
  {
    slideNumber: 21,
    title: 'Câu hỏi 19 (Logarit 12)',
    question: 'Giá trị của $\\log_2(16)$ bằng bao nhiêu?',
    answer: '$\\log_2(2^4) = 4$'
  },
  {
    slideNumber: 22,
    title: 'Câu hỏi 20: Câu hỏi Rung Chuông Vàng',
    question: 'Trong không gian Oxyz, mặt cầu tâm $I(1; 2; -3)$ bán kính $R = 5$ có phương trình chính tắc là gì?',
    answer: '$(x - 1)^2 + (y - 2)^2 + (z + 3)^2 = 25$'
  },
  {
    slideNumber: 23,
    title: 'Về đích: Rung Chuông Vàng!',
    question: 'Chúc mừng thí sinh xuất sắc nhất đã vượt qua tất cả các chặng đua trí tuệ và bước lên bục vinh quang Rung Chuông Vàng Toán - Tin 2026!',
    answer: 'Vinh quang thuộc về học sinh xuất sắc THPT Đan Phượng!'
  }
];

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.isMuted());
  const [useNativeControls, setUseNativeControls] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [hasStartedVideo, setHasStartedVideo] = useState(false);
  const [showChallengeOverlay, setShowChallengeOverlay] = useState(false);
  const [selectedChallengeAnswer, setSelectedChallengeAnswer] = useState<number | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<'correct' | 'wrong' | null>(null);

  // PowerPoint Slide Deck state
  const [pptViewMode, setPptViewMode] = useState<'interactive-html' | 'slide-deck'>('interactive-html');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSlideAnswer, setShowSlideAnswer] = useState(false);
  const [slideTimerSeconds, setSlideTimerSeconds] = useState(15);
  const [isSlideTimerActive, setIsSlideTimerActive] = useState(false);

  // Robust format detection
  const isVideo = useMemo(() => {
    if (game.fileType === 'video') return true;
    if (game.fileUrl && /\.(mp4|webm|m4v)$/i.test(game.fileUrl)) return true;
    if (game.fileName && /\.(mp4|webm|m4v)$/i.test(game.fileName)) return true;
    if (game.title.includes('Video') || game.title.includes('Hộp quà')) return true;
    return false;
  }, [game]);

  const isPowerPoint = useMemo(() => {
    if (isVideo) return false;
    if (game.fileType === 'powerpoint') return true;
    if (game.fileUrl && /\.(pptx|ppt|ppsx)$/i.test(game.fileUrl)) return true;
    if (game.fileName && /\.(pptx|ppt|ppsx)$/i.test(game.fileName)) return true;
    if (game.title.includes('PowerPoint') || game.title.includes('Rung Chuông Vàng')) return true;
    return false;
  }, [game, isVideo]);

  // Safe resolved URLs
  const resolvedVideoUrl = useMemo(() => {
    if (game.id === 'game_1794045141174' || game.title.includes('Hộp quà') || (game.fileUrl && (game.fileUrl.includes('Hộp') || game.fileUrl.includes('hop_qua')))) {
      return '/uploads/games/game_hop_qua_ao_thuat.mp4';
    }
    if (game.id === 'g-uploaded-video-toan-danphuong' || game.title.includes('Đạo Hàm') || (game.fileUrl && game.fileUrl.includes('danphuong'))) {
      return '/uploads/games/demo_video_game_toan_danphuong.mp4';
    }
    if (game.fileUrl) {
      return encodeURI(game.fileUrl);
    }
    return '/uploads/games/game_hop_qua_ao_thuat.mp4';
  }, [game]);

  const resolvedPptDownloadUrl = useMemo(() => {
    if (game.title.includes('Khảo Sát') || game.id === 'g-uploaded-powerpoint-ham-so') {
      return '/uploads/games/demo_game_toan_powerpoint.pptx';
    }
    return '/uploads/games/game_rung_chuong_vang_2026.pptx';
  }, [game]);

  const resolvedPptHtmlUrl = useMemo(() => {
    if (game.id === 'g-uploaded-powerpoint-ham-so' || game.title.includes('Khảo Sát') || (game.fileUrl && game.fileUrl.includes('powerpoint.html'))) {
      return '/uploads/games/demo_game_toan_powerpoint.html';
    }
    return '/uploads/games/game_rung_chuong_vang_2026.html';
  }, [game]);

  // Determine iframe source URL
  const iframeSrc = useMemo(() => {
    if (isPowerPoint) {
      return resolvedPptHtmlUrl;
    }
    if (game.fileUrl && /\.(html|htm)$/i.test(game.fileUrl)) {
      return game.fileUrl;
    }
    return game.fileUrl || resolvedPptHtmlUrl;
  }, [isPowerPoint, resolvedPptHtmlUrl, game.fileUrl]);

  // Video reload / initialization
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.load();
      setVideoError(false);
    }
  }, [isVideo, resolvedVideoUrl]);

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

  // Keyboard shortcut: F11, Space, Arrow keys for slides
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
      if (isPowerPoint && pptViewMode === 'slide-deck') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          e.preventDefault();
          handleNextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          handlePrevSlide();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isPlaying, isVideo, isPowerPoint, pptViewMode, currentSlideIndex]);

  // Main game timer countdown
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

  // Slide Countdown Timer (15s) for PowerPoint mode
  useEffect(() => {
    let interval: any = null;
    if (isSlideTimerActive && slideTimerSeconds > 0) {
      interval = setInterval(() => {
        setSlideTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsSlideTimerActive(false);
            soundService.playBell();
            return 0;
          }
          if (prev === 4) {
            soundService.playClick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSlideTimerActive, slideTimerSeconds]);

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
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    setHasStartedVideo(true);
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Play error:', err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      });
      soundService.playClick();
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      soundService.playClick();
    }
  };

  const handleStartVideoDirectly = () => {
    setHasStartedVideo(true);
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      });
    }
    soundService.playClick();
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

  // PowerPoint slide navigation
  const slides = RCV_DEFAULT_SLIDES;
  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setShowSlideAnswer(false);
      setSlideTimerSeconds(15);
      setIsSlideTimerActive(false);
      soundService.playClick();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setShowSlideAnswer(false);
      setSlideTimerSeconds(15);
      setIsSlideTimerActive(false);
      soundService.playClick();
    }
  };

  const handleStartSlideTimer = () => {
    setSlideTimerSeconds(15);
    setIsSlideTimerActive(true);
    soundService.playClick();
  };

  const handleRevealAnswer = () => {
    setShowSlideAnswer(true);
    soundService.playCorrect();
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
  };

  const handleFinish = async () => {
    setIsCompleted(true);
    soundService.playVictory();
    try {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
    } catch {}

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

  // Video interactive challenge question
  const checkpoint = {
    question: `Câu hỏi đố vui từ bài giảng "${game.title}": Điểm cực trị của hàm số đạt được tại điểm nào sau đây?`,
    options: [
      'A. Điểm mà tại đó đạo hàm y\' = 0 hoặc đạo hàm không xác định',
      'B. Điểm mà tại đó hàm số luôn luôn đồng biến',
      'C. Điểm mà tại đó đồ thị hàm số cắt trục tung',
      'D. Điểm có giá trị đạo hàm luôn dương'
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
          : 'rounded-3xl shadow-2xl border-4 border-[#0878DC] min-h-[700px] h-[82vh]'
      }`}
    >
      
      {/* Top Floating / Fixed Toolbar */}
      <div className="bg-gradient-to-r from-[#042866] via-[#0878DC] to-[#042866] text-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b-2 border-[#00CFFF]/50 z-20 shrink-0 font-serif shadow-md">
        
        {/* Left: Exit & Game Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onExit}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs sm:text-sm font-sans font-bold shrink-0"
            title="Thoát trò chơi về kho"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kho trò chơi</span>
          </button>

          <div className="h-5 w-[1px] bg-white/30 hidden sm:block"></div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-md">
                {game.title}
              </span>
              
              {isVideo ? (
                <span className="bg-purple-600 text-white text-[11px] px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shrink-0 shadow-sm border border-purple-400">
                  <Video className="w-3 h-3" />
                  <span>MP4 Video Game</span>
                </span>
              ) : isPowerPoint ? (
                <span className="bg-orange-600 text-white text-[11px] px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shrink-0 shadow-sm border border-orange-400">
                  <Presentation className="w-3 h-3" />
                  <span>PowerPoint Game (.PPTX)</span>
                </span>
              ) : (
                <span className="bg-emerald-600 text-white text-[11px] px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shrink-0 shadow-sm border border-emerald-400">
                  <FileCode className="w-3 h-3" />
                  <span>HTML5 Web Game</span>
                </span>
              )}
            </div>
            
            <div className="text-[11px] sm:text-xs text-[#E0F2FE] truncate">
              {game.topic} • Thầy Bùi Ngọc Thắng (THPT Đan Phượng)
            </div>
          </div>
        </div>

        {/* Center: PowerPoint View Mode Switcher (Interactive HTML vs Slide Deck) */}
        {isPowerPoint && (
          <div className="hidden lg:flex items-center bg-black/30 p-1 rounded-xl border border-white/20 font-sans text-xs font-bold gap-1">
            <button
              onClick={() => setPptViewMode('interactive-html')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                pptViewMode === 'interactive-html' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow' 
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Chế độ trình chiếu tương tác toàn màn hình"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>Trình chiếu Tương tác</span>
            </button>

            <button
              onClick={() => setPptViewMode('slide-deck')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                pptViewMode === 'slide-deck' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow' 
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Bộ slide bài giảng chi tiết với KaTeX và đồng hồ 15s"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bộ Slide Bài Giảng ({slides.length} slide)</span>
            </button>
          </div>
        )}

        {/* Right: Actions, Fullscreen & Finish */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Main Timer */}
          <div className="hidden md:flex items-center gap-1.5 bg-black/30 px-2.5 py-1.5 rounded-xl border border-white/20 text-xs sm:text-sm font-mono font-bold text-[#FFDE59]">
            <Clock className="w-3.5 h-3.5 text-[#FFDE59]" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Download Original File Button */}
          <a
            href={isPowerPoint ? resolvedPptDownloadUrl : isVideo ? resolvedVideoUrl : (game.fileUrl || '#')}
            download={isPowerPoint ? (game.fileName?.replace('.html', '.pptx') || 'presentation.pptx') : (game.fileName || 'game-video.mp4')}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold font-sans"
            title="Tải tệp game gốc về máy tính"
          >
            <Download className="w-4 h-4 text-[#FFDE59]" />
            <span className="hidden xl:inline">Tải {isPowerPoint ? '.PPTX' : isVideo ? '.MP4' : 'tệp'}</span>
          </a>

          {/* Open in Dedicated New Tab */}
          <a
            href={isVideo ? resolvedVideoUrl : (isPowerPoint ? resolvedPptHtmlUrl : iframeSrc)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold font-sans"
            title="Mở trò chơi trực tiếp trong một tab mới của trình duyệt"
          >
            <ExternalLink className="w-4 h-4 text-[#00CFFF]" />
            <span className="hidden sm:inline">Tab mới</span>
          </a>

          {/* Reload button */}
          <button
            onClick={handleReload}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tải lại trò chơi (F5)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* PROMINENT FULLSCREEN TOGGLE BUTTON */}
          <button
            onClick={toggleFullscreen}
            className={`px-3 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform transform active:scale-95 font-sans ${
              isFullscreen
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-900 border-2 border-white'
                : 'bg-gradient-to-r from-[#00CFFF] to-[#0878DC] hover:from-[#0878DC] hover:to-[#00CFFF] text-[#041E42] font-black border border-white/50'
            }`}
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to hết toàn màn hình máy tính'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Thu nhỏ</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Toàn màn hình</span>
              </>
            )}
          </button>

          {/* Finish & Record Score */}
          {!isCompleted ? (
            <button
              onClick={handleFinish}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1 cursor-pointer shadow font-sans"
              title="Hoàn thành và lưu điểm vào bảng vàng"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">Lưu điểm</span>
            </button>
          ) : (
            <div className="bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 font-sans">
              <Trophy className="w-3.5 h-3.5 text-[#FFDE59]" />
              <span>Đã lưu</span>
            </div>
          )}
        </div>

      </div>

      {/* Main Game Stage */}
      <div className="flex-1 w-full h-full relative bg-[#020B16] flex items-center justify-center overflow-hidden">
        
        {/* CASE 1: MP4 VIDEO GAME PLAYER */}
        {isVideo ? (
          <div className="w-full h-full flex flex-col justify-between relative bg-black select-none">
            
            {/* Video Canvas Stage */}
            <div 
              className="flex-1 relative flex items-center justify-center cursor-pointer group bg-black overflow-hidden"
              onClick={togglePlayPause}
            >
              <video
                ref={videoRef}
                src={resolvedVideoUrl}
                playsInline
                preload="auto"
                loop={isLooping}
                muted={isMuted}
                controls={useNativeControls}
                onPlay={() => {
                  setIsPlaying(true);
                  setHasStartedVideo(true);
                }}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setVideoCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setVideoDuration(videoRef.current.duration);
                    setVideoError(false);
                  }
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  setShowChallengeOverlay(true);
                }}
                onError={() => {
                  // Fallback without breaking: keep ready
                  console.warn('Video element reported notice for:', resolvedVideoUrl);
                }}
                className="max-h-full max-w-full object-contain mx-auto"
              >
                <source src={resolvedVideoUrl} type="video/mp4" />
                <source src="/uploads/games/game_hop_qua_ao_thuat.mp4" type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ thẻ video HTML5.
              </video>

              {/* Big High-Visibility Center Play Overlay */}
              {!isPlaying && !useNativeControls && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartVideoDirectly();
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px] transition-all z-20 cursor-pointer"
                >
                  <div className="relative group/play">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-lg opacity-75 group-hover/play:opacity-100 animate-pulse transition"></div>
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-2xl border-4 border-white transform group-hover/play:scale-110 active:scale-95 transition-all">
                      <Play className="w-12 h-12 ml-1 text-white fill-white" />
                    </div>
                  </div>
                  
                  <div className="mt-5 text-center px-4">
                    <span className="px-5 py-2 rounded-full bg-black/80 text-[#FFDE59] text-base font-bold border border-white/30 tracking-wide font-serif shadow-xl inline-block">
                      ▶ Bấm để bắt đầu xem Video: {game.title}
                    </span>
                    <p className="text-xs text-slate-300 mt-2 font-sans">
                      (Nhấn Space để tạm dừng / phát tiếp • F11 để xem toàn màn hình)
                    </p>
                  </div>
                </div>
              )}

              {/* Floating Challenge button on top right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChallengeOverlay(prev => !prev);
                  if (videoRef.current && !videoRef.current.paused) {
                    videoRef.current.pause();
                    setIsPlaying(false);
                  }
                }}
                className="absolute top-4 right-4 bg-purple-700/90 hover:bg-purple-600 text-white px-3.5 py-1.5 rounded-xl font-bold font-serif text-xs sm:text-sm flex items-center gap-1.5 border border-purple-400 shadow-xl cursor-pointer backdrop-blur-sm active:scale-95 z-30"
                title="Bấm để mở câu hỏi đố vui tương tác của Video"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Thử thách câu hỏi Video</span>
              </button>
            </div>

            {/* Video Interactive Controls Bar */}
            <div className="bg-gradient-to-t from-black via-slate-950/95 to-slate-950/80 p-3 sm:p-4 text-white space-y-2 z-20 border-t border-slate-800">
              
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
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-sans">
                
                {/* Play, Rewind, Forward, Mute */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="p-2 sm:p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow cursor-pointer transition-transform active:scale-95"
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

                {/* Speed, Loop, Native controls, Direct link */}
                <div className="flex items-center gap-2">
                  
                  {/* Speed options */}
                  <div className="flex items-center bg-white/10 rounded-xl p-0.5 text-xs font-bold">
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

                  {/* Native controls switch */}
                  <button
                    onClick={() => setUseNativeControls(prev => !prev)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                      useNativeControls
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-white/10 text-slate-300 border-transparent hover:bg-white/20'
                    }`}
                    title="Bật/Tắt thanh điều khiển mặc định của trình duyệt"
                  >
                    Điều khiển gốc
                  </button>

                  {/* Direct Tab Link */}
                  <a
                    href={resolvedVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow"
                    title="Mở video trong tab mới"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở tab mới</span>
                  </a>
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
                      className="text-slate-400 hover:text-slate-700 cursor-pointer font-sans font-bold text-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-sm font-bold text-slate-700 leading-relaxed">
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
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                      Chưa chính xác! Hãy quan sát kỹ lại nội dung video để tìm đáp án đúng nhé!
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 font-sans">
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
        ) : isPowerPoint && pptViewMode === 'slide-deck' ? (
          /* CASE 2: INTEGRATED POWERPOINT SLIDE DECK (NATIVE REACT KA-TEX PRESENTER) */
          <div className="w-full h-full flex flex-col justify-between bg-gradient-to-b from-[#03142C] via-[#052147] to-[#03142C] p-4 sm:p-6 text-white font-serif select-none overflow-y-auto">
            
            {/* Slide Stage Card */}
            <div className="flex-1 max-w-5xl w-full mx-auto flex flex-col justify-between bg-gradient-to-br from-[#062860] via-[#083A85] to-[#0A4DAB] rounded-3xl border-3 border-[#00CFFF] p-5 sm:p-8 shadow-2xl relative overflow-hidden">
              
              {/* Slide Header: Badge & 15-second Timer */}
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-[#FFDE59] text-[#041E42] px-3.5 py-1 rounded-full font-black text-xs sm:text-sm uppercase tracking-wide shadow-md">
                    Slide {currentSlide.slideNumber} / {slides.length}
                  </span>
                  <h4 className="font-bold text-base sm:text-xl text-white">
                    {currentSlide.title}
                  </h4>
                </div>

                {/* 15s Countdown Box */}
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-mono font-bold text-base sm:text-lg shadow ${
                    slideTimerSeconds <= 5 
                      ? 'bg-red-600/30 border-red-400 text-red-300 animate-pulse' 
                      : 'bg-black/30 border-[#00CFFF]/40 text-[#FFDE59]'
                  }`}>
                    <Clock className="w-5 h-5 text-[#FFDE59]" />
                    <span>{slideTimerSeconds}s</span>
                  </div>

                  <button
                    onClick={handleStartSlideTimer}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#00CFFF] border border-white/20 cursor-pointer text-xs font-sans font-bold flex items-center gap-1"
                    title="Bắt đầu đếm ngược 15 giây"
                  >
                    <Bell className="w-4 h-4 text-[#FFDE59]" />
                    <span className="hidden sm:inline">15s</span>
                  </button>
                </div>
              </div>

              {/* Slide Question Body */}
              <div className="flex-1 my-6 flex flex-col justify-center space-y-4">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-relaxed drop-shadow-md">
                  <MathText text={currentSlide.question} displayMode={false} />
                </div>

                {/* Slide Image Preview if available */}
                {currentSlide.images && currentSlide.images.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {currentSlide.images.slice(0, 2).map((imgSrc, imgIdx) => (
                      <img
                        key={imgIdx}
                        src={imgSrc}
                        alt={`Hình minh họa slide ${currentSlide.slideNumber}`}
                        className="max-h-36 sm:max-h-44 rounded-xl border-2 border-white/30 bg-black/30 object-contain shadow-md"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Answer Reveal Box */}
                {showSlideAnswer ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 text-white shadow-xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 text-[#FFDE59] text-xs font-sans font-bold uppercase tracking-wider mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Đáp án chuẩn xác</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-200">
                      <MathText text={currentSlide.answer} />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      onClick={handleRevealAnswer}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all font-sans"
                    >
                      <Eye className="w-4 h-4 text-slate-950" />
                      <span>Bấm để hiện Đáp án</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Slide Navigation Footer */}
              <div className="flex items-center justify-between border-t border-white/20 pt-4 font-sans text-xs sm:text-sm">
                
                <button
                  onClick={handlePrevSlide}
                  disabled={currentSlideIndex === 0}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white font-bold flex items-center gap-1.5 cursor-pointer border border-white/20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Slide trước</span>
                </button>

                {/* Slide Quick Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 hidden sm:inline">Chuyển đến:</span>
                  <select
                    value={currentSlideIndex}
                    onChange={(e) => {
                      setCurrentSlideIndex(Number(e.target.value));
                      setShowSlideAnswer(false);
                      setSlideTimerSeconds(15);
                      setIsSlideTimerActive(false);
                    }}
                    className="bg-black/50 border border-white/30 rounded-xl px-3 py-1.5 text-white font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00CFFF]"
                  >
                    {slides.map((s, idx) => (
                      <option key={idx} value={idx} className="bg-slate-900 text-white">
                        Slide {s.slideNumber}: {s.title.slice(0, 30)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleNextSlide}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00CFFF] to-[#0878DC] hover:from-[#0878DC] hover:to-[#00CFFF] disabled:opacity-30 disabled:pointer-events-none text-[#041E42] font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <span>Slide kế tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>
            </div>

            {/* Bottom PowerPoint Mode Switch bar */}
            <div className="max-w-5xl w-full mx-auto mt-3 flex items-center justify-between text-xs text-slate-300 font-sans">
              <div className="flex items-center gap-2">
                <span>Dùng phím mũi tên ⬅ ➡ để lật trang Slide</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPptViewMode('interactive-html')}
                  className="text-[#00CFFF] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <MonitorPlay className="w-3.5 h-3.5" />
                  <span>Chuyển sang Trình chiếu Toàn màn hình</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* CASE 3: INTERACTIVE HTML PRESENTATION OR WEB GAME IFRAME */
          <div className="w-full h-full relative bg-slate-950 flex flex-col">
            <iframe
              key={keyCounter}
              src={iframeSrc}
              title={game.title}
              className="w-full h-full border-0 select-none bg-black"
              allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
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
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-300 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer font-sans"
                >
                  Chơi tiếp
                </button>
                <button
                  onClick={onExit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#063B8E] to-[#0878DC] text-white font-bold shadow-lg hover:shadow-xl cursor-pointer font-sans"
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
