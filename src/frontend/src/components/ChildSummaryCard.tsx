import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import type { ChildSummary } from "../types";
import { EmotionBadge } from "./EmotionBadge";

interface ChildSummaryCardProps {
  child: ChildSummary;
  index: number;
}

function StressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct >= 70 ? "bg-accent" : pct >= 45 ? "bg-secondary" : "bg-primary/50";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">Stress Level</span>
        <span
          className={`font-semibold font-display ${pct >= 70 ? "text-accent" : pct >= 45 ? "text-secondary-foreground" : "text-primary"}`}
        >
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}

function formatTimestamp(ts: bigint | undefined): string {
  if (ts === undefined) return "No data yet";
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "No data yet";
  return `${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}, ${date.toLocaleDateString([], { month: "short", day: "numeric" })}`;
}

export function ChildSummaryCard({ child, index }: ChildSummaryCardProps) {
  const stressLevel = child.latestStressLevel ?? 0;
  const isHighStress = stressLevel >= 70;
  const isDistressed = child.latestEmotion?.toLowerCase() === "distressed";
  const showAlertBadge = isHighStress || isDistressed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
    >
      <Card
        className="relative shadow-card hover:shadow-elevated transition-smooth cursor-default overflow-hidden border border-border bg-card"
        data-ocid="child-summary-card"
      >
        {showAlertBadge && (
          <div
            className="absolute inset-x-0 top-0 h-0.5 bg-accent rounded-t"
            aria-hidden="true"
          />
        )}

        <CardContent className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-base text-foreground truncate leading-tight">
                {child.name}
              </h3>
              {showAlertBadge && (
                <Badge
                  className="mt-1 text-[10px] px-1.5 py-0 bg-accent/15 text-accent border-accent/30 border"
                  data-ocid="alert-badge"
                >
                  Alert ≥ 70%
                </Badge>
              )}
            </div>
            <EmotionBadge
              emotion={child.latestEmotion ?? "unknown"}
              size="sm"
            />
          </div>

          {/* Stress bar */}
          <StressBar value={stressLevel} />

          {/* Motion intensity */}
          {child.latestMotionIntensity !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Motion</span>
              <span className="font-medium text-foreground font-display">
                {Math.round(child.latestMotionIntensity * 100) / 100}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
              <Clock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">
                {formatTimestamp(child.latestTimestamp)}
              </span>
            </div>
            <Link
              to="/children/$childId"
              params={{ childId: child.id.toString() }}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors duration-200 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              data-ocid="view-details-link"
            >
              View Details
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
