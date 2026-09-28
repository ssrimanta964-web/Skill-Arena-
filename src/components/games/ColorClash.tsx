import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../../utils/audio';
import { Palette, RotateCcw, Check, X, Flame, Sparkles } from 'lucide-react';

interface Props {
  onFinish: (result: { score: number; metricValue: number; metricLabel: string; accuracy?: number }) => void;
  isDaily?: boolean;
}

interface ColorDef {
  name: string;
  css: string;
}

const COLORS: ColorDef[] = [
  { name: 'RED', css: '#ef4444' },
  { name: 'BLUE', css: '#3b82f6' },
  { name: 'GREEN', css: '#22c55e' },
  { name: 'YELLOW', css: '#eab308' },
  { name: 'PURPLE', css: '#c084fc' },
];

export default function ColorClash({ onFinish }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [wordColor, setWordColor] = useState<ColorDef>(COLORS[0]);
  const [inkColor, setInkColor] = useState<ColorDef>(COLORS[1]);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);

  const nextQuestion = useCallback(() => {
    const isMatching = Math.random() < 0.5;
    const wordIndex = Math.floor(Math.random() * COLORS.length);
    const chosenWord = COLORS[wordIndex];

    let chosenInk: ColorDef;
    if (isMatching) {
      chosenInk = chosenWord;
    } else {
      let inkIndex = Math.floor(Math.random() * COLORS.length);
      while (inkIndex === wordIndex) {
        inkIndex = Math.floor(Math.random() * COLORS.length);
      }
      chosenInk = COLORS[inkIndex];
    }

    setWordColor(chosenWord);
    setInkColor(chosenInk);
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(30);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setFeedback(null);

    soundManager.playCountdown(true);
    nextQuestion();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (answerYes: boolean) => {
    if (!isPlaying) return;

    const actualMatch = wordColor.name === inkColor.name;
    const isCorrect = answerYes === actualMatch;

    if (isCorrect) {
      const multiplier = 1 + Math.min(streak * 0.1, 2.0);
      const points = Math.round(100 * multiplier);

      setScore((s) => s + points);
      setStreak((st) => st + 1);
      setCorrectCount((c) => c + 1);

      setFeedback(`+${points} STROOP CRUSH!`);
      setTimeout(() => setFeedback(null), 400);

      soundManager.playClick(600 + Math.min(streak * 40, 800));
      soundManager.vibrate(15);
    } else {
      setScore((s) => Math.max(0, s - 50));
      setStreak(0);
      setWrongCount((w) => w + 1);
      setFeedback('MISMATCH -50');
      setTimeout(() => setFeedback(null), 400);

      soundManager.playFail();
      soundManager.vibrate(60);
    }

    nextQuestion();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'y') {
        handleAnswer(true);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'n') {
        handleAnswer(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, wordColor, inkColor, streak]);

  useEffect(() => {
    if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      soundManager.playLevelUp();

      const total = correctCount + wrongCount;
      const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

      onFinish({
        score,
        metricValue: score,
        metricLabel: 'pts',
        accuracy,
      });
    }
  }, [timeLeft, isPlaying, correctCount, wrongCount, score, onFinish]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const total = correctCount + wrongCount;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 100;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {/* Sci-Fi HUD Header */}
      <div className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">INHIBITION CLOCK</div>
            <div className={`text-xl font-mono font-black ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-fuchsia-400'}`}>
              {timeLeft}s
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {streak >= 3 && (
            <div className="flex items-center gap-1 text-xs px-3 py-1 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 font-bold animate-pulse shadow-sm shadow-fuchsia-500/20">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak} STREAK</span>
            </div>
          )}
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ACC · SCORE</div>
            <div className="text-sm font-mono font-black text-white">
              <span className="text-cyan-400">{accuracy}%</span> <span className="text-slate-600">·</span>{' '}
              <span className="text-fuchsia-400">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Conflict Arena Card */}
      <div className="w-full aspect-[4/3] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800/90 rounded-3xl p-6 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d946ef_1px,transparent_1px)] [background-size:16px_16px]" />

        {feedback && (
          <div className="absolute top-6 px-4 py-1 rounded-full bg-slate-900/90 border border-fuchsia-500/40 font-mono text-xs font-black text-fuchsia-300 animate-scale-in z-20">
            {feedback}
          </div>
        )}

        {!isPlaying ? (
          <div className="flex flex-col items-center gap-5 text-center p-4 z-10 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-fuchsia-500 to-pink-600 p-0.5 shadow-xl shadow-fuchsia-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-fuchsia-400">
                  <Palette className="w-10 h-10" />
                </div>
              </div>
              <div className="absolute -inset-2 bg-fuchsia-500/20 rounded-full blur-xl -z-10 animate-pulse-glow" />
            </div>

            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">COLOR CLASH</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xs leading-relaxed">
                Does the linguistic word match the ink color? Resist cognitive interference and respond at lightning speed!
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-fuchsia-500/30 tracking-wider uppercase transition flex items-center gap-2 cursor-pointer"
            >
              {timeLeft === 0 ? <RotateCcw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{timeLeft === 0 ? 'RETRY CLASH' : 'START STROOP TRIAL'}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-between w-full h-full py-2 z-10">
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold mt-4">
              DOES WORD MEANING MATCH INK PIGMENT?
            </div>

            {/* Stimulus Word with glowing color */}
            <div
              style={{
                color: inkColor.css,
                textShadow: `0 0 35px ${inkColor.css}66`,
              }}
              className="text-7xl sm:text-8xl font-black tracking-tight select-none animate-scale-in"
            >
              {wordColor.name}
            </div>

            {/* Response Triggers */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md pb-2">
              <button
                onClick={() => handleAnswer(true)}
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-lg flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 active:scale-95 transition cursor-pointer border border-emerald-400/40"
              >
                <Check className="w-6 h-6 stroke-[3]" />
                <span>MATCH</span>
                <span className="text-[10px] font-mono text-emerald-200/70 ml-1 hidden sm:inline">[←]</span>
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-lg flex items-center justify-center gap-2.5 shadow-xl shadow-rose-600/30 active:scale-95 transition cursor-pointer border border-rose-400/40"
              >
                <X className="w-6 h-6 stroke-[3]" />
                <span>DIFFERENT</span>
                <span className="text-[10px] font-mono text-rose-200/70 ml-1 hidden sm:inline">[→]</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full mt-3 text-center text-xs text-slate-400 font-medium">
        Keyboard controls enabled: Left Arrow [←] for MATCH · Right Arrow [→] for DIFFERENT
      </div>
    </div>
  );
}
