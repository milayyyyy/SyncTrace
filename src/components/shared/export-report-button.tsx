"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { exportApi } from "@/lib/api";

interface ExportReportButtonProps {
  workspaceId: string;
  teamCode?: string;
}

export function ExportReportButton({ workspaceId, teamCode }: ExportReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await exportApi.downloadPdf(workspaceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `synctrace-audit-${teamCode ?? workspaceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Audit report downloaded successfully");
    } catch {
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={loading} className="gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {loading ? "Generating..." : "Export Report"}
    </Button>
  );
}
