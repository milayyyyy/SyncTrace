"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Eye, Loader2, RefreshCw } from "lucide-react";
import { traceabilityApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MappingStatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TraceabilityLink } from "@/types";

interface TraceabilityStatusPanelProps {
  workspaceId: string;
}

export function TraceabilityStatusPanel({ workspaceId }: TraceabilityStatusPanelProps) {
  const queryClient = useQueryClient();
  const [selectedPair, setSelectedPair] = useState<string | null>(null);
  const [links, setLinks] = useState<TraceabilityLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  const { data: pairs = [], isLoading } = useQuery({
    queryKey: ["traceability-pairs", workspaceId],
    queryFn: () => traceabilityApi.getPairs(workspaceId),
  });

  const rerunMutation = useMutation({
    mutationFn: () => traceabilityApi.rerun(workspaceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["traceability-pairs", workspaceId] }),
  });

  const handleViewLinks = async (pairLabel: string) => {
    setSelectedPair(pairLabel);
    setLoadingLinks(true);
    try {
      const data = await traceabilityApi.getLinks(workspaceId, pairLabel);
      setLinks(data);
    } finally {
      setLoadingLinks(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Sequential Traceability</CardTitle>
            <CardDescription>
              Five predefined artifact pairs with mapping status and alignment scores
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => rerunMutation.mutate()}
            disabled={rerunMutation.isPending}
          >
            {rerunMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-1">Re-run Mapping</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
            </div>
          ) : (
            pairs.map((pair) => (
              <div
                key={pair.label}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-brand-navy">
                    <span>{pair.upstream.replace("_", " ")}</span>
                    <ArrowRight className="h-4 w-4 text-brand-slate/70 shrink-0" />
                    <span>{pair.downstream.replace("_", " ")}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={pair.alignmentScore * 100} className="h-1.5 flex-1 max-w-xs" />
                    <span className="text-xs text-brand-slate">
                      {(pair.alignmentScore * 100).toFixed(0)}% · {pair.coveragePercentage}% coverage · {pair.linkCount} links
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <MappingStatusBadge status={pair.status} />
                  <Button variant="ghost" size="sm" onClick={() => handleViewLinks(pair.label)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Links
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPair} onOpenChange={() => setSelectedPair(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Traceability Links — {selectedPair}</DialogTitle>
          </DialogHeader>
          {loadingLinks ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <div key={link.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-brand-slate">Similarity</span>
                    <span className="text-sm font-bold text-brand-navy">
                      {(link.similarityScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-brand-navy/5 rounded p-2">
                      <p className="font-medium text-brand-navy mb-1">Upstream</p>
                      <p className="text-brand-slate">{link.upstreamExcerpt}</p>
                    </div>
                    <div className="bg-brand-emerald/10 rounded p-2">
                      <p className="font-medium text-brand-emerald mb-1">Downstream</p>
                      <p className="text-brand-slate">{link.downstreamExcerpt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
