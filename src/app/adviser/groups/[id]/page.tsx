"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, GitBranch, Loader2 } from "lucide-react";
import { adviserApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { ExportReportButton } from "@/components/shared/export-report-button";
import { ReadinessBadge, SeverityBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { isAuthenticated, user } = useAuthStore();

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

  const { group, audit, gaps, links, recommendations } = data;

  return (
    <div className="space-y-6">
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
          title={group.title}
          subtitle={group.teamCode}
          actions={<ExportReportButton workspaceId={workspaceId} teamCode={group.teamCode} />}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-brand-slate">Alignment Score</p>
            <p className="text-3xl font-bold text-brand-navy mt-1">
              {audit.overallAlignmentScore.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-slate">Readiness</p>
              <div className="mt-2">
                <ReadinessBadge status={audit.readinessStatus} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-brand-slate">Open Gaps</p>
            <p className="text-3xl font-bold text-status-fail mt-1">
              {audit.totalCriticalGaps + audit.totalWarningGaps}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traceability Report</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted text-brand-slate text-left">
                <th className="p-3">Upstream Excerpt</th>
                <th className="p-3">Downstream Excerpt</th>
                <th className="p-3">Similarity</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b">
                  <td className="p-3 text-xs max-w-xs">{link.upstreamExcerpt}</td>
                  <td className="p-3 text-xs max-w-xs">{link.downstreamExcerpt}</td>
                  <td className="p-3 font-semibold text-brand-navy">
                    {(link.similarityScore * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Continuity Gaps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gaps.slice(0, 5).map((gap) => (
              <div key={gap.id} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={gap.severity} />
                  <span className="text-xs text-brand-slate">{gap.pairLabel}</span>
                </div>
                <p className="text-sm text-brand-navy/90">{gap.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Audit Diagnostic Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="rounded-lg bg-muted border p-4">
                <p className="text-xs font-medium text-brand-slate mb-1">
                  Priority {rec.priority} · {rec.actionType.replace(/_/g, " ")}
                </p>
                <p className="text-sm font-medium text-brand-navy mb-2">{rec.rootCause}</p>
                <p className="text-sm text-brand-slate">{rec.recommendationText}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
