import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { AlertCircle, Baby, PlusCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AddChildModal } from "../components/AddChildModal";
import { ChildSummaryCard } from "../components/ChildSummaryCard";
import { showStressAlert } from "../components/StressAlertToast";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";
import type { Alert, ChildSummary } from "../types";

const POLL_INTERVAL = 30_000;

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c", "sk-d", "sk-e", "sk-f"];

// --- Skeleton grid for first load ---
function DashboardSkeleton() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      aria-busy="true"
      aria-label="Loading children"
    >
      {SKELETON_KEYS.map((key) => (
        <div
          key={key}
          className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-card"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-border/60">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Empty state ---
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
      data-ocid="empty-state"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
        <Baby className="h-10 w-10 text-primary" aria-hidden="true" />
      </div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-2">
        No children added yet
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
        Add your first child to start monitoring their emotion status and sensor
        readings in real time.
      </p>
      <Button onClick={onAdd} data-ocid="empty-add-child-btn">
        <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
        Add Your First Child
      </Button>
    </motion.div>
  );
}

// --- Error state ---
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
      data-ocid="error-state"
    >
      <AlertCircle
        className="h-8 w-8 text-destructive mx-auto mb-3"
        aria-hidden="true"
      />
      <h2 className="font-display text-base font-semibold text-foreground mb-1">
        Failed to load children
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        There was a problem fetching your data. Please try again.
      </p>
      <Button variant="outline" onClick={onRetry} data-ocid="error-retry-btn">
        <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
        Retry
      </Button>
    </motion.div>
  );
}

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { actor, isLoading: actorLoading } = useBackend();
  const [modalOpen, setModalOpen] = useState(false);
  const seenAlertIds = useRef<Set<string>>(new Set());
  const registeredRef = useRef(false);

  // Register user with backend once authenticated — required for role-guarded methods
  useEffect(() => {
    if (!isAuthenticated || !actor || actorLoading || registeredRef.current)
      return;
    registeredRef.current = true;
    actor.register().catch(() => {
      // Ignore — user may already be registered (returning user)
    });
  }, [isAuthenticated, actor, actorLoading]);

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    throw redirect({ to: "/login" });
  }

  // Main children query — 30s polling
  const {
    data: children,
    isLoading,
    isError,
    refetch,
  } = useQuery<ChildSummary[]>({
    queryKey: ["myChildren"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getMyChildren();
      return result as ChildSummary[];
    },
    enabled: !!actor && !actorLoading,
    refetchInterval: POLL_INTERVAL,
    staleTime: POLL_INTERVAL / 2,
  });

  // Alert polling — 30s, compare vs seen set
  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAlerts();
    },
    enabled: !!actor && !actorLoading,
    refetchInterval: POLL_INTERVAL,
    staleTime: POLL_INTERVAL / 2,
  });

  useEffect(() => {
    if (!alerts) return;
    for (const alert of alerts) {
      const alertKey = `${alert.childId.toString()}-${alert.timestamp.toString()}`;
      if (seenAlertIds.current.has(alertKey)) continue;
      seenAlertIds.current.add(alertKey);

      const isStressAlert = alert.stressLevel >= 70;
      const isDistressedAlert =
        alert.emotionState?.toLowerCase() === "distressed";

      if (isStressAlert) {
        showStressAlert({
          childId: alert.childId,
          childName: alert.childName,
          alertType: "stress",
          stressLevel: alert.stressLevel,
          emotionState: alert.emotionState,
          timestamp: Number(alert.timestamp),
        });
      } else if (isDistressedAlert) {
        showStressAlert({
          childId: alert.childId,
          childName: alert.childName,
          alertType: "distressed",
          emotionState: alert.emotionState,
          timestamp: Number(alert.timestamp),
        });
      }
    }
  }, [alerts]);

  const showSkeleton = isLoading || authLoading || actorLoading;

  return (
    <Layout>
      <div
        className="container mx-auto px-4 sm:px-6 py-8 space-y-8"
        data-ocid="dashboard-page"
      >
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
              KidiCare
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              My Children — real-time emotion &amp; sensor monitoring
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="self-start sm:self-auto"
            data-ocid="add-child-btn"
          >
            <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
            Add Child
          </Button>
        </motion.div>

        {/* Section label */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-foreground">
            Emotion Status
          </h2>
          {!showSkeleton && !isError && children && children.length > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {children.length} {children.length === 1 ? "child" : "children"} ·
              auto-refreshes every 30s
            </span>
          )}
        </div>

        {/* Content area */}
        {showSkeleton ? (
          <DashboardSkeleton />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !children || children.length === 0 ? (
          <EmptyState onAdd={() => setModalOpen(true)} />
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            data-ocid="children-grid"
          >
            {children.map((child, index) => (
              <ChildSummaryCard
                key={child.id.toString()}
                child={child}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <AddChildModal open={modalOpen} onOpenChange={setModalOpen} />
    </Layout>
  );
}
