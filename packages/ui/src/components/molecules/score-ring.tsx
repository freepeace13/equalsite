import * as React from 'react';

import { cn } from '../../lib/utils';

export interface ScoreRingProps extends Omit<React.SVGProps<SVGSVGElement>, 'children'> {
  score: number;
  /** Diameter in px. */
  size?: number;
  strokeWidth?: number;
  /** Score at/above this renders success-toned. */
  goodThreshold?: number;
  /** Score at/above this (and below goodThreshold) renders warning-toned; below it renders critical-toned. */
  fairThreshold?: number;
}

function scoreRingTone(score: number, goodThreshold: number, fairThreshold: number) {
  if (score >= goodThreshold) {
    return 'text-emerald-600 dark:text-emerald-400';
  }
  if (score >= fairThreshold) {
    return 'text-yellow-600 dark:text-yellow-400';
  }
  return 'text-red-600 dark:text-red-400';
}

function ScoreRing({
  score,
  size = 40,
  strokeWidth = 4,
  goodThreshold = 90,
  fairThreshold = 70,
  className,
  ...props
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(score, 0), 100) / 100);
  const center = size / 2;
  const fontSize = Math.round(size * 0.28);

  return (
    <svg
      data-slot="score-ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('shrink-0', className)}
      aria-hidden="true"
      {...props}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-slate-200 dark:stroke-slate-800"
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        className={cn('stroke-current', scoreRingTone(score, goodThreshold, fairThreshold))}
      />
      <text
        x={center}
        y={center + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        className="fill-slate-900 font-medium tabular-nums dark:fill-white"
      >
        {score}
      </text>
    </svg>
  );
}

export { ScoreRing };
