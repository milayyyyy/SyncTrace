import axios from "axios";
import type {
  Adviser,
  Artifact,
  AuditResult,
  ContinuityGap,
  DiagnosticResult,
  GroupSummary,
  ProcessingJob,
  Recommendation,
  TraceabilityLink,
  TraceabilityPair,
  Workspace,
} from "@/types";
import {
  ARTIFACT_PAIRS,
  MOCK_ADVISERS,
  MOCK_ARTIFACTS,
  MOCK_AUDIT,
  MOCK_GAPS,
  MOCK_GROUPS,
  MOCK_RECOMMENDATIONS,
  MOCK_TRACEABILITY_LINKS,
  MOCK_WORKSPACE,
  PROCESSING_STEPS,
} from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("synctrace-auth");
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch {
        /* ignore */
      }
    }
  }
  return config;
});

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const authApi = {
  getGoogleAuthUrl: async (role: string) => {
    if (USE_MOCK) return { url: "#mock-oauth" };
    const { data } = await api.get(`/auth/google?role=${role}`);
    return data;
  },
};

export const workspaceApi = {
  getAdvisers: async (): Promise<Adviser[]> => {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_ADVISERS;
    }
    const { data } = await api.get("/workspace/advisers");
    return data;
  },
  create: async (payload: {
    title: string;
    teamCode: string;
    adviserId: string;
    memberEmails: string[];
  }): Promise<Workspace> => {
    if (USE_MOCK) {
      await delay(800);
      return {
        ...MOCK_WORKSPACE,
        title: payload.title,
        teamCode: payload.teamCode,
        adviserId: payload.adviserId,
        adviserName:
          MOCK_ADVISERS.find((a) => a.id === payload.adviserId)?.name ?? "",
      };
    }
    const { data } = await api.post("/workspace/create", payload);
    return data;
  },
  getById: async (id: string): Promise<Workspace> => {
    if (USE_MOCK) {
      await delay(200);
      return { ...MOCK_WORKSPACE, id };
    }
    const { data } = await api.get(`/workspace/${id}`);
    return data;
  },
};

export const artifactApi = {
  getByWorkspace: async (workspaceId: string): Promise<Artifact[]> => {
    if (USE_MOCK) {
      await delay(200);
      return MOCK_ARTIFACTS.filter((a) => a.workspaceId === workspaceId || workspaceId === "ws-1");
    }
    const { data } = await api.get(`/artifacts/${workspaceId}`);
    return data;
  },
  submit: async (
    workspaceId: string,
    urls: Record<string, string>
  ): Promise<{ jobId: string }> => {
    if (USE_MOCK) {
      await delay(500);
      return { jobId: "job-mock-1" };
    }
    const { data } = await api.post("/artifacts/submit", { workspaceId, urls });
    return data;
  },
  getJobStatus: async (jobId: string): Promise<ProcessingJob> => {
    if (USE_MOCK) {
      await delay(300);
      return {
        id: jobId,
        workspaceId: "ws-1",
        status: "PROCESSING",
        currentStep: PROCESSING_STEPS[2],
      };
    }
    const { data } = await api.get(`/artifacts/status/${jobId}`);
    return data;
  },
};

export const traceabilityApi = {
  getPairs: async (workspaceId: string): Promise<TraceabilityPair[]> => {
    if (USE_MOCK) {
      await delay(300);
      return ARTIFACT_PAIRS;
    }
    const { data } = await api.get(`/traceability/${workspaceId}/pairs`);
    return data;
  },
  getLinks: async (
    _workspaceId: string,
    _pair: string
  ): Promise<TraceabilityLink[]> => {
    if (USE_MOCK) {
      await delay(200);
      return MOCK_TRACEABILITY_LINKS;
    }
    const { data } = await api.get(`/traceability/${_workspaceId}/links`);
    return data;
  },
  rerun: async (workspaceId: string) => {
    if (USE_MOCK) {
      await delay(1000);
      return { status: "ok" };
    }
    const { data } = await api.post(`/traceability/run/${workspaceId}`);
    return data;
  },
};

export const gapApi = {
  getGaps: async (_workspaceId: string): Promise<ContinuityGap[]> => {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_GAPS;
    }
    const { data } = await api.get(`/gaps/${_workspaceId}`);
    return data;
  },
  rerun: async (workspaceId: string) => {
    if (USE_MOCK) {
      await delay(800);
      return { status: "ok" };
    }
    const { data } = await api.post(`/gaps/run/${workspaceId}`);
    return data;
  },
};

export const diagnosticsApi = {
  getForGap: async (gapId: string): Promise<DiagnosticResult> => {
    if (USE_MOCK) {
      await delay(600);
      const recs = MOCK_RECOMMENDATIONS.filter((r) => r.gapId === gapId);
      const gap = MOCK_GAPS.find((g) => g.id === gapId);
      return {
        gapId,
        rootCause:
          recs[0]?.rootCause ??
          gap?.description ??
          "Analysis pending for this gap.",
        recommendations: recs.length > 0 ? recs : MOCK_RECOMMENDATIONS.slice(0, 1),
      };
    }
    const { data } = await api.post(`/diagnostics/generate`, { gapId });
    return data;
  },
  acknowledge: async (recommendationId: string) => {
    if (USE_MOCK) {
      await delay(200);
      return { status: "ok" };
    }
    const { data } = await api.post(`/diagnostics/acknowledge/${recommendationId}`);
    return data;
  },
};

export const auditApi = {
  get: async (_workspaceId: string): Promise<AuditResult> => {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_AUDIT;
    }
    const { data } = await api.get(`/audit/${_workspaceId}`);
    return data;
  },
  getPairDetail: async (_workspaceId: string, pairLabel: string) => {
    if (USE_MOCK) {
      await delay(200);
      return {
        pairLabel,
        traceEvidence: MOCK_TRACEABILITY_LINKS[0],
        matchedSections: ["Authentication", "Traceability Mapping", "Gap Analysis"],
        confidence: 0.87,
      };
    }
    const { data } = await api.get(`/audit/${_workspaceId}/pair/${encodeURIComponent(pairLabel)}`);
    return data;
  },
  refresh: async (workspaceId: string) => {
    if (USE_MOCK) {
      await delay(1000);
      return MOCK_AUDIT;
    }
    const { data } = await api.post(`/audit/${workspaceId}/refresh`);
    return data;
  },
};

export const adviserApi = {
  getGroups: async (): Promise<GroupSummary[]> => {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_GROUPS;
    }
    const { data } = await api.get("/adviser/groups");
    return data;
  },
  getGroupDetail: async (
    workspaceId: string
  ): Promise<{
    group: GroupSummary;
    audit: AuditResult;
    gaps: ContinuityGap[];
    links: TraceabilityLink[];
    recommendations: Recommendation[];
  }> => {
    if (USE_MOCK) {
      await delay(500);
      const group = MOCK_GROUPS.find((g) => g.workspaceId === workspaceId) ?? MOCK_GROUPS[0];
      return {
        group,
        audit: MOCK_AUDIT,
        gaps: MOCK_GAPS,
        links: MOCK_TRACEABILITY_LINKS,
        recommendations: MOCK_RECOMMENDATIONS,
      };
    }
    const { data } = await api.get(`/adviser/groups/${workspaceId}`);
    return data;
  },
};

export const exportApi = {
  downloadPdf: async (workspaceId: string): Promise<Blob> => {
    if (USE_MOCK) {
      await delay(1500);
      const content = `SyncTrace Audit Report\nWorkspace: ${workspaceId}\nGenerated: ${new Date().toISOString()}`;
      return new Blob([content], { type: "application/pdf" });
    }
    const { data } = await api.get(`/export/${workspaceId}/pdf`, {
      responseType: "blob",
    });
    return data;
  },
};
