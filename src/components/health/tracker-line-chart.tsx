"use client";

import { useId } from "react";
import type { TrackerEntry } from "@/lib/health/trackers";
import { formatDate } from "@/lib/utils";

interface TrackerLineChartProps {
  entries: TrackerEntry[];
  locale: "ka" | "ru" | "en";
  emptyLabel: string;
  unit?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  showSecondaryLine?: boolean;
}

const WIDTH = 640;
const HEIGHT = 240;
const MARGIN = { top: 16, right: 20, bottom: 44, left: 52 };

function niceStep(range: number) {
  const rough = range / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function buildTicks(min: number, max: number) {
  if (min === max) {
    const pad = Math.max(1, min * 0.1 || 1);
    min -= pad;
    max += pad;
  }

  const step = niceStep(max - min);
  const tickMin = Math.floor(min / step) * step;
  const tickMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];

  for (let value = tickMin; value <= tickMax + step * 0.001; value += step) {
    ticks.push(Number(value.toFixed(2)));
  }

  return ticks.length >= 2 ? ticks : [min, max];
}

function formatTick(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function buildLinePath(
  points: Array<{ x: number; y: number }>
) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function buildAreaPath(
  points: Array<{ x: number; y: number }>,
  baselineY: number
) {
  if (points.length === 0) return "";
  const line = buildLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

export function TrackerLineChart({
  entries,
  locale,
  emptyLabel,
  unit,
  primaryLabel,
  secondaryLabel,
  showSecondaryLine = false,
}: TrackerLineChartProps) {
  const gradientId = useId().replace(/:/g, "");

  if (entries.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }

  const sorted = [...entries].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  const primaryValues = sorted.map((entry) => entry.value);
  const secondaryValues = showSecondaryLine
    ? sorted.map((entry) => entry.valueSecondary ?? entry.value)
    : [];
  const allValues = [...primaryValues, ...secondaryValues];
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const yTicks = buildTicks(dataMin, dataMax);
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];
  const yRange = yMax - yMin || 1;

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const baselineY = MARGIN.top + innerHeight;

  const xForIndex = (index: number) =>
    MARGIN.left + (sorted.length === 1 ? innerWidth / 2 : (index / (sorted.length - 1)) * innerWidth);

  const yForValue = (value: number) =>
    MARGIN.top + innerHeight - ((value - yMin) / yRange) * innerHeight;

  const primaryPoints = sorted.map((entry, index) => ({
    x: xForIndex(index),
    y: yForValue(entry.value),
    entry,
    value: entry.value,
  }));

  const secondaryPoints =
    showSecondaryLine &&
    sorted.map((entry, index) => ({
      x: xForIndex(index),
      y: yForValue(entry.valueSecondary ?? entry.value),
      entry,
      value: entry.valueSecondary ?? entry.value,
    }));

  const primaryPath = buildLinePath(primaryPoints);
  const primaryArea = buildAreaPath(primaryPoints, baselineY);
  const secondaryPath =
    secondaryPoints && secondaryPoints.length > 0
      ? buildLinePath(secondaryPoints)
      : "";

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full min-w-[280px] text-muted"
          role="img"
          aria-hidden
        >
          <defs>
            <linearGradient id={`chart-fill-${gradientId}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(45 212 191)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="rgb(45 212 191)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = yForValue(tick);
            return (
              <g key={tick}>
                <line
                  x1={MARGIN.left}
                  x2={WIDTH - MARGIN.right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.12}
                />
                <text
                  x={MARGIN.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted text-[11px]"
                >
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

          <line
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={baselineY}
            y2={baselineY}
            stroke="currentColor"
            strokeOpacity={0.25}
          />

          {sorted.length > 1 && primaryArea && (
            <path d={primaryArea} fill={`url(#chart-fill-${gradientId})`} />
          )}

          {sorted.length > 1 && primaryPath && (
            <path
              d={primaryPath}
              fill="none"
              stroke="rgb(20 184 166)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {sorted.length > 1 && secondaryPath && (
            <path
              d={secondaryPath}
              fill="none"
              stroke="rgb(56 189 248)"
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {primaryPoints.map((point) => (
            <g key={`primary-${point.entry.id}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={5}
                fill="rgb(20 184 166)"
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={point.x}
                y={point.y - 10}
                textAnchor="middle"
                className="fill-foreground text-[10px] font-medium"
              >
                {showSecondaryLine && point.entry.valueSecondary
                  ? `${point.entry.value}/${point.entry.valueSecondary}`
                  : point.value}
              </text>
            </g>
          ))}

          {primaryPoints.map((point, index) => (
            <text
              key={`date-${point.entry.id}`}
              x={point.x}
              y={HEIGHT - 14}
              textAnchor={index === 0 ? "start" : index === primaryPoints.length - 1 ? "end" : "middle"}
              className="fill-muted text-[10px]"
            >
              {formatDate(point.entry.recordedAt, locale, { day: "numeric", month: "short" })}
            </text>
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
        {showSecondaryLine ? (
          <>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-0.5 w-5 rounded bg-teal-500" />
              {primaryLabel ?? unit}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-0.5 w-5 rounded border-t-2 border-dashed border-sky-400" />
              {secondaryLabel}
            </span>
          </>
        ) : unit ? (
          <span>{unit}</span>
        ) : null}
      </div>
    </div>
  );
}
