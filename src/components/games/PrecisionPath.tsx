import React, { useRef, useState, useEffect, useCallback } from 'react';
import { soundManager } from '../../utils/audio';
import { Route, RotateCcw, AlertTriangle, Award, Compass, Sparkles, Flame, ShieldAlert, Zap, Layers } from 'lucide-react';

interface Props {
  onFinish: (result: { score: number; metricValue: number; metricLabel: string; accuracy?: number }) => void;
  isDaily?: boolean;
}

interface Point {
  x: number;
  y: number;
}

type ThemeId = 'cyber' | 'volcanic' | 'toxic' | 'cosmic';
type DifficultyId = 'standard' | 'hard' | 'apex';

interface ThemeConfig {
  id: ThemeId;
  name: string;
  icon: string;
  bgFill: string;
  gridColor: string;
  conduitOuter: string;
  wallStroke: string;
  guideStroke: string;
  probeColor: string;
  probeGlow: string;
  sparkColors: string[];
  hazardColor: string;
  hazardGlow: string;
  startColor: string;
  finishColor: string;
  ambientVibe: string;
}

const THEMES: Record<ThemeId, ThemeConfig> = {
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    icon: '⚡',
    bgFill: '#050811',
    gridColor: 'rgba(56, 189, 248, 0.05)',
    conduitOuter: '#0c1527',
    wallStroke: 'rgba(14, 165, 233, 0.85)',
    guideStroke: 'rgba(56, 189, 248, 0.5)',
    probeColor: '#0ea5e9',
    probeGlow: '#38bdf8',
    sparkColors: ['#38bdf8', '#0ea5e9', '#67e8f9', '#ffffff'],
    hazardColor: '#f43f5e',
    hazardGlow: 'rgba(244, 63, 94, 0.6)',
    startColor: '#10b981',
    finishColor: '#f59e0b',
    ambientVibe: 'Digital Grid Protocol',
  },
  volcanic: {
    id: 'volcanic',
    name: 'Molten Core',
    icon: '🌋',
    bgFill: '#0e0504',
    gridColor: 'rgba(239, 68, 68, 0.05)',
    conduitOuter: '#1c0a08',
    wallStroke: 'rgba(249, 115, 22, 0.9)',
    guideStroke: 'rgba(251, 146, 60, 0.55)',
    probeColor: '#f97316',
    probeGlow: '#fb923c',
    sparkColors: ['#fbbf24', '#f97316', '#ef4444', '#ffffff'],
    hazardColor: '#ef4444',
    hazardGlow: 'rgba(239, 68, 68, 0.7)',
    startColor: '#eab308',
    finishColor: '#dc2626',
    ambientVibe: 'Magma Fracture Chasm',
  },
  toxic: {
    id: 'toxic',
    name: 'Bio-Crypt',
    icon: '☣️',
    bgFill: '#040b06',
    gridColor: 'rgba(132, 204, 22, 0.05)',
    conduitOuter: '#0d1f11',
    wallStroke: 'rgba(132, 204, 22, 0.9)',
    guideStroke: 'rgba(163, 230, 53, 0.5)',
    probeColor: '#84cc16',
    probeGlow: '#a3e635',
    sparkColors: ['#a3e635', '#84cc16', '#4ade80', '#ffffff'],
    hazardColor: '#eab308',
    hazardGlow: 'rgba(234, 179, 8, 0.6)',
    startColor: '#22c55e',
    finishColor: '#84cc16',
    ambientVibe: 'Acid Spill Facility',
  },
  cosmic: {
    id: 'cosmic',
    name: 'Nebula Void',
    icon: '🌌',
    bgFill: '#090314',
    gridColor: 'rgba(168, 85, 247, 0.05)',
    conduitOuter: '#170b2c',
    wallStroke: 'rgba(192, 132, 252, 0.9)',
    guideStroke: 'rgba(216, 180, 254, 0.5)',
    probeColor: '#a855f7',
    probeGlow: '#c084fc',
    sparkColors: ['#f472b6', '#c084fc', '#a855f7', '#ffffff'],
    hazardColor: '#ec4899',
    hazardGlow: 'rgba(236, 72, 153, 0.7)',
    startColor: '#38bdf8',
    finishColor: '#ec4899',
    ambientVibe: 'Pulsar Singularity',
  },
};

interface HazardLaser {
  segmentIndex: number;
  pos: Point;
  angle: number;
  length: number;
  speed: number;
  offset: number;
  sweepRange: number;
}

export default function PrecisionPath({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [integrity, setIntegrity] = useState(100);
  const [elapsedSec, setElapsedSec] = useState(0);

  const [currentTheme, setCurrentTheme] = useState<ThemeId>('cyber');
  const [difficulty, setDifficulty] = useState<DifficultyId>('hard');
  const [hazardAlert, setHazardAlert] = useState(false);

  const gameStateRef = useRef({
    path: [] as Point[],
    pathRadius: 18,
    player: { x: 50, y: 150 },
    isDragging: false,
    startTime: 0,
    integrity: 100,
    wallHits: 0,
    laserHits: 0,
    samples: 0,
    totalDeviation: 0,
    isRunning: false,
    lasers: [] as HazardLaser[],
    sparks: [] as { x: number; y: number; vx: number; vy: number; alpha: number; color: string }[],
    portalPulse: 0,
    theme: THEMES['cyber'],
    difficulty: 'hard' as DifficultyId,
  });

  const getDifficultySettings = (diff: DifficultyId) => {
    switch (diff) {
      case 'standard':
        return { radius: 24, laserCount: 1, multiplier: 1.0, label: 'STANDARD' };
      case 'hard':
        return { radius: 17, laserCount: 2, multiplier: 1.6, label: 'CHICANE HAZARD' };
      case 'apex':
        return { radius: 12.5, laserCount: 3, multiplier: 2.4, label: 'APEX SURGEON' };
    }
  };

  const generateComplexPath = (width: number, height: number, diff: DifficultyId): Point[] => {
    const points: Point[] = [];
    const steps = diff === 'apex' ? 26 : diff === 'hard' ? 22 : 18;
    const startX = 65;
    const endX = width - 65;
    const dx = (endX - startX) / (steps - 1);

    for (let i = 0; i < steps; i++) {
      const x = startX + i * dx;
      const normalizedX = i / (steps - 1);

      // Create challenging hairpin switchbacks and acute turns on higher difficulties
      let y: number;
      if (diff === 'apex') {
        const primary = Math.sin(normalizedX * Math.PI * 4) * (height * 0.35);
        const hairpin = Math.cos(normalizedX * Math.PI * 6) * (height * 0.15);
        const undulation = Math.sin(normalizedX * Math.PI * 10) * (height * 0.08);
        y = height / 2 + primary + hairpin + undulation;
      } else if (diff === 'hard') {
        const primary = Math.sin(normalizedX * Math.PI * 3.5) * (height * 0.32);
        const secondary = Math.cos(normalizedX * Math.PI * 5) * (height * 0.14);
        y = height / 2 + primary + secondary;
      } else {
        const primary = Math.sin(normalizedX * Math.PI * 2.8) * (height * 0.25);
        y = height / 2 + primary;
      }

      points.push({ x, y: Math.max(45, Math.min(height - 45, y)) });
    }

    return points;
  };

  const setupLasers = (path: Point[], count: number): HazardLaser[] => {
    const lasers: HazardLaser[] = [];
    if (count <= 0 || path.length < 6) return lasers;

    const interval = Math.floor((path.length - 4) / count);
    for (let k = 0; k < count; k++) {
      const idx = 3 + k * interval;
      const pt = path[idx];
      const nextPt = path[idx + 1] || path[idx - 1];
      const pathAngle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x);

      lasers.push({
        segmentIndex: idx,
        pos: { x: pt.x, y: pt.y },
        angle: pathAngle + Math.PI / 2, // Perpendicular to path
        length: 44,
        speed: 0.04 + k * 0.02,
        offset: k * Math.PI * 0.7,
        sweepRange: 28,
      });
    }

    return lasers;
  };

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    const diffSettings = getDifficultySettings(difficulty);
    const path = generateComplexPath(width, height, difficulty);
    const lasers = setupLasers(path, diffSettings.laserCount);
    const activeTheme = THEMES[currentTheme];

    gameStateRef.current = {
      path,
      pathRadius: diffSettings.radius,
      player: { x: path[0].x, y: path[0].y },
      isDragging: false,
      startTime: 0,
      integrity: 100,
      wallHits: 0,
      laserHits: 0,
      samples: 0,
      totalDeviation: 0,
      isRunning: true,
      lasers,
      sparks: [],
      portalPulse: 0,
      theme: activeTheme,
      difficulty,
    };

    setIsPlaying(true);
    setIsCompleted(false);
    setIntegrity(100);
    setElapsedSec(0);
    setHazardAlert(false);
    soundManager.playCountdown(true);
  };

  const getDistToPath = (p: Point, path: Point[]): { dist: number; nearestSegmentIndex: number } => {
    let minDist = Infinity;
    let nearestIndex = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];

      const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
      if (l2 === 0) continue;

      let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
      t = Math.max(0, Math.min(1, t));

      const projX = a.x + t * (b.x - a.x);
      const projY = a.y + t * (b.y - a.y);
      const d = Math.hypot(p.x - projX, p.y - projY);

      if (d < minDist) {
        minDist = d;
        nearestIndex = i;
      }
    }

    return { dist: minDist, nearestSegmentIndex: nearestIndex };
  };

  const handleFinish = useCallback((finalIntegrity: number, timeSec: number) => {
    gameStateRef.current.isRunning = false;
    setIsPlaying(false);
    setIsCompleted(true);
    soundManager.playLevelUp();

    const diffSettings = getDifficultySettings(difficulty);
    const speedBonus = Math.max(0, Math.round((28 - timeSec) * 60));
    const rawScore = Math.round(finalIntegrity * 18 + speedBonus);
    const score = Math.round(rawScore * diffSettings.multiplier);

    onFinish({
      score,
      metricValue: Math.round(finalIntegrity),
      metricLabel: '%',
      accuracy: Math.round(finalIntegrity),
    });
  }, [difficulty, onFinish]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const loop = (now: number) => {
      const state = gameStateRef.current;
      const theme = state.theme;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Theme background
      ctx.fillStyle = theme.bgFill;
      ctx.fillRect(0, 0, width, height);

      // Theme Grid
      ctx.strokeStyle = theme.gridColor;
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      state.portalPulse += 0.05;

      if (state.path.length > 1) {
        // 1. Outer Conduit Trench
        ctx.beginPath();
        ctx.moveTo(state.path[0].x, state.path[0].y);
        for (let i = 1; i < state.path.length; i++) {
          ctx.lineTo(state.path[i].x, state.path[i].y);
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = state.pathRadius * 2 + 10;
        ctx.strokeStyle = theme.conduitOuter;
        ctx.stroke();

        // 2. High-Voltage Glowing Boundary
        ctx.lineWidth = state.pathRadius * 2;
        ctx.strokeStyle = state.integrity < 35 ? '#ef4444' : theme.wallStroke;
        ctx.shadowColor = state.integrity < 35 ? '#ef4444' : theme.wallStroke;
        ctx.shadowBlur = state.integrity < 35 ? 15 : 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 3. Inner Center Guide Line
        ctx.beginPath();
        ctx.moveTo(state.path[0].x, state.path[0].y);
        for (let i = 1; i < state.path.length; i++) {
          ctx.lineTo(state.path[i].x, state.path[i].y);
        }
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = theme.guideStroke;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 4. Update & Draw Moving Hazard Lasers (Difficulty Multiplier)
        let playerLaserCollision = false;

        state.lasers.forEach((laser, idx) => {
          laser.offset += laser.speed;
          const shift = Math.sin(laser.offset) * laser.sweepRange;
          const lx = laser.pos.x + Math.cos(laser.angle) * shift;
          const ly = laser.pos.y + Math.sin(laser.angle) * shift;

          const p1x = lx - Math.cos(laser.angle + Math.PI / 2) * (laser.length / 2);
          const p1y = ly - Math.sin(laser.angle + Math.PI / 2) * (laser.length / 2);
          const p2x = lx + Math.cos(laser.angle + Math.PI / 2) * (laser.length / 2);
          const p2y = ly + Math.sin(laser.angle + Math.PI / 2) * (laser.length / 2);

          // Draw laser emitter nodes
          ctx.beginPath();
          ctx.arc(p1x, p1y, 4, 0, Math.PI * 2);
          ctx.arc(p2x, p2y, 4, 0, Math.PI * 2);
          ctx.fillStyle = theme.hazardColor;
          ctx.fill();

          // Draw lethal laser beam
          ctx.beginPath();
          ctx.moveTo(p1x, p1y);
          ctx.lineTo(p2x, p2y);
          ctx.lineWidth = 3;
          ctx.strokeStyle = theme.hazardColor;
          ctx.shadowColor = theme.hazardGlow;
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Check collision with player
          if (state.isRunning && state.isDragging) {
            // Distance from player to segment p1-p2
            const l2 = (p2x - p1x) ** 2 + (p2y - p1y) ** 2;
            let t = ((state.player.x - p1x) * (p2x - p1x) + (state.player.y - p1y) * (p2y - p1y)) / l2;
            t = Math.max(0, Math.min(1, t));
            const projX = p1x + t * (p2x - p1x);
            const projY = p1y + t * (p2y - p1y);
            const distToBeam = Math.hypot(state.player.x - projX, state.player.y - projY);

            if (distToBeam < 10) {
              playerLaserCollision = true;
            }
          }
        });

        if (playerLaserCollision) {
          state.integrity = Math.max(0, state.integrity - 1.2);
          setIntegrity(Math.round(state.integrity));
          state.laserHits++;
          setHazardAlert(true);
          soundManager.vibrate(35);
          if (Math.random() < 0.25) soundManager.playFail();

          for (let k = 0; k < 4; k++) {
            state.sparks.push({
              x: state.player.x,
              y: state.player.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              alpha: 1,
              color: theme.hazardColor,
            });
          }
        } else {
          setHazardAlert(false);
        }

        // 5. Start & Finish Portal Nodes
        const startPt = state.path[0];
        const finishPt = state.path[state.path.length - 1];

        // START Portal
        const startRadius = 24 + Math.sin(state.portalPulse) * 2.5;
        ctx.beginPath();
        ctx.arc(startPt.x, startPt.y, startRadius, 0, Math.PI * 2);
        ctx.fillStyle = `${theme.startColor}33`;
        ctx.strokeStyle = theme.startColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = theme.startColor;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'black 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('START', startPt.x, startPt.y);

        // FINISH Portal
        const finishRadius = 26 + Math.sin(state.portalPulse + 1) * 3;
        ctx.beginPath();
        ctx.arc(finishPt.x, finishPt.y, finishRadius, 0, Math.PI * 2);
        ctx.fillStyle = `${theme.finishColor}33`;
        ctx.strokeStyle = theme.finishColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = theme.finishColor;
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.fillText('FINISH', finishPt.x, finishPt.y);

        // 6. Sparks Physics
        for (let i = state.sparks.length - 1; i >= 0; i--) {
          const sp = state.sparks[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.alpha -= 0.045;
          if (sp.alpha <= 0) {
            state.sparks.splice(i, 1);
          } else {
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = sp.color;
            ctx.globalAlpha = sp.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }

        // 7. Player Probe
        if (state.isRunning) {
          ctx.beginPath();
          ctx.arc(state.player.x, state.player.y, 14, 0, Math.PI * 2);
          ctx.fillStyle = state.integrity > 35 ? `${theme.probeColor}33` : 'rgba(239, 68, 68, 0.4)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(state.player.x, state.player.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = state.integrity > 35 ? theme.probeColor : '#ef4444';
          ctx.shadowColor = state.integrity > 35 ? theme.probeGlow : '#ef4444';
          ctx.shadowBlur = 18;
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.beginPath();
          ctx.arc(state.player.x, state.player.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    const handlePointerDown = (e: PointerEvent) => {
      const state = gameStateRef.current;
      if (!state.isRunning) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const distToPlayer = Math.hypot(x - state.player.x, y - state.player.y);
      const distToStart = Math.hypot(x - state.path[0].x, y - state.path[0].y);

      if (distToPlayer < 40 || distToStart < 40) {
        state.isDragging = true;
        if (state.startTime === 0) {
          state.startTime = performance.now();
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const state = gameStateRef.current;
      if (!state.isRunning || !state.isDragging) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      state.player.x = x;
      state.player.y = y;

      const elapsed = (performance.now() - state.startTime) / 1000;
      setElapsedSec(parseFloat(elapsed.toFixed(1)));

      const { dist } = getDistToPath({ x, y }, state.path);
      state.samples++;
      state.totalDeviation += dist;

      // Wall collision check
      if (dist > state.pathRadius - 3.5) {
        state.integrity = Math.max(0, state.integrity - 0.8);
        setIntegrity(Math.round(state.integrity));
        state.wallHits++;

        const sparkColor = state.theme.sparkColors[Math.floor(Math.random() * state.theme.sparkColors.length)];
        for (let k = 0; k < 3; k++) {
          state.sparks.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 7,
            vy: (Math.random() - 0.5) * 7,
            alpha: 1,
            color: sparkColor,
          });
        }
        soundManager.vibrate(25);
        if (Math.random() < 0.2) {
          soundManager.playFail();
        }
      }

      // Check if reached FINISH node
      const finishPt = state.path[state.path.length - 1];
      const distToFinish = Math.hypot(x - finishPt.x, y - finishPt.y);
      if (distToFinish < 28) {
        handleFinish(state.integrity, elapsed);
      }
    };

    const handlePointerUp = () => {
      gameStateRef.current.isDragging = false;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handleFinish]);

  const activeTheme = THEMES[currentTheme];
  const diffInfo = getDifficultySettings(difficulty);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Top Selectors: Theme Switcher & Difficulty Levels (When not in trial) */}
      {!isPlaying && (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>THEME:</span>
            </span>
            {(Object.keys(THEMES) as ThemeId[]).map((tid) => {
              const th = THEMES[tid];
              return (
                <button
                  key={tid}
                  onClick={() => {
                    soundManager.playClick();
                    setCurrentTheme(tid);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    currentTheme === tid
                      ? 'bg-slate-800 text-white border border-slate-600 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{th.icon}</span>
                  <span className="hidden sm:inline">{th.name}</span>
                </button>
              );
            })}
          </div>

          {/* Difficulty Selector */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
            {(['standard', 'hard', 'apex'] as DifficultyId[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  soundManager.playClick();
                  setDifficulty(d);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  difficulty === d
                    ? d === 'apex'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : d === 'hard'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d === 'apex' ? '⚡ APEX (12PX)' : d === 'hard' ? 'HARD (17PX)' : 'NORMAL'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sci-Fi HUD Header */}
      <div className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {activeTheme.ambientVibe}
            </div>
            <div className="text-xl font-mono font-black text-sky-400">{elapsedSec}s</div>
          </div>
        </div>

        {/* Hazard Alarm & Difficulty Badge */}
        <div className="flex items-center gap-3">
          {hazardAlert && (
            <div className="flex items-center gap-1 text-xs px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse font-black">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>BEAM CONTACT!</span>
            </div>
          )}

          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              CORE INTEGRITY · {diffInfo.multiplier}X MULT
            </div>
            <div
              className={`text-xl font-mono font-black ${
                integrity > 60
                  ? 'text-emerald-400'
                  : integrity > 30
                  ? 'text-amber-400'
                  : 'text-rose-400 animate-pulse'
              }`}
            >
              {integrity}%
            </div>
          </div>
        </div>
      </div>

      {/* Cyber Labyrinth Canvas */}
      <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl">
        <canvas ref={canvasRef} className="w-full h-full cursor-pointer touch-none" />

        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            {isCompleted ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
                  <Award className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">CONDUIT CONQUERED!</h3>
                  <p className="text-slate-300 text-sm mt-1">
                    Cleared on <strong className="text-amber-400 uppercase">{difficulty}</strong> mode in{' '}
                    <strong className="text-sky-400">{elapsedSec}s</strong> with{' '}
                    <strong className="text-emerald-400">{integrity}% stability</strong>
                  </p>
                </div>
                <button
                  onClick={startGame}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-sky-500/25 transition flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RETRY PRECISION PATH</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-xl shadow-sky-500/25">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-sky-400">
                    <Route className="w-10 h-10 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">PRECISION PATH</h3>
                  <p className="text-slate-300 text-sm max-w-md mt-1 leading-relaxed">
                    Guide the energy core through hairpins and past lethal moving laser gates. Choose your theme and test fine-motor discipline!
                  </p>
                </div>
                <button
                  onClick={startGame}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-sky-500/30 tracking-wider uppercase transition cursor-pointer"
                >
                  LAUNCH {activeTheme.name.toUpperCase()} TRIAL
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full mt-3 text-center text-xs text-slate-400 font-medium">
        Difficulty: {difficulty.toUpperCase()} ({diffInfo.radius}px corridor) · {diffInfo.laserCount} Oscillating Laser Gates · {diffInfo.multiplier}x Score Multiplier
      </div>
    </div>
  );
}
