"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  FileCheck2,
  FileSearch,
  FolderOpen,
  GitBranch,
  LayoutDashboard,
  ShieldAlert,
  Upload,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ReadinessBadge,
  MappingStatusBadge,
  SeverityBadge,
} from "@/components/shared/status-badge";
import {
  MOCK_AUDITS_MAP,
  MOCK_AUDIT,
  MOCK_GAPS_MAP,
  MOCK_GAPS,
  MOCK_WORKSPACES,
  ARTIFACT_PAIRS_MAP,
  ARTIFACT_PAIRS,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-600";
  if (score >= 65) return "text-amber-500";
  return "text-red-500";
}

function scoreBarColor(score: number) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 65) return "bg-amber-400";
  return "bg-red-500";
}

function gapCardClass(severity: string) {
  if (severity === "CRITICAL") return "border border-l-4 border-l-red-400 bg-red-50/40";
  if (severity === "WARNING") return "border border-l-4 border-l-amber-400 bg-amber-50/40";
  return "border border-l-4 border-l-slate-300 bg-muted/20";
}

function DashboardContent() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { workspace, setWorkspace } = useWorkspaceStore();
  const searchParams = useSearchParams();
  const wsParam = searchParams.get("ws");

  const currentWs =
    (wsParam ? MOCK_WORKSPACES.find((w) => w.id === wsParam) : workspace) ??
    MOCK_WORKSPACES[0];
  const workspaceId = currentWs.id;
  const wsAudit = MOCK_AUDITS_MAP[workspaceId] ?? MOCK_AUDITS_MAP["ws-1"] ?? MOCK_AUDIT;
  const wsGaps = MOCK_GAPS_MAP[workspaceId] ?? MOCK_GAPS_MAP["ws-1"] ?? MOCK_GAPS;
  const wsPairs = ARTIFACT_PAIRS_MAP[workspaceId] ?? ARTIFACT_PAIRS_MAP["ws-1"] ?? ARTIFACT_PAIRS;

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    if (pickerOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [pickerOpen]);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
    if (user?.role === "FACULTY_ADVISER") router.replace("/adviser/dashboard");
  }, [isAuthenticated, user, router]);

  const activeGaps = (wsGaps ?? []).filter((g) => !g.isResolved).sort((a, b) => {
    const order: Record<string, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    return order[a.severity] - order[b.severity];
  });

  const lastAudit = new Date(wsAudit.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6 pb-10">
      {/* ── Project Selector ── */}
      <div className="relative" ref={pickerRef}>
        <p className="text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-2">
          Active Project
        </p>
        <button
          type="button"
          onClick={() => setPickerOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-xl border border-border bg-white px-4 py-2.5 shadow-sm hover:border-brand-gold/50 hover:shadow-md transition-all w-full sm:w-auto max-w-sm"
        >
          <FolderOpen className="h-4 w-4 shrink-0 text-brand-navy/60" />
          <span className="flex-1 text-left text-sm font-semibold text-brand-navy truncate">
            {currentWs.title}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-brand-slate transition-transform",
              pickerOpen && "rotate-180"
            )}
          />
        </button>

        {pickerOpen && (
          <div className="absolute left-0 top-full mt-1.5 z-50 w-80 rounded-xl border border-border bg-white shadow-xl overflow-hidden">
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold text-brand-slate uppercase tracking-wider">
                Switch Project
              </p>
              {MOCK_WORKSPACES.map((ws) => {
                const isActive = ws.id === workspaceId;
                return (
                  <Link
                    key={ws.id}
                    href={`/dashboard?ws=${ws.id}`}
                    onClick={() => {
                      setWorkspace(ws);
                      setPickerOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 transition-colors",
                      isActive
                        ? "bg-brand-navy/5"
                        : "hover:bg-muted/60"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        isActive ? "bg-brand-navy" : "bg-brand-navy/8"
                      )}
                    >
                      <FolderOpen
                        className={cn(
                          "h-3.5 w-3.5",
                          isActive ? "text-white" : "text-brand-navy"
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm truncate",
                          isActive
                            ? "font-semibold text-brand-navy"
                            : "font-medium text-brand-navy"
                        )}
                      >
                        {ws.title}
                      </p>
                      <p className="text-[10px] font-mono text-brand-slate/60 mt-0.5">
                        {ws.teamCode}
                      </p>
                    </div>
                    {isActive && (
                      <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    )}
                  </Link>
                );
              })}
              <div className="h-2" />
            </div>
          )}
      </div>

      {/* ── Header ── */}
      <PageHeader
        icon={LayoutDashboard}
        title={currentWs.title}
        subtitle={`${currentWs.adviserName} · ${currentWs.members.length} members · Audited ${lastAudit}`}
        badge={<ReadinessBadge status={wsAudit.readinessStatus} />}
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Overall Alignment",
            value: `${wsAudit.overallAlignmentScore}%`,
            sub: "of 100% target",
            icon: BarChart3,
            valueColor: scoreColor(wsAudit.overallAlignmentScore),
            topAccent: "border-t-brand-navy",
            iconBg: "bg-brand-navy/8",
            iconColor: "text-brand-navy",
            href: `/workspace/${workspaceId}/audit`,
          },
          {
            label: "Critical Gaps",
            value: wsAudit.totalCriticalGaps,
            sub: "unresolved issues",
            icon: ShieldAlert,
            valueColor: "text-red-600",
            topAccent: "border-t-red-400",
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
            href: `/workspace/${workspaceId}/gaps`,
          },
          {
            label: "Warnings",
            value: wsAudit.totalWarningGaps,
            sub: "flagged items",
            icon: AlertTriangle,
            valueColor: "text-amber-600",
            topAccent: "border-t-amber-400",
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500",
            href: `/workspace/${workspaceId}/gaps`,
          },
          {
            label: "Artifacts",
            value: "6 / 6",
            sub: "documents complete",
            icon: FileCheck2,
            valueColor: "text-emerald-600",
            topAccent: "border-t-emerald-500",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
            href: `/workspace/${workspaceId}/artifacts`,
          },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card
              className={cn(
                "hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full border-t-2",
                stat.topAccent
              )}
            >
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-[10px] font-semibold text-brand-slate uppercase tracking-wider leading-tight">
                    {stat.label}
                  </p>
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      stat.iconBg
                    )}
                  >
                    <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
                  </div>
                </div>
                <p className={cn("text-2xl font-bold leading-none", stat.valueColor)}>
                  {stat.value}
                </p>
                <p className="text-[11px] text-brand-slate/55 mt-1.5">{stat.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Traceability map */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Traceability Map</CardTitle>
              <p className="text-xs text-brand-slate mt-0.5">
                5 artifact pairs · alignment scores
              </p>
            </div>
            <Link href={`/workspace/${workspaceId}/audit`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                Full Report <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {wsPairs.map((pair) => {
              const score = Math.round(pair.alignmentScore * 100);
              return (
                <div key={pair.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <GitBranch className="h-3.5 w-3.5 shrink-0 text-brand-slate/60" />
                      <span className="text-sm font-medium text-brand-navy truncate">
                        {pair.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <MappingStatusBadge status={pair.status} />
                      <span className={cn("text-sm font-bold w-10 text-right", scoreColor(score))}>
                        {score}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", scoreBarColor(score))}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-brand-slate/60 w-24 shrink-0 text-right">
                      {pair.linkCount} links · {pair.coveragePercentage}% cov.
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Active issues */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active Issues</CardTitle>
              <Link href={`/workspace/${workspaceId}/gaps`}>
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 px-2">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-brand-slate">
              {activeGaps.length} unresolved · sorted by severity
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeGaps.map((gap) => (
              <div
                key={gap.id}
                className={cn("rounded-xl p-3.5 space-y-2", gapCardClass(gap.severity))}
              >
                <div className="flex items-start justify-between gap-2">
                  <SeverityBadge severity={gap.severity} />
                  <span className="text-[11px] font-mono text-brand-slate/60 shrink-0">
                    {gap.pairLabel}
                  </span>
                </div>
                <p className="text-xs text-brand-slate leading-relaxed line-clamp-2">
                  {gap.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Team members */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentWs.members.map((member, i) => (
                <div key={member.userId} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      ["bg-brand-navy text-white", "bg-violet-600 text-white", "bg-teal-600 text-white"][i % 3]
                    )}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-navy truncate">{member.name}</p>
                    <p className="text-xs text-brand-slate truncate">{member.email}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      member.role === "LEADER"
                        ? "bg-brand-gold/15 text-brand-gold"
                        : "bg-muted text-brand-slate"
                    )}
                  >
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              {
                href: `/workspace/${workspaceId}/artifacts`,
                icon: Upload,
                label: "Manage Artifacts",
                desc: "Upload or update documents",
              },
              {
                href: `/workspace/${workspaceId}/gaps`,
                icon: ShieldAlert,
                label: "View Gap Analysis",
                desc: "Review and resolve issues",
              },
              {
                href: `/workspace/${workspaceId}/audit`,
                icon: FileSearch,
                label: "Open Audit Report",
                desc: "Full traceability report",
              },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-3 rounded-xl border border-border p-3.5 hover:bg-muted/40 hover:border-brand-navy/20 transition-colors cursor-pointer group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/8 group-hover:bg-brand-navy/15 transition-colors">
                    <action.icon className="h-4 w-4 text-brand-navy/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-navy">{action.label}</p>
                    <p className="text-xs text-brand-slate">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-brand-slate/40 shrink-0 group-hover:text-brand-navy/60 transition-colors" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}