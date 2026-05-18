"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Info, Loader2, RefreshCw } from "lucide-react";
import { gapApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/layout/page-header";
import type { ContinuityGap, GapSeverity } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/shared/status-badge";
import { DiagnosticsPanel } from "@/components/gaps/diagnostics-panel";
import { cn } from "@/lib/utils";

export default function GapAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [selectedGap, setSelectedGap] = useState<ContinuityGap | null>(null);
  const [severityFilter, setSeverityFilter] = useState<GapSeverity | "ALL">("ALL");
  const [pairFilter, setPairFilter] = useState<string>("ALL");

  const { data: gaps = [], isLoading } = useQuery({
    queryKey: ["gaps", workspaceId],
    queryFn: () => gapApi.getGaps(workspaceId),
  });

  const rerunMutation = useMutation({
    mutationFn: () => gapApi.rerun(workspaceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gaps", workspaceId] }),
  });

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  const summary = useMemo(
    () => ({
      critical: gaps.filter((g) => g.severity === "CRITICAL" && !g.isResolved).length,
      warning: gaps.filter((g) => g.severity === "WARNING" && !g.isResolved).length,
      passed: gaps.filter((g) => g.isResolved || g.severity === "INFO").length,
    }),
    [gaps]
  );

  const pairLabels = useMemo(
    () => Array.from(new Set(gaps.map((g) => g.pairLabel))),
    [gaps]
  );

  const filtered = gaps.filter((g) => {
    if (severityFilter !== "ALL" && g.severity !== severityFilter) return false;
    if (pairFilter !== "ALL" && g.pairLabel !== pairFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={AlertCircle}
        title="Gap Analysis"
        subtitle="Detected continuity gaps across artifact pairs with AI diagnostic guidance"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => rerunMutation.mutate()}
            disabled={rerunMutation.isPending}
          >
            {rerunMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Re-Analyze
          </Button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Critical", count: summary.critical, icon: AlertCircle, color: "border-status-fail/30 bg-status-fail/10 text-status-critical" },
          { label: "Warning", count: summary.warning, icon: Info, color: "border-brand-coral/30 bg-brand-coral/10 text-brand-coral" },
          { label: "Passed / Info", count: summary.passed, icon: CheckCircle, color: "border-status-pass/30 bg-status-pass/10 text-brand-emerald" },
        ].map((s) => (
          <Card key={s.label} className={cn("border-2", s.color)}>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{s.label}</p>
                <p className="text-3xl font-bold mt-1">{s.count}</p>
              </div>
              <s.icon className="h-10 w-10 opacity-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as GapSeverity | "ALL")}
          className="h-9 rounded-md border px-3 text-sm"
        >
          <option value="ALL">All severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="WARNING">Warning</option>
          <option value="INFO">Info</option>
        </select>
        <select
          value={pairFilter}
          onChange={(e) => setPairFilter(e.target.value)}
          className="h-9 rounded-md border px-3 text-sm"
        >
          <option value="ALL">All artifact pairs</option>
          {pairLabels.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            filtered.map((gap) => (
              <button
                key={gap.id}
                type="button"
                onClick={() => setSelectedGap(gap)}
                className={cn(
                  "w-full text-left rounded-lg border p-4 transition-all hover:shadow-sm",
                  selectedGap?.id === gap.id
                    ? "border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy/40"
                    : "border-border bg-white hover:border-border"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <SeverityBadge severity={gap.severity} />
                  <span className="text-xs text-brand-slate font-mono">{gap.pairLabel}</span>
                </div>
                <p className="text-xs font-medium text-brand-slate uppercase">{gap.type.replace(/_/g, " ")}</p>
                <p className="text-sm text-brand-navy/90 mt-1 line-clamp-2">{gap.description}</p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-3">
          {selectedGap ? (
            <DiagnosticsPanel gap={selectedGap} />
          ) : (
            <Card className="h-full min-h-[300px] flex items-center justify-center">
              <CardContent className="text-center text-brand-slate">
                <p>Select a gap to view details and AI recommendations</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
