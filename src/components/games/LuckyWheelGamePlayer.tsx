import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCw, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GameItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { MathText } from '../common/MathText';

interface LuckyWheelGamePlayerProps {
  game: GameItem;
  currentUser: UserProfile;
  roomCode?: string;
  onExit: () => void;
  onFinished?: () => void;
}

export const LuckyWheelGamePlayer: React.FC<LuckyWheelGamePlayerProps> = ({
  game,
  currentUser,
  roomCode = '',
  onExit,
  onFinished
}) => {
  const slices = [
    { label: '+20 Điểm', color: '#EF4444', value: 20 },
    { label: '+50 Điểm', color: '#F59E0B', value: 50 },
    { label: '+10 Điểm', color: '#10B981', value: 10 },
    { label: 'Nhân đôi x2', color: '#3B82F6', value: 40 },
    { label: '+80 Điểm', color: '#8B5CF6', value: 80 },
    { label: '+30 Điểm', color: '#EC4899', value: 30 },
    { label: 'Thưởng 100đ', color: '#06B6D4', value: 100 },
    { label: '+15 Điểm', color: '#84CC16', value: 15 }
  ];

  const mathChallenges = [
    {
      q: 'Tính nhẩm nhanh: $15 \\cdot 12 = ?$',
      options: ['$180$', '$170$', '$190$', '$160$'],
      correct: 0
    },
    {
      q: 'Đạo hàm của hàm số $f(x) = x^2$ tại điểm $x = 3$ là:',
      options: ['$f\'(3) = 6$', '$f\'(3) = 9$', '$f\'(3) = 3$', '$f\'(3) = 12$'],
      correct: 0
    },
    {
      q: 'Giá trị lượng giác của $\\sin 30^\\circ$ bằng bao nhiêu?',
      options: ['$\\dfrac{1}{2}$', '$\\dfrac{\\sqrt{3}}{2}$', '$\\dfrac{\\sqrt{2}}{2}$', '$1$'],
      correct: 0
    },
    {
      q: 'Giá trị của logarit $\\log_2 64$ bằng:',
      options: ['$6$', '$8$', '$5$', '$4$'],
      correct: 0
    },
    {
      q: 'Nghiệm của phương trình $\\sqrt{x + 1} = 3$ là:',
      options: ['$x = 8$', '$x = 2$', '$x = 10$', '$x = 9$'],
      correct: 0
    },
    {
      q: 'Số cạnh của một hình lăng trụ đứng tam giác là:',
      options: ['$9$', '$6$', '$5$', '$8$'],
      correct: 0
    }
  ];

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [totalScore, setTotalScore] = useState(0);
  const [currentReward, setCurrentReward] = useState<any>(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [isFinished, setIsFinished] = useState(false);

  const spinWheel = () => {
    if (isSpinning || spinsLeft <= 0) return;
    setIsSpinning(true);
    setCurrentReward(null);

    // Random slices
    const randomSlice = Math.floor(Math.random() * slices.length);
    const sliceAngle = 360 / slices.length;
    // Add multiple full spins
    const extraSpins = 360 * 5;
    const targetAngle = rotation + extraSpins + (360 - (randomSlice * sliceAngle + sliceAngle / 2));

    setRotation(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const won = slices[randomSlice];
      setCurrentReward(won);
      setSpinsLeft((prev) => prev - 1);

      // Open a quick math bonus challenge
      const randomQ = mathChallenges[Math.floor(Math.random() * mathChallenges.length)];
      setActiveChallenge(randomQ);
      setShowChallenge(true);
    }, 4000);
  };

  const handleChallengeAnswer = (isCorrect: boolean) => {
    setShowChallenge(false);
    const gained = isCorrect ? currentReward.value : Math.floor(currentReward.value / 2);
    const newTotal = totalScore + gained;
    setTotalScore(newTotal);

    if (isCorrect) {
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }

    if (spinsLeft <= 1) {
      setTimeout(() => {
        finishGame(newTotal);
      }, 1000);
    }
  };

  const finishGame = async (finalPts: number) => {
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
      durationSeconds: 180,
      totalQuestions: 3,
      correctCount: 3,
      incorrectCount: 0,
      score: Math.min(finalPts, 120),
      status: 'completed'
    });

    try {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
    } catch {}

    if (onFinished) onFinished();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border-4 border-[#F59E0B] p-6 sm:p-8">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-[#063B8E] font-serif">
          🎯 Vòng Quay May Mắn Toán Học
        </h2>
        <p className="text-slate-600 font-medium">
          Quay trúng điểm thưởng và giải câu đố thần tốc để nhận điểm tối đa!
        </p>

        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="bg-amber-100 px-4 py-1.5 rounded-full text-amber-800 font-bold text-sm">
            Lượt quay còn lại: <span className="text-lg text-amber-900">{spinsLeft}</span>
          </div>
          <div className="bg-blue-100 px-4 py-1.5 rounded-full text-blue-800 font-bold text-sm">
            Điểm tích lũy: <span className="text-lg text-blue-900">{totalScore}</span>
          </div>
        </div>
      </div>

      {/* Wheel Area */}
      <div className="relative flex flex-col items-center justify-center my-6">
        {/* Pointer Triangle */}
        <div className="z-20 -mb-5 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[30px] border-t-red-600 filter drop-shadow-md"></div>

        {/* Circular Wheel */}
        <div
          className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-8 border-white shadow-2xl overflow-hidden transition-all duration-[4000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Wheel SVG slices */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {slices.map((slice, i) => {
              const angle = 360 / slices.length;
              const startAngle = i * angle;
              const endAngle = (i + 1) * angle;

              const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);

              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

              return (
                <g key={i}>
                  <path d={pathData} fill={slice.color} stroke="#FFFFFF" strokeWidth="1" />
                  <text
                    x="50"
                    y="22"
                    fill="#FFFFFF"
                    fontSize="5"
                    fontWeight="bold"
                    textAnchor="middle"
                    transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                  >
                    {slice.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Center Hub */}
          <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white border-4 border-amber-400 shadow-md flex items-center justify-center text-xl font-black text-[#063B8E]">
            🌟
          </div>
        </div>

        {/* Spin Button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning || spinsLeft <= 0}
          className={`mt-8 px-8 py-3.5 rounded-2xl font-bold font-serif text-xl shadow-xl flex items-center gap-2 cursor-pointer transition-transform transform active:scale-95 ${
            isSpinning || spinsLeft <= 0
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white hover:scale-105'
          }`}
        >
          <RotateCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Đang quay...' : spinsLeft > 0 ? 'QUAY NGAY!' : 'Hết lượt quay'}</span>
        </button>
      </div>

      {/* Math Challenge Modal */}
      {showChallenge && activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-400 shadow-2xl animate-in zoom-in-95 text-center">
            <span className="text-4xl mb-2 block">🎁</span>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              Ô thưởng: {currentReward?.label}
            </div>
            <h4 className="text-xl font-bold font-serif text-[#063B8E] mb-3">
              Trả lời đúng câu đố Toán để nhận trọn vẹn điểm thưởng!
            </h4>
            
            <div className="bg-amber-50 p-4 rounded-2xl text-slate-800 font-bold text-lg mb-4 font-serif">
              <MathText text={activeChallenge.q} />
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {activeChallenge.options.map((opt: string, i: number) => (
                <button
                  key={i}
                  onClick={() => handleChallengeAnswer(i === activeChallenge.correct)}
                  className="p-3 bg-white border-2 border-slate-300 hover:border-amber-500 hover:bg-amber-50 rounded-xl font-bold text-slate-800 font-serif cursor-pointer transition-colors text-base"
                >
                  <MathText text={opt} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {isFinished && (
        <div className="text-center pt-4 border-t border-slate-100">
          <div className="text-2xl font-bold text-[#16A34A] mb-2 font-serif">
            🎉 Chúc mừng bạn đã hoàn thành phiên quay may mắn!
          </div>
          <div className="text-xl font-bold text-[#063B8E] mb-4">
            Tổng điểm đạt được: <span className="text-3xl text-amber-600">{totalScore}</span> điểm
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onExit}
              className="px-6 py-2.5 rounded-xl bg-[#063B8E] text-white font-bold cursor-pointer"
            >
              Về kho trò chơi
            </button>
          </div>
        </div>
      )}

      {!isFinished && (
        <div className="flex justify-between items-center text-xs text-slate-400 pt-4 border-t border-slate-100">
          <span>Người chơi: <strong>{currentUser.name}</strong></span>
          <button onClick={onExit} className="hover:text-slate-600 cursor-pointer">
            Thoát game
          </button>
        </div>
      )}

    </div>
  );
};
