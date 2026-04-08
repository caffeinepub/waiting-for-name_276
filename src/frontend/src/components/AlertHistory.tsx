import { Activity, AlertTriangle } from "lucide-react";
import type { Alert } from "../types";

interface AlertHistoryProps {
  alerts: Alert[];
  childId: bigint;
}

function formatTimestamp(ts: bigint): string {
  const tsMs = Number(ts) > 1e12 ? Number(ts) / 1_000_000 : Number(ts) * 1000;
  const date = new Date(tsMs);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAlertType(alert: Alert): "stress" | "distressed" {
  const lower = alert.emotionState?.toLowerCase() ?? "";
  if (lower === "distressed") return "distressed";
  return "stress";
}

export function AlertHistory({ alerts, childId }: AlertHistoryProps) {
  const filtered = alerts
    .filter((a) => a.childId === childId)
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, 5);

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden shadow-card"
      data-ocid="alert-history"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h2 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-accent" aria-hidden="true" />
          Recent Alerts
        </h2>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-8 text-center" data-ocid="alert-history-empty">
          <Activity
            className="h-8 w-8 text-muted-foreground mx-auto mb-2"
            aria-hidden="true"
          />
          <p className="text-muted-foreground text-sm font-body">
            No alerts recorded
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-border" aria-label="Alert history">
          {filtered.map((alert) => {
            const type = getAlertType(alert);
            const key = `${alert.childId}-${alert.timestamp}`;
            return (
              <li
                key={key}
                className="flex items-start gap-3 px-4 py-3 bg-accent/8 hover:bg-accent/12 transition-smooth"
                data-ocid="alert-history-row"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <AlertTriangle
                    className="h-4 w-4 text-accent"
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body bg-accent/20 text-accent border border-accent/30">
                      {type === "stress" ? "High Stress" : "Distressed"}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground font-body mt-0.5">
                    {type === "stress"
                      ? `Stress level: ${Math.round(alert.stressLevel)}%`
                      : `Emotion: ${alert.emotionState}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
