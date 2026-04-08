import { AlertHistory } from "@/components/AlertHistory";
import { EmotionBadge } from "@/components/EmotionBadge";
import { Layout } from "@/components/Layout";
import { SensorChart } from "@/components/SensorChart";
import { showStressAlert } from "@/components/StressAlertToast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import type {
  Alert,
  ChildDetail as ChildDetailType,
  EmotionResult,
  SensorReading,
  StressAlert,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Link, redirect, useParams } from "@tanstack/react-router";
import { ArrowLeft, Clock, Cpu, RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";

// Chart palette matches OKLCH design system
const CHART_COLORS = {
  hrv: "oklch(0.65 0.18 150)", // chart-1 green
  stressLevel: "oklch(0.68 0.18 25)", // accent coral
  motionIntensity: "oklch(0.65 0.17 240)", // chart-2 blue
};

function formatAge(age: bigint): string {
  const n = Number(age);
  return n === 1 ? "1 yr" : `${n} yrs`;
}

function getLatestEmotion(
  emotionHistory: EmotionResult[],
): EmotionResult | null {
  if (!emotionHistory.length) return null;
  return [...emotionHistory].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  )[0];
}

// Skeleton for initial load
function DetailSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading child details"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["a", "b", "c"].map((k) => (
          <Skeleton key={k} className="h-52 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function ChildDetailPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { childId: childIdParam } = useParams({ from: "/children/$childId" });
  const { actor, isLoading: actorLoading } = useBackend();

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    throw redirect({ to: "/login" });
  }

  const childIdBigInt = BigInt(childIdParam);

  const {
    data: detail,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<ChildDetailType | null>({
    queryKey: ["childDetail", childIdParam],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getChildDetail(childIdBigInt);
    },
    enabled: !!actor && !actorLoading,
    refetchInterval: 10_000,
  });

  const { data: allAlerts = [], isFetching: alertsFetching } = useQuery<
    Alert[]
  >({
    queryKey: ["alerts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAlerts();
    },
    enabled: !!actor && !actorLoading,
    refetchInterval: 10_000,
  });

  // Track seen alert IDs to fire toasts only on new ones
  const seenAlertIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!allAlerts.length || !detail) return;
    const childName = detail.profile.name;
    const childAlerts = allAlerts.filter((a) => a.childId === childIdBigInt);

    for (const alert of childAlerts) {
      const key = `${alert.childId}-${alert.timestamp}`;
      if (!seenAlertIdsRef.current.has(key)) {
        seenAlertIdsRef.current.add(key);
        const lower = alert.emotionState?.toLowerCase() ?? "";
        const alertType = lower === "distressed" ? "distressed" : "stress";
        // Only fire toast after initial load (seenAlertIds was populated)
        if (seenAlertIdsRef.current.size > childAlerts.length) {
          const stressAlert: StressAlert = {
            childId: alert.childId,
            childName,
            alertType,
            stressLevel: alertType === "stress" ? alert.stressLevel : undefined,
            emotionState:
              alertType === "distressed" ? alert.emotionState : undefined,
            timestamp: Number(alert.timestamp),
          };
          showStressAlert(stressAlert);
        }
      }
    }
  }, [allAlerts, detail, childIdBigInt]);

  const latestEmotion = detail ? getLatestEmotion(detail.emotionHistory) : null;
  const latestReading = detail?.recentReadings?.length
    ? [...detail.recentReadings].sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      )[0]
    : null;
  const readings: SensorReading[] = detail?.recentReadings ?? [];

  return (
    <Layout>
      <div
        className="container mx-auto px-4 sm:px-6 py-8 space-y-6"
        data-ocid="child-detail-page"
      >
        {/* Header / back nav */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="flex-shrink-0 -ml-1"
              aria-label="Back to dashboard"
              data-ocid="back-button"
            >
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                Dashboard
              </Link>
            </Button>

            {detail && (
              <>
                <span className="text-border" aria-hidden="true">
                  /
                </span>
                <div className="min-w-0">
                  <h1 className="font-display font-bold text-xl text-foreground truncate">
                    {detail.profile.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground font-body">
                      Age {formatAge(detail.profile.age)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-body">
                      <Cpu className="h-3 w-3" aria-hidden="true" />
                      {detail.profile.deviceId}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Refresh indicator */}
          <div
            className="flex items-center gap-2 text-xs text-muted-foreground font-body"
            data-ocid="refresh-indicator"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching || alertsFetching ? "animate-spin text-primary" : "text-muted-foreground/50"}`}
              aria-hidden="true"
            />
            <span>{isFetching ? "Refreshing…" : "Live · 10s"}</span>
          </div>
        </div>

        {/* Loading / error / content */}
        {isLoading || authLoading ? (
          <DetailSkeleton />
        ) : isError || !detail ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="child-detail-error"
          >
            <p className="text-muted-foreground font-body text-sm">
              Failed to load child details.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              data-ocid="retry-button"
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Top row: current emotion + latest readings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Current Emotion card */}
              <div
                className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-3 lg:col-span-1"
                data-ocid="emotion-card"
              >
                <h2 className="font-display font-semibold text-sm text-foreground">
                  Current Emotion
                </h2>
                <div className="flex items-center gap-3">
                  <EmotionBadge
                    emotion={latestEmotion?.emotionState ?? "unknown"}
                    size="md"
                    className="text-base px-3 py-1.5"
                  />
                  {latestEmotion?.confidence !== undefined && (
                    <span className="text-xs text-muted-foreground font-body">
                      {Math.round(latestEmotion.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
                {latestEmotion?.careSuggestions?.length ? (
                  <p className="text-sm text-foreground/80 font-body leading-relaxed border-l-2 border-primary/30 pl-3">
                    {latestEmotion.careSuggestions[0]}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground font-body italic">
                    No care suggestion available.
                  </p>
                )}
              </div>

              {/* Stress snapshot */}
              <div
                className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-2"
                data-ocid="stress-snapshot"
              >
                <h2 className="font-display font-semibold text-sm text-foreground">
                  Stress Level
                </h2>
                {latestReading ? (
                  <>
                    <div className="flex items-end gap-2 mt-1">
                      <span
                        className={`font-display font-bold text-3xl tabular-nums ${
                          latestReading.stressLevel > 70
                            ? "text-accent"
                            : "text-foreground"
                        }`}
                      >
                        {Math.round(latestReading.stressLevel)}
                      </span>
                      <span className="text-muted-foreground font-body text-sm mb-1">
                        / 100
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-smooth ${
                          latestReading.stressLevel > 70
                            ? "bg-accent"
                            : "bg-primary"
                        }`}
                        style={{ width: `${latestReading.stressLevel}%` }}
                        role="progressbar"
                        tabIndex={-1}
                        aria-valuenow={Math.round(latestReading.stressLevel)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    {latestReading.stressLevel > 70 && (
                      <p className="text-xs text-accent font-body font-medium">
                        ⚠ Above danger threshold
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground font-body">
                    No reading yet
                  </p>
                )}
              </div>

              {/* HRV snapshot */}
              <div
                className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-2"
                data-ocid="hrv-snapshot"
              >
                <h2 className="font-display font-semibold text-sm text-foreground">
                  Heart Rate Variability
                </h2>
                {latestReading ? (
                  <>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="font-display font-bold text-3xl tabular-nums text-foreground">
                        {Math.round(latestReading.hrv)}
                      </span>
                      <span className="text-muted-foreground font-body text-sm mb-1">
                        ms
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body">
                      Normal range: 20–100 ms
                    </p>
                    <div className="flex items-center gap-1.5 mt-auto">
                      <Clock
                        className="h-3 w-3 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-muted-foreground font-body">
                        Motion: {Math.round(latestReading.motionIntensity)}{" "}
                        intensity
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground font-body">
                    No reading yet
                  </p>
                )}
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SensorChart
                readings={readings}
                metric="hrv"
                title="Heart Rate Variability (HRV)"
                unit=" ms"
                yDomain={[0, 150]}
                color={CHART_COLORS.hrv}
              />
              <SensorChart
                readings={readings}
                metric="stressLevel"
                title="Stress Level"
                unit="%"
                yDomain={[0, 100]}
                dangerThreshold={70}
                color={CHART_COLORS.stressLevel}
              />
              <SensorChart
                readings={readings}
                metric="motionIntensity"
                title="Motion Intensity"
                yDomain={[0, 100]}
                color={CHART_COLORS.motionIntensity}
              />
            </div>

            {/* Alert history */}
            <AlertHistory alerts={allAlerts} childId={childIdBigInt} />
          </>
        )}
      </div>
    </Layout>
  );
}
