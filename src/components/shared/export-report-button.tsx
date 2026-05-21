"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { exportApi } from "@/lib/api";

interface ExportReportButtonProps {
  workspaceId: string;
  teamCode?: string;
}

const STAGES = [
  "Initializing report engine...",
  "Collecting audit data...",
  "Building traceability matrix...",
  "Rendering PDF pages...",
  "Finalizing document...",
];

type ModalState = "idle" | "generating" | "ready" | "error";

export function ExportReportButton({ workspaceId, teamCode }: ExportReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("idle");
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const blobRef = useRef<Blob | null>(null);

  // Animate progress bar while generating
  useEffect(() => {
    if (modalState !== "generating") return;
    setProgress(0);
    setStageIndex(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        // Advance stage label at each 20% mark (up to 80%)
        setStageIndex(Math.min(Math.floor(next / 20), STAGES.length - 1));
        if (next >= 90) {
          clearInterval(interval);
          return 90; // hold at 90 until fetch completes
        }
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [modalState]);

  const handleOpen = async () => {
    blobRef.current = null;
    setModalState("generating");
    setOpen(true);

    try {
      const blob = await exportApi.downloadPdf(workspaceId);
      blobRef.current = blob;
      setProgress(100);
      setStageIndex(STAGES.length - 1);
      setModalState("ready");
    } catch {
      setModalState("error");
    }
  };

  const handleDownload = () => {
    if (!blobRef.current) return;
    const url = URL.createObjectURL(blobRef.current);
    const a = document.createElement("a");
    a.href = url;
    a.download = `synctrace-audit-${teamCode ?? workspaceId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
    setModalState("idle");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(false);
      setModalState("idle");
      setProgress(0);
      setStageIndex(0);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="gap-2">
        <Download className="h-4 w-4" />
        Export Report
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-navy" />
              Export Audit Report
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={modalState === "ready" ? 100 : progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-brand-slate">
                <span>{modalState === "ready" ? "Complete" : STAGES[stageIndex]}</span>
                <span className="tabular-nums font-medium">{modalState === "ready" ? 100 : progress}%</span>
              </div>
            </div>

            {/* State content */}
            {modalState === "generating" && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-brand-slate">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF, please wait…
              </div>
            )}

            {modalState === "ready" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Report ready</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      {teamCode ?? workspaceId} · PDF document
                    </p>
                  </div>
                </div>
                <Button onClick={handleDownload} className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            )}

            {modalState === "error" && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                Failed to generate report. Please try again.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
