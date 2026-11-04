import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Clock, Check, RotateCcw, HelpCircle, Trophy } from 'lucide-react';
import { GameItem, UserProfile } from '../../types';
import { api } from '../../services/api';

interface SudokuGamePlayerProps {
  game: GameItem;
  currentUser: UserProfile;
  roomCode?: string;
  onExit: () => void;
  onFinished?: () => void;
}

export const SudokuGamePlayer: React.FC<SudokuGamePlayerProps> = ({
  game,
  currentUser,
  roomCode = '',
  onExit,
  onFinished
}) => {
  // A clean 6x6 mini Sudoku puzzle (blocks 2x3)
  const initialGrid = [
    [1, 0, 0, 4, 0, 6],
    [0, 6, 4, 0, 1, 0],
    [0, 0, 6, 2, 0, 4],
    [4, 0, 1, 6, 0, 0],
    [0, 4, 0, 1, 6, 0],
    [6, 0, 3, 0, 0, 1]
  ];

  const solution = [
    [1, 2, 5, 4, 3, 6],
    [3, 6, 4, 5, 1, 2],
    [5, 1, 6, 2, 8, 4],
    [4, 3, 1, 6, 2, 5],
    [2, 4, 8, 1, 6, 3],
    [6, 5, 3, 8, 4, 1]
  ];

  const [grid, setGrid] = useState<number[][]>(() => initialGrid.map((row) => [...row]));
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>({ r: 0, c: 1 });
  const [mistakes, setMistakes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [hintCount, setHintCount] = useState(3);

  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  const handleCellClick = (r: number, c: number) => {
    setSelectedCell({ r, c });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isWon) return;
    const { r, c } = selectedCell;
    // Cannot overwrite initial prefilled numbers
    if (initialGrid[r][c] !== 0) return;

    const newGrid = grid.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? num : val))
    );
    setGrid(newGrid);

    // Check if correct
    if (num !== 0 && solution[r][c] !== num) {
      setMistakes((m) => m + 1);
    }

    // Check if board is complete and correct
    let complete = true;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (newGrid[i][j] !== solution[i][j]) {
          complete = false;
          break;
        }
      }
    }

    if (complete) {
      handleWin();
    }
  };

  const handleHint = () => {
    if (!selectedCell || hintCount <= 0 || isWon) return;
    const { r, c } = selectedCell;
    if (initialGrid[r][c] !== 0) return;

    const correctVal = solution[r][c];
    handleNumberInput(correctVal);
    setHintCount((h) => h - 1);
  };

  const handleWin = async () => {
    setIsWon(true);
    const score = Math.max(70, 100 - mistakes * 5);

    await api.saveAttempt({
      studentCode: currentUser.code || 'HS1001',
      studentName: currentUser.name || 'Học sinh',
      className: currentUser.className || '12A1',
      gameId: game.id,
      gameTitle: game.title,
      roomCode: roomCode || '',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: timerSeconds,
      totalQuestions: 1,
      correctCount: 1,
      incorrectCount: mistakes,
      score,
      status: 'completed'
    });

    try {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } catch {}

    if (onFinished) onFinished();
  };

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border-4 border-[#16A34A] p-6 sm:p-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B8E] font-serif">
            🧩 Sudoku Ma Trận Toán Học
          </h2>
          <p className="text-sm text-slate-500">Điền số từ 1 đến 6 vào các ô trống</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-sm font-bold border border-emerald-200">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-sm font-bold border border-red-200">
            Lỗi: {mistakes}
          </div>
        </div>
      </div>

      {/* Sudoku Grid */}
      <div className="my-6 flex justify-center">
        <div className="grid grid-cols-6 border-4 border-[#063B8E] rounded-xl overflow-hidden shadow-lg bg-slate-100">
          {grid.map((row, r) =>
            row.map((val, c) => {
              const isPre = initialGrid[r][c] !== 0;
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isSameRowOrCol = selectedCell && (selectedCell.r === r || selectedCell.c === c);
              const isWrong = val !== 0 && !isPre && val !== solution[r][c];

              // Block border styling for 2x3 blocks
              const borderBottom = (r + 1) % 2 === 0 && r !== 5 ? 'border-b-2 border-b-[#063B8E]' : 'border-b border-b-slate-300';
              const borderRight = (c + 1) % 3 === 0 && c !== 5 ? 'border-r-2 border-r-[#063B8E]' : 'border-r border-r-slate-300';

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-xl sm:text-2xl transition-all cursor-pointer ${borderBottom} ${borderRight} ${
                    isSelected
                      ? 'bg-[#00CFFF]/40 text-[#063B8E] scale-105 z-10'
                      : isWrong
                      ? 'bg-red-100 text-red-600'
                      : isSameRowOrCol
                      ? 'bg-blue-50'
                      : isPre
                      ? 'bg-slate-200 text-[#063B8E]'
                      : 'bg-white text-[#0878DC]'
                  }`}
                >
                  {val !== 0 ? val : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Number Keypad & Controls */}
      <div className="space-y-4">
        <div className="flex justify-center gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-white to-slate-100 border-2 border-slate-300 hover:border-[#16A34A] text-slate-800 hover:text-[#16A34A] font-bold text-xl shadow flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleNumberInput(0)}
            className="px-3 h-11 sm:h-12 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm shadow flex items-center justify-center transition-all cursor-pointer"
          >
            Xóa
          </button>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleHint}
            disabled={hintCount <= 0 || isWon}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-sm font-bold cursor-pointer transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Gợi ý ({hintCount})</span>
          </button>

          <button
            onClick={onExit}
            className="text-slate-500 hover:text-slate-700 text-sm font-bold cursor-pointer"
          >
            Thoát game
          </button>
        </div>
      </div>

      {/* Victory Banner */}
      {isWon && (
        <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-center animate-in zoom-in-95">
          <h3 className="text-2xl font-black text-emerald-800 font-serif mb-1">
            🎉 Xin chúc mừng! Bạn đã giải xong ma trận!
          </h3>
          <p className="text-emerald-700 mb-3 text-sm">
            Thời gian hoàn thành: {formatTimer(timerSeconds)} • Số lỗi: {mistakes}
          </p>
          <button
            onClick={onExit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl shadow cursor-pointer"
          >
            Hoàn tất & Lưu thành tích
          </button>
        </div>
      )}

    </div>
  );
};
