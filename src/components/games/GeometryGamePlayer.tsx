import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, ArrowRight, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { GameItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { MathText } from '../common/MathText';

interface GeometryGamePlayerProps {
  game: GameItem;
  currentUser: UserProfile;
  roomCode?: string;
  onExit: () => void;
  onFinished?: () => void;
}

export const GeometryGamePlayer: React.FC<GeometryGamePlayerProps> = ({
  game,
  currentUser,
  roomCode = '',
  onExit,
  onFinished
}) => {
  const questions = [
    {
      q: 'Đường cong trong hình vẽ bên dưới là đồ thị của hàm số nào dưới đây?',
      type: 'svg-graph-1',
      options: [
        '$y = x^3 - 3x^2 + 2$',
        '$y = -x^3 + 3x^2 + 2$',
        '$y = x^4 - 2x^2 + 1$',
        '$y = \\dfrac{2x - 1}{x + 1}$'
      ],
      correct: 0,
      explain: 'Đồ thị là hàm số bậc ba $y = ax^3 + bx^2 + cx + d$ có nhánh cuối đi lên ($a > 0$), cắt trục tung tại $(0; 2)$ và có hai điểm cực trị tại $x = 0$ và $x = 2$. Do đó hàm số là $y = x^3 - 3x^2 + 2$.'
    },
    {
      q: 'Quan sát đồ thị hàm phân thức hyperbol dưới đây. Phương trình đường tiệm cận đứng và tiệm cận ngang lần lượt là:',
      type: 'svg-hyperbol',
      options: [
        '$x = 1$ và $y = 2$',
        '$x = 2$ và $y = 1$',
        '$x = -1$ và $y = 2$',
        '$x = 1$ và $y = -2$'
      ],
      correct: 0,
      explain: 'Đường tiệm cận đứng là đường thẳng $x = 1$ và đường tiệm cận ngang là đường thẳng $y = 2$.'
    },
    {
      q: 'Cho khối chóp $S.ABCD$ có đáy $ABCD$ là hình vuông và $SO \\perp (ABCD)$ với $O$ là tâm đáy. Góc giữa cạnh bên $SA$ và mặt phẳng đáy $(ABCD)$ là:',
      type: 'svg-pyramid',
      options: [
        '$\\widehat{SCA}$',
        '$\\widehat{SAB}$',
        '$\\widehat{SOA}$ (hoặc $\\widehat{SAO}$)',
        '$\\widehat{SAD}$'
      ],
      correct: 2,
      explain: 'Vì $SO \\perp (ABCD)$ tại $O$ nên $OA$ là hình chiếu của $SA$ lên mặt phẳng đáy $(ABCD)$. Do đó góc giữa $SA$ và đáy $(ABCD)$ chính là góc giữa $SA$ và $OA$, tức là góc $\\widehat{SAO}$.'
    },
    {
      q: 'Khối $12$ mặt đều (Dodecahedron) có bao nhiêu đỉnh và bao nhiêu cạnh?',
      type: 'svg-polyhedron',
      options: [
        '$20\\text{ đỉnh và }30\\text{ cạnh}$',
        '$12\\text{ đỉnh và }30\\text{ cạnh}$',
        '$20\\text{ đỉnh và }12\\text{ cạnh}$',
        '$30\\text{ đỉnh và }20\\text{ cạnh}$'
      ],
      correct: 0,
      explain: 'Khối $12$ mặt đều thuộc loại đa diện đều $\\{5; 3\\}$: mỗi mặt là ngũ giác đều, có $12$ mặt, $20$ đỉnh và $30$ cạnh.'
    }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const q = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    if (idx === q.correct) {
      setScore((s) => s + 25);
    }
  };

  const handleNext = async () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((c) => c + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);

      await api.saveAttempt({
        studentCode: currentUser.code || 'HS1001',
        studentName: currentUser.name || 'Học sinh',
        className: currentUser.className || '12A1',
        gameId: game.id,
        gameTitle: game.title,
        roomCode: roomCode || '',
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationSeconds: 240,
        totalQuestions: questions.length,
        correctCount: Math.round(score / 25),
        incorrectCount: questions.length - Math.round(score / 25),
        score,
        status: 'completed'
      });

      try {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      } catch {}

      if (onFinished) onFinished();
    }
  };

  const renderVisual = (type: string) => {
    if (type === 'svg-graph-1') {
      return (
        <svg viewBox="0 0 240 180" className="w-64 h-48 mx-auto bg-white rounded-xl shadow-inner border border-slate-200">
          {/* Axis */}
          <line x1="20" y1="120" x2="220" y2="120" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="80" y1="20" x2="80" y2="160" stroke="#94A3B8" strokeWidth="1.5" />
          <text x="220" y="115" fill="#64748B" fontSize="12" fontWeight="bold">x</text>
          <text x="85" y="25" fill="#64748B" fontSize="12" fontWeight="bold">y</text>
          {/* Cubic curve */}
          <path d="M 30 160 C 50 40, 70 50, 110 130 C 140 170, 170 120, 200 30" fill="none" stroke="#7C3AED" strokeWidth="3" />
          <circle cx="80" cy="70" r="3" fill="#E11D48" />
          <text x="85" y="70" fill="#E11D48" fontSize="11" fontWeight="bold">(0; 2)</text>
          <circle cx="130" cy="140" r="3" fill="#E11D48" />
          <text x="135" y="145" fill="#E11D48" fontSize="11" fontWeight="bold">(2; -2)</text>
        </svg>
      );
    }
    if (type === 'svg-hyperbol') {
      return (
        <svg viewBox="0 0 240 180" className="w-64 h-48 mx-auto bg-white rounded-xl shadow-inner border border-slate-200">
          <line x1="20" y1="130" x2="220" y2="130" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="70" y1="20" x2="70" y2="160" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Asymptotes */}
          <line x1="120" y1="15" x2="120" y2="165" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="15" y1="80" x2="225" y2="80" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="125" y="30" fill="#EF4444" fontSize="11" fontWeight="bold">x = 1</text>
          <text x="180" y="75" fill="#EF4444" fontSize="11" fontWeight="bold">y = 2</text>
          {/* Branches */}
          <path d="M 30 75 Q 100 70 110 20" fill="none" stroke="#0878DC" strokeWidth="2.5" />
          <path d="M 130 160 Q 140 90 210 85" fill="none" stroke="#0878DC" strokeWidth="2.5" />
        </svg>
      );
    }
    if (type === 'svg-pyramid') {
      return (
        <svg viewBox="0 0 240 180" className="w-64 h-48 mx-auto bg-white rounded-xl shadow-inner border border-slate-200">
          {/* Base ABCD */}
          <polygon points="50,130 150,130 190,95 90,95" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.5" />
          <line x1="50" y1="130" x2="190" y2="95" stroke="#94A3B8" strokeDasharray="3 3" />
          <line x1="150" y1="130" x2="90" y2="95" stroke="#94A3B8" strokeDasharray="3 3" />
          {/* Center O */}
          <circle cx="120" cy="112" r="2.5" fill="#DC2626" />
          <text x="122" y="112" fill="#DC2626" fontSize="11" fontWeight="bold">O</text>
          {/* Top S */}
          <line x1="120" y1="30" x2="120" y2="112" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="120" y1="30" x2="50" y2="130" stroke="#7C3AED" strokeWidth="2" />
          <line x1="120" y1="30" x2="150" y2="130" stroke="#7C3AED" strokeWidth="2" />
          <line x1="120" y1="30" x2="190" y2="95" stroke="#7C3AED" strokeWidth="2" />
          <line x1="120" y1="30" x2="90" y2="95" stroke="#7C3AED" strokeWidth="1" strokeDasharray="3 3" />
          <text x="116" y="22" fill="#7C3AED" fontSize="13" fontWeight="bold">S</text>
          <text x="38" y="138" fill="#7C3AED" fontSize="12" fontWeight="bold">A</text>
          <text x="154" y="138" fill="#7C3AED" fontSize="12" fontWeight="bold">B</text>
          <text x="195" y="98" fill="#7C3AED" fontSize="12" fontWeight="bold">C</text>
          <text x="80" y="98" fill="#7C3AED" fontSize="12" fontWeight="bold">D</text>
        </svg>
      );
    }
    return (
      <div className="w-64 h-48 mx-auto bg-purple-50 rounded-xl flex items-center justify-center text-6xl shadow-inner border border-purple-200">
        🔷
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border-4 border-[#7C3AED] p-6 sm:p-8">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B8E] font-serif">
            📐 Nhận Diện Đồ Thị & Hình Học Không Gian
          </h2>
          <p className="text-sm text-slate-500">Khối 12 • Chương trình chuẩn THPT</p>
        </div>
        <div className="bg-purple-100 text-purple-900 font-bold px-4 py-1.5 rounded-xl text-sm">
          Câu {currentIdx + 1} / {questions.length}
        </div>
      </div>

      <div className="my-6 space-y-4">
        <div className="text-center">
          <span className="inline-block bg-purple-100 border-2 border-purple-400 px-4 py-1.5 rounded-full text-lg sm:text-2xl font-black text-[#5B21B6] uppercase tracking-wider font-serif shadow-xs">
            CÂU SỐ {currentIdx + 1}
          </span>
        </div>

        {renderVisual(q.type)}

        <div className="text-xl sm:text-2xl font-bold font-serif text-slate-800 text-center leading-relaxed">
          <MathText text={q.q} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {q.options.map((opt, i) => {
            const letter = ['A', 'B', 'C', 'D'][i];
            let btnStyle = 'border-2 border-slate-200 hover:border-[#7C3AED] hover:bg-purple-50 text-slate-800';

            if (isAnswered) {
              if (i === q.correct) {
                btnStyle = 'border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
              } else if (i === selectedOpt) {
                btnStyle = 'border-2 border-red-500 bg-red-50 text-red-800 font-bold';
              } else {
                btnStyle = 'border-slate-200 opacity-50';
              }
            }

            return (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => handleSelect(i)}
                className={`p-3.5 rounded-2xl flex items-center justify-between text-left font-serif text-base cursor-pointer transition-all ${btnStyle}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-purple-900 flex items-center justify-center shrink-0 text-sm">
                    {letter}
                  </span>
                  <span><MathText text={opt} /></span>
                </div>
                {isAnswered && i === q.correct && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                {isAnswered && i === selectedOpt && i !== q.correct && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-sm sm:text-base text-purple-950 font-serif">
            <strong className="block text-purple-900 font-bold mb-1">Giải thích chi tiết:</strong>
            <MathText text={q.explain} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button onClick={onExit} className="text-slate-500 hover:text-slate-800 text-sm font-bold cursor-pointer">
          Thoát game
        </button>

        {isAnswered && (
          <button
            onClick={handleNext}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold px-6 py-2.5 rounded-xl shadow flex items-center gap-2 cursor-pointer font-serif"
          >
            <span>{currentIdx + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {isFinished && (
        <div className="mt-6 p-6 bg-purple-50 border-2 border-purple-300 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-[#063B8E] mb-2 font-serif">
            🎉 Bạn đã hoàn thành bài kiểm tra Hình học!
          </h3>
          <p className="text-lg font-bold text-purple-800 mb-4">
            Điểm số: {score} / 100 điểm
          </p>
          <button
            onClick={onExit}
            className="bg-[#063B8E] text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer"
          >
            Về kho trò chơi
          </button>
        </div>
      )}

    </div>
  );
};
