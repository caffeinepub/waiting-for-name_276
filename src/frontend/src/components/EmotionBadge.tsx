import { cn } from "@/lib/utils";
import type { EmotionState } from "../types";

interface EmotionBadgeProps {
  emotion: EmotionState | string;
  size?: "sm" | "md";
  className?: string;
}

const emotionConfig: Record<
  string,
  { label: string; classes: string; emoji: string }
> = {
  calm: {
    label: "Calm",
    emoji: "😊",
    classes: "bg-primary/10 text-primary border-primary/25",
  },
  alert: {
    label: "Alert",
    emoji: "😐",
    classes: "bg-secondary/40 text-secondary-foreground border-secondary/60",
  },
  distressed: {
    label: "Distressed",
    emoji: "😟",
    classes:
      "bg-accent/15 text-accent border-accent/30 dark:bg-accent/20 dark:text-accent dark:border-accent/40",
  },
  excited: {
    label: "Excited",
    emoji: "😄",
    classes: "bg-primary/20 text-primary border-primary/35",
  },
  unknown: {
    label: "Unknown",
    emoji: "😶",
    classes: "bg-muted text-muted-foreground border-border",
  },
};

function normalizeEmotion(emotion: string): string {
  const lower = emotion.toLowerCase();
  if (lower in emotionConfig) return lower;
  return "unknown";
}

export function EmotionBadge({
  emotion,
  size = "md",
  className,
}: EmotionBadgeProps) {
  const key = normalizeEmotion(emotion);
  const config = emotionConfig[key] ?? emotionConfig.unknown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-body font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        config.classes,
        className,
      )}
      data-ocid="emotion-badge"
    >
      <span aria-hidden="true">{config.emoji}</span>
      {config.label}
    </span>
  );
}
