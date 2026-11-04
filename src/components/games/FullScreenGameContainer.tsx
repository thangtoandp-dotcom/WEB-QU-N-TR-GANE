import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Monitor,
  HelpCircle
} from 'lucide-react';
import { GameItem } from '../../types';

interface FullScreenGameContainerProps {
  game: GameItem;
  onExit: () => void;
  children: React.ReactNode;
}

export const FullScreenGameContainer: React.FC<FullScreenGameContainerProps> = ({
  game,
  onExit,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Monitor HTML5 fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcut: F11 or Esc or F to toggle fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

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
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch {
      // Fallback for iframe restrictions: CSS fullscreen toggle
      setIsFullscreen((prev) => !prev);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-gradient-to-b from-[#021124] via-[#041E42] to-[#021124] overflow-y-auto p-3 sm:p-6 flex flex-col justify-between'
          : 'relative w-full space-y-4'
      }`}
    >
      {/* Top Universal Game Bar with Fullscreen Toggle */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl shadow-md border font-serif ${
        isFullscreen
          ? 'bg-black/60 border-[#00CFFF]/40 text-white backdrop-blur-md mb-4'
          : 'bg-white border-[#0878DC]/30 text-slate-800'
      }`}>
        {/* Left Side: Exit button & Game Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (document.fullscreenElement) {
                try { document.exitFullscreen(); } catch {}
              }
              onExit();
            }}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-sm sm:text-base flex items-center gap-1.5 transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                : 'bg-[#EAF5FF] hover:bg-[#d6ecff] text-[#063B8E] border border-[#0878DC]/30'
            }`}
            title="Thoát và quay về Kho trò chơi"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Kho trò chơi</span>
          </button>

          <div className="hidden sm:block">
            <span className={`text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
              isFullscreen ? 'bg-[#00CFFF]/20 text-[#00CFFF]' : 'bg-blue-100 text-[#063B8E]'
            }`}>
              {game.categoryName}
            </span>
            <span className={`text-xs ml-2 font-bold ${isFullscreen ? 'text-amber-300' : 'text-amber-600'}`}>
              • Khối {game.grade === 'all' ? '10-11-12' : game.grade}
            </span>
          </div>
        </div>

        {/* Right Side: Game Title & Big Fullscreen Toggle Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleFullscreen}
            className={`px-4 py-2 rounded-xl font-black text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              isFullscreen
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 border-2 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-gradient-to-r from-[#063B8E] via-[#0878DC] to-[#00CFFF] hover:from-[#052C6E] hover:to-[#0664B8] text-white border border-[#00CFFF]/50 shadow-[0_0_15px_rgba(8,120,220,0.3)]'
            }`}
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Mở rộng hết toàn màn hình máy tính để chơi'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-5 h-5 text-slate-950" />
                <span>Thu nhỏ màn hình [Esc]</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-5 h-5 text-amber-300 animate-pulse" />
                <span className="font-extrabold tracking-wide">Mở rộng hết màn hình</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Game Screen Content */}
      <div className={`flex-1 w-full ${isFullscreen ? 'max-w-6xl mx-auto flex items-center justify-center my-auto py-2' : ''}`}>
        {children}
      </div>

      {/* Fullscreen footer tips */}
      {isFullscreen && (
        <div className="text-center text-xs text-slate-400 font-serif pt-3 border-t border-white/10 mt-4">
          💡 <em>Chế độ Toàn Màn Hình THPT Đan Phượng:</em> Nhấn <strong>Esc</strong> hoặc nút <strong>Thu nhỏ màn hình</strong> ở góc trên bất cứ lúc nào để quay lại.
        </div>
      )}
    </div>
  );
};
