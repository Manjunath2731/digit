import React, { useEffect, useRef, useState } from 'react';
import '../styles/WaterTank3D.css';

interface WaterTank3DProps {
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
  width?: number;
  height?: number;
}

const WaterTank3D: React.FC<WaterTank3DProps> = ({ 
  percentage, 
  status,
  width = 200,
  height = 240
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const rippleMapRef = useRef<number[]>([]);
  const lastMapRef = useRef<number[]>([]);
  const oldIndRef = useRef<number>(width);
  const newIndRef = useRef<number>(width * (height + 3));

  // Get color based on status
  const getColor = () => {
    switch (status) {
      case 'warning': return '#ffb74d';
      case 'critical': return '#e57373';
      default: return '#6ecff6';
    }
  };

  const color = getColor();
  const ovalHeight = width / 2.36;

  // Calculate heights
  const balanceHeight = Math.max((height * (100 - percentage)) / 100, 5); // Minimum 5px to always show
  const fillHeight = Math.max((height * percentage) / 100, 5); // Minimum 5px to always show
  const reflectionHeight = fillHeight / 2 + 20;

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
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
    ctx.fillStyle = color;
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
    };
  }, [percentage, color, width, height]);

  return (
    <div className="_tank" style={{ 
      width: `${width}px`, 
      height: `${height}px`,
      position: 'relative',
      margin: `${(height / 2) - 40}px auto`,
      transform: 'translate3d(0, 0, 0)',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }}>
      {/* Empty tank balance - RELATIVE positioning like original */}
      <div 
        className="_balance" 
        style={{ 
          height: `${balanceHeight}px`,
          background: 'rgba(220, 220, 220, 0.8)',
          position: 'relative',
          transform: 'translateZ(0px)',
          overflow: 'visible',
          transition: 'height 0.8s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
      >
        <div 
          className="_balanceTopCircle"
          style={{
            height: `${width}px`,
            width: '100%',
            background: 'rgba(220, 220, 220, 0.8)',
            borderRadius: '50%',
            top: 0,
            marginTop: `${-(width / 2)}px`,
            position: 'absolute',
            transform: 'rotateX(65deg) translateZ(0px)',
            transformStyle: 'preserve-3d'
          }}
        />
      </div>

      {/* Filled water - RELATIVE positioning like original */}
      <div 
        className="_filled"
        style={{ 
          height: `${fillHeight}px`,
          position: 'relative',
          opacity: isVisible ? 1 : 0,
          transform: 'translate3d(0, 0, 0)',
          overflow: 'visible',
          transition: 'height 0.8s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.8s ease'
        }}
      >
          {/* Water body */}
          <div 
            className="_filledBg"
            style={{
              height: '100%',
              width: '100%',
              background: color,
              position: 'absolute',
              opacity: 0.6,
              zIndex: 10
            }}
          >
            {/* Percentage label */}
            <div 
              className="_percentageTag"
              style={{
                position: 'absolute',
                right: '-85px',
                width: '70px',
                fontSize: '17px',
                top: '-10px',
                textAlign: 'left',
                userSelect: 'none'
              }}
            >
              {percentage}%
            </div>
          </div>

          {/* Top ellipse with ripple */}
          <div 
            className="_filledTopCircle"
            style={{
              height: `${width}px`,
              width: '100%',
              background: color,
              borderRadius: '50%',
              top: 0,
              marginTop: `${-(width / 2)}px`,
              position: 'absolute',
              overflow: 'hidden',
              zIndex: 10,
              transform: 'rotateX(65deg) translateZ(0px)',
              transformStyle: 'preserve-3d'
            }}
          >
            <canvas 
              ref={canvasRef}
              className="_canvas"
              style={{
                opacity: 0.8,
                transform: 'rotate(90deg)'
              }}
            />
          </div>

          {/* Bottom ellipse */}
          <div 
            className="_filledBottomCircle"
            style={{
              height: `${width}px`,
              width: '100%',
              background: color,
              borderRadius: '50%',
              bottom: 0,
              marginBottom: `${-(width / 2)}px`,
              position: 'absolute',
              boxShadow: 'rgba(0, 0, 0, 0.3) 0px 15px 50px',
              transform: 'rotateX(65deg) translateZ(0px)',
              transformStyle: 'preserve-3d'
            }}
          />

          {/* Reflection */}
          <div 
            className="_reflect"
            style={{
              position: 'absolute',
              width: '100%',
              height: `${reflectionHeight}px`,
              opacity: 0.4,
              background: `linear-gradient(to bottom, ${color} 0%, rgba(255,255,255,0) 100%)`,
              bottom: `${-reflectionHeight}px`,
              transition: 'height 0.8s cubic-bezier(0.23, 1, 0.32, 1)'
            }}
          />
        </div>

      {/* Top circle shine overlay */}
      {percentage < 100 && (
        <div 
          className="_topCircle"
          style={{
            height: `${width}px`,
            width: '100%',
            background: 'rgba(255, 255, 255, .2)',
            borderRadius: '50%',
            top: 0,
            marginTop: `${-(width / 2)}px`,
            position: 'absolute',
            zIndex: 500,
            pointerEvents: 'none',
            transform: 'rotateX(65deg) translateZ(0px)',
            transformStyle: 'preserve-3d'
          }}
        />
      )}
    </div>
  );
};

export default WaterTank3D;
