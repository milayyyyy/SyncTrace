"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import { adviserApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ReadinessBadge } from "@/components/shared/status-badge";
import { getScoreColor, cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function FacultyOversightDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [search, setSearch] = useState("");

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["adviser-groups"],
    queryFn: adviserApi.getGroups,
  });

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
    else if (user?.role !== "FACULTY_ADVISER") router.replace("/");
  }, [isAuthenticated, user, router]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.teamCode.toLowerCase().includes(q)
    );
  }, [groups, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Faculty Oversight"
        subtitle="Monitor assigned capstone groups and continuity audit status"
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-slate/70" />
        <Input
          placeholder="Search by project name or team code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="rounded-lg border overflow-hidden">
          <div className="animate-pulse divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/40" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-brand-slate/40 mx-auto mb-4" />
            <p className="font-medium text-brand-slate">No groups assigned</p>
            <p className="text-sm text-brand-slate mt-1">
              Contact your department admin if you expect assigned student groups.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-brand-slate text-left border-b">
                <th className="px-4 py-3 font-medium">Student Group</th>
                <th className="px-4 py-3 font-medium">Health Score</th>
                <th className="px-4 py-3 font-medium">Unresolved Issues</th>
                <th className="px-4 py-3 font-medium">Readiness Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((group) => (
                <tr
                  key={group.workspaceId}
                  className="border-b last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => router.push(`/adviser/groups/${group.workspaceId}`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-brand-slate">{group.teamCode}</p>
                    <p className="font-semibold text-brand-navy mt-0.5">{group.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={group.overallAlignmentScore} className="w-20 h-2" />
                      <span className={cn("font-bold text-xs tabular-nums", getScoreColor(group.overallAlignmentScore))}>
                        {group.overallAlignmentScore.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("font-bold", group.totalCriticalGaps > 0 ? "text-status-fail" : "text-status-pass")}>
                      {group.totalCriticalGaps}
                    </span>
                    <span className="text-brand-slate ml-1 text-xs">
                      {group.totalCriticalGaps === 1 ? "critical gap" : "critical gaps"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ReadinessBadge status={group.readinessStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
