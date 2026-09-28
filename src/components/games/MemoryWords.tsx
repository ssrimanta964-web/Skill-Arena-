import React, { useState } from 'react';
import { soundManager } from '../../utils/audio';
import { BookOpen, Heart, RotateCcw, Check, Sparkles, Brain, AlertCircle } from 'lucide-react';

interface Props {
  onFinish: (result: { score: number; metricValue: number; metricLabel: string; accuracy?: number }) => void;
  isDaily?: boolean;
}

const WORD_BANK = [
  'HORIZON', 'CRYSTAL', 'VELOCITY', 'SHADOW', 'LANTERN', 'MIRAGE', 'PHANTOM', 'ECLIPSE',
  'COMPASS', 'VORTEX', 'GLACIER', 'NEXUS', 'SOLITUDE', 'AURORA', 'CASCADE', 'ZENITH',
  'TITAN', 'ORBIT', 'METEOR', 'CHRONO', 'NEBULA', 'SIGNAL', 'MONOLITH', 'BASTION',
  'VALIANT', 'FROST', 'GRAVITY', 'CIRCUIT', 'QUANTUM', 'SPECTRUM', 'EMBER', 'SERPENT',
  'TALISMAN', 'OASIS', 'VOYAGE', 'OBSIDIAN', 'TEMPEST', 'SUMMIT', 'QUARTZ', 'ENIGMA',
  'RADAR', 'CORONA', 'STELLAR', 'APEX', 'FLARE', 'BLIZZARD', 'PULSE', 'ECHO',
  'SPARK', 'AVALANCHE', 'DYNAMIC', 'CHASM', 'BEACON', 'MATRIX', 'GALAXY', 'COBALT',
  'SYMPHONY', 'INFINITY', 'FRACTAL', 'HARMONY', 'PYRAMID', 'CYPHER', 'KINETIC', 'MIRROR'
];

export default function MemoryWords({ onFinish }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [lives, setLives] = useState(3);
  const [currentWord, setCurrentWord] = useState('');
  const [seenWords, setSeenWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [wordsCount, setWordsCount] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);

  const getNextWord = (existingSeen: string[]) => {
    const shouldPickSeen = existingSeen.length >= 2 && Math.random() < 0.46;

    if (shouldPickSeen) {
      const randIndex = Math.floor(Math.random() * existingSeen.length);
      return existingSeen[randIndex];
    } else {
      const unseen = WORD_BANK.filter((w) => !existingSeen.includes(w));
      if (unseen.length === 0) {
        return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
      }
      return unseen[Math.floor(Math.random() * unseen.length)];
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setLives(3);
    setScore(0);
    setWordsCount(0);
    setSeenWords([]);
    setFeedback(null);

    soundManager.playCountdown(true);
    const firstWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    setCurrentWord(firstWord);
  };

  const handleDecision = (claimedSeen: boolean) => {
    if (!isPlaying) return;

    const actuallySeen = seenWords.includes(currentWord);
    const isCorrect = claimedSeen === actuallySeen;

    if (isCorrect) {
      soundManager.playSuccess();
      soundManager.vibrate(20);

      const nextSeen = actuallySeen ? seenWords : [...seenWords, currentWord];
      setSeenWords(nextSeen);
      setScore((s) => s + 100);
      setWordsCount((w) => w + 1);

      setFeedback({ text: 'CORRECT RETENTION!', correct: true });
      setTimeout(() => setFeedback(null), 350);

      setCurrentWord(getNextWord(nextSeen));
    } else {
      soundManager.playFail();
      soundManager.vibrate(80);

      const nextLives = lives - 1;
      setLives(nextLives);

      setFeedback({ text: 'RETENTION STRIKE!', correct: false });
      setTimeout(() => setFeedback(null), 350);

      if (nextLives <= 0) {
        setIsPlaying(false);
        const finalCount = wordsCount;
        const finalScore = score;

        onFinish({
          score: finalScore,
          metricValue: finalCount,
          metricLabel: 'words',
          accuracy: Math.min(100, Math.round((finalCount / (finalCount + 3)) * 100)),
        });
      } else {
        const nextSeen = actuallySeen ? seenWords : [...seenWords, currentWord];
        setSeenWords(nextSeen);
        setCurrentWord(getNextWord(nextSeen));
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {/* Sci-Fi HUD Header */}
      <div className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">WORKING MEMORY CAPACITY</div>
            <div className="text-xl font-mono font-black text-teal-400">
              {wordsCount} <span className="text-xs text-slate-400">WORDS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-all ${
                  i < lives ? 'text-rose-500 fill-rose-500 drop-shadow-md' : 'text-slate-800 scale-90'
                }`}
              />
            ))}
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SCORE</div>
            <div className="text-sm font-black font-mono text-white">{score}</div>
          </div>
        </div>
      </div>

      {/* Main Lexical Terminal */}
      <div className="w-full aspect-[4/3] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800/90 rounded-3xl p-6 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]" />

        {feedback && (
          <div
            className={`absolute top-6 px-4 py-1.5 rounded-full font-mono text-xs font-black tracking-wider animate-scale-in z-20 ${
              feedback.correct
                ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/90 border border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {!isPlaying ? (
          <div className="flex flex-col items-center gap-5 text-center p-4 z-10 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-600 p-0.5 shadow-xl shadow-teal-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-teal-400">
                  <BookOpen className="w-10 h-10" />
                </div>
              </div>
              <div className="absolute -inset-2 bg-teal-500/20 rounded-full blur-xl -z-10 animate-pulse-glow" />
            </div>

            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">MEMORY WORDS</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xs leading-relaxed">
                Identify whether each word has appeared previously or represents a novel lexical stimulus.
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/30 tracking-wider uppercase transition flex items-center gap-2 cursor-pointer"
            >
              {lives <= 0 ? <RotateCcw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{lives <= 0 ? 'RETRY MEMORY WORDS' : 'START MEMORY BENCHMARK'}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-between w-full h-full py-4 z-10">
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold mt-2">
              HAVE YOU SEEN THIS WORD BEFORE?
            </div>

            {/* Stimulus Word Terminal Pedestal */}
            <div className="relative px-8 py-4 rounded-3xl bg-slate-900/90 border border-slate-700/60 shadow-2xl flex items-center justify-center">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 rounded-3xl blur-md -z-10" />
              <div className="text-5xl sm:text-6xl font-mono font-black text-white tracking-widest select-none">
                {currentWord}
              </div>
            </div>

            {/* SEEN vs NEW Response Actuators */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md pb-2">
              <button
                onClick={() => handleDecision(true)}
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-lg shadow-xl shadow-indigo-600/30 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2.5 border border-indigo-400/40"
              >
                <Check className="w-6 h-6 stroke-[3]" />
                <span>SEEN</span>
              </button>
              <button
                onClick={() => handleDecision(false)}
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-lg shadow-xl shadow-teal-600/30 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2.5 border border-teal-400/40"
              >
                <Sparkles className="w-5 h-5" />
                <span>NEW</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full mt-3 text-center text-xs text-slate-400 font-medium">
        Cognitive span capacity: 3 strike tolerance · Test your working memory limits
      </div>
    </div>
  );
}
