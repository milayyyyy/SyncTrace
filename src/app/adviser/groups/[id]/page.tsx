"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  GitBranch,
  Loader2,
  X,
  XCircle,
} from "lucide-react";
import { adviserApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { ExportReportButton } from "@/components/shared/export-report-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { cn, getScoreColor } from "@/lib/utils";
import type { ReadinessStatus } from "@/types";

const PHASE_LABELS: Record<string, string> = {
  "Proposal → SRS": "Requirements Elicitation",
  "SRS → SDD": "Architectural Design",
  "SRS → SPMP": "Project Planning",
  "SRS → STD": "Test Coverage",
  "SDD → Source Code": "Implementation",
};

function getSemanticConfidence(score: number) {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

function getPhaseStatus(readiness: ReadinessStatus): "ALIGNED" | "PARTIAL" | "GAPS_DETECTED" {
  if (readiness === "READY_FOR_REVIEW") return "ALIGNED";
  if (readiness === "NEEDS_REVISION") return "PARTIAL";
  return "GAPS_DETECTED";
}

function PhaseStatusBadge({ status }: { status: "ALIGNED" | "PARTIAL" | "GAPS_DETECTED" }) {
  if (status === "ALIGNED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1">
        <CheckCircle className="h-3.5 w-3.5" />
        ALIGNED
      </span>
    );
  }
  if (status === "PARTIAL") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-semibold px-3 py-1">
        <AlertTriangle className="h-3.5 w-3.5" />
        PARTIAL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1">
      <XCircle className="h-3.5 w-3.5" />
      GAPS DETECTED
    </span>
  );
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { isAuthenticated, user } = useAuthStore();
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["adviser-group", workspaceId],
    queryFn: () => adviserApi.getGroupDetail(workspaceId),
  });

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
    else if (user?.role !== "FACULTY_ADVISER") router.replace("/");
  }, [isAuthenticated, user, router]);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
      </div>
    );
  }

  const { group, audit, gaps, pairs } = data;

  const avgCoverage = audit.pairScores.length > 0
    ? Math.round(audit.pairScores.reduce((s, p) => s + p.coveragePercentage, 0) / audit.pairScores.length)
    : 0;
  const semanticConfidence = getSemanticConfidence(audit.overallAlignmentScore);

  const rows = audit.pairScores.map((ps) => {
    const pair = pairs.find((p) => p.label === ps.pairLabel);
    return {
      pairLabel: ps.pairLabel,
      phaseLabel: PHASE_LABELS[ps.pairLabel] ?? "",
      confidence: Math.round(ps.alignmentScore),
      mappedItems: pair?.linkCount ?? 0,
      identifiedGaps: ps.criticalGapCount + ps.warningGapCount,
      status: getPhaseStatus(ps.readinessStatus),
    };
  });

  const selectedRow = rows.find((r) => r.pairLabel === selectedPair) ?? null;
  const phaseGaps = selectedPair
    ? gaps.filter((g) => !g.isResolved && g.pairLabel === selectedPair)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/adviser/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-brand-slate hover:text-brand-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <PageHeader
          icon={GitBranch}
          title="Matrix"
          subtitle={`${group.title} · ${group.teamCode}`}
          actions={<ExportReportButton workspaceId={workspaceId} teamCode={group.teamCode} />}
        />
      </div>

      {/* 4 stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Alignment Score – dark */}
        <div className="rounded-xl bg-[#0a1628] text-white p-5 flex flex-col justify-between min-h-[120px]">
          <p className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Alignment Score</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold">{Math.round(audit.overallAlignmentScore)}%</p>
            <GitBranch className="h-8 w-8 text-teal-400/50" />
          </div>
        </div>

        {/* Completeness Indicator */}
        <div className="rounded-xl bg-card border p-5 flex flex-col justify-between min-h-[120px]">
          <p className="text-xs font-semibold tracking-widest text-brand-slate uppercase">Completeness Indicator</p>
          <p className="text-4xl font-bold text-brand-navy">{avgCoverage}%</p>
        </div>

        {/* Semantic Confidence */}
        <div className="rounded-xl bg-card border p-5 flex flex-col justify-between min-h-[120px]">
          <p className="text-xs font-semibold tracking-widest text-brand-slate uppercase">Semantic Confidence</p>
          <p className={cn(
            "text-4xl font-bold",
            semanticConfidence === "High" ? "text-brand-navy" :
            semanticConfidence === "Medium" ? "text-amber-600" : "text-status-fail"
          )}>
            {semanticConfidence}
          </p>
        </div>

        {/* Readiness Status – tinted */}
        <div className={cn(
          "rounded-xl border p-5 flex flex-col justify-between min-h-[120px]",
          audit.readinessStatus === "NEEDS_REVISION" ? "bg-amber-50 border-amber-200" :
          audit.readinessStatus === "CRITICAL_GAPS_EXIST" ? "bg-red-50 border-red-200" :
          "bg-green-50 border-green-200"
        )}>
          <p className={cn(
            "text-xs font-semibold tracking-widest uppercase",
            audit.readinessStatus === "NEEDS_REVISION" ? "text-amber-600" :
            audit.readinessStatus === "CRITICAL_GAPS_EXIST" ? "text-red-600" : "text-green-600"
          )}>Readiness Status</p>
          <p className={cn(
            "text-2xl font-bold leading-tight",
            audit.readinessStatus === "NEEDS_REVISION" ? "text-amber-600" :
            audit.readinessStatus === "CRITICAL_GAPS_EXIST" ? "text-red-600" : "text-green-600"
          )}>
            {audit.readinessStatus === "READY_FOR_REVIEW" ? "Ready for Review" :
             audit.readinessStatus === "NEEDS_REVISION" ? "Needs Revision" :
             "Critical Gaps"}
          </p>
        </div>
      </div>

      {/* Phase Alignment Summary + Phase Summary panel */}
      <div className={cn("grid gap-6 items-start", selectedRow ? "lg:grid-cols-[1fr_360px]" : "grid-cols-1")}>
        {/* Left: Phase Alignment Summary */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Phase Alignment Summary</CardTitle>
              <p className="text-sm text-brand-slate mt-1">
                Summarized results across all sequential artifact pairs.
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted text-brand-slate text-left">
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider uppercase">Sequential Phase</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider uppercase">Confidence</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider uppercase">Mapped Items</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider uppercase">Identified Gaps</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.pairLabel}
                    className={cn(
                      "border-b last:border-0 cursor-pointer transition-colors",
                      selectedPair === row.pairLabel ? "bg-red-50/50" : "hover:bg-muted/40"
                    )}
                    onClick={() => setSelectedPair(row.pairLabel === selectedPair ? null : row.pairLabel)}
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-brand-navy">{row.pairLabel}</p>
                      <p className="text-xs text-brand-slate uppercase tracking-wider mt-0.5">{row.phaseLabel}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-block bg-muted border rounded-full px-3 py-0.5 text-sm font-semibold text-brand-navy">
                        {row.confidence}%
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-lg text-brand-navy">{row.mappedItems}</td>
                    <td className="px-4 py-4 font-bold text-lg">
                      <span className={row.identifiedGaps > 0 ? "text-red-500" : "text-green-600"}>
                        {row.identifiedGaps}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <PhaseStatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Right: Phase Summary panel */}
        {selectedRow && (
          <div className="rounded-xl border bg-card p-5 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-widest text-brand-slate uppercase mb-2">
                  Phase Summary
                </p>
                <h3 className="text-2xl font-bold text-brand-navy">{selectedRow.pairLabel}</h3>
                <p className="text-sm text-brand-slate mt-0.5">{selectedRow.phaseLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPair(null)}
                className="rounded-full p-1.5 hover:bg-muted transition-colors shrink-0"
              >
                <X className="h-4 w-4 text-brand-slate" />
              </button>
            </div>

            {/* 3 mini stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className={cn("text-xl font-bold", getScoreColor(selectedRow.confidence))}>
                  {selectedRow.confidence}%
                </p>
                <p className="text-xs text-brand-slate uppercase tracking-wider mt-1">Confidence</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-xl font-bold text-brand-navy">{selectedRow.mappedItems}</p>
                <p className="text-xs text-brand-slate uppercase tracking-wider mt-1">Mapped Items</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className={cn("text-xl font-bold", selectedRow.identifiedGaps > 0 ? "text-red-500" : "text-green-600")}>
                  {selectedRow.identifiedGaps}
                </p>
                <p className="text-xs text-brand-slate uppercase tracking-wider mt-1">Gaps Found</p>
              </div>
            </div>

            {/* Phase Diagnostic */}
            {phaseGaps.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Activity className="h-3.5 w-3.5 text-brand-slate" />
                  <p className="text-xs font-semibold tracking-widest text-brand-slate uppercase">
                    Phase Diagnostic
                  </p>
                </div>
                <div className="rounded-lg bg-muted border p-3">
                  <p className="text-sm text-brand-navy/90 leading-relaxed">
                    {phaseGaps[0].description}
                  </p>
                </div>
              </div>
            )}

            {/* Gaps Detected list */}
            {phaseGaps.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    <p className="text-xs font-semibold tracking-widest text-brand-slate uppercase">
                      Gaps Detected
                    </p>
                  </div>
                  <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                    {phaseGaps.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {phaseGaps.map((gap) => (
                    <div key={gap.id} className="rounded-lg border border-red-100 bg-red-50/40 p-3">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                        {gap.type.replaceAll("_", " ")}
                      </p>
                      <p className="text-sm text-brand-navy/90">{gap.description}</p>
                      {gap.upstreamExcerpt && (
                        <p className="mt-2 text-xs text-brand-slate bg-white rounded px-2 py-1 border border-red-100 line-clamp-2">
                          {gap.upstreamExcerpt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm text-green-700 font-medium">No gaps detected for this phase</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
