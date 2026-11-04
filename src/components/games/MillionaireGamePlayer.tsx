import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Phone, Users, Shuffle, Award, CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react';
import { GameItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { MathText } from '../common/MathText';

interface MillionaireGamePlayerProps {
  game: GameItem;
  currentUser: UserProfile;
  roomCode?: string;
  onExit: () => void;
  onFinished?: () => void;
}

export const MillionaireGamePlayer: React.FC<MillionaireGamePlayerProps> = ({
  game,
  currentUser,
  roomCode = '',
  onExit,
  onFinished
}) => {
  const ladderScores = [
    { level: 1, pts: 2, milestone: false },
    { level: 2, pts: 4, milestone: false },
    { level: 3, pts: 6, milestone: false },
    { level: 4, pts: 8, milestone: false },
    { level: 5, pts: 20, milestone: true },
    { level: 6, pts: 30, milestone: false },
    { level: 7, pts: 40, milestone: false },
    { level: 8, pts: 50, milestone: false },
    { level: 9, pts: 60, milestone: false },
    { level: 10, pts: 80, milestone: true },
    { level: 11, pts: 95, milestone: false },
    { level: 12, pts: 110, milestone: false },
    { level: 13, pts: 125, milestone: false },
    { level: 14, pts: 135, milestone: false },
    { level: 15, pts: 150, milestone: true }
  ];

  const millionaireQuestions = [
    {
      q: 'Hàm số bậc nhất $y = ax + b$ ($a \\neq 0$) đồng biến trên $\\mathbb{R}$ khi và chỉ khi:',
      options: ['$a > 0$', '$a < 0$', '$b > 0$', '$b < 0$'],
      correct: 0,
      explain: 'Theo SGK Toán THPT: Hàm số bậc nhất $y = ax + b$ đồng biến trên $\\mathbb{R}$ khi hệ số góc $a > 0$ và nghịch biến khi $a < 0$.'
    },
    {
      q: 'Số tập hợp con của một tập hợp có $3$ phần tử là:',
      options: ['$6$', '$8$', '$9$', '$3$'],
      correct: 1,
      explain: 'Số tập con của tập hợp có $n$ phần tử là $2^n$. Với $n = 3$, số tập con bằng $2^3 = 8$.'
    },
    {
      q: 'Phương trình bậc hai $x^2 - 4x + 3 = 0$ có hai nghiệm phân biệt là:',
      options: ['$x_1 = 1;\\ x_2 = 3$', '$x_1 = -1;\\ x_2 = -3$', '$x_1 = 1;\\ x_2 = -3$', '$x_1 = -1;\\ x_2 = 3$'],
      correct: 0,
      explain: 'Áp dụng định lý Viète: $S = x_1 + x_2 = 4$, $P = x_1 x_2 = 3 \\Rightarrow x_1 = 1,\\ x_2 = 3$.'
    },
    {
      q: 'Đạo hàm của hàm số $y = \\ln x$ với $x > 0$ là:',
      options: ['$\\dfrac{1}{x}$', '$e^x$', '$x$', '$\\dfrac{1}{2x}$'],
      correct: 0,
      explain: 'Theo công thức SGK Giải tích 12: $(\\ln x)\' = \\dfrac{1}{x}$ với mọi $x > 0$.'
    },
    {
      q: 'Cho hình vuông $ABCD$ có cạnh bằng $a$. Diện tích của hình vuông đó bằng:',
      options: ['$a^2$', '$2a$', '$4a$', '$\\dfrac{a^2}{2}$'],
      correct: 0,
      explain: 'Diện tích hình vuông cạnh $a$ là $S = a^2$.'
    },
    {
      q: 'Số đường tiệm cận (đứng và ngang) của đồ thị hàm số $y = \\dfrac{1}{x^2 - 1}$ là:',
      options: ['$1$', '$2$', '$3$', '$0$'],
      correct: 2,
      explain: 'Đồ thị có $2$ tiệm cận đứng là các đường thẳng $x = 1$, $x = -1$ và $1$ tiệm cận ngang là $y = 0$. Tổng cộng có $3$ đường tiệm cận.'
    },
    {
      q: 'Tích phân $I = \\displaystyle\\int_{0}^{1} x\\,\\mathrm{d}x$ bằng:',
      options: ['$\\dfrac{1}{2}$', '$1$', '$2$', '$\\dfrac{1}{3}$'],
      correct: 0,
      explain: '$I = \\left.\\dfrac{x^2}{2}\\right|_0^1 = \\dfrac{1^2}{2} - 0 = \\dfrac{1}{2}$.'
    },
    {
      q: 'Khối bát diện đều thuộc loại đa diện đều nào và có bao nhiêu đỉnh?',
      options: ['$6\\text{ đỉnh, loại }\\{3; 4\\}$', '$8\\text{ đỉnh, loại }\\{4; 3\\}$', '$12\\text{ đỉnh, loại }\\{3; 5\\}$', '$4\\text{ đỉnh, loại }\\{3; 3\\}$'],
      correct: 0,
      explain: 'Khối bát diện đều thuộc loại $\\{3; 4\\}$ (mỗi mặt là tam giác đều, mỗi đỉnh là đỉnh chung của $4$ mặt) có $6$ đỉnh, $12$ cạnh và $8$ mặt.'
    },
    {
      q: 'Đạo hàm của hàm số mũ $y = 3^x$ là:',
      options: ['$3^x \\ln 3$', '$\\dfrac{3^x}{\\ln 3}$', '$x \\cdot 3^{x-1}$', '$3^x$'],
      correct: 0,
      explain: 'Theo SGK Giải tích 12: Đạo hàm của hàm số mũ $(a^x)\' = a^x \\ln a$, với $a = 3 \\Rightarrow (3^x)\' = 3^x \\ln 3$.'
    },
    {
      q: 'Trong mặt phẳng tọa độ $Oxy$, đường tròn $(C): (x - 2)^2 + (y + 1)^2 = 25$ có bán kính $R$ bằng:',
      options: ['$R = 5$', '$R = 25$', '$R = 10$', '$R = \\sqrt{5}$'],
      correct: 0,
      explain: 'Phương trình $(x - a)^2 + (y - b)^2 = R^2 \\Rightarrow R^2 = 25 \\Rightarrow R = 5$.'
    },
    {
      q: 'Cho khối tứ diện đều $ABCD$ có tất cả các cạnh bằng $a$. Thể tích $V$ của khối tứ diện đều đó bằng:',
      options: ['$\\dfrac{a^3\\sqrt{2}}{12}$', '$\\dfrac{a^3\\sqrt{3}}{12}$', '$\\dfrac{a^3\\sqrt{2}}{6}$', '$\\dfrac{a^3\\sqrt{3}}{4}$'],
      correct: 0,
      explain: 'Thể tích của khối tứ diện đều cạnh $a$ chuẩn SGK Hình học 12 là $V = \\dfrac{a^3\\sqrt{2}}{12}$.'
    },
    {
      q: 'Họ tất cả các nguyên hàm của hàm số $f(x) = e^{2x}$ là:',
      options: ['$\\dfrac{1}{2}e^{2x} + C$', '$2e^{2x} + C$', '$e^{2x} + C$', '$\\dfrac{1}{2}e^x + C$'],
      correct: 0,
      explain: '$\\displaystyle\\int e^{2x}\\,\\mathrm{d}x = \\dfrac{1}{2}e^{2x} + C$.'
    },
    {
      q: 'Trong không gian $Oxyz$, khoảng cách từ điểm $M(1; 2; 3)$ đến mặt phẳng tọa độ $(Oxy)$ bằng:',
      options: ['$3$', '$2$', '$1$', '$\\sqrt{14}$'],
      correct: 0,
      explain: 'Khoảng cách từ điểm $M(x_0; y_0; z_0)$ đến mặt phẳng tọa độ $(Oxy)$ là $d(M, (Oxy)) = |z_0| = |3| = 3$.'
    },
    {
      q: 'Giá trị của giới hạn $\\displaystyle\\lim_{x \\to 0} \\dfrac{\\sin 2x}{x}$ bằng:',
      options: ['$2$', '$1$', '$\\dfrac{1}{2}$', '$0$'],
      correct: 0,
      explain: '$\\lim_{x \\to 0} \\dfrac{\\sin 2x}{x} = \\lim_{x \\to 0} \\left( 2 \\cdot \\dfrac{\\sin 2x}{2x} \\right) = 2 \\cdot 1 = 2$.'
    },
    {
      q: 'Hệ số của số hạng chứa $x^3$ trong khai triển nhị thức Newton $(x + 2)^5$ là:',
      options: ['$40$', '$80$', '$10$', '$20$'],
      correct: 0,
      explain: 'Số hạng tổng quát $T_{k+1} = C_5^k \\cdot x^{5-k} \\cdot 2^k$. Để có số hạng chứa $x^3$ thì $5 - k = 3 \\Rightarrow k = 2$. Hệ số: $C_5^2 \\cdot 2^2 = 10 \\cdot 4 = 40$.'
    }
  ];

  const [currentLevel, setCurrentLevel] = useState(0); // 0 to 14
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [statusText, setStatusText] = useState('');

  // Lifelines availability
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    audience: true,
    teacherCall: true,
    switchQ: true
  });

  // Active dialog for lifeline
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const currentQ = millionaireQuestions[currentLevel];

  // 1. 50:50 Lifeline
  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || isAnswered) return;
    const correctIdx = currentQ.correct;
    const wrongIndices = [0, 1, 2, 3].filter((idx) => idx !== correctIdx);
    // Shuffle and pick 2 to eliminate
    const toEliminate = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
    setEliminatedOptions(toEliminate);
    setLifelines((prev) => ({ ...prev, fiftyFifty: false }));
  };

  // 2. Audience Lifeline
  const useAudience = () => {
    if (!lifelines.audience || isAnswered) return;
    setActiveDialog('audience');
    setLifelines((prev) => ({ ...prev, audience: false }));
  };

  // 3. Call Teacher Bùi Ngọc Thắng
  const useTeacherCall = () => {
    if (!lifelines.teacherCall || isAnswered) return;
    setActiveDialog('teacher');
    setLifelines((prev) => ({ ...prev, teacherCall: false }));
  };

  // 4. Switch Question
  const useSwitchQuestion = () => {
    if (!lifelines.switchQ || isAnswered) return;
    setEliminatedOptions([]);
    setLifelines((prev) => ({ ...prev, switchQ: false }));
  };

  const handleChoose = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correct;

    if (isCorrect) {
      if (currentLevel === 14) {
        // Won the game!
        setTimeout(() => {
          endMillionaire(150, 'Chúc mừng bạn đã chinh phục 15/15 câu hỏi và trở thành TRIỆU PHÚ TOÁN HỌC THPT ĐAN PHƯỢNG!');
        }, 1200);
      } else {
        setTimeout(() => {
          setCurrentLevel((l) => l + 1);
          setSelectedOpt(null);
          setIsAnswered(false);
          setEliminatedOptions([]);
        }, 1200);
      }
    } else {
      // Wrong answer -> determine safe score
      let safeScore = 0;
      if (currentLevel >= 9) safeScore = 80;
      else if (currentLevel >= 4) safeScore = 20;

      setTimeout(() => {
        endMillionaire(safeScore, `Rất tiếc! Đáp án đúng là ${['A', 'B', 'C', 'D'][currentQ.correct]}. Bạn dừng chân ở câu hỏi số ${currentLevel + 1}.`);
      }, 1500);
    }
  };

  const endMillionaire = async (finalScore: number, message: string) => {
    setIsFinished(true);
    setStatusText(message);

    await api.saveAttempt({
      studentCode: currentUser.code || 'HS1001',
      studentName: currentUser.name || 'Học sinh',
      className: currentUser.className || '12A1',
      gameId: game.id,
      gameTitle: game.title,
      roomCode: roomCode || '',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: (currentLevel + 1) * 35,
      totalQuestions: 15,
      correctCount: currentLevel + (selectedOpt === currentQ.correct ? 1 : 0),
      incorrectCount: selectedOpt === currentQ.correct ? 0 : 1,
      score: finalScore,
      status: 'completed'
    });

    try {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
    } catch {}

    if (onFinished) onFinished();
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#063B8E] to-[#042866] text-white rounded-3xl shadow-2xl border-4 border-[#FFD700] p-6 sm:p-8 text-center animate-in zoom-in-95">
        <div className="text-5xl mb-3">👑</div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FFD700] font-serif mb-2">
          Kết quả Ai Là Triệu Phú Toán Học
        </h2>
        <p className="text-slate-200 text-lg mb-6 leading-relaxed font-serif">
          {statusText}
        </p>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/20 mb-6 max-w-sm mx-auto">
          <div className="text-xs uppercase text-[#00CFFF] font-bold tracking-wider">Điểm tích lũy nhận được</div>
          <div className="text-4xl font-black text-[#FFD700] mt-1">
            {ladderScores[Math.max(0, currentLevel - 1)]?.pts || 0} điểm
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setCurrentLevel(0);
              setSelectedOpt(null);
              setIsAnswered(false);
              setEliminatedOptions([]);
              setIsFinished(false);
              setLifelines({ fiftyFifty: true, audience: true, teacherCall: true, switchQ: true });
            }}
            className="px-6 py-2.5 rounded-xl border-2 border-white/60 text-white font-bold hover:bg-white/10 flex items-center gap-2 cursor-pointer font-serif"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Thử lại từ câu 1</span>
          </button>
          <button
            onClick={onExit}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-[#063B8E] font-bold shadow-lg flex items-center gap-2 cursor-pointer font-serif text-lg"
          >
            <Award className="w-5 h-5" />
            <span>Xem Bảng xếp hạng</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-[#041E42] text-white rounded-3xl shadow-2xl border-4 border-[#0878DC] overflow-hidden">
      
      {/* Top Header with 4 Lifelines */}
      <div className="bg-gradient-to-r from-[#063B8E] via-[#0878DC] to-[#063B8E] px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#00CFFF]/40">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#FFD700] flex items-center justify-center text-[#063B8E] font-black text-xl shadow">
            👑
          </div>
          <div>
            <h3 className="font-bold font-serif text-lg text-white">Ai Là Triệu Phú Toán Học</h3>
            <span className="text-xs text-[#FFDE59]">Đang ở câu {currentLevel + 1}/15 • Mốc thưởng: {ladderScores[currentLevel]?.pts} điểm</span>
          </div>
        </div>

        {/* 4 Lifelines */}
        <div className="flex items-center gap-2">
          {/* 50:50 */}
          <button
            onClick={useFiftyFifty}
            disabled={!lifelines.fiftyFifty || isAnswered}
            className={`px-3 py-1.5 rounded-xl font-black text-sm border-2 cursor-pointer transition-all ${
              lifelines.fiftyFifty
                ? 'bg-blue-600/80 border-[#00CFFF] text-white hover:scale-105 shadow-[0_0_10px_rgba(0,207,255,0.5)]'
                : 'bg-slate-700 border-slate-600 text-slate-400 line-through opacity-50 cursor-not-allowed'
            }`}
            title="Loại bỏ 2 phương án sai"
          >
            50:50
          </button>

          {/* Audience */}
          <button
            onClick={useAudience}
            disabled={!lifelines.audience || isAnswered}
            className={`p-2 rounded-xl border-2 cursor-pointer transition-all ${
              lifelines.audience
                ? 'bg-blue-600/80 border-[#00CFFF] text-white hover:scale-105 shadow-[0_0_10px_rgba(0,207,255,0.5)]'
                : 'bg-slate-700 border-slate-600 text-slate-400 opacity-50 cursor-not-allowed'
            }`}
            title="Hỏi ý kiến khán giả THPT Đan Phượng"
          >
            <Users className="w-4 h-4 text-[#00CFFF]" />
          </button>

          {/* Call Teacher Bùi Ngọc Thắng */}
          <button
            onClick={useTeacherCall}
            disabled={!lifelines.teacherCall || isAnswered}
            className={`p-2 rounded-xl border-2 cursor-pointer transition-all ${
              lifelines.teacherCall
                ? 'bg-blue-600/80 border-[#FFD700] text-white hover:scale-105 shadow-[0_0_10px_rgba(255,215,0,0.5)]'
                : 'bg-slate-700 border-slate-600 text-slate-400 opacity-50 cursor-not-allowed'
            }`}
            title="Gọi điện cho Thầy Bùi Ngọc Thắng"
          >
            <Phone className="w-4 h-4 text-[#FFD700]" />
          </button>

          {/* Switch Question */}
          <button
            onClick={useSwitchQuestion}
            disabled={!lifelines.switchQ || isAnswered}
            className={`p-2 rounded-xl border-2 cursor-pointer transition-all ${
              lifelines.switchQ
                ? 'bg-blue-600/80 border-[#00CFFF] text-white hover:scale-105 shadow-[0_0_10px_rgba(0,207,255,0.5)]'
                : 'bg-slate-700 border-slate-600 text-slate-400 opacity-50 cursor-not-allowed'
            }`}
            title="Đổi câu hỏi khác"
          >
            <Shuffle className="w-4 h-4 text-[#00CFFF]" />
          </button>
        </div>
      </div>

      {/* Main Container: Question area + Ladder */}
      <div className="grid grid-cols-1 lg:grid-cols-4 p-5 sm:p-7 gap-6">
        
        {/* Left 3 cols: Question & 4 choices */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
          
          {/* Question Box */}
          <div className="relative bg-gradient-to-r from-[#063B8E] via-[#0B4B9A] to-[#063B8E] border-2 border-[#00CFFF] rounded-2xl p-6 sm:p-8 shadow-[0_0_20px_rgba(0,207,255,0.25)] text-center">
            <div className="mb-3">
              <span className="inline-block bg-[#FFD700]/15 border-2 border-[#FFD700]/80 px-5 py-1.5 rounded-full text-xl sm:text-2xl font-black text-[#FFDE59] uppercase tracking-widest font-serif shadow-[0_0_15px_rgba(255,222,89,0.35)]">
                CÂU SỐ {currentLevel + 1}
              </span>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold font-serif leading-relaxed text-white">
              <MathText text={currentQ.q} />
            </div>
            {isAnswered && currentQ.explain && (
              <div className="mt-4 p-3.5 bg-blue-950/80 rounded-xl border border-[#00CFFF]/40 text-sm sm:text-base text-[#E0F2FE] text-left">
                <span className="text-[#FFDE59] font-bold block mb-1">💡 Lời giải chi tiết:</span>
                <MathText text={currentQ.explain} />
              </div>
            )}
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQ.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isEliminated = eliminatedOptions.includes(idx);

              let choiceStyle = 'bg-[#062D6E]/80 border-[#0878DC] hover:border-[#00CFFF] text-white hover:bg-[#08459F]';

              if (isAnswered) {
                if (idx === currentQ.correct) {
                  choiceStyle = 'bg-emerald-600 border-emerald-400 text-white font-bold animate-pulse';
                } else if (idx === selectedOpt) {
                  choiceStyle = 'bg-red-600 border-red-400 text-white font-bold';
                } else {
                  choiceStyle = 'bg-[#031530] border-slate-800 text-slate-500 opacity-30';
                }
              }

              if (isEliminated) {
                return (
                  <div key={idx} className="p-4 rounded-2xl border-2 border-slate-800 bg-[#020D1E] opacity-20 select-none">
                    <span className="text-slate-600 font-bold">{letter}: [Đã loại trừ]</span>
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleChoose(idx)}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 text-left font-serif text-lg cursor-pointer ${choiceStyle}`}
                >
                  <span className="w-8 h-8 rounded-xl bg-blue-900 border border-[#00CFFF] text-[#FFDE59] font-black flex items-center justify-center shrink-0 text-sm">
                    {letter}
                  </span>
                  <span className="flex-1 text-base sm:text-lg">
                    <MathText text={opt} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
            <span>Thí sinh: <strong className="text-white">{currentUser.name}</strong></span>
            <button onClick={onExit} className="hover:text-red-400 cursor-pointer">
              Dừng cuộc chơi & Rời phòng
            </button>
          </div>
        </div>

        {/* Right 1 col: Milestone Ladder */}
        <div className="bg-[#021124] rounded-2xl p-3 border border-[#0878DC]/40 flex flex-col justify-between text-xs">
          <div className="font-bold text-[#FFD700] text-center mb-2 uppercase tracking-wider text-sm border-b border-slate-800 pb-1">
            Bậc thang giải thưởng
          </div>
          <div className="flex flex-col-reverse gap-1 font-mono">
            {ladderScores.map((item, idx) => {
              const isCurrent = idx === currentLevel;
              const isPassed = idx < currentLevel;

              return (
                <div
                  key={item.level}
                  className={`flex items-center justify-between px-2.5 py-1 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-[#FFD700] text-[#063B8E] font-black shadow-md'
                      : isPassed
                      ? 'text-emerald-400 font-bold'
                      : item.milestone
                      ? 'text-white font-bold bg-blue-900/40'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-5">{item.level}.</span>
                  <span>{item.pts} điểm</span>
                  {item.milestone && <span className="text-[10px]">⭐ Mốc</span>}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Lifeline Modals */}
      {activeDialog === 'audience' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-sm w-full border-4 border-[#0878DC] shadow-2xl text-center">
            <h4 className="text-xl font-bold font-serif text-[#063B8E] mb-2">
              Khán giả THPT Đan Phượng bình chọn
            </h4>
            <p className="text-sm text-slate-600 mb-4">
              98 bạn học sinh khối 10, 11, 12 có mặt tại trường đã gửi biểu quyết:
            </p>
            <div className="space-y-2 mb-6">
              {['A', 'B', 'C', 'D'].map((letter, i) => {
                const percent = i === currentQ.correct ? 72 : Math.floor((28 / 3));
                return (
                  <div key={letter} className="flex items-center gap-3">
                    <span className="w-6 font-bold">{letter}:</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-4 overflow-hidden">
                      <div className="bg-[#0878DC] h-full" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="w-10 text-right font-bold">{percent}%</span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setActiveDialog(null)}
              className="w-full bg-[#063B8E] text-white py-2.5 rounded-xl font-bold cursor-pointer"
            >
              Cảm ơn khán giả (Đóng)
            </button>
          </div>
        </div>
      )}

      {activeDialog === 'teacher' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-md w-full border-4 border-[#FFD700] shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#063B8E] flex items-center justify-center text-white text-2xl">
                👨‍🏫
              </div>
              <div>
                <h4 className="font-bold text-lg text-[#063B8E] font-serif">Thầy Bùi Ngọc Thắng</h4>
                <p className="text-xs text-slate-500">Giáo viên Toán THPT Đan Phượng</p>
              </div>
            </div>
            <div className="bg-[#EAF5FF] p-4 rounded-xl border border-[#0878DC]/30 text-sm leading-relaxed mb-5 italic font-serif">
              "Thầy chào em! Với câu hỏi này, em hãy nhớ lại công thức cơ bản và phương pháp loại trừ. Thầy chắc chắn 90% đáp án đúng là phương án <strong>{['A', 'B', 'C', 'D'][currentQ.correct]}</strong>! Em tự tin chọn nhé!"
            </div>
            <button
              onClick={() => setActiveDialog(null)}
              className="w-full bg-[#0878DC] text-white py-2.5 rounded-xl font-bold cursor-pointer"
            >
              Cảm ơn Thầy Thắng! (Đóng)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
