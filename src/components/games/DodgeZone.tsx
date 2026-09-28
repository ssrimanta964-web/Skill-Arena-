import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundManager } from '../../utils/audio';
import { Shield, Clock, Zap, RotateCcw, Crosshair, Flame } from 'lucide-react';

interface Props {
  onFinish: (result: { score: number; metricValue: number; metricLabel: string; accuracy?: number }) => void;
  isDaily?: boolean;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'standard' | 'fast' | 'seeker';
  trail: { x: number; y: number }[];
}

interface PowerUp {
  x: number;
  y: number;
  type: 'shield' | 'slow';
  radius: number;
  pulse: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

interface FloatText {
  id: number;
  text: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
}

export default function DodgeZone({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [score, setScore] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [grazeCount, setGrazeCount] = useState(0);

  const gameStateRef = useRef({
    player: { x: 300, y: 200, radius: 11, speed: 6 },
    target: { x: 300, y: 200 },
    playerTrail: [] as { x: number; y: number }[],
    projectiles: [] as Projectile[],
    powerUps: [] as PowerUp[],
    particles: [] as Particle[],
    floatTexts: [] as FloatText[],
    shieldActive: false,
    shieldAngle: 0,
    slowMoUntil: 0,
    startTime: 0,
    lastSpawn: 0,
    lastPowerUp: 0,
    score: 0,
    grazes: 0,
    screenShake: 0,
    keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, s: false, a: false, d: false },
    isRunning: false,
  });

  const nextTextId = useRef(1);

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundManager.playCountdown(true);
    const startX = canvas.width / (2 * window.devicePixelRatio);
    const startY = canvas.height / (2 * window.devicePixelRatio);

    gameStateRef.current = {
      player: { x: startX, y: startY, radius: 11, speed: 6 },
      target: { x: startX, y: startY },
      playerTrail: [],
      projectiles: [],
      powerUps: [],
      particles: [],
      floatTexts: [],
      shieldActive: false,
      shieldAngle: 0,
      slowMoUntil: 0,
      startTime: performance.now(),
      lastSpawn: performance.now(),
      lastPowerUp: performance.now(),
      score: 0,
      grazes: 0,
      screenShake: 0,
      keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, s: false, a: false, d: false },
      isRunning: true,
    };

    setIsPlaying(true);
    setIsGameOver(false);
    setTimeSurvived(0);
    setScore(0);
    setHasShield(false);
    setIsSlowMo(false);
    setGrazeCount(0);
  };

  const handleGameOver = useCallback((finalScore: number, finalSeconds: number) => {
    gameStateRef.current.isRunning = false;
    setIsPlaying(false);
    setIsGameOver(true);
    soundManager.playFail();
    soundManager.vibrate(120);

    onFinish({
      score: finalScore,
      metricValue: finalSeconds,
      metricLabel: 'sec',
      accuracy: Math.min(100, Math.round(50 + gameStateRef.current.grazes * 3)),
    });
  }, [onFinish]);

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

    // Main Game Loop
    const loop = (now: number) => {
      const state = gameStateRef.current;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.save();

      // Screen Shake
      if (state.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.screenShake;
        const shakeY = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(shakeX, shakeY);
        state.screenShake *= 0.88;
        if (state.screenShake < 0.2) state.screenShake = 0;
      }

      // Background clear
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      // Deep cyber space ambient gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.7);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Grid cyber floor
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (state.isRunning) {
        const elapsedSec = (now - state.startTime) / 1000;
        setTimeSurvived(parseFloat(elapsedSec.toFixed(1)));

        // Handle SlowMo status
        const isSlow = now < state.slowMoUntil;
        setIsSlowMo(isSlow);
        const speedScale = isSlow ? 0.4 : 1;

        // Player movement
        let dx = 0;
        let dy = 0;
        if (state.keys.ArrowUp || state.keys.w) dy -= state.player.speed;
        if (state.keys.ArrowDown || state.keys.s) dy += state.player.speed;
        if (state.keys.ArrowLeft || state.keys.a) dx -= state.player.speed;
        if (state.keys.ArrowRight || state.keys.d) dx += state.player.speed;

        if (dx !== 0 || dy !== 0) {
          state.player.x += dx;
          state.player.y += dy;
        } else {
          // Smooth follow pointer
          state.player.x += (state.target.x - state.player.x) * 0.22;
          state.player.y += (state.target.y - state.player.y) * 0.22;
        }

        // Clamp to boundaries
        state.player.x = Math.max(state.player.radius, Math.min(width - state.player.radius, state.player.x));
        state.player.y = Math.max(state.player.radius, Math.min(height - state.player.radius, state.player.y));

        // Player trail
        state.playerTrail.push({ x: state.player.x, y: state.player.y });
        if (state.playerTrail.length > 8) state.playerTrail.shift();

        // Spawn projectiles
        const spawnInterval = Math.max(90, 580 - elapsedSec * 18);
        if (now - state.lastSpawn > spawnInterval) {
          state.lastSpawn = now;

          const edge = Math.floor(Math.random() * 4);
          let px = 0, py = 0;
          if (edge === 0) { px = Math.random() * width; py = -12; }
          else if (edge === 1) { px = width + 12; py = Math.random() * height; }
          else if (edge === 2) { px = Math.random() * width; py = height + 12; }
          else { px = -12; py = Math.random() * height; }

          const angle = Math.atan2(state.player.y - py, state.player.x - px) + (Math.random() - 0.5) * 0.55;
          const baseSpeed = 2.8 + Math.random() * 2 + Math.min(4.5, elapsedSec * 0.08);

          const rand = Math.random();
          let type: Projectile['type'] = 'standard';
          let color = '#f43f5e';
          let radius = 6;

          if (rand > 0.85 && elapsedSec > 8) {
            type = 'fast';
            color = '#fbbf24';
            radius = 4.5;
          } else if (rand > 0.7 && elapsedSec > 14) {
            type = 'seeker';
            color = '#c084fc';
            radius = 7.5;
          }

          state.projectiles.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * (type === 'fast' ? baseSpeed * 1.5 : baseSpeed),
            vy: Math.sin(angle) * (type === 'fast' ? baseSpeed * 1.5 : baseSpeed),
            radius,
            color,
            type,
            trail: [],
          });
        }

        // Spawn Powerups periodically
        if (now - state.lastPowerUp > 11000) {
          state.lastPowerUp = now;
          if (state.powerUps.length < 2) {
            state.powerUps.push({
              x: 50 + Math.random() * (width - 100),
              y: 50 + Math.random() * (height - 100),
              type: Math.random() > 0.5 ? 'shield' : 'slow',
              radius: 14,
              pulse: 0,
            });
          }
        }

        state.score += 1;
        setScore(state.score);

        // Update Projectiles
        for (let i = state.projectiles.length - 1; i >= 0; i--) {
          const p = state.projectiles[i];

          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 5) p.trail.shift();

          if (p.type === 'seeker') {
            const seekAngle = Math.atan2(state.player.y - p.y, state.player.x - p.x);
            p.vx += Math.cos(seekAngle) * 0.1;
            p.vy += Math.sin(seekAngle) * 0.1;
          }

          p.x += p.vx * speedScale;
          p.y += p.vy * speedScale;

          // Check Graze (near miss)
          const distToPlayer = Math.hypot(p.x - state.player.x, p.y - state.player.y);
          if (distToPlayer < state.player.radius + p.radius + 18 && distToPlayer > state.player.radius + p.radius) {
            state.score += 2;
            state.grazes += 1;
            setGrazeCount(state.grazes);

            if (Math.random() < 0.25) {
              state.floatTexts.push({
                id: nextTextId.current++,
                text: '+10 GRAZE!',
                x: p.x,
                y: p.y - 10,
                alpha: 1,
                color: '#38bdf8',
              });
            }
          }

          // Check Collision with Player
          if (distToPlayer < state.player.radius + p.radius) {
            if (state.shieldActive) {
              state.shieldActive = false;
              setHasShield(false);
              state.screenShake = 12;
              soundManager.playClick(300);
              soundManager.vibrate(60);

              for (let k = 0; k < 20; k++) {
                state.particles.push({
                  x: state.player.x,
                  y: state.player.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  color: '#38bdf8',
                  alpha: 1,
                  size: 4,
                });
              }
              state.projectiles.splice(i, 1);
              continue;
            } else {
              // Game Over
              state.screenShake = 20;
              for (let k = 0; k < 30; k++) {
                state.particles.push({
                  x: state.player.x,
                  y: state.player.y,
                  vx: (Math.random() - 0.5) * 12,
                  vy: (Math.random() - 0.5) * 12,
                  color: '#f43f5e',
                  alpha: 1,
                  size: 5,
                });
              }
              handleGameOver(state.score, parseFloat(elapsedSec.toFixed(1)));
              break;
            }
          }

          // Remove off-screen
          if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
            state.projectiles.splice(i, 1);
          }
        }

        // Update Powerups
        for (let i = state.powerUps.length - 1; i >= 0; i--) {
          const pu = state.powerUps[i];
          pu.pulse += 0.06;
          const dist = Math.hypot(pu.x - state.player.x, pu.y - state.player.y);
          if (dist < state.player.radius + pu.radius) {
            if (pu.type === 'shield') {
              state.shieldActive = true;
              setHasShield(true);
              soundManager.playSuccess();
            } else {
              state.slowMoUntil = now + 4500;
              soundManager.playClick(900);
            }
            state.score += 60;
            state.floatTexts.push({
              id: nextTextId.current++,
              text: pu.type === 'shield' ? '🛡️ SHIELD READY' : '⏱️ TIME DILATION',
              x: pu.x,
              y: pu.y - 15,
              alpha: 1,
              color: pu.type === 'shield' ? '#38bdf8' : '#22d3ee',
            });
            state.powerUps.splice(i, 1);
          }
        }
      }

      // Draw Projectiles with motion trails
      state.projectiles.forEach((p) => {
        // Trail
        p.trail.forEach((t, idx) => {
          ctx.beginPath();
          ctx.arc(t.x, t.y, p.radius * (idx / p.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.2 * (idx / p.trail.length);
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Powerups
      state.powerUps.forEach((pu) => {
        const radius = pu.radius + Math.sin(pu.pulse) * 3;
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = pu.type === 'shield' ? '#0ea5e9' : '#06b6d4';
        ctx.shadowColor = pu.type === 'shield' ? '#38bdf8' : '#22d3ee';
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Outer pulse ring
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = pu.type === 'shield' ? '#38bdf866' : '#22d3ee66';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pu.type === 'shield' ? '🛡️' : '⏱️', pu.x, pu.y);
      });

      // Draw Player Trail
      state.playerTrail.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, state.player.radius * (0.4 + 0.6 * (idx / state.playerTrail.length)), 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.globalAlpha = 0.25 * (idx / state.playerTrail.length);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw Player
      if (state.isRunning) {
        ctx.beginPath();
        ctx.arc(state.player.x, state.player.y, state.player.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(state.player.x, state.player.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Rotating Shield Aura
        if (state.shieldActive) {
          state.shieldAngle += 0.04;
          const shieldRadius = state.player.radius + 9;

          ctx.beginPath();
          ctx.arc(state.player.x, state.player.y, shieldRadius, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();

          // 3 orbiting shield hex nodes
          for (let k = 0; k < 3; k++) {
            const nodeAngle = state.shieldAngle + (k * (Math.PI * 2)) / 3;
            const nx = state.player.x + Math.cos(nodeAngle) * shieldRadius;
            const ny = state.player.y + Math.sin(nodeAngle) * shieldRadius;
            ctx.beginPath();
            ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw Floating Feedback Texts
      for (let i = state.floatTexts.length - 1; i >= 0; i--) {
        const ft = state.floatTexts[i];
        ft.y -= 1.2;
        ft.alpha -= 0.03;
        if (ft.alpha <= 0) {
          state.floatTexts.splice(i, 1);
        } else {
          ctx.fillStyle = ft.color;
          ctx.font = 'black 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.globalAlpha = Math.max(0, ft.alpha);
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.globalAlpha = 1;
        }
      }

      // Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.035;
        if (pt.alpha <= 0) {
          state.particles.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      gameStateRef.current.target.x = e.clientX - rect.left;
      gameStateRef.current.target.y = e.clientY - rect.top;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key in gameStateRef.current.keys) {
        (gameStateRef.current.keys as Record<string, boolean>)[e.key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key in gameStateRef.current.keys) {
        (gameStateRef.current.keys as Record<string, boolean>)[e.key] = false;
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleGameOver]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Sci-Fi HUD Header */}
      <div className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-3 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SURVIVAL CHRONO</div>
            <div className="text-xl font-mono font-black text-amber-400">
              {timeSurvived.toFixed(1)} <span className="text-xs text-slate-400">s</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasShield && (
            <div className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/20 font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>SHIELDED</span>
            </div>
          )}
          {isSlowMo && (
            <div className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 animate-pulse font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>DILATION</span>
            </div>
          )}
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SCORE · GRAZES</div>
            <div className="text-sm font-mono font-black text-white">
              <span className="text-emerald-400">{score}</span> <span className="text-slate-600">·</span>{' '}
              <span className="text-cyan-400">{grazeCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cyber Canvas Container */}
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl">
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair touch-none" />

        {/* Start / Gameover Overlays */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            {isGameOver ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/20 animate-bounce">
                  <Zap className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">ENERGY COLLAPSE!</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Survived <strong className="text-amber-400">{timeSurvived}s</strong> · Scored{' '}
                    <strong className="text-emerald-400">{score} pts</strong> ({grazeCount} Grazes)
                  </p>
                </div>
                <button
                  onClick={startGame}
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-rose-500/25 transition flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RE-ENTER DODGE ZONE</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 p-0.5 shadow-xl shadow-amber-500/25">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
                    <Crosshair className="w-10 h-10 animate-spin" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">DODGE ZONE</h3>
                  <p className="text-slate-300 text-sm max-w-sm mt-1 leading-relaxed">
                    Guide your glowing energy orb with mouse or WASD. Graze bullets closely to multiply your score!
                  </p>
                </div>
                <button
                  onClick={startGame}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 tracking-wider uppercase transition cursor-pointer"
                >
                  INITIALIZE EVASION
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full mt-2.5 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
        <Flame className="w-3.5 h-3.5 text-amber-400" />
        <span>Graze bonus: Skim within 18px of incoming hazards for extra points and XP!</span>
      </div>
    </div>
  );
}
