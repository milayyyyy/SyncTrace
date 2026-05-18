import type {
  Adviser,
  Artifact,
  AuditResult,
  ContinuityGap,
  GroupSummary,
  Recommendation,
  TraceabilityLink,
  TraceabilityPair,
  User,
  Workspace,
} from "@/types";

export const MOCK_ADVISERS: Adviser[] = [
  { id: "adv-1", name: "Dr. Maria Santos", email: "msantos@cit.edu" },
  { id: "adv-2", name: "Prof. James Rivera", email: "jrivera@cit.edu" },
  { id: "adv-3", name: "Dr. Elena Cruz", email: "ecruz@cit.edu" },
];

export const MOCK_STUDENT: User = {
  id: "user-1",
  email: "student@cit.edu",
  name: "Camila Rose Cordero",
  role: "STUDENT",
};

export const MOCK_ADVISER: User = {
  id: "adv-1",
  email: "msantos@cit.edu",
  name: "Dr. Maria Santos",
  role: "FACULTY_ADVISER",
};

export const MOCK_WORKSPACE: Workspace = {
  id: "ws-1",
  title: "SyncTrace: Intelligent Project Continuity Assistant",
  teamCode: "2526-sem2-it332-08",
  adviserId: "adv-1",
  adviserName: "Dr. Maria Santos",
  createdBy: "user-1",
  createdAt: "2026-05-01T08:00:00Z",
  members: [
    { userId: "user-1", email: "student@cit.edu", name: "Camila Rose Cordero", role: "LEADER" },
    { userId: "user-2", email: "member2@cit.edu", name: "Niña Nicole Villadarez", role: "MEMBER" },
    { userId: "user-3", email: "member3@cit.edu", name: "Sharbelle Temperatura", role: "MEMBER" },
  ],
};

export const MOCK_WORKSPACES: Workspace[] = [
  MOCK_WORKSPACE,
  {
    id: "ws-2",
    title: "EduTrack: Learning Progress Monitoring System",
    teamCode: "2526-sem2-it332-12",
    adviserId: "adv-2",
    adviserName: "Prof. James Rivera",
    createdBy: "user-1",
    createdAt: "2026-04-15T08:00:00Z",
    members: [
      { userId: "user-1", email: "student@cit.edu", name: "Camila Rose Cordero", role: "MEMBER" },
      { userId: "user-4", email: "member4@cit.edu", name: "Ronan Dela Cruz", role: "LEADER" },
    ],
  },
  {
    id: "ws-3",
    title: "CampusConnect: Student Services Portal",
    teamCode: "2526-sem1-it315-05",
    adviserId: "adv-3",
    adviserName: "Dr. Elena Cruz",
    createdBy: "user-5",
    createdAt: "2026-01-10T08:00:00Z",
    members: [
      { userId: "user-1", email: "student@cit.edu", name: "Camila Rose Cordero", role: "MEMBER" },
      { userId: "user-5", email: "member5@cit.edu", name: "Maria Luz Reyes", role: "LEADER" },
      { userId: "user-6", email: "member6@cit.edu", name: "Jose Ramon Bautista", role: "MEMBER" },
    ],
  },
];

export const MOCK_ARTIFACTS: Artifact[] = [
  { id: "a1", workspaceId: "ws-1", type: "PROPOSAL", url: "https://docs.google.com/document/d/proposal", status: "COMPLETE" },
  { id: "a2", workspaceId: "ws-1", type: "SRS", url: "https://docs.google.com/document/d/srs", status: "COMPLETE" },
  { id: "a3", workspaceId: "ws-1", type: "SDD", url: "https://docs.google.com/document/d/sdd", status: "COMPLETE" },
  { id: "a4", workspaceId: "ws-1", type: "SPMP", url: "https://docs.google.com/document/d/spmp", status: "COMPLETE" },
  { id: "a5", workspaceId: "ws-1", type: "STD", url: "https://docs.google.com/document/d/std", status: "COMPLETE" },
  { id: "a6", workspaceId: "ws-1", type: "SOURCE_CODE", url: "https://github.com/team/synctrace", status: "COMPLETE" },
];

export const ARTIFACT_PAIRS: TraceabilityPair[] = [
  { upstream: "PROPOSAL", downstream: "SRS", label: "Proposal → SRS", status: "MAPPED", alignmentScore: 0.89, coveragePercentage: 94, linkCount: 42 },
  { upstream: "SRS", downstream: "SDD", label: "SRS → SDD", status: "PARTIAL", alignmentScore: 0.72, coveragePercentage: 81, linkCount: 38 },
  { upstream: "SRS", downstream: "SPMP", label: "SRS → SPMP", status: "MAPPED", alignmentScore: 0.86, coveragePercentage: 91, linkCount: 28 },
  { upstream: "SRS", downstream: "STD", label: "SRS → STD", status: "PARTIAL", alignmentScore: 0.68, coveragePercentage: 76, linkCount: 31 },
  { upstream: "SDD", downstream: "SOURCE_CODE", label: "SDD → Source Code", status: "NOT_MAPPED", alignmentScore: 0.54, coveragePercentage: 62, linkCount: 15 },
];

export const MOCK_TRACEABILITY_LINKS: TraceabilityLink[] = [
  {
    id: "tl-1",
    upstreamExcerpt: "The system shall provide secure authentication via Google OAuth 2.0 for all users.",
    downstreamExcerpt: "Authentication module implements Google OAuth 2.0 with JWT session tokens.",
    similarityScore: 0.92,
  },
  {
    id: "tl-2",
    upstreamExcerpt: "Sequential traceability mapping shall recover links between artifact pairs with ≥0.65 similarity.",
    downstreamExcerpt: "SemanticLinkRecoveryService queries pgvector for cosine similarity with threshold 0.65.",
    similarityScore: 0.88,
  },
  {
    id: "tl-3",
    upstreamExcerpt: "Faculty advisers shall monitor assigned student groups via an oversight dashboard.",
    downstreamExcerpt: "FacultyOversightDashboard displays group cards with readiness status and health scores.",
    similarityScore: 0.85,
  },
];

export const MOCK_GAPS: ContinuityGap[] = [
  {
    id: "gap-1",
    type: "MISSING_LINK",
    pairLabel: "SRS → SDD",
    description: "Functional requirement FR-2.3 (artifact URL validation) has no corresponding design component in the SDD.",
    severity: "CRITICAL",
    upstreamExcerpt: "FR-2.3: The system shall validate artifact URLs via HEAD request before processing.",
    isResolved: false,
  },
  {
    id: "gap-2",
    type: "TERMINOLOGY_DRIFT",
    pairLabel: "Proposal → SRS",
    description: "Term 'Vector Database' used in Proposal is referred to as 'embedding store' in SRS without glossary alignment.",
    severity: "WARNING",
    upstreamExcerpt: "Semantic embeddings stored in a dedicated Vector Database.",
    downstreamExcerpt: "Embedding vectors persisted in the pgvector embedding store.",
    isResolved: false,
  },
  {
    id: "gap-3",
    type: "IMPLEMENTATION_DISCREPANCY",
    pairLabel: "SDD → Source Code",
    description: "SDD specifies WeasyPrint for PDF export but no corresponding service implementation found in repository.",
    severity: "CRITICAL",
    upstreamExcerpt: "PDFExportService uses WeasyPrint + Jinja2 for server-side PDF generation.",
    downstreamExcerpt: "// TODO: implement PDF export",
    isResolved: false,
  },
  {
    id: "gap-4",
    type: "DOWNSTREAM_OMISSION",
    pairLabel: "SRS → STD",
    description: "Non-functional requirement NFR-4.1 (response time < 3s) lacks test cases in STD.",
    severity: "WARNING",
    isResolved: false,
  },
  {
    id: "gap-5",
    type: "SEMANTIC_CONTRADICTION",
    pairLabel: "SRS → SPMP",
    description: "SRS specifies 6-week sprint cycles; SPMP outlines 2-week sprints without justification.",
    severity: "INFO",
    isResolved: true,
  },
];

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-1",
    gapId: "gap-1",
    rootCause: "The SDD Detailed Design section for Module 1.3 was drafted before FR-2.3 was added to the SRS in v0.5.",
    actionType: "ADD_MISSING_SECTION",
    recommendationText: "Add ArtifactValidationService component design under Module 1.3 with HEAD request validation flow and sequence diagram.",
    priority: 1,
    isAcknowledged: false,
  },
  {
    id: "rec-2",
    gapId: "gap-1",
    rootCause: "Traceability link between FR-2.3 and SDD section 1.3 was never established.",
    actionType: "REWRITE_DOCUMENT_SECTION",
    recommendationText: "Cross-reference FR-2.3 in SDD Section 1.3 Back-end Components table.",
    priority: 2,
    isAcknowledged: false,
  },
  {
    id: "rec-3",
    gapId: "gap-3",
    rootCause: "PDF export was deferred during implementation sprint 3.",
    actionType: "FIX_CODE_LOGIC",
    recommendationText: "Implement PDFExportService in backend/app/services/export/ using WeasyPrint as specified in SDD Section 3.3.",
    priority: 1,
    isAcknowledged: false,
  },
];

export const MOCK_AUDIT: AuditResult = {
  id: "audit-1",
  workspaceId: "ws-1",
  overallAlignmentScore: 74.2,
  totalCriticalGaps: 2,
  totalWarningGaps: 2,
  readinessStatus: "NEEDS_REVISION",
  createdAt: "2026-05-18T14:30:00Z",
  pairScores: [
    { pairLabel: "Proposal → SRS", alignmentScore: 89, coveragePercentage: 94, criticalGapCount: 0, warningGapCount: 1, readinessStatus: "READY_FOR_REVIEW" },
    { pairLabel: "SRS → SDD", alignmentScore: 72, coveragePercentage: 81, criticalGapCount: 1, warningGapCount: 0, readinessStatus: "NEEDS_REVISION" },
    { pairLabel: "SRS → SPMP", alignmentScore: 86, coveragePercentage: 91, criticalGapCount: 0, warningGapCount: 0, readinessStatus: "READY_FOR_REVIEW" },
    { pairLabel: "SRS → STD", alignmentScore: 68, coveragePercentage: 76, criticalGapCount: 0, warningGapCount: 1, readinessStatus: "NEEDS_REVISION" },
    { pairLabel: "SDD → Source Code", alignmentScore: 54, coveragePercentage: 62, criticalGapCount: 1, warningGapCount: 0, readinessStatus: "CRITICAL_GAPS_EXIST" },
  ],
};

export const MOCK_GROUPS: GroupSummary[] = [
  {
    workspaceId: "ws-1",
    title: "SyncTrace: Intelligent Project Continuity Assistant",
    teamCode: "2526-sem2-it332-08",
    overallAlignmentScore: 74.2,
    readinessStatus: "NEEDS_REVISION",
    lastAuditAt: "2026-05-18T14:30:00Z",
    totalCriticalGaps: 2,
  },
  {
    workspaceId: "ws-2",
    title: "SmartCampus IoT Monitoring System",
    teamCode: "2526-sem2-it332-03",
    overallAlignmentScore: 91.5,
    readinessStatus: "READY_FOR_REVIEW",
    lastAuditAt: "2026-05-17T10:00:00Z",
    totalCriticalGaps: 0,
  },
  {
    workspaceId: "ws-3",
    title: "E-Learning Analytics Platform",
    teamCode: "2526-sem2-it332-12",
    overallAlignmentScore: 58.3,
    readinessStatus: "CRITICAL_GAPS_EXIST",
    lastAuditAt: "2026-05-16T16:45:00Z",
    totalCriticalGaps: 4,
  },
];

export const MOCK_AUDITS_MAP: Partial<Record<string, AuditResult>> = {
  "ws-1": MOCK_AUDIT,
  "ws-2": {
    id: "audit-2",
    workspaceId: "ws-2",
    overallAlignmentScore: 88.4,
    totalCriticalGaps: 0,
    totalWarningGaps: 1,
    readinessStatus: "READY_FOR_REVIEW",
    createdAt: "2026-05-17T10:00:00Z",
    pairScores: [
      { pairLabel: "Proposal → SRS", alignmentScore: 93, coveragePercentage: 97, criticalGapCount: 0, warningGapCount: 0, readinessStatus: "READY_FOR_REVIEW" },
      { pairLabel: "SRS → SDD", alignmentScore: 91, coveragePercentage: 95, criticalGapCount: 0, warningGapCount: 0, readinessStatus: "READY_FOR_REVIEW" },
      { pairLabel: "SRS → SPMP", alignmentScore: 84, coveragePercentage: 89, criticalGapCount: 0, warningGapCount: 1, readinessStatus: "NEEDS_REVISION" },
      { pairLabel: "SRS → STD", alignmentScore: 87, coveragePercentage: 92, criticalGapCount: 0, warningGapCount: 0, readinessStatus: "READY_FOR_REVIEW" },
      { pairLabel: "SDD → Source Code", alignmentScore: 83, coveragePercentage: 88, criticalGapCount: 0, warningGapCount: 0, readinessStatus: "READY_FOR_REVIEW" },
    ],
  },
  "ws-3": {
    id: "audit-3",
    workspaceId: "ws-3",
    overallAlignmentScore: 55.7,
    totalCriticalGaps: 3,
    totalWarningGaps: 2,
    readinessStatus: "CRITICAL_GAPS_EXIST",
    createdAt: "2026-05-16T16:45:00Z",
    pairScores: [
      { pairLabel: "Proposal → SRS", alignmentScore: 78, coveragePercentage: 82, criticalGapCount: 0, warningGapCount: 1, readinessStatus: "NEEDS_REVISION" },
      { pairLabel: "SRS → SDD", alignmentScore: 51, coveragePercentage: 60, criticalGapCount: 1, warningGapCount: 0, readinessStatus: "CRITICAL_GAPS_EXIST" },
      { pairLabel: "SRS → SPMP", alignmentScore: 62, coveragePercentage: 70, criticalGapCount: 0, warningGapCount: 1, readinessStatus: "NEEDS_REVISION" },
      { pairLabel: "SRS → STD", alignmentScore: 47, coveragePercentage: 55, criticalGapCount: 1, warningGapCount: 0, readinessStatus: "CRITICAL_GAPS_EXIST" },
      { pairLabel: "SDD → Source Code", alignmentScore: 41, coveragePercentage: 48, criticalGapCount: 1, warningGapCount: 0, readinessStatus: "CRITICAL_GAPS_EXIST" },
    ],
  },
};

export const MOCK_GAPS_MAP: Partial<Record<string, ContinuityGap[]>> = {
  "ws-1": MOCK_GAPS,
  "ws-2": [
    {
      id: "gap-ws2-1",
      type: "TERMINOLOGY_DRIFT",
      pairLabel: "SRS → SPMP",
      description: "Term 'sprint velocity' used in SRS is referred to as 'iteration throughput' in SPMP without a glossary mapping.",
      severity: "WARNING",
      isResolved: false,
    },
  ],
  "ws-3": [
    {
      id: "gap-ws3-1",
      type: "MISSING_LINK",
      pairLabel: "SRS → SDD",
      description: "Module 2.4 (Notification Service) has no corresponding design section in the SDD.",
      severity: "CRITICAL",
      isResolved: false,
    },
    {
      id: "gap-ws3-2",
      type: "IMPLEMENTATION_DISCREPANCY",
      pairLabel: "SRS → STD",
      description: "Performance requirement NFR-2.1 (< 2s page load) has no corresponding load test cases in STD.",
      severity: "CRITICAL",
      isResolved: false,
    },
    {
      id: "gap-ws3-3",
      type: "DOWNSTREAM_OMISSION",
      pairLabel: "SDD → Source Code",
      description: "Portal authentication module specified in SDD has no corresponding implementation found in repository.",
      severity: "CRITICAL",
      isResolved: false,
    },
    {
      id: "gap-ws3-4",
      type: "TERMINOLOGY_DRIFT",
      pairLabel: "Proposal → SRS",
      description: "Term 'student portal' in Proposal is referred to as 'student services hub' in SRS without justification.",
      severity: "WARNING",
      isResolved: false,
    },
    {
      id: "gap-ws3-5",
      type: "SEMANTIC_CONTRADICTION",
      pairLabel: "SRS → SPMP",
      description: "SRS specifies React frontend; SPMP project plan references Vue.js without a formal change notice.",
      severity: "WARNING",
      isResolved: false,
    },
  ],
};

export const ARTIFACT_PAIRS_MAP: Partial<Record<string, TraceabilityPair[]>> = {
  "ws-1": ARTIFACT_PAIRS,
  "ws-2": [
    { upstream: "PROPOSAL", downstream: "SRS", label: "Proposal → SRS", status: "MAPPED", alignmentScore: 0.93, coveragePercentage: 97, linkCount: 50 },
    { upstream: "SRS", downstream: "SDD", label: "SRS → SDD", status: "MAPPED", alignmentScore: 0.91, coveragePercentage: 95, linkCount: 45 },
    { upstream: "SRS", downstream: "SPMP", label: "SRS → SPMP", status: "PARTIAL", alignmentScore: 0.84, coveragePercentage: 89, linkCount: 32 },
    { upstream: "SRS", downstream: "STD", label: "SRS → STD", status: "MAPPED", alignmentScore: 0.87, coveragePercentage: 92, linkCount: 38 },
    { upstream: "SDD", downstream: "SOURCE_CODE", label: "SDD → Source Code", status: "MAPPED", alignmentScore: 0.83, coveragePercentage: 88, linkCount: 29 },
  ],
  "ws-3": [
    { upstream: "PROPOSAL", downstream: "SRS", label: "Proposal → SRS", status: "PARTIAL", alignmentScore: 0.78, coveragePercentage: 82, linkCount: 35 },
    { upstream: "SRS", downstream: "SDD", label: "SRS → SDD", status: "NOT_MAPPED", alignmentScore: 0.51, coveragePercentage: 60, linkCount: 18 },
    { upstream: "SRS", downstream: "SPMP", label: "SRS → SPMP", status: "PARTIAL", alignmentScore: 0.62, coveragePercentage: 70, linkCount: 22 },
    { upstream: "SRS", downstream: "STD", label: "SRS → STD", status: "NOT_MAPPED", alignmentScore: 0.47, coveragePercentage: 55, linkCount: 14 },
    { upstream: "SDD", downstream: "SOURCE_CODE", label: "SDD → Source Code", status: "NOT_MAPPED", alignmentScore: 0.41, coveragePercentage: 48, linkCount: 9 },
  ],
};

export const PROCESSING_STEPS = [
  "Validating URLs",
  "Retrieving documents",
  "Extracting content",
  "Generating embeddings",
  "Storing vectors",
];

export const ARTIFACT_LABELS: Record<string, string> = {
  PROPOSAL: "Project Proposal",
  SRS: "Software Requirements Specification (SRS)",
  SDD: "Software Design Description (SDD)",
  SPMP: "Software Project Management Plan (SPMP)",
  STD: "Software Test Document (STD)",
  SOURCE_CODE: "GitHub Repository",
};

export const ARTIFACT_URLS_MAP: Record<string, Record<string, string>> = {
  "ws-1": {
    PROPOSAL: "https://docs.google.com/document/d/synctrace-proposal",
    SRS: "https://docs.google.com/document/d/synctrace-srs",
    SDD: "https://docs.google.com/document/d/synctrace-sdd",
    SPMP: "https://docs.google.com/document/d/synctrace-spmp",
    STD: "https://docs.google.com/document/d/synctrace-std",
    SOURCE_CODE: "https://github.com/team/synctrace",
  },
  "ws-2": {
    PROPOSAL: "https://docs.google.com/document/d/edutrack-proposal",
    SRS: "https://docs.google.com/document/d/edutrack-srs",
    SDD: "https://docs.google.com/document/d/edutrack-sdd",
    SPMP: "https://docs.google.com/document/d/edutrack-spmp",
    STD: "https://docs.google.com/document/d/edutrack-std",
    SOURCE_CODE: "https://github.com/team/edutrack",
  },
  "ws-3": {
    PROPOSAL: "https://docs.google.com/document/d/campusconnect-proposal",
    SRS: "https://docs.google.com/document/d/campusconnect-srs",
    SDD: "https://docs.google.com/document/d/campusconnect-sdd",
    SPMP: "https://docs.google.com/document/d/campusconnect-spmp",
    STD: "https://docs.google.com/document/d/campusconnect-std",
    SOURCE_CODE: "https://github.com/team/campusconnect",
  },
};
