"use client";

import React, { useEffect, useMemo, useRef } from "react";

interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
  animated?: boolean;
}

const Noise: React.FC<NoiseProps> = ({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15,
  animated = true,
}) => {
  const grainRef = useRef<HTMLCanvasElement | null>(null);
  const canvasSize = useMemo(() => Math.max(1, Math.floor(patternSize)), [patternSize]);
  const scaleX = useMemo(() => Math.max(0.1, patternScaleX), [patternScaleX]);
  const scaleY = useMemo(() => Math.max(0.1, patternScaleY), [patternScaleY]);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      return;
    }

    let frame = 0;
    let animationId: number | undefined;
    const shouldAnimate = animated && patternRefreshInterval > 0;

    const resize = () => {
      if (!canvas) {
        return;
      }
      canvas.width = canvasSize;
      canvas.height = canvasSize;
    };

    const drawGrain = () => {
      const imageData = ctx.createImageData(canvasSize, canvasSize);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }

      ctx.putImageData(imageData, 0, 0);
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) {
        drawGrain();
      }
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    resize();
    drawGrain();

    if (shouldAnimate) {
      loop();
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (animationId !== undefined) {
        window.cancelAnimationFrame(animationId);
      }
    };
  }, [animated, canvasSize, patternRefreshInterval, patternAlpha]);

  return (
    <canvas
      className="pointer-events-none absolute left-1/2 top-1/2"
      ref={grainRef}
      style={{
        width: `${scaleX * 100}vw`,
        height: `${scaleY * 100}vh`,
        transform: "translate(-50%, -50%)",
        imageRendering: "pixelated",
      }}
    />
  );
};

export default Noise;
