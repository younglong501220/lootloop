import React, { useEffect, useRef } from 'react';
import { TrackNode, MonsterStats } from '../types/game';

interface TrackCanvasProps {
  nodes: TrackNode[];
  heroNodeIndex: number;
  heroProgress: number; // 0 to 1 between nodes
  currentMonster: MonsterStats | null;
  isInCombat: boolean;
  loop: number;
  onNodeClick?: (index: number) => void;
}

export const TrackCanvas: React.FC<TrackCanvasProps> = ({
  nodes,
  heroNodeIndex,
  heroProgress,
  currentMonster,
  isInCombat,
  loop
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw atmospheric background texture
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        50,
        canvas.width / 2,
        canvas.height / 2,
        280
      );
      bgGrad.addColorStop(0, '#10141f');
      bgGrad.addColorStop(1, '#080a0e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle ground grid / cobblestone ambiance
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. Draw loop path line
      if (nodes.length > 1) {
        // Outer glow
        ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        nodes.forEach((n, idx) => {
          if (idx === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        });
        ctx.closePath();
        ctx.stroke();

        // Inner road
        ctx.strokeStyle = '#1e2430';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Dashed center guiding line with gentle pulse
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.15 + Math.sin(tick * 0.05) * 0.05})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Draw nodes
      nodes.forEach((node, idx) => {
        const isCurrentHero = idx === heroNodeIndex;
        const pulse = Math.sin(tick * 0.08 + idx) * 2;

        // Base circular shadow
        ctx.beginPath();
        ctx.arc(node.x, node.y + 2, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();

        // Tile specific colors and border styling
        ctx.beginPath();
        ctx.arc(node.x, node.y, 14 + (isCurrentHero ? pulse * 0.5 : 0), 0, Math.PI * 2);

        let fillColor = '#1e2330';
        let borderColor = '#3b4252';

        if (node.type === 'camp') {
          fillColor = '#854d0e';
          borderColor = '#facc15';
        } else if (node.type === 'merchant') {
          fillColor = '#78350f';
          borderColor = '#f59e0b';
        } else if (node.type === 'monster') {
          fillColor = '#7f1d1d';
          borderColor = '#f87171';
        } else if (node.type === 'chest') {
          fillColor = '#581c87';
          borderColor = '#c084fc';
        } else if (node.type === 'shrine') {
          fillColor = '#065f46';
          borderColor = '#34d399';
        } else if (node.type === 'forge') {
          fillColor = '#7c2d12';
          borderColor = '#fb923c';
        }

        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isCurrentHero ? 3 : 2;
        ctx.stroke();

        // Special aura for camp or merchant
        if (node.type === 'camp') {
          const fireSize = 3 + Math.sin(tick * 0.2) * 1.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y - 12, fireSize, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
          ctx.fill();
        } else if (node.type === 'merchant') {
          const sparkSize = 2.5 + Math.sin(tick * 0.15) * 1;
          ctx.beginPath();
          ctx.arc(node.x + 8, node.y - 10, sparkSize, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
          ctx.fill();
        }

        // Icon
        ctx.font = '14px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon, node.x, node.y);

        // Node index or step counter badge
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(203, 213, 225, 0.6)';
        ctx.fillText(`${idx + 1}`, node.x, node.y + 22);
      });

      // 4. Interpolate Hero position between nodes
      const currentNode = nodes[heroNodeIndex];
      const nextIndex = (heroNodeIndex + 1) % nodes.length;
      const nextNode = nodes[nextIndex];

      let heroX = currentNode.x;
      let heroY = currentNode.y;

      if (!isInCombat && nextNode) {
        heroX = currentNode.x + (nextNode.x - currentNode.x) * heroProgress;
        heroY = currentNode.y + (nextNode.y - currentNode.y) * heroProgress;
      }

      // Draw Hero shadow
      ctx.beginPath();
      ctx.ellipse(heroX, heroY + 8, 14, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fill();

      // Hero aura pulse
      const heroPulse = Math.sin(tick * 0.1) * 3;
      ctx.beginPath();
      ctx.arc(heroX, heroY, 18 + heroPulse, 0, Math.PI * 2);
      ctx.fillStyle = isInCombat ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.25)';
      ctx.fill();
      ctx.strokeStyle = isInCombat ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Hero Sprite / Avatar
      ctx.font = '20px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const heroBobbing = Math.sin(tick * 0.15) * 2;
      ctx.fillText('🧙‍♂️', heroX, heroY + heroBobbing);

      // Combat clashing effect
      if (isInCombat && currentMonster) {
        // Red slash arc
        ctx.save();
        ctx.strokeStyle = `rgba(248, 113, 113, ${0.4 + Math.sin(tick * 0.3) * 0.4})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(heroX, heroY, 26, -0.6, 1.2);
        ctx.stroke();
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [nodes, heroNodeIndex, heroProgress, currentMonster, isInCombat, loop]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
      <canvas
        ref={canvasRef}
        width={490}
        height={360}
        className="block max-w-full h-auto cursor-default"
      />
      
      {/* Loop Tracker Overlay */}
      <div className="absolute top-2.5 left-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-md text-xs font-mono">
        <span className="text-amber-400 font-bold">⭕ 循環圈數</span>
        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
          第 {loop} 圈
        </span>
      </div>

      {/* Track Current Node Banner */}
      <div className="absolute top-2.5 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-xs">
        <span className="text-base">{nodes[heroNodeIndex]?.icon}</span>
        <span className="font-semibold text-slate-200">{nodes[heroNodeIndex]?.name}</span>
      </div>

      {/* Combat Warning Indicator */}
      {isInCombat && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold animate-pulse flex items-center gap-1.5 shadow-lg shadow-red-900/40">
          <span>⚔️</span>
          <span>戰鬥交鋒中！裝備自動結算</span>
        </div>
      )}
    </div>
  );
};
