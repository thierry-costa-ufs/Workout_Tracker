import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { PersonalRecord } from '@/types/workout';
import { appTheme } from '@/shared/constants/theme';

interface WeightProgressionChartProps {
  records: PersonalRecord[];
}

const CHART_HEIGHT = 170;
const PADDING = { top: 24, right: 20, bottom: 36, left: 44 };
const CONTAINER_WIDTH = Dimensions.get('window').width - 64;

function parseDate(dateStr: string): Date {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date(dateStr);
}

function formatDateShort(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[0]}/${parts[1]}`;
  }
  return dateStr;
}

export function WeightProgressionChart({ records }: WeightProgressionChartProps) {
  const sorted = useMemo(() => {
    return [...records].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
  }, [records]);

  const chartWidth = CONTAINER_WIDTH - PADDING.left - PADDING.right;
  const chartAreaHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const { points, minWeight, maxWeight, bestIndex } = useMemo(() => {
    if (sorted.length === 0) {
      return { points: [], minWeight: 0, maxWeight: 100, bestIndex: -1 };
    }

    const weights = sorted.map((r) => r.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = max - min || 1;

    let bestIdx = 0;
    sorted.forEach((r, i) => {
      if (r.weight > sorted[bestIdx].weight) bestIdx = i;
    });

    const mapped = sorted.map((r, i) => {
      const x = sorted.length === 1 ? chartWidth / 2 : (i / (sorted.length - 1)) * chartWidth;
      const y = chartAreaHeight - ((r.weight - min) / range) * chartAreaHeight;
      return { x: x + PADDING.left, y: y + PADDING.top, record: r };
    });

    return { points: mapped, minWeight: min, maxWeight: max, bestIndex: bestIdx };
  }, [sorted, chartWidth, chartAreaHeight]);

  if (sorted.length === 0) return null;

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  const gridLines = 4;
  const yLabels: number[] = [];
  for (let i = 0; i <= gridLines; i++) {
    const val = minWeight + ((maxWeight - minWeight) * i) / gridLines;
    yLabels.push(Math.round(val * 10) / 10);
  }

  const xLabelStep = Math.max(1, Math.floor(points.length / 5));

  return (
    <View style={styles.container}>
      <Svg width={CONTAINER_WIDTH} height={CHART_HEIGHT}>
        {yLabels.map((val, i) => {
          const y = PADDING.top + chartAreaHeight - (i / gridLines) * chartAreaHeight;
          return (
            <React.Fragment key={`grid-${i}`}>
              <Line
                x1={PADDING.left}
                y1={y}
                x2={CONTAINER_WIDTH - PADDING.right}
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

        {points.length > 1 && (
          <Polygon
            points={`${PADDING.left},${PADDING.top + chartAreaHeight} ${linePoints} ${PADDING.left + chartWidth},${PADDING.top + chartAreaHeight}`}
            fill="rgba(255, 159, 10, 0.06)"
          />
        )}

        {points.length > 1 && (
          <Polygon
            points={linePoints}
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
              fill={i === bestIndex ? appTheme.colors.accent : '#1C1C1E'}
              stroke={i === bestIndex ? appTheme.colors.accent : appTheme.colors.textMuted}
              strokeWidth={i === bestIndex ? 2 : 1.5}
            />
            {i === bestIndex && points.length > 1 && (
              <>
                <Circle cx={p.x} cy={p.y} r={9} fill="rgba(255, 159, 10, 0.15)" />
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
                  {`${p.record.weight} kg`}
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
            const diff = last.record.weight - prev.record.weight;
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
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
});
