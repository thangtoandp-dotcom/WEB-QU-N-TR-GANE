import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Clock, RotateCcw, Trophy, Award } from 'lucide-react';
import { GameItem, UserProfile } from '../../types';
import { api } from '../../services/api';
import { MathText } from '../common/MathText';

interface MemoryCardGamePlayerProps {
  game: GameItem;
  currentUser: UserProfile;
  roomCode?: string;
  onExit: () => void;
  onFinished?: () => void;
}

interface CardItem {
  id: number;
  pairId: number;
  text: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryCardGamePlayer: React.FC<MemoryCardGamePlayerProps> = ({
  game,
  currentUser,
  roomCode = '',
  onExit,
  onFinished
}) => {
  const formulaPairs = [
    { pId: 1, a: '$\\sin^2 x + \\cos^2 x$', b: '$= 1$' },
    { pId: 2, a: '$(u \\cdot v)\'$', b: '$= u\'v + uv\'$' },
    { pId: 3, a: '$\\displaystyle\\int \\dfrac{1}{x}\\,\\mathrm{d}x$', b: '$= \\ln|x| + C$' },
    { pId: 4, a: '$V_{\\text{chóp}}$', b: '$= \\dfrac{1}{3}Bh$' },
    { pId: 5, a: '$V_{\\text{trụ}}$', b: '$= \\pi r^2 h$' },
    { pId: 6, a: '$\\log_a(x \\cdot y)$', b: '$= \\log_a x + \\log_a y$' }
  ];

  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Initialize and shuffle cards
  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const deck: CardItem[] = [];
    let idCounter = 1;

    formulaPairs.forEach((pair) => {
      deck.push({ id: idCounter++, pairId: pair.pId, text: pair.a, isFlipped: false, isMatched: false });
      deck.push({ id: idCounter++, pairId: pair.pId, text: pair.b, isFlipped: false, isMatched: false });
    });

    // Shuffle
    const shuffled = deck.sort(() => 0.5 - Math.random());
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setTimer(0);
    setIsWon(false);
  };

  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const card1 = newCards.find((c) => c.id === newFlipped[0])!;
      const card2 = newCards.find((c) => c.id === newFlipped[1])!;

      if (card1.pairId === card2.pairId) {
        // Matched!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.pairId === card1.pairId ? { ...c, isMatched: true } : c))
          );
          setFlippedCards([]);

          // Check if all matched
          const allDone = newCards.every((c) => c.isMatched || c.pairId === card1.pairId);
          if (allDone) {
            handleVictory();
          }
        }, 500);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c))
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleVictory = async () => {
    setIsWon(true);
    const score = Math.max(60, 100 - (moves - 6) * 4);

    await api.saveAttempt({
      studentCode: currentUser.code || 'HS1001',
      studentName: currentUser.name || 'Học sinh',
      className: currentUser.className || '12A1',
      gameId: game.id,
      gameTitle: game.title,
      roomCode: roomCode || '',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: timer,
      totalQuestions: 6,
      correctCount: 6,
      incorrectCount: Math.max(0, moves - 6),
      score,
      status: 'completed'
    });

    try {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } catch {}

    if (onFinished) onFinished();
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border-4 border-[#6D28D9] p-6 sm:p-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B8E] font-serif">
            🃏 Lật Thẻ Trí Nhớ Công Thức Toán
          </h2>
          <p className="text-sm text-slate-500">Lật đúng các cặp công thức và vế tương ứng</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-purple-50 text-purple-900 px-3 py-1.5 rounded-xl text-sm font-bold border border-purple-200">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>{formatTimer(timer)}</span>
          </div>
          <div className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl text-sm font-bold border border-slate-300">
            Lượt lật: {moves}
          </div>
        </div>
      </div>

      {/* Grid of 12 cards */}
      <div className="my-6 grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map((c) => {
          const isOpen = c.isFlipped || c.isMatched;

          return (
            <button
              key={c.id}
              disabled={isOpen}
              onClick={() => handleCardClick(c.id)}
              className={`h-24 sm:h-28 rounded-2xl p-2 font-bold font-serif text-sm sm:text-base flex items-center justify-center text-center shadow-md transition-all duration-300 cursor-pointer transform ${
                c.isMatched
                  ? 'bg-emerald-100 border-2 border-emerald-400 text-emerald-900 scale-95 opacity-80'
                  : isOpen
                  ? 'bg-gradient-to-br from-[#EAF5FF] to-[#D0E7FF] border-2 border-[#0878DC] text-[#063B8E] rotate-0 scale-100'
                  : 'bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] text-white hover:scale-105 hover:shadow-lg'
              }`}
            >
              {isOpen ? (
                <span className="text-center px-1"><MathText text={c.text} /></span>
              ) : (
                <div className="text-2xl sm:text-3xl opacity-80 select-none">
                  π
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer controls */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <button
          onClick={initGame}
          className="flex items-center gap-1.5 text-[#0878DC] hover:text-[#063B8E] font-bold text-sm cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Xếp lại thẻ bài</span>
        </button>

        <button
          onClick={onExit}
          className="text-slate-500 hover:text-slate-800 text-sm font-bold cursor-pointer"
        >
          Thoát game
        </button>
      </div>

      {/* Victory modal */}
      {isWon && (
        <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-center animate-in zoom-in-95">
          <div className="text-4xl mb-1">🎉</div>
          <h3 className="text-2xl font-bold text-emerald-900 font-serif mb-1">
            Tuyệt vời! Bạn có trí nhớ công thức siêu đỉnh!
          </h3>
          <p className="text-emerald-800 text-sm mb-4">
            Hoàn thành trong {formatTimer(timer)} với {moves} lần lật thẻ.
          </p>
          <button
            onClick={onExit}
            className="bg-[#063B8E] text-white font-bold px-6 py-2.5 rounded-xl shadow cursor-pointer font-serif"
          >
            Về kho trò chơi
          </button>
        </div>
      )}

    </div>
  );
};
