import { AlertTriangle } from "lucide-react";
import type { StressAlert } from "../types";

interface StressAlertToastProps {
  alert: StressAlert;
}

export function StressAlertToast({ alert }: StressAlertToastProps) {
  return (
    <div className="flex items-start gap-3" data-ocid="stress-alert-toast">
      <div className="flex-shrink-0 mt-0.5">
        <AlertTriangle className="h-4 w-4 text-accent" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold text-foreground text-sm leading-snug">
          Alert: {alert.childName}
        </p>
        <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
          {alert.alertType === "stress" && alert.stressLevel !== undefined
            ? `Stress level at ${Math.round(alert.stressLevel)}% — monitoring recommended.`
            : `Showing signs of ${alert.emotionState ?? "distress"} — check in now.`}
        </p>
      </div>
    </div>
  );
}

export function showStressAlert(alert: StressAlert): void {
  import("sonner").then(({ toast }) => {
    toast.custom(() => <StressAlertToast alert={alert} />, {
      duration: 5000,
      className: "border border-accent/30 bg-accent/10",
    });
  });
}
