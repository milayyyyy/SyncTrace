"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, FolderOpen, Loader2, Play, Upload } from "lucide-react";
import { artifactApi } from "@/lib/api";
import { ARTIFACT_LABELS, ARTIFACT_URLS_MAP, MOCK_WORKSPACES } from "@/lib/mock-data";
import type { ArtifactType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessingStatusModal } from "@/components/artifacts/processing-status-modal";
import { useAuthStore } from "@/store/auth-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

const ARTIFACT_TYPES: ArtifactType[] = [
  "PROPOSAL",
  "SRS",
  "SDD",
  "SPMP",
  "STD",
  "SOURCE_CODE",
];

export default function ArtifactSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const { setWorkspace } = useWorkspaceStore();

  const defaultUrls = ARTIFACT_URLS_MAP[workspaceId] ?? ARTIFACT_URLS_MAP["ws-1"];
  const currentWs = MOCK_WORKSPACES.find((w) => w.id === workspaceId) ?? MOCK_WORKSPACES[0];

  const [urls, setUrls] = useState<Record<ArtifactType, string>>(defaultUrls);
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<ArtifactType, string>>>({});
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

  // Reset URLs when workspace changes
  useEffect(() => {
    setUrls(ARTIFACT_URLS_MAP[workspaceId] ?? ARTIFACT_URLS_MAP["ws-1"]);
  }, [workspaceId]);

  const { data: artifacts, isLoading } = useQuery({
    queryKey: ["artifacts", workspaceId],
    queryFn: () => artifactApi.getByWorkspace(workspaceId),
  });

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
    if (artifacts?.length) {
      const populated: Record<ArtifactType, string> = {
        ...(ARTIFACT_URLS_MAP[workspaceId] ?? ARTIFACT_URLS_MAP["ws-1"]),
      };
      artifacts.forEach((a) => {
        populated[a.type] = a.url;
      });
      setUrls(populated);
    }
  }, [isAuthenticated, artifacts, router, workspaceId]);

  const handleSubmit = async () => {
    const newErrors: Partial<Record<ArtifactType, string>> = {};
    ARTIFACT_TYPES.forEach((type) => {
      if (!urls[type]?.trim()) newErrors[type] = "URL is required";
      else if (!urls[type].startsWith("http")) newErrors[type] = "Enter a valid URL";
    });
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setProcessing(true);
    setShowModal(true);
    await artifactApi.submit(workspaceId, urls);
  };

  const handleComplete = () => {
    setShowModal(false);
    setProcessing(false);
    router.push(`/workspace/${workspaceId}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── Project Picker ── */}
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
                  href={`/workspace/${ws.id}/artifacts`}
                  onClick={() => {
                    setWorkspace(ws);
                    setPickerOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 transition-colors",
                    isActive ? "bg-brand-navy/5" : "hover:bg-muted/60"
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
                        isActive ? "font-semibold text-brand-navy" : "font-medium text-brand-navy"
                      )}
                    >
                      {ws.title}
                    </p>
                    <p className="text-[10px] font-mono text-brand-slate/60 mt-0.5">
                      {ws.teamCode}
                    </p>
                  </div>
                  {isActive && <Check className="h-4 w-4 text-brand-gold shrink-0" />}
                </Link>
              );
            })}
            <div className="h-2" />
          </div>
        )}
      </div>

      <PageHeader
        icon={Upload}
        title="Artifact Submission"
        subtitle="Provide Google Drive links for documents and a GitHub URL for source code"
      />

      <Card>
        <CardHeader>
          <CardTitle>Artifact URLs</CardTitle>
          <CardDescription>
            All six artifact types are required before running traceability analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
            </div>
          ) : (
            ARTIFACT_TYPES.map((type) => (
              <div key={type} className="space-y-1.5">
                <Label htmlFor={type}>{ARTIFACT_LABELS[type]}</Label>
                <Input
                  id={type}
                  value={urls[type]}
                  onChange={(e) => setUrls((prev) => ({ ...prev, [type]: e.target.value }))}
                  placeholder={
                    type === "SOURCE_CODE"
                      ? "https://github.com/org/repo"
                      : "https://docs.google.com/document/d/..."
                  }
                />
                {errors[type] && (
                  <p className="text-sm text-status-fail">{errors[type]}</p>
                )}
              </div>
            ))
          )}

          <Button
            className="w-full mt-4"
            onClick={handleSubmit}
            disabled={processing || isLoading}
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Traceability
          </Button>
        </CardContent>
      </Card>

      <ProcessingStatusModal open={showModal} onComplete={handleComplete} />
    </div>
  );
}
