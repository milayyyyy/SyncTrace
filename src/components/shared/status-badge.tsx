import { Badge } from "@/components/ui/badge";
import type { GapSeverity, GapType, MappingStatus, ReadinessStatus } from "@/types";

const mappingLabels: Record<MappingStatus, string> = {
  MAPPED: "Mapped",
  PARTIAL: "Partial",
  NOT_MAPPED: "Not Mapped",
};

const mappingVariants: Record<MappingStatus, "pass" | "partial" | "fail"> = {
  MAPPED: "pass",
  PARTIAL: "partial",
  NOT_MAPPED: "fail",
};

const severityVariants: Record<GapSeverity, "critical" | "partial" | "info"> = {
  CRITICAL: "critical",
  WARNING: "partial",
  INFO: "info",
};

const readinessLabels: Record<ReadinessStatus, string> = {
  READY_FOR_REVIEW: "Ready for Review",
  NEEDS_REVISION: "Needs Revision",
  CRITICAL_GAPS_EXIST: "Critical Gaps Exist",
};

const readinessVariants: Record<ReadinessStatus, "ready" | "revision" | "fail"> = {
  READY_FOR_REVIEW: "ready",
  NEEDS_REVISION: "revision",
  CRITICAL_GAPS_EXIST: "fail",
};

const gapTypeVariants: Partial<Record<GapType, "drift" | "critical" | "ai">> = {
  TERMINOLOGY_DRIFT: "drift",
  SEMANTIC_CONTRADICTION: "ai",
};

export function MappingStatusBadge({ status }: { status: MappingStatus }) {
  return <Badge variant={mappingVariants[status]}>{mappingLabels[status]}</Badge>;
}

export function SeverityBadge({ severity }: { severity: GapSeverity }) {
  return <Badge variant={severityVariants[severity]}>{severity}</Badge>;
}

export function ReadinessBadge({ status }: { status: ReadinessStatus }) {
  return <Badge variant={readinessVariants[status]}>{readinessLabels[status]}</Badge>;
}

export function GapTypeBadge({ type }: { type: GapType }) {
  const variant = gapTypeVariants[type] ?? "partial";
  return (
    <Badge variant={variant}>
      {type.replace(/_/g, " ")}
    </Badge>
  );
}
