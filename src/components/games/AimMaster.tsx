import React, { useRef, useState, useEffect, useCallback } from 'react';
import { soundManager } from '../../utils/audio';
import { Target, RotateCcw, AlertTriangle, ShieldAlert, Award, Sparkles, Flame, Zap } from 'lucide-react';

interface Props {
  onFinish: (result: { score: number; metricValue: number; metricLabel: string; accuracy?: number }) => void;
  isDaily?: boolean;
}

interface OrbitBall {
  id: number;
  type: 'green' | 'red';
  angle: number; // in radians
  radius: number; // orbital radius from center
  size: number;
  destroyed: boolean;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  active: boolean;
  distanceTraveled: number;
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

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
}

interface ShellCasing {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  alpha: number;
}

export default function AimMaster({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<'red_ball' | 'out_of_ammo' | null>(null);

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bulletsLeft, setBulletsLeft] = useState(6);
  const [greenRemaining, setGreenRemaining] = useState(3);
  const [totalHits, setTotalHits] = useState(0);
  const [totalShots, setTotalShots] = useState(0);
  const [screenShake, setScreenShake] = useState(0);

  const nextTextId = useRef(1);

  const gameStateRef = useRef({
    isRunning: false,
    gunAngle: 0,
    gunRotSpeed: 0.025,
    recoil: 0,
    cylinderAngle: 0,
    orbitRadius: 155,
    orbitSpeed: 0.02,
    orbitDirection: -1,
    orbitAngle: 0,
    bulletsLeft: 6,
    level: 1,
    score: 0,
    totalShots: 0,
    totalHits: 0,
    balls: [] as OrbitBall[],
    bullets: [] as Bullet[],
    particles: [] as Particle[],
    floatTexts: [] as FloatingText[],
    shells: [] as ShellCasing[],
    screenShake: 0,
    lastTime: 0,
    canShootAfter: 0,
    lastShotTime: 0,
  });

  const generateLevelBalls = (lvl: number, orbitRadius: number): OrbitBall[] => {
    // 3 green balls and 3 red balls in alternating or spaced positions
    const balls: OrbitBall[] = [];
    const count = 6;
    const baseSpacing = (Math.PI * 2) / count;

    // Pattern: alternate green and red: G, R, G, R, G, R
    // On higher levels, add slight randomized offsets to make timing more skill-based
    const jitter = Math.min(0.25, lvl * 0.04);

    for (let i = 0; i < count; i++) {
      const type: 'green' | 'red' = i % 2 === 0 ? 'green' : 'red';
      const offset = (Math.random() - 0.5) * jitter;
      const angle = i * baseSpacing + offset;

      balls.push({
        id: i + 1,
        type,
        angle,
        radius: orbitRadius,
        size: 15,
        destroyed: false,
      });
    }

    return balls;
  };

  const initLevel = useCallback((lvl: number, currentScore: number) => {
    const state = gameStateRef.current;
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width / window.devicePixelRatio : 500;
    const height = canvas ? canvas.height / window.devicePixelRatio : 500;
    const orbitRadius = Math.min(width, height) * 0.36;

    // Scaling speeds with level
    // CRITICAL FIX: Gun rotates clockwise, balls rotate counter-clockwise (opposite directions)
    // so they constantly and smoothly sweep past each other in a thrilling interception rhythm!
    const baseGunSpeed = 0.024 + Math.min(0.028, (lvl - 1) * 0.0035);
    const baseOrbitSpeed = 0.018 + Math.min(0.024, (lvl - 1) * 0.003);
    const orbitDir = -1; // Opposite to gun rotation!

    state.level = lvl;
    state.score = currentScore;
    state.bulletsLeft = 6;
    state.orbitRadius = orbitRadius;
    state.gunRotSpeed = baseGunSpeed;
    state.orbitSpeed = baseOrbitSpeed;
    state.orbitDirection = orbitDir;
    state.balls = generateLevelBalls(lvl, orbitRadius);
    state.bullets = [];

    setLevel(lvl);
    setBulletsLeft(6);
    setGreenRemaining(3);
    setScore(currentScore);

    // Floating Level Up text
    state.floatTexts.push({
      id: nextTextId.current++,
      text: `LEVEL ${lvl}`,
      x: width / 2,
      y: height / 2 - 50,
      alpha: 1,
      color: '#38bdf8',
    });
  }, []);

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundManager.playCountdown(true);
    const state = gameStateRef.current;

    state.isRunning = true;
    state.gunAngle = -Math.PI / 2;
    state.recoil = 0;
    state.cylinderAngle = 0;
    state.totalShots = 0;
    state.totalHits = 0;
    state.particles = [];
    state.floatTexts = [];
    state.shells = [];
    state.screenShake = 0;
    state.lastTime = performance.now();
    state.canShootAfter = performance.now() + 350;

    setIsPlaying(true);
    setIsGameOver(false);
    setGameOverReason(null);
    setTotalHits(0);
    setTotalShots(0);

    initLevel(1, 0);
  };

  const handleGameOver = useCallback((reason: 'red_ball' | 'out_of_ammo') => {
    const state = gameStateRef.current;
    state.isRunning = false;
    setIsPlaying(false);
    setIsGameOver(true);
    setGameOverReason(reason);

    soundManager.playFail();
    soundManager.vibrate(100);

    const accuracy = state.totalShots > 0 ? Math.round((state.totalHits / state.totalShots) * 100) : 0;
    onFinish({
      score: state.score,
      metricValue: state.score,
      metricLabel: 'pts',
      accuracy,
    });
  }, [onFinish]);

  const shoot = useCallback(() => {
    const state = gameStateRef.current;
    if (!state.isRunning) return;

    const now = performance.now();
    if (now < state.canShootAfter) return;
    if (now - state.lastShotTime < 180) return; // Prevent double trigger from pointerdown + click or bouncing
    state.lastShotTime = now;

    // Check ammo
    if (state.bulletsLeft <= 0) {
      soundManager.playEmptyClick();
      return;
    }

    // Fire bullet!
    state.bulletsLeft -= 1;
    setBulletsLeft(state.bulletsLeft);
    state.totalShots += 1;
    setTotalShots(state.totalShots);

    state.recoil = 12; // kickback
    state.cylinderAngle += Math.PI / 3; // 60 degree rotation per chamber
    state.screenShake = 7;

    soundManager.playGunshot();
    soundManager.vibrate(35);

    const canvas = canvasRef.current;
    const width = canvas ? canvas.width / window.devicePixelRatio : 500;
    const height = canvas ? canvas.height / window.devicePixelRatio : 500;
    const centerX = width / 2;
    const centerY = height / 2;

    const barrelLength = 38;
    const muzzleX = centerX + Math.cos(state.gunAngle) * barrelLength;
    const muzzleY = centerY + Math.sin(state.gunAngle) * barrelLength;

    // Bullet speed - fast sniper snap to prevent lead-time frustration
    const bulletSpeed = 24;
    state.bullets.push({
      x: muzzleX,
      y: muzzleY,
      vx: Math.cos(state.gunAngle) * bulletSpeed,
      vy: Math.sin(state.gunAngle) * bulletSpeed,
      angle: state.gunAngle,
      radius: 4.5,
      active: true,
      distanceTraveled: 0,
    });

    // Muzzle flash particles
    for (let k = 0; k < 12; k++) {
      const spread = (Math.random() - 0.5) * 0.8;
      const speed = 4 + Math.random() * 6;
      state.particles.push({
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(state.gunAngle + spread) * speed,
        vy: Math.sin(state.gunAngle + spread) * speed,
        color: Math.random() > 0.5 ? '#fbbf24' : '#f97316',
        alpha: 1,
        size: 3 + Math.random() * 2,
      });
    }

    // Brass casing ejection
    const ejectAngle = state.gunAngle - Math.PI / 2 + (Math.random() - 0.5) * 0.4;
    state.shells.push({
      x: centerX - Math.cos(state.gunAngle) * 6,
      y: centerY - Math.sin(state.gunAngle) * 6,
      vx: Math.cos(ejectAngle) * (3 + Math.random() * 2),
      vy: Math.sin(ejectAngle) * (3 + Math.random() * 2),
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.3,
      alpha: 1,
    });
  }, []);

  // Main Animation & Physics Loop
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

    const loop = (time: number) => {
      const state = gameStateRef.current;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.save();

      // Screen shake
      if (state.screenShake > 0) {
        const sx = (Math.random() - 0.5) * state.screenShake;
        const sy = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(sx, sy);
        state.screenShake *= 0.86;
        if (state.screenShake < 0.2) state.screenShake = 0;
      }

      // Background clear
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, width, height);

      // Radial ambient lighting
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, width * 0.6);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Tactical circular radar rings
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 1;
      [state.orbitRadius * 0.45, state.orbitRadius * 0.75, state.orbitRadius * 1.3].forEach((r) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Orbital Path Ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, state.orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dynamic Laser Targeting Sight extending from revolver muzzle to orbital perimeter
      const muzzleX = centerX + Math.cos(state.gunAngle) * 38;
      const muzzleY = centerY + Math.sin(state.gunAngle) * 38;
      const targetPointX = centerX + Math.cos(state.gunAngle) * state.orbitRadius;
      const targetPointY = centerY + Math.sin(state.gunAngle) * state.orbitRadius;

      // Check if laser is currently pointing at a ball
      let sightColor = 'rgba(56, 189, 248, 0.4)';
      let sightGlow = false;

      for (let j = 0; j < state.balls.length; j++) {
        const ball = state.balls[j];
        if (ball.destroyed) continue;
        const ballCurrentAngle = ball.angle + state.orbitAngle;
        const bx = centerX + Math.cos(ballCurrentAngle) * state.orbitRadius;
        const by = centerY + Math.sin(ballCurrentAngle) * state.orbitRadius;
        const d = Math.hypot(targetPointX - bx, targetPointY - by);
        if (d < ball.size + 4) {
          sightColor = ball.type === 'green' ? 'rgba(52, 211, 153, 0.95)' : 'rgba(244, 63, 94, 0.95)';
          sightGlow = true;
          break;
        }
      }

      ctx.beginPath();
      ctx.moveTo(muzzleX, muzzleY);
      ctx.lineTo(targetPointX, targetPointY);
      ctx.strokeStyle = sightColor;
      ctx.lineWidth = sightGlow ? 2.5 : 1.2;
      ctx.setLineDash(sightGlow ? [] : [4, 4]);
      if (sightGlow) {
        ctx.shadowColor = sightColor;
        ctx.shadowBlur = 10;
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Small reticle bead at orbital intersection
      ctx.beginPath();
      ctx.arc(targetPointX, targetPointY, sightGlow ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = sightColor;
      ctx.fill();

      if (state.isRunning) {
        // Rotate Gun Clockwise
        state.gunAngle += state.gunRotSpeed;

        // Rotate Orbital Balls Counter-Clockwise (Smoothly Sweeping Across Gun Barrel!)
        state.orbitAngle += state.orbitSpeed * state.orbitDirection;

        // Recoil decay
        state.recoil *= 0.82;

        // Update Bullets
        for (let i = state.bullets.length - 1; i >= 0; i--) {
          const b = state.bullets[i];
          b.x += b.vx;
          b.y += b.vy;
          b.distanceTraveled += Math.hypot(b.vx, b.vy);

          // Check collision with orbiting balls
          let bulletRemoved = false;
          for (let j = 0; j < state.balls.length; j++) {
            const ball = state.balls[j];
            if (ball.destroyed) continue;

            const ballCurrentAngle = ball.angle + state.orbitAngle;
            const ballX = centerX + Math.cos(ballCurrentAngle) * state.orbitRadius;
            const ballY = centerY + Math.sin(ballCurrentAngle) * state.orbitRadius;

            const dist = Math.hypot(b.x - ballX, b.y - ballY);
            if (dist < ball.size + b.radius + 6.5) {
              // HIT!
              bulletRemoved = true;
              b.active = false;
              state.bullets.splice(i, 1);

              if (ball.type === 'green') {
                // SUCCESS: Green ball hit!
                ball.destroyed = true;
                state.totalHits += 1;
                setTotalHits(state.totalHits);

                const hitPoints = 100 * state.level;
                state.score += hitPoints;
                setScore(state.score);

                // Emerald explosion particles
                for (let k = 0; k < 22; k++) {
                  const pSpeed = 3 + Math.random() * 6;
                  const pAngle = Math.random() * Math.PI * 2;
                  state.particles.push({
                    x: ballX,
                    y: ballY,
                    vx: Math.cos(pAngle) * pSpeed,
                    vy: Math.sin(pAngle) * pSpeed,
                    color: Math.random() > 0.4 ? '#34d399' : '#10b981',
                    alpha: 1,
                    size: 3.5 + Math.random() * 3,
                  });
                }

                // Float text
                state.floatTexts.push({
                  id: nextTextId.current++,
                  text: `+${hitPoints}`,
                  x: ballX,
                  y: ballY - 15,
                  alpha: 1,
                  color: '#34d399',
                });

                soundManager.playSuccess();
                soundManager.vibrate(25);

                // Check remaining green balls
                const activeGreen = state.balls.filter((bl) => bl.type === 'green' && !bl.destroyed).length;
                setGreenRemaining(activeGreen);

                if (activeGreen === 0) {
                  // LEVEL CLEARED!
                  soundManager.playLevelUp();
                  const remainingBulletsBonus = state.bulletsLeft * 150;
                  const levelClearBonus = state.level * 300;
                  state.score += remainingBulletsBonus + levelClearBonus;
                  setScore(state.score);

                  state.floatTexts.push({
                    id: nextTextId.current++,
                    text: `SECTOR CLEARED! +${levelClearBonus + remainingBulletsBonus}`,
                    x: centerX,
                    y: centerY - 60,
                    alpha: 1,
                    color: '#38bdf8',
                  });

                  setTimeout(() => {
                    initLevel(state.level + 1, state.score);
                  }, 800);
                }
              } else if (ball.type === 'red') {
                // LETHAL MISTAKE: Red ball hit!
                state.screenShake = 22;

                // Crimson violent explosion
                for (let k = 0; k < 35; k++) {
                  const pSpeed = 4 + Math.random() * 8;
                  const pAngle = Math.random() * Math.PI * 2;
                  state.particles.push({
                    x: ballX,
                    y: ballY,
                    vx: Math.cos(pAngle) * pSpeed,
                    vy: Math.sin(pAngle) * pSpeed,
                    color: Math.random() > 0.5 ? '#f43f5e' : '#ef4444',
                    alpha: 1,
                    size: 4 + Math.random() * 3,
                  });
                }

                state.floatTexts.push({
                  id: nextTextId.current++,
                  text: `HAZARD STRIKE! ELIMINATED!`,
                  x: ballX,
                  y: ballY - 20,
                  alpha: 1,
                  color: '#f43f5e',
                });

                handleGameOver('red_ball');
              }

              break;
            }
          }

          // If bullet traveled beyond arena, remove it
          if (!bulletRemoved && (b.distanceTraveled > state.orbitRadius * 1.5 || b.x < 0 || b.x > width || b.y < 0 || b.y > height)) {
            state.bullets.splice(i, 1);
          }
        }

        // When player has shot all 6 bullets and no bullets remain in flight
        if (state.isRunning && state.bulletsLeft === 0 && state.bullets.length === 0) {
          const activeGreen = state.balls.filter((bl) => bl.type === 'green' && !bl.destroyed).length;
          if (activeGreen > 0) {
            handleGameOver('out_of_ammo');
          }
        }
      }

      // Draw Orbiting Balls
      state.balls.forEach((ball) => {
        if (ball.destroyed) return;

        const currentAngle = ball.angle + state.orbitAngle;
        const bx = centerX + Math.cos(currentAngle) * state.orbitRadius;
        const by = centerY + Math.sin(currentAngle) * state.orbitRadius;

        if (ball.type === 'green') {
          // --- GREEN TARGET ORB ---
          // Outer neon glow
          ctx.beginPath();
          ctx.arc(bx, by, ball.size + 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
          ctx.fill();

          // Main orb body
          ctx.beginPath();
          ctx.arc(bx, by, ball.size, 0, Math.PI * 2);
          const greenGrad = ctx.createRadialGradient(bx - 3, by - 3, 2, bx, by, ball.size);
          greenGrad.addColorStop(0, '#6ee7b7');
          greenGrad.addColorStop(0.6, '#10b981');
          greenGrad.addColorStop(1, '#047857');
          ctx.fillStyle = greenGrad;
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Inner crosshair target dot
          ctx.beginPath();
          ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Concentric target ring
          ctx.beginPath();
          ctx.arc(bx, by, ball.size - 4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          // --- RED HAZARD ORB (DO NOT SHOOT!) ---
          // Outer warning aura
          ctx.beginPath();
          ctx.arc(bx, by, ball.size + 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.fill();

          // Main hazard orb body
          ctx.beginPath();
          ctx.arc(bx, by, ball.size, 0, Math.PI * 2);
          const redGrad = ctx.createRadialGradient(bx - 3, by - 3, 2, bx, by, ball.size);
          redGrad.addColorStop(0, '#fca5a5');
          redGrad.addColorStop(0.6, '#ef4444');
          redGrad.addColorStop(1, '#991b1b');
          ctx.fillStyle = redGrad;
          ctx.shadowColor = '#f87171';
          ctx.shadowBlur = 16;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Hazard Cross / Spikes
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          const crossSize = 5;
          ctx.beginPath();
          ctx.moveTo(bx - crossSize, by - crossSize);
          ctx.lineTo(bx + crossSize, by + crossSize);
          ctx.moveTo(bx + crossSize, by - crossSize);
          ctx.lineTo(bx - crossSize, by + crossSize);
          ctx.stroke();
        }
      });

      // Draw Bullets in Flight
      state.bullets.forEach((b) => {
        // Bullet tracer tail
        ctx.beginPath();
        ctx.moveTo(b.x - Math.cos(b.angle) * 16, b.y - Math.sin(b.angle) * 16);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Bullet head
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Shell Casings
      for (let i = state.shells.length - 1; i >= 0; i--) {
        const sh = state.shells[i];
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.vx *= 0.94;
        sh.vy *= 0.94;
        sh.rotation += sh.vRot;
        sh.alpha -= 0.02;

        if (sh.alpha <= 0) {
          state.shells.splice(i, 1);
        } else {
          ctx.save();
          ctx.translate(sh.x, sh.y);
          ctx.rotate(sh.rotation);
          ctx.fillStyle = '#fbbf24';
          ctx.globalAlpha = sh.alpha;
          ctx.fillRect(-4, -1.8, 8, 3.6);
          ctx.restore();
        }
      }

      // Draw Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vx *= 0.95;
        pt.vy *= 0.95;
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

      // ==========================================
      // DRAW REVOLVER IN THE CENTER (EXQUISITE ART)
      // ==========================================
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(state.gunAngle);

      // Apply recoil offset back along angle
      ctx.translate(-state.recoil, 0);

      // Revolver Grip / Handle
      ctx.save();
      ctx.rotate(Math.PI / 4.5);
      ctx.fillStyle = '#451a03'; // Wooden grip
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-22, 6, 12, 24, [4, 4, 8, 8]);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Gun Frame & Trigger Guard
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-10, -6, 20, 12, 3);
      ctx.fill();
      ctx.stroke();

      // Revolver Cylinder (with 6 chambers!)
      ctx.save();
      ctx.rotate(state.cylinderAngle);
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw the 6 chambers around cylinder
      for (let ch = 0; ch < 6; ch++) {
        const chAngle = (ch * Math.PI * 2) / 6;
        const cx = Math.cos(chAngle) * 9.5;
        const cy = Math.sin(chAngle) * 9.5;

        ctx.beginPath();
        ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
        // Show gold cartridge if bullet exists, else dark empty chamber hole
        if (ch < state.bulletsLeft) {
          ctx.fillStyle = '#f59e0b'; // Brass bullet cartridge
          ctx.fill();
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#090d16'; // Empty spent chamber
          ctx.fill();
        }
      }
      ctx.restore();

      // Long Revolver Barrel
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(10, -4, 28, 8, [0, 3, 3, 0]);
      ctx.fill();
      ctx.stroke();

      // Top rib and front sight
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(34, -6, 3, 2);

      // Center Pin Axis
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();

      ctx.restore(); // End revolver render

      // Draw Floating Texts
      for (let i = state.floatTexts.length - 1; i >= 0; i--) {
        const ft = state.floatTexts[i];
        ft.y -= 1;
        ft.alpha -= 0.025;
        if (ft.alpha <= 0) {
          state.floatTexts.splice(i, 1);
        } else {
          ctx.fillStyle = ft.color;
          ctx.font = 'black 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.globalAlpha = Math.max(0, ft.alpha);
          ctx.shadowColor = ft.color;
          ctx.shadowBlur = 8;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [initLevel, handleGameOver]);

  // Spacebar and Enter keyboard trigger support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (gameStateRef.current.isRunning) {
          e.preventDefault();
          shoot();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shoot]);

  const accuracy = totalShots > 0 ? Math.round((totalHits / totalShots) * 100) : 100;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Sci-Fi HUD Top Bar */}
      <div className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-3 backdrop-blur-xl shadow-lg">
        {/* Left: Level & Green Targets Count */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SECTOR / TARGETS</div>
            <div className="text-sm font-black text-white font-mono flex items-center gap-2">
              <span className="text-amber-400">LVL {level}</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span>{greenRemaining} GREEN LEFT</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Revolver 6-Bullet Cylinder HUD */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/70 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
              CYLINDER:
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-5 rounded-sm transition-all duration-150 border ${
                    idx < bulletsLeft
                      ? 'bg-gradient-to-t from-amber-600 via-amber-400 to-amber-300 border-amber-200 shadow-sm shadow-amber-400/50 scale-100'
                      : 'bg-slate-950 border-slate-800 scale-90 opacity-40'
                  }`}
                  title={idx < bulletsLeft ? 'Loaded Bullet' : 'Empty Chamber'}
                />
              ))}
            </div>
            <span className="font-mono font-black text-xs text-amber-400 ml-1">{bulletsLeft}/6</span>
          </div>

          {/* No Time Limit Indicator */}
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[10px] font-mono font-bold text-sky-400">
            <span>∞ NO TIME LIMIT</span>
          </div>
        </div>

        {/* Right: Score & Accuracy */}
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SCORE · ACC</div>
          <div className="text-sm font-mono font-black text-white">
            <span className="text-emerald-400">{score}</span> <span className="text-slate-600">·</span>{' '}
            <span className="text-cyan-400">{accuracy}%</span>
          </div>
        </div>
      </div>

      {/* Main Canvas Arena (Tap or click to shoot!) */}
      <div
        onPointerDown={(e) => {
          if (gameStateRef.current.isRunning) {
            shoot();
          }
        }}
        className="relative w-full aspect-square max-w-lg rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl cursor-pointer select-none"
      >
        <canvas ref={canvasRef} className="w-full h-full touch-none" />

        {/* In-game Objective Banner Overlay */}
        {isPlaying && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-slate-950/85 border border-slate-800 backdrop-blur-md text-[11px] font-bold text-slate-300 pointer-events-none z-10 shadow-lg">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Shoot Green Balls
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Avoid Red Balls!
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-sky-400 font-mono text-[10px]">
              ∞ No Timer
            </span>
          </div>
        )}

        {/* Tap Prompt at Bottom during play */}
        {isPlaying && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-slate-950/80 border border-slate-700/80 text-white font-mono text-xs font-black tracking-widest uppercase pointer-events-none animate-pulse">
            TAP SCREEN TO FIRE REVOLVER
          </div>
        )}

        {/* Start / Game Over Overlay */}
        {!isPlaying && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in"
          >
            {isGameOver ? (
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 shadow-2xl animate-bounce ${
                    gameOverReason === 'red_ball'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-rose-500/25'
                      : 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-amber-500/25'
                  }`}
                >
                  {gameOverReason === 'red_ball' ? (
                    <AlertTriangle className="w-10 h-10" />
                  ) : (
                    <ShieldAlert className="w-10 h-10" />
                  )}
                </div>

                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">
                    {gameOverReason === 'red_ball' ? 'HAZARD ORB STRUCK!' : 'ALL BULLETS EXPENDED!'}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto leading-relaxed">
                    {gameOverReason === 'red_ball'
                      ? 'You struck a red ball and were eliminated! Only shoot the green target balls.'
                      : 'All 6 bullets were shot without destroying all green targets. Trial ended!'}
                  </p>
                  <div className="mt-3 text-xs font-mono text-slate-300">
                    Sector Reached: <strong className="text-amber-400">Sector {level}</strong> · Final Score:{' '}
                    <strong className="text-emerald-400">{score} pts</strong>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-rose-500/30 tracking-wider uppercase transition flex items-center gap-2 cursor-pointer mt-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RELOAD & TRY AGAIN</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 p-0.5 shadow-xl shadow-amber-500/25">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
                    <Target className="w-10 h-10 animate-spin" />
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">AIM MASTER: REVOLVER ORBIT</h3>
                  <p className="text-slate-300 text-sm max-w-sm mt-1.5 leading-relaxed">
                    The revolver rotates at the center. Tap to fire your 6 bullets. Destroy all{' '}
                    <strong className="text-emerald-400">3 Green Balls</strong> and avoid hitting any{' '}
                    <strong className="text-rose-400">Red Balls</strong>!
                  </p>
                  <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-300 mt-2.5">
                    <span className="text-sky-400 font-bold bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                      ⏱️ NO TIME LIMIT
                    </span>
                    <span className="text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      🎯 6 BULLETS PER ROUND
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 tracking-wider uppercase transition cursor-pointer"
                >
                  LOAD REVOLVER & BEGIN
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full mt-3 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <span>Timing is everything: 6 shots, 3 green targets. Hitting a red ball results in instant elimination!</span>
      </div>
    </div>
  );
}
