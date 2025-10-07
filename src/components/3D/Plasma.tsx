import { useEffect, useRef } from 'react';

interface PlasmaProps {
  color?: string;
  speed?: number;
  direction?: 'forward' | 'backward';
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
}

export default function Plasma({
  color = '#ff6b35',
  speed = 0.6,
  direction = 'forward',
  scale = 1.1,
  opacity = 0.8,
  mouseInteractive = true
}: PlasmaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseInteractive) {
        const rect = canvas.getBoundingClientRect();
        mousePos.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        };
      }
    };

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 255, g: 107, b: 53 };
    };

    const rgb = hexToRgb(color);

    const render = () => {
      const { width, height } = canvas;
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      time += (direction === 'forward' ? speed : -speed) * 0.01;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;

          const nx = (x / width) * scale;
          const ny = (y / height) * scale;

          const mouseInfluence = mouseInteractive ? 
            Math.sin((nx - mousePos.current.x) * 10 + (ny - mousePos.current.y) * 10) * 0.5 : 0;

          const value1 = Math.sin(nx * 5 + time + mouseInfluence);
          const value2 = Math.sin(ny * 5 + time * 1.5 + mouseInfluence);
          const value3 = Math.sin((nx + ny) * 3 + time * 0.8 + mouseInfluence);
          const value4 = Math.sin(Math.sqrt(nx * nx + ny * ny) * 5 + time * 2);

          const plasma = (value1 + value2 + value3 + value4) / 4;
          const normalized = (plasma + 1) / 2;

          data[index] = rgb.r * normalized;
          data[index + 1] = rgb.g * normalized;
          data[index + 2] = rgb.b * normalized;
          data[index + 3] = 255 * opacity;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationFrameId = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    render();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: mouseInteractive ? 'auto' : 'none'
      }}
    />
  );
}
