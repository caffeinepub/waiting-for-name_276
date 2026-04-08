import { cn } from "@/lib/utils";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SensorReading } from "../types";

interface SensorChartProps {
  readings: SensorReading[];
  metric: "hrv" | "stressLevel" | "motionIntensity";
  title: string;
  unit?: string;
  yDomain?: [number, number];
  dangerThreshold?: number;
  color: string;
  className?: string;
}

function buildChartData(
  readings: SensorReading[],
  metric: "hrv" | "stressLevel" | "motionIntensity",
) {
  const last60 = readings.slice(-60);
  const now = Date.now();
  return last60.map((r, i) => {
    const tsMs =
      Number(r.timestamp) > 1e12
        ? Number(r.timestamp) / 1_000_000
        : Number(r.timestamp) * 1000;
    const diffSec = Math.round((now - tsMs) / 1000);
    const label = diffSec <= 0 ? "now" : `${diffSec}s ago`;
    return {
      label,
      index: i,
      value: r[metric],
    };
  });
}

// Custom tooltip
function ChartTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-elevated text-xs font-body">
      <span className="font-semibold text-foreground">
        {Math.round(payload[0].value)}
        {unit}
      </span>
    </div>
  );
}

export function SensorChart({
  readings,
  metric,
  title,
  unit = "",
  yDomain,
  dangerThreshold,
  color,
  className,
}: SensorChartProps) {
  const data = buildChartData(readings, metric);
  const isEmpty = data.length === 0;

  // Show every ~10th label on x-axis to avoid crowding
  const xTickFormatter = (_: string, index: number) => {
    if (index === 0) return data[0]?.label ?? "";
    if (index === data.length - 1) return "now";
    return "";
  };

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-4 shadow-card",
        className,
      )}
      data-ocid={`sensor-chart-${metric}`}
    >
      <h3 className="font-display font-semibold text-sm text-foreground mb-3 tracking-tight">
        {title}
      </h3>

      {isEmpty ? (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-xs font-body">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(var(--border))"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="label"
              tick={{
                fontSize: 10,
                fill: "oklch(var(--muted-foreground))",
                fontFamily: "var(--font-body)",
              }}
              tickFormatter={xTickFormatter}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yDomain ?? ["auto", "auto"]}
              tick={{
                fontSize: 10,
                fill: "oklch(var(--muted-foreground))",
                fontFamily: "var(--font-body)",
              }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<ChartTooltip unit={unit} />} />

            {dangerThreshold !== undefined && (
              <ReferenceLine
                y={dangerThreshold}
                stroke="oklch(var(--accent))"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{
                  value: `⚠ ${dangerThreshold}`,
                  position: "right",
                  fontSize: 9,
                  fill: "oklch(var(--accent))",
                  fontFamily: "var(--font-body)",
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
