"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import { adviserApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ReadinessBadge } from "@/components/shared/status-badge";
import { formatDate, getScoreColor, cn } from "@/lib/utils";
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-40" />
          ))}
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((group) => (
            <Link key={group.workspaceId} href={`/adviser/groups/${group.workspaceId}`}>
              <Card className="h-full hover:shadow-md hover:border-brand-navy/20 transition-all cursor-pointer">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-brand-slate">{group.teamCode}</p>
                      <p className="font-semibold text-brand-navy mt-1 line-clamp-2">{group.title}</p>
                    </div>
                    <ReadinessBadge status={group.readinessStatus} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-brand-slate mb-1">
                      <span>Health Score</span>
                      <span className={cn("font-bold", getScoreColor(group.overallAlignmentScore))}>
                        {group.overallAlignmentScore.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={group.overallAlignmentScore} className="h-2" />
                  </div>
                  <div className="flex justify-between text-xs text-brand-slate">
                    <span>{group.totalCriticalGaps} critical gaps</span>
                    <span>Last audit: {formatDate(group.lastAuditAt)}</span>
                  </div>
                  <p className="text-sm text-brand-navy font-medium">View Report →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
