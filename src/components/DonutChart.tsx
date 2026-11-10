import React, { useState } from 'react';

export interface DonutSegment {
  key: string | number;
  label: string;
  sublabel?: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  totalLabel?: string;
  centerTitle?: string;
  centerSubtitle?: string;
  size?: number;
  strokeWidth?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  totalLabel = 'ทั้งหมด',
  centerTitle,
  centerSubtitle,
  size = 220,
  strokeWidth = 32
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalValue = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke offsets
  let accumulatedPercent = 0;
  const renderedSegments = segments.map((seg, idx) => {
    const percent = totalValue > 0 ? seg.value / totalValue : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      ...seg,
      index: idx,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset
    };
  });

  const activeSegment = hoveredIndex !== null ? renderedSegments[hoveredIndex] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      {/* SVG Donut Circle */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800/40"
          />

          {totalValue > 0 ? (
            renderedSegments.map((seg) => {
              const isHovered = hoveredIndex === seg.index;
              return (
                <circle
                  key={seg.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredIndex(seg.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="transition-all duration-300 cursor-pointer origin-center"
                  style={{
                    filter: isHovered ? 'drop-shadow(0px 0px 6px rgba(255,255,255,0.25))' : 'none'
                  }}
                />
              );
            })
          ) : (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#475569"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
            />
          )}
        </svg>

        {/* Center Label inside Donut Hole */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          {activeSegment ? (
            <>
              <span className="text-[11px] text-amber-200/90 font-medium truncate max-w-full">
                {activeSegment.label}
              </span>
              <span className="text-2xl font-bold text-white font-mono tabular-nums leading-none my-1">
                {activeSegment.percent}%
              </span>
              <span className="text-[10px] text-slate-300 font-mono">
                {activeSegment.value} ครั้ง
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] text-slate-400 font-medium">
                {centerSubtitle || totalLabel}
              </span>
              <span className="text-2xl font-bold text-white font-mono tabular-nums leading-none my-1">
                {centerTitle !== undefined ? centerTitle : totalValue}
              </span>
              <span className="text-[10px] text-amber-200/80 font-medium">
                คำตอบทั้งหมด
              </span>
            </>
          )}
        </div>
      </div>

      {/* Formal Legend with Navy, Slate, and Beige Badges */}
      <div className="flex-1 w-full space-y-2">
        {renderedSegments.map((seg) => {
          const isHovered = hoveredIndex === seg.index;
          return (
            <div
              key={seg.key}
              onMouseEnter={() => setHoveredIndex(seg.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                isHovered
                  ? 'bg-slate-800/90 border-amber-300/40 shadow-xs translate-x-1'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: seg.color }}
                />
                <div>
                  <span className="font-semibold text-slate-200">{seg.label}</span>
                  {seg.sublabel && (
                    <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">
                      ({seg.sublabel})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                <span className="text-slate-300 font-medium">{seg.value} ครั้ง</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-200 border border-slate-700">
                  {seg.percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
