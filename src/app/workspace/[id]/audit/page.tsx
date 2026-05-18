"use client";

import { Fragment, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, BarChart3, Loader2 } from "lucide-react";
import { auditApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { ExportReportButton } from "@/components/shared/export-report-button";
import { ReadinessBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getScoreColor, cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import type { PairScore } from "@/types";

export default function AuditDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const { workspace } = useWorkspaceStore();
  const [expandedPair, setExpandedPair] = useState<string | null>(null);
  const [pairDetail, setPairDetail] = useState<{
    traceEvidence: { upstreamExcerpt: string; downstreamExcerpt: string; similarityScore: number };
    matchedSections: string[];
    confidence: number;
  } | null>(null);

  const { data: audit, isLoading } = useQuery({
    queryKey: ["audit", workspaceId],
    queryFn: () => auditApi.get(workspaceId),
  });

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  const handleExpand = async (pair: PairScore) => {
    if (expandedPair === pair.pairLabel) {
      setExpandedPair(null);
      setPairDetail(null);
      return;
    }
    setExpandedPair(pair.pairLabel);
    const detail = await auditApi.getPairDetail(workspaceId, pair.pairLabel);
    setPairDetail(detail);
  };

  if (isLoading || !audit) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
      </div>
    );
  }

  const partialCount = audit.pairScores.filter(
    (p) => p.readinessStatus === "NEEDS_REVISION"
  ).length;
  const missingCount = audit.pairScores.filter(
    (p) => p.readinessStatus === "CRITICAL_GAPS_EXIST"
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        icon={BarChart3}
        title="Continuity Audit"
        subtitle="Project readiness matrix and trace evidence"
        actions={<ExportReportButton workspaceId={workspaceId} teamCode={workspace?.teamCode} />}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="sm:col-span-2">
          <CardContent className="pt-6">
            <p className="text-sm text-brand-slate mb-2">Overall Alignment Score</p>
            <div className="flex items-end gap-3">
              <span className={cn("text-5xl font-bold", getScoreColor(audit.overallAlignmentScore))}>
                {audit.overallAlignmentScore.toFixed(1)}%
              </span>
              <ReadinessBadge status={audit.readinessStatus} />
            </div>
            <Progress value={audit.overallAlignmentScore} className="mt-4 h-3" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-brand-slate">Critical Gaps</p>
            <p className="text-3xl font-bold text-status-fail mt-1">{audit.totalCriticalGaps}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-brand-slate">Warnings</p>
            <p className="text-3xl font-bold text-status-partial mt-1">{audit.totalWarningGaps}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-brand-slate">Partial Alignments</p>
            <p className="text-2xl font-bold text-status-partial">{partialCount} pairs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-brand-slate">Missing / Critical</p>
            <p className="text-2xl font-bold text-status-fail">{missingCount} pairs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Readiness Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted text-left text-brand-slate">
                  <th className="p-4 w-8" />
                  <th className="p-4">Artifact Pair</th>
                  <th className="p-4">Alignment</th>
                  <th className="p-4">Coverage</th>
                  <th className="p-4">Gaps</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {audit.pairScores.map((pair) => (
                  <Fragment key={pair.pairLabel}>
                    <tr
                      className="border-b hover:bg-muted cursor-pointer"
                      onClick={() => handleExpand(pair)}
                    >
                      <td className="p-4">
                        {expandedPair === pair.pairLabel ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td className="p-4 font-medium">{pair.pairLabel}</td>
                      <td className={cn("p-4 font-semibold", getScoreColor(pair.alignmentScore))}>
                        {pair.alignmentScore}%
                      </td>
                      <td className="p-4">{pair.coveragePercentage}%</td>
                      <td className="p-4 text-xs">
                        <span className="text-status-fail">{pair.criticalGapCount}C</span>
                        {" / "}
                        <span className="text-status-partial">{pair.warningGapCount}W</span>
                      </td>
                      <td className="p-4">
                        <ReadinessBadge status={pair.readinessStatus} />
                      </td>
                    </tr>
                    {expandedPair === pair.pairLabel && pairDetail && (
                      <tr>
                        <td colSpan={6} className="p-4 bg-muted">
                          <div className="space-y-4">
                            <p className="text-xs font-medium text-brand-slate">
                              Confidence: {(pairDetail.confidence * 100).toFixed(1)}%
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4 text-xs">
                              <div className="bg-white rounded-lg border p-3">
                                <p className="font-medium text-brand-navy mb-1">Upstream Evidence</p>
                                <p>{pairDetail.traceEvidence.upstreamExcerpt}</p>
                              </div>
                              <div className="bg-white rounded-lg border p-3">
                                <p className="font-medium text-brand-emerald mb-1">Downstream Evidence</p>
                                <p>{pairDetail.traceEvidence.downstreamExcerpt}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-brand-slate mb-2">Matched Sections</p>
                              <div className="flex flex-wrap gap-2">
                                {pairDetail.matchedSections.map((s) => (
                                  <span
                                    key={s}
                                    className="rounded-full bg-brand-navy/10 text-brand-navy px-2 py-0.5 text-xs"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
