export type UserRole = "STUDENT" | "FACULTY_ADVISER";

export type ArtifactType =
  | "PROPOSAL"
  | "SRS"
  | "SDD"
  | "SPMP"
  | "STD"
  | "SOURCE_CODE";

export type ProcessingStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETE"
  | "FAILED";

export type MappingStatus = "MAPPED" | "PARTIAL" | "NOT_MAPPED";

export type GapSeverity = "CRITICAL" | "WARNING" | "INFO";

export type GapType =
  | "MISSING_LINK"
  | "SEMANTIC_CONTRADICTION"
  | "IMPLEMENTATION_DISCREPANCY"
  | "TERMINOLOGY_DRIFT"
  | "DOWNSTREAM_OMISSION";

export type ReadinessStatus =
  | "READY_FOR_REVIEW"
  | "NEEDS_REVISION"
  | "CRITICAL_GAPS_EXIST";

export type ActionType =
  | "REWRITE_DOCUMENT_SECTION"
  | "ADD_MISSING_SECTION"
  | "FIX_CODE_LOGIC"
  | "ALIGN_TERMINOLOGY"
  | "ADD_TEST_CASE";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Workspace {
  id: string;
  title: string;
  teamCode: string;
  adviserId: string;
  adviserName: string;
  createdBy: string;
  createdAt: string;
  members: WorkspaceMember[];
}

export interface WorkspaceMember {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export interface Artifact {
  id: string;
  workspaceId: string;
  type: ArtifactType;
  url: string;
  status: ProcessingStatus;
  errorMessage?: string;
}

export interface ProcessingJob {
  id: string;
  workspaceId: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETE" | "FAILED";
  currentStep: string;
  errorMessage?: string;
}

export interface TraceabilityPair {
  upstream: ArtifactType;
  downstream: ArtifactType;
  label: string;
  status: MappingStatus;
  alignmentScore: number;
  coveragePercentage: number;
  linkCount: number;
}

export interface TraceabilityLink {
  id: string;
  upstreamExcerpt: string;
  downstreamExcerpt: string;
  similarityScore: number;
}

export interface ContinuityGap {
  id: string;
  type: GapType;
  pairLabel: string;
  description: string;
  severity: GapSeverity;
  upstreamExcerpt?: string;
  downstreamExcerpt?: string;
  isResolved: boolean;
}

export interface Recommendation {
  id: string;
  gapId: string;
  rootCause: string;
  actionType: ActionType;
  recommendationText: string;
  priority: number;
  isAcknowledged: boolean;
}

export interface DiagnosticResult {
  gapId: string;
  rootCause: string;
  recommendations: Recommendation[];
}

export interface PairScore {
  pairLabel: string;
  alignmentScore: number;
  coveragePercentage: number;
  criticalGapCount: number;
  warningGapCount: number;
  readinessStatus: ReadinessStatus;
}

export interface AuditResult {
  id: string;
  workspaceId: string;
  overallAlignmentScore: number;
  totalCriticalGaps: number;
  totalWarningGaps: number;
  readinessStatus: ReadinessStatus;
  pairScores: PairScore[];
  createdAt: string;
}

export interface GroupSummary {
  workspaceId: string;
  title: string;
  teamCode: string;
  overallAlignmentScore: number;
  readinessStatus: ReadinessStatus;
  lastAuditAt: string;
  totalCriticalGaps: number;
}

export interface Adviser {
  id: string;
  name: string;
  email: string;
}
