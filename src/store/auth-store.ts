import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";
import { MOCK_ADVISER, MOCK_STUDENT } from "@/lib/mock-data";

interface AuthState {
  user: User | null;
  token: string | null;
  selectedRole: UserRole;
  isAuthenticated: boolean;
  setSelectedRole: (role: UserRole) => void;
  signIn: (role: UserRole) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      selectedRole: "STUDENT",
      isAuthenticated: false,
      setSelectedRole: (role) => set({ selectedRole: role }),
      signIn: (role) => {
        const user = role === "FACULTY_ADVISER" ? MOCK_ADVISER : MOCK_STUDENT;
        set({
          user: { ...user, role },
          token: "mock-jwt-token",
          isAuthenticated: true,
          selectedRole: role,
        });
      },
      signOut: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    { name: "synctrace-auth" }
  )
);
