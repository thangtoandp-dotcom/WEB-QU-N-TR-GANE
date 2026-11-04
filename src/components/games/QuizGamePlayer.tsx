import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Clock, ArrowRight, CheckCircle2, XCircle, Trophy, RotateCcw, Award } from 'lucide-react';
import { GameItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { MathText } from '../common/MathText';

interface QuizGamePlayerProps {
  game: GameItem;
  currentUser: UserProfile;
  roomCode?: string;
  onExit: () => void;
  onFinished?: () => void;
}

export const QuizGamePlayer: React.FC<QuizGamePlayerProps> = ({
  game,
  currentUser,
  roomCode = '',
  onExit,
  onFinished
}) => {
  // Built-in question bank for THPT Math chuẩn SGK
  const [questions] = useState([
    {
      q: 'Cho hàm số bậc bốn trùng phương $y = -x^4 + 2x^2 + 1$. Số điểm cực trị của hàm số đã cho là:',
      options: ['$1$', '$2$', '$3$', '$0$'],
      correct: 2,
      explain: 'Ta có $y\' = -4x^3 + 4x = -4x(x^2 - 1) = 0 \\Leftrightarrow x = 0$ hoặc $x = \\pm 1$. Vì đạo hàm đổi dấu qua cả $3$ nghiệm đơn nên đồ thị hàm số có $3$ điểm cực trị.'
    },
    {
      q: 'Đường tiệm cận đứng của đồ thị hàm số $y = \\dfrac{3x - 1}{x - 2}$ là đường thẳng:',
      options: ['$y = 3$', '$x = 2$', '$x = -2$', '$y = 2$'],
      correct: 1,
      explain: 'Nghiệm của mẫu số $x - 2 = 0 \\Leftrightarrow x = 2$ và $\\lim_{x \\to 2^+} \\dfrac{3x - 1}{x - 2} = +\\infty$. Do đó tiệm cận đứng là đường thẳng $x = 2$.'
    },
    {
      q: 'Tìm họ tất cả các nguyên hàm của hàm số $f(x) = 2x + \\cos x$:',
      options: ['$x^2 + \\sin x + C$', '$x^2 - \\sin x + C$', '$2 + \\sin x + C$', '$x^2 + \\cos x + C$'],
      correct: 0,
      explain: 'Theo công thức nguyên hàm cơ bản trong SGK: $\\displaystyle\\int (2x + \\cos x)\\,\\mathrm{d}x = x^2 + \\sin x + C$.'
    },
    {
      q: 'Trong không gian $Oxyz$, tọa độ tâm $I$ và bán kính $R$ của mặt cầu $(S): (x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 16$ là:',
      options: ['$I(1; -2; 3),\\ R = 4$', '$I(-1; 2; -3),\\ R = 4$', '$I(1; 2; 3),\\ R = 16$', '$I(-1; -2; 3),\\ R = 16$'],
      correct: 0,
      explain: 'Phương trình mặt cầu $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$ có tâm $I(a; b; c) = (1; -2; 3)$ và bán kính $R = \\sqrt{16} = 4$.'
    },
    {
      q: 'Nghiệm của phương trình mũ $2^{x - 1} = 8$ là:',
      options: ['$x = 4$', '$x = 3$', '$x = 2$', '$x = 5$'],
      correct: 0,
      explain: 'Ta có $2^{x - 1} = 2^3 \\Leftrightarrow x - 1 = 3 \\Leftrightarrow x = 4$.'
    },
    {
      q: 'Thể tích $V$ của khối chóp có diện tích đáy $B = 6$ và chiều cao $h = 5$ là:',
      options: ['$V = 30$', '$V = 10$', '$V = 15$', '$V = 20$'],
      correct: 1,
      explain: 'Công thức thể tích khối chóp trong SGK Hình học: $V = \\dfrac{1}{3}Bh = \\dfrac{1}{3} \\cdot 6 \\cdot 5 = 10$.'
    },
    {
      q: 'Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = 2$ và công sai $d = 3$. Số hạng thứ tư $u_4$ bằng:',
      options: ['$u_4 = 11$', '$u_4 = 14$', '$u_4 = 8$', '$u_4 = 17$'],
      correct: 0,
      explain: 'Công thức số hạng tổng quát: $u_n = u_1 + (n - 1)d \\Rightarrow u_4 = 2 + (4 - 1) \\cdot 3 = 2 + 9 = 11$.'
    },
    {
      q: 'Tập nghiệm của bất phương trình logarit $\\log_3(x - 2) < 2$ là:',
      options: ['$(2; 11)$', '$(-\\infty; 11)$', '$(2; +\\infty)$', '$[2; 11)$'],
      correct: 0,
      explain: 'Điều kiện xác định: $x - 2 > 0 \\Leftrightarrow x > 2$. Bất phương trình $\\Leftrightarrow x - 2 < 3^2 = 9 \\Leftrightarrow x < 11$. Kết hợp điều kiện suy ra tập nghiệm $S = (2; 11)$.'
    },
    {
      q: 'Giá trị lớn nhất của hàm số $f(x) = x^3 - 3x$ trên đoạn $[0; 2]$ là:',
      options: ['$2$', '$0$', '$-2$', '$4$'],
      correct: 0,
      explain: 'Đạo hàm $f\'(x) = 3x^2 - 3 = 0 \\Leftrightarrow x = 1 \\in [0; 2]$. Tính các giá trị: $f(0) = 0$, $f(1) = -2$, $f(2) = 2$. Vậy $\\max_{[0; 2]} f(x) = 2$ tại $x = 2$.'
    },
    {
      q: 'Gieo một con xúc xắc cân đối đồng chất. Xác suất xuất hiện mặt có số chấm chia hết cho $2$ là:',
      options: ['$\\dfrac{1}{2}$', '$\\dfrac{1}{3}$', '$\\dfrac{2}{3}$', '$\\dfrac{1}{6}$'],
      correct: 0,
      explain: 'Không gian mẫu $n(\\Omega) = 6$. Biến cố $A$ xuất hiện mặt chẵn: $A = \\{2, 4, 6\\} \\Rightarrow n(A) = 3$. Xác suất $P(A) = \\dfrac{n(A)}{n(\\Omega)} = \\dfrac{3}{6} = \\dfrac{1}{2}$.'
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(game.durationMinutes * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(new Date().toISOString());

  // Countdown timer
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  const finishGame = async () => {
    setIsCompleted(true);
    const finalScore = Math.round((correctCount / questions.length) * game.maxScore);

    // Save attempt to backend
    await api.saveAttempt({
      studentCode: currentUser.code || 'HS1001',
      studentName: currentUser.name || 'Học sinh',
      className: currentUser.className || '12A1',
      gameId: game.id,
      gameTitle: game.title,
      roomCode: roomCode || '',
      startedAt: startTime,
      endedAt: new Date().toISOString(),
      durationSeconds: (game.durationMinutes * 60) - timeLeft,
      totalQuestions: questions.length,
      correctCount,
      incorrectCount,
      score: finalScore,
      status: 'completed'
    });

    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    if (onFinished) onFinished();
  };

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isRight = idx === questions[currentIndex].correct;
    if (isRight) {
      setCorrectCount((c) => c + 1);
      setScore((s) => s + Math.round(game.maxScore / questions.length));
    } else {
      setIncorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishGame();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const q = questions[currentIndex];

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border-4 border-[#0878DC] p-6 sm:p-8 text-center animate-in zoom-in-95">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-4xl mb-3 shadow-inner">
          🏆
        </div>
        <h2 className="text-3xl font-extrabold text-[#063B8E] font-serif mb-1">
          Hoàn thành xuất sắc!
        </h2>
        <p className="text-slate-600 font-medium text-lg">
          Trò chơi: <span className="font-bold text-[#0878DC]">{game.title}</span>
        </p>

        {/* Score Board */}
        <div className="my-6 grid grid-cols-3 gap-3">
          <div className="bg-[#E0F2FE] p-3 rounded-2xl border border-blue-200">
            <div className="text-xs text-slate-500 font-bold uppercase">Điểm số</div>
            <div className="text-3xl font-black text-[#0878DC] mt-1">{score}</div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
            <div className="text-xs text-slate-500 font-bold uppercase">Trả lời đúng</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">{correctCount}/{questions.length}</div>
          </div>
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <div className="text-xs text-slate-500 font-bold uppercase">Thời gian</div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {formatTime((game.durationMinutes * 60) - timeLeft)}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#EAF5FF] rounded-2xl border border-[#0878DC]/30 mb-6 text-sm text-slate-700">
          🎉 Kết quả đã được hệ thống tự động ghi nhận vào học bạ & bảng vàng THPT Đan Phượng!
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSelectedOption(null);
              setIsAnswered(false);
              setScore(0);
              setCorrectCount(0);
              setIncorrectCount(0);
              setTimeLeft(game.durationMinutes * 60);
              setIsCompleted(false);
            }}
            className="px-6 py-2.5 rounded-xl border-2 border-[#0878DC] text-[#0878DC] font-bold hover:bg-[#EAF5FF] flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Chơi lại</span>
          </button>
          <button
            onClick={onExit}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#063B8E] to-[#0878DC] text-white font-bold shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-[#FFDE59]" />
            <span>Xem Bảng xếp hạng</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border-2 border-[#0878DC]/30 overflow-hidden">
      
      {/* Top Bar with Timer and Progress */}
      <div className="bg-[#063B8E] text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎓</span>
          <div>
            <h3 className="font-bold font-serif text-lg leading-tight">{game.title}</h3>
            <span className="text-xs text-[#00CFFF]">Câu {currentIndex + 1} / {questions.length}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
          <Clock className="w-4 h-4 text-[#FFDE59]" />
          <span className="font-mono font-bold text-base">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2">
        <div 
          className="bg-gradient-to-r from-[#00CFFF] to-[#0878DC] h-2 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Body */}
      <div className="p-6 sm:p-8 space-y-5">
        <div className="text-center sm:text-left">
          <span className="inline-block bg-[#063B8E]/10 border-2 border-[#0878DC]/60 px-4 py-1.5 rounded-full text-lg sm:text-2xl font-black text-[#063B8E] uppercase tracking-wider font-serif shadow-xs">
            CÂU SỐ {currentIndex + 1}
          </span>
        </div>

        <div className="text-slate-800 text-xl sm:text-2xl font-bold font-serif leading-relaxed">
          <MathText text={q.q} />
        </div>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {q.options.map((opt, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            let btnClass = 'border-2 border-slate-200 bg-white hover:border-[#0878DC] hover:bg-[#EAF5FF] text-slate-800';

            if (isAnswered) {
              if (idx === q.correct) {
                btnClass = 'border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
              } else if (idx === selectedOption) {
                btnClass = 'border-2 border-red-500 bg-red-50 text-red-800 font-bold';
              } else {
                btnClass = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx)}
                className={`p-4 rounded-2xl flex items-center justify-between text-left transition-all font-serif text-base sm:text-lg cursor-pointer ${btnClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-[#063B8E] shrink-0 text-sm border border-slate-300">
                    {letter}
                  </span>
                  <span className="text-base sm:text-lg">
                    <MathText text={opt} />
                  </span>
                </div>
                {isAnswered && idx === q.correct && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswered && idx === selectedOption && idx !== q.correct && (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation box after answer */}
        {isAnswered && (
          <div className="p-4 rounded-2xl bg-[#EAF5FF] border border-[#0878DC]/40 text-sm sm:text-base animate-in fade-in">
            <div className="font-bold text-[#063B8E] flex items-center gap-1.5 mb-1">
              <Award className="w-4 h-4 text-[#0878DC]" />
              <span>Lời giải chi tiết:</span>
            </div>
            <div className="text-slate-700 leading-relaxed font-serif">
              <MathText text={q.explain} />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={onExit}
            className="text-slate-500 hover:text-slate-800 text-sm font-semibold cursor-pointer"
          >
            Thoát game
          </button>

          {isAnswered && (
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#063B8E] to-[#0878DC] hover:from-[#052C6E] hover:to-[#0664B8] text-white font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer text-base"
            >
              <span>{currentIndex + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
