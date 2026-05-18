import { create } from "zustand";
import type { Workspace } from "@/types";

interface WorkspaceState {
  workspace: Workspace | null;
  hasWorkspace: boolean;
  setWorkspace: (workspace: Workspace) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  workspace: null,
  hasWorkspace: false,
  setWorkspace: (workspace) => set({ workspace, hasWorkspace: true }),
  clearWorkspace: () => set({ workspace: null, hasWorkspace: false }),
}));
