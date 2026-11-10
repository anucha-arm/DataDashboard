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
  isDark?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  totalLabel = 'ทั้งหมด',
  centerTitle,
  centerSubtitle,
  size = 220,
  strokeWidth = 32,
  isDark = false
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
            className={isDark ? 'text-slate-800/60' : 'text-slate-200'}
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
                    filter: isHovered
                      ? isDark
                        ? 'drop-shadow(0px 0px 6px rgba(255,255,255,0.3))'
                        : 'drop-shadow(0px 2px 6px rgba(30,58,138,0.25))'
                      : 'none'
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
              stroke={isDark ? '#475569' : '#CBD5E1'}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
            />
          )}
        </svg>

        {/* Center Label inside Donut Hole */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          {activeSegment ? (
            <>
              <span
                className={`text-[11px] font-semibold truncate max-w-full ${
                  isDark ? 'text-amber-200' : 'text-[#1E3A8A]'
                }`}
              >
                {activeSegment.label}
              </span>
              <span
                className={`text-2xl font-bold font-mono tabular-nums leading-none my-1 ${
                  isDark ? 'text-white' : 'text-[#0F1E36]'
                }`}
              >
                {activeSegment.percent}%
              </span>
              <span className={`text-[10px] font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                {activeSegment.value} ครั้ง
              </span>
            </>
          ) : (
            <>
              <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {centerSubtitle || totalLabel}
              </span>
              <span
                className={`text-2xl font-bold font-mono tabular-nums leading-none my-1 ${
                  isDark ? 'text-white' : 'text-[#0F1E36]'
                }`}
              >
                {centerTitle !== undefined ? centerTitle : totalValue}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  isDark ? 'text-amber-200/90' : 'text-[#8C7A62]'
                }`}
              >
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
                isDark
                  ? isHovered
                    ? 'bg-slate-800/90 border-amber-300/40 shadow-xs translate-x-1'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60'
                  : isHovered
                  ? 'bg-white border-[#1E3A8A] shadow-sm translate-x-1'
                  : 'bg-[#FAF8F5] border-[#E8E2D8] hover:bg-white text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: seg.color }}
                />
                <div>
                  <span
                    className={`font-semibold ${
                      isDark ? 'text-slate-200' : 'text-[#0F1E36]'
                    }`}
                  >
                    {seg.label}
                  </span>
                  {seg.sublabel && (
                    <span
                      className={`text-[10px] ml-1.5 hidden sm:inline ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      ({seg.sublabel})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                <span className={isDark ? 'text-slate-300 font-medium' : 'text-slate-600 font-medium'}>
                  {seg.value} ครั้ง
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                    isDark
                      ? 'bg-slate-800 text-amber-200 border-slate-700'
                      : 'bg-[#EFE9DF] text-[#1E3A8A] border-[#D8D2C5]'
                  }`}
                >
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
