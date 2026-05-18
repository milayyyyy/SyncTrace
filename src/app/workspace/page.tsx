"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FolderOpen,
  Hash,
  Layers,
  Plus,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MOCK_WORKSPACES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Mode = "join" | "create";

function roleChip(role: string) {
  if (role === "LEADER")
    return "bg-brand-gold/15 text-brand-gold border border-brand-gold/30";
  return "bg-brand-navy/8 text-brand-navy/55 border border-brand-navy/12";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function WorkspaceListPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { setWorkspace } = useWorkspaceStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("join");
  const [teamCode, setTeamCode] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
    if (user?.role === "FACULTY_ADVISER") router.replace("/adviser/dashboard");
  }, [isAuthenticated, user, router]);

  const resetDialog = () => {
    setTeamCode("");
    setProjectTitle("");
    setError("");
    setSuccess("");
    setJoining(false);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetDialog();
  };

  const handleJoin = () => {
    setError("");
    const code = teamCode.trim();
    if (!code) {
      setError("Please enter a team code.");
      return;
    }
    const found = MOCK_WORKSPACES.find(
      (w) => w.teamCode.toLowerCase() === code.toLowerCase()
    );
    if (!found) {
      setError("No workspace found with that code. Double-check and try again.");
      return;
    }
    setJoining(true);
    setWorkspace(found);
    setTimeout(() => {
      setDialogOpen(false);
      resetDialog();
      router.push("/dashboard");
    }, 800);
  };

  const handleCreate = () => {
    const title = projectTitle.trim();
    setDialogOpen(false);
    resetDialog();
    router.push(`/workspace/setup${title ? `?title=${encodeURIComponent(title)}` : ""}`);
  };

  const totalWs = MOCK_WORKSPACES.length;
  const leaderCount = MOCK_WORKSPACES.filter(
    (w) => w.members.find((m) => m.email === user?.email)?.role === "LEADER"
  ).length;

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        {/* Top accent band */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-navy via-brand-navy/70 to-brand-gold/60" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-navy">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-navy">My Workspaces</h1>
              <p className="text-sm text-brand-slate mt-0.5">
                {totalWs} active project{totalWs !== 1 ? "s" : ""}
                {leaderCount > 0 && (
                  <> · <span className="text-brand-gold font-medium">{leaderCount} as leader</span></>
                )}
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-brand-navy hover:bg-brand-navy/90 text-white gap-2 self-start sm:self-auto shrink-0">
                <Plus className="h-4 w-4" />
                Join / Create
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-brand-navy">
                  {mode === "join" ? "Join a Workspace" : "Create a Workspace"}
                </DialogTitle>
              </DialogHeader>

              {/* Tab switcher */}
              <div className="flex rounded-lg border border-border overflow-hidden text-sm font-medium">
                {(["join", "create"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setError("");
                      setSuccess("");
                    }}
                    className={cn(
                      "flex-1 py-2 transition-colors",
                      mode === m
                        ? "bg-brand-navy text-white"
                        : "bg-white text-brand-slate hover:bg-muted/60"
                    )}
                  >
                    {m === "join" ? "Join with Code" : "Create New"}
                  </button>
                ))}
              </div>

              {mode === "join" ? (
                <div className="space-y-4 pt-1">
                  <p className="text-sm text-brand-slate">
                    Enter the team code shared by your group leader to join their
                    workspace.
                  </p>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="teamCode"
                      className="text-xs font-semibold text-brand-navy"
                    >
                      Team Code
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-slate/40" />
                      <Input
                        id="teamCode"
                        placeholder="e.g. 2526-sem2-it332-08"
                        value={teamCode}
                        onChange={(e) => setTeamCode(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                        className="pl-9 font-mono text-sm"
                        autoComplete="off"
                        disabled={joining}
                      />
                    </div>
                    {error && (
                      <p className="text-xs text-red-500 mt-1">{error}</p>
                    )}
                  </div>
                  <Button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white"
                  >
                    {joining ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-brand-gold animate-pulse" />
                        Joining…
                      </span>
                    ) : (
                      "Join Workspace"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  <p className="text-sm text-brand-slate">
                    Create a new workspace for your capstone team. You will be set as
                    the group leader and can invite members via a team code.
                  </p>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="projectTitle"
                      className="text-xs font-semibold text-brand-navy"
                    >
                      Project Title
                    </Label>
                    <Input
                      id="projectTitle"
                      placeholder="e.g. Hospital Information System"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                      disabled={!!success}
                    />
                    {error && (
                      <p className="text-xs text-red-500 mt-1">{error}</p>
                    )}
                    {success && (
                      <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {success}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={!!success}
                    className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white"
                  >
                    Create Workspace
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MOCK_WORKSPACES.map((ws) => {
          const myRole =
            ws.members.find((m) => m.email === user?.email)?.role ?? "MEMBER";
          return (
            <Link
              key={ws.id}
              href={`/workspace/${ws.id}`}
              className="group block focus:outline-none"
            >
              <Card className="bg-white border-border hover:border-brand-navy/25 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
                <CardContent className="p-5 flex flex-col gap-4 h-full">
                  {/* Icon row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/8">
                        <FolderOpen className="h-4 w-4 text-brand-navy/60" />
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2.5 py-0.5 rounded-full",
                          roleChip(myRole)
                        )}
                      >
                        {myRole}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-brand-slate/25 group-hover:text-brand-navy/60 transition-colors shrink-0 mt-0.5" />
                  </div>

                  {/* Title */}
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-brand-navy leading-snug line-clamp-2">
                      {ws.title}
                    </h2>
                    <p className="text-[11px] font-mono text-brand-slate/50 mt-1">
                      {ws.teamCode}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="space-y-2 border-t border-border pt-3">
                    <div className="flex items-center gap-2 text-[11px] text-brand-slate/65">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {ws.members.length} members · {ws.adviserName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-brand-slate/65">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>Created {formatDate(ws.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
