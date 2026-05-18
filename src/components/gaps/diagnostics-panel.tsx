"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { diagnosticsApi } from "@/lib/api";
import type { ContinuityGap } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/shared/status-badge";

interface DiagnosticsPanelProps {
  gap: ContinuityGap;
}

const actionLabels: Record<string, string> = {
  REWRITE_DOCUMENT_SECTION: "Rewrite Section",
  ADD_MISSING_SECTION: "Add Section",
  FIX_CODE_LOGIC: "Fix Code",
  ALIGN_TERMINOLOGY: "Align Terminology",
  ADD_TEST_CASE: "Add Test Case",
};

export function DiagnosticsPanel({ gap }: DiagnosticsPanelProps) {
  const queryClient = useQueryClient();
  const [retryKey, setRetryKey] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["diagnostics", gap.id, retryKey],
    queryFn: () => diagnosticsApi.getForGap(gap.id),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: diagnosticsApi.acknowledge,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diagnostics", gap.id] }),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Gap Details</CardTitle>
            <p className="text-sm text-brand-slate mt-1 font-mono">{gap.pairLabel}</p>
          </div>
          <SeverityBadge severity={gap.severity} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-xs font-medium text-brand-slate uppercase mb-1">{gap.type.replace(/_/g, " ")}</p>
          <p className="text-sm text-brand-navy/90">{gap.description}</p>
        </div>

        {gap.upstreamExcerpt && (
          <div className="rounded-lg bg-brand-navy/5 p-3 text-xs">
            <p className="font-medium text-brand-navy mb-1">Upstream Excerpt</p>
            <p className="text-brand-slate">{gap.upstreamExcerpt}</p>
          </div>
        )}
        {gap.downstreamExcerpt && (
          <div className="rounded-lg bg-brand-emerald/10 p-3 text-xs">
            <p className="font-medium text-brand-emerald mb-1">Downstream Excerpt</p>
            <p className="text-brand-slate">{gap.downstreamExcerpt}</p>
          </div>
        )}

        <hr />

        <div>
          <h4 className="font-semibold text-brand-indigo mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-status-ai shrink-0" />
            AI Diagnostic Guidance
          </h4>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-20 bg-muted rounded" />
              <div className="h-20 bg-muted rounded" />
            </div>
          ) : isError ? (
            <div className="text-center py-6">
              <p className="text-sm text-brand-slate mb-3">LLM service unavailable</p>
              <Button variant="outline" size="sm" onClick={() => { setRetryKey((k) => k + 1); refetch(); }}>
                <RefreshCw className="h-4 w-4 mr-1" /> Retry
              </Button>
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted border p-4">
                <p className="text-xs font-medium text-brand-slate mb-1">Root Cause</p>
                <p className="text-sm text-brand-navy/90">{data.rootCause}</p>
              </div>
              {data.recommendations.map((rec) => (
                <div key={rec.id} className="rounded-lg border border-status-ai/25 bg-status-ai/5 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Priority {rec.priority}</Badge>
                    <Badge variant="ai">{actionLabels[rec.actionType] ?? rec.actionType}</Badge>
                  </div>
                  <p className="text-sm text-brand-navy/90">{rec.recommendationText}</p>
                  <Button
                    variant={rec.isAcknowledged ? "secondary" : "outline"}
                    size="sm"
                    disabled={rec.isAcknowledged || acknowledgeMutation.isPending}
                    onClick={() => acknowledgeMutation.mutate(rec.id)}
                  >
                    {rec.isAcknowledged ? (
                      <>
                        <Check className="h-4 w-4 mr-1" /> Acknowledged
                      </>
                    ) : (
                      "Mark as Acknowledged"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
