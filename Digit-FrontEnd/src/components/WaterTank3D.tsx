import React, { useEffect, useRef, useState } from 'react';

interface WaterTank3DProps {
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
  width?: number;
  height?: number;
  color?: string;
}

const WaterTank3D: React.FC<WaterTank3DProps> = ({ 
  percentage, 
  status,
  width = 180,
  height = 240,
  color
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const rippleMapRef = useRef<number[]>([]);
  const lastMapRef = useRef<number[]>([]);
  const oldIndRef = useRef<number>(width);
  const newIndRef = useRef<number>(width * (height + 3));

  // Get color based on status
  const getColor = () => {
    if (color) return color;
    switch (status) {
      case 'warning': return '#ffb74d';
      case 'critical': return '#e57373';
      default: return '#6ecff6';
    }
  };

  const tankColor = getColor();
  const ovalHeight = width / 2.36;

  // Calculate heights
  const balanceHeight = (height * (100 - percentage)) / 100;
  const fillHeight = (height * percentage) / 100;
  const reflectionHeight = fillHeight / 2 + 20;

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || percentage === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = width;
    const canvasHeight = width;
    const halfWidth = canvasWidth >> 1;
    const halfHeight = canvasHeight >> 1;
    const size = canvasWidth * (canvasHeight + 2) * 2;
    const ripRad = 8;
    const lineWidth = 1;
    const step = lineWidth * 18;
    const count = canvasHeight / lineWidth;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Initialize ripple maps
    rippleMapRef.current = new Array(size).fill(0);
    lastMapRef.current = new Array(size).fill(0);

    // Draw initial texture with diagonal lines
    ctx.fillStyle = tankColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#000';
    ctx.save();
    ctx.rotate(-0.785);
    for (let i = 0; i < count; i++) {
      ctx.fillRect(-canvasWidth, i * step, canvasWidth * 3, lineWidth);
    }
    ctx.restore();

    const texture = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const ripple = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

    // Disturb function
    const disturb = (dx: number, dy: number) => {
      dx = dx << 0;
      dy = dy << 0;
      for (let j = dy - ripRad; j < dy + ripRad; j++) {
        for (let k = dx - ripRad; k < dx + ripRad; k++) {
          if (rippleMapRef.current) {
            rippleMapRef.current[oldIndRef.current + (j * canvasWidth) + k] += 128;
          }
        }
      }
    };

    // New frame calculation
    const newFrame = () => {
      const t = oldIndRef.current;
      oldIndRef.current = newIndRef.current;
      newIndRef.current = t;

      let i = 0;
      const rippleMap = rippleMapRef.current;
      const lastMap = lastMapRef.current;
      const rd = ripple.data;
      const td = texture.data;

      for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
          const newind = newIndRef.current + i;
          const mapind = oldIndRef.current + i;

          let data = (
            rippleMap[mapind - canvasWidth] +
            rippleMap[mapind + canvasWidth] +
            rippleMap[mapind - 1] +
            rippleMap[mapind + 1]
          ) >> 1;

          data -= rippleMap[newind];
          data -= data >> 5;
          rippleMap[newind] = data;

          data = 1024 - data;
          const oldData = lastMap[i];
          lastMap[i] = data;

          if (oldData !== data) {
            let a = (((x - halfWidth) * data / 1024) << 0) + halfWidth;
            let b = (((y - halfHeight) * data / 1024) << 0) + halfHeight;

            if (a >= canvasWidth) a = canvasWidth - 1;
            if (a < 0) a = 0;
            if (b >= canvasHeight) b = canvasHeight - 1;
            if (b < 0) b = 0;

            const newPixel = (a + (b * canvasWidth)) * 4;
            const curPixel = i * 4;

            rd[curPixel] = td[newPixel];
            rd[curPixel + 1] = td[newPixel + 1];
            rd[curPixel + 2] = td[newPixel + 2];
          }
          ++i;
        }
      }
    };

    // Animation loop
    const run = () => {
      newFrame();
      ctx.putImageData(ripple, 0, 0);
    };

    // Start animation
    const intervalId = setInterval(run, 30);

    // Random disturbances
    const disturbIntervalId = setInterval(() => {
      disturb(Math.random() * canvasWidth, Math.random() * canvasHeight);
    }, 700);

    // Mouse move handler
    const handleMouseMove = (evt: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      disturb(x, y);
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(intervalId);
      clearInterval(disturbIntervalId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [percentage, tankColor, width, height]);

  return (
    <div className="tank-container">
      {/* Empty tank balance */}
      <div 
        className="tank-balance" 
        style={{ height: `${balanceHeight}px` }}
      >
        <div className="tank-balance-top" />
      </div>

      {/* Filled water */}
      {percentage > 0 && (
        <div 
          className={`tank-fill ${isVisible ? 'visible' : ''}`}
          style={{ height: `${fillHeight}px` }}
        >
          {/* Water body */}
          <div className={`tank-fill-bg ${status}`} />

          {/* Top ellipse with ripple */}
          <div className={`tank-fill-top ${status}`}>
            <canvas 
              ref={canvasRef}
              className="water-ripple-canvas"
            />
          </div>

          {/* Bottom ellipse */}
          <div className={`tank-fill-bottom ${status}`} />

          {/* Reflection */}
          <div 
            className={`tank-reflection ${status}`}
            style={{ height: `${reflectionHeight}px` }}
          />
        </div>
      )}

      {/* Top circle shine overlay */}
      {percentage < 100 && (
        <div className="tank-top-circle" />
      )}

      {/* Percentage label */}
      <div className="tank-percentage">{percentage}%</div>
    </div>
  );
};

export default WaterTank3D;
