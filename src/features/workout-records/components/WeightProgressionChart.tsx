import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { PersonalRecord } from '@/types/workout';
import { appTheme } from '@/shared/constants/theme';

interface WeightProgressionChartProps {
  records: PersonalRecord[];
  mode?: 'weight' | '1rm';
}

const CHART_HEIGHT = 170;
const PADDING = { top: 24, right: 20, bottom: 36, left: 44 };

function epley1RM(w: number, r: number) {
  return w * (1 + r / 30);
}

function getDisplayValue(r: PersonalRecord, mode: 'weight' | '1rm') {
  return mode === '1rm' ? epley1RM(r.weight, r.reps) : r.weight;
}

function parseRecordDate(r: PersonalRecord): Date {
  if (r.timestamp) return new Date(r.timestamp);
  const parts = r.date.split('/');
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date(r.date);
}

function formatDateShort(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[0]}/${parts[1]}`;
  }
  return dateStr;
}

export function WeightProgressionChart({ records, mode = 'weight' }: WeightProgressionChartProps) {
  const sorted = useMemo(() => {
    return [...records].sort((a, b) => parseRecordDate(a).getTime() - parseRecordDate(b).getTime());
  }, [records]);

  const containerWidth = useMemo(() => Dimensions.get('window').width - 64, []);
  const chartWidth = containerWidth - PADDING.left - PADDING.right;
  const chartAreaHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const { points, minVal, maxVal, bestIndex } = useMemo(() => {
    if (sorted.length === 0) {
      return { points: [], minVal: 0, maxVal: 100, bestIndex: -1 };
    }

    const values = sorted.map((r) => getDisplayValue(r, mode));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    let bestIdx = 0;
    sorted.forEach((r, i) => {
      if (getDisplayValue(r, mode) > getDisplayValue(sorted[bestIdx], mode)) bestIdx = i;
    });

    const mapped = sorted.map((r, i) => {
      const x = sorted.length === 1 ? chartWidth / 2 : (i / (sorted.length - 1)) * chartWidth;
      const val = getDisplayValue(r, mode);
      const y = chartAreaHeight - ((val - min) / range) * chartAreaHeight;
      return { x: x + PADDING.left, y: y + PADDING.top, record: r };
    });

    return { points: mapped, minVal: min, maxVal: max, bestIndex: bestIdx };
  }, [sorted, chartWidth, chartAreaHeight, mode]);

  if (sorted.length === 0) return null;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  const floorY = PADDING.top + chartAreaHeight;
  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;
  const areaPath = `${linePath} L${lastX},${floorY} L${firstX},${floorY} Z`;

  const gridLines = 4;
  const yLabels: number[] = [];
  for (let i = 0; i <= gridLines; i++) {
    const val = minVal + ((maxVal - minVal) * i) / gridLines;
    yLabels.push(Math.round(val * 10) / 10);
  }

  const xLabelStep = Math.max(1, Math.floor(points.length / 5));

  return (
    <View style={styles.container}>
      <Svg width={containerWidth} height={CHART_HEIGHT}>
        {yLabels.map((val, i) => {
          const y = PADDING.top + chartAreaHeight - (i / gridLines) * chartAreaHeight;
          return (
            <React.Fragment key={`grid-${i}`}>
              <Line
                x1={PADDING.left}
                y1={y}
                x2={containerWidth - PADDING.right}
                y2={y}
                stroke={appTheme.colors.borderStrong}
                strokeWidth={0.5}
                strokeDasharray="4,4"
              />
              <SvgText
                x={PADDING.left - 8}
                y={y + 4}
                fontSize={8}
                fill={appTheme.colors.textMuted}
                textAnchor="end"
                fontFamily="System"
                fontWeight="600"
              >
                {val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {points.length > 1 && <Path d={areaPath} fill={appTheme.colors.prBadgeBackground} />}

        {points.length > 1 && (
          <Path
            d={linePath}
            fill="none"
            stroke={appTheme.colors.accent}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {points.map((p, i) => (
          <React.Fragment key={`dot-${i}`}>
            <Circle
              cx={p.x}
              cy={p.y}
              r={i === bestIndex ? 5 : 3.5}
              fill={i === bestIndex ? appTheme.colors.accent : appTheme.colors.surfaceElevated}
              stroke={i === bestIndex ? appTheme.colors.accent : appTheme.colors.textMuted}
              strokeWidth={i === bestIndex ? 2 : 1.5}
            />
            {i === bestIndex && points.length > 1 && (
              <>
                <Circle cx={p.x} cy={p.y} r={9} fill={appTheme.colors.prBadgeBackground} />
                <Circle cx={p.x} cy={p.y} r={5} fill={appTheme.colors.accent} />
                <SvgText
                  x={p.x}
                  y={p.y - 12}
                  fontSize={9}
                  fill={appTheme.colors.accent}
                  textAnchor="middle"
                  fontFamily="System"
                  fontWeight="800"
                >
                  {`${getDisplayValue(p.record, mode).toFixed(1)} ${mode === '1rm' ? '1RM' : 'kg'}`}
                </SvgText>
              </>
            )}
          </React.Fragment>
        ))}

        {points.map((p, i) => {
          if (i % xLabelStep !== 0 && i !== points.length - 1) return null;
          return (
            <SvgText
              key={`xlabel-${i}`}
              x={p.x}
              y={CHART_HEIGHT - 8}
              fontSize={8}
              fill={appTheme.colors.textMuted}
              textAnchor="middle"
              fontFamily="System"
              fontWeight="600"
            >
              {formatDateShort(p.record.date)}
            </SvgText>
          );
        })}

        {points.length > 1 &&
          (() => {
            const last = points[points.length - 1];
            const prev = points[points.length - 2];
            const diff = getDisplayValue(last.record, mode) - getDisplayValue(prev.record, mode);
            const isUp = diff >= 0;
            const label = `${isUp ? '+' : ''}${diff.toFixed(1)}`;
            const labelX = last.x;
            const labelY = last.y - (last.y < PADDING.top + 30 ? -18 : 22);

            return (
              <SvgText
                key="last-delta"
                x={labelX}
                y={labelY}
                fontSize={8}
                fill={isUp ? appTheme.colors.success : appTheme.colors.danger}
                textAnchor="middle"
                fontFamily="System"
                fontWeight="700"
              >
                {label}
              </SvgText>
            );
          })()}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
});
