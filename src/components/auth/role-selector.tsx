"use client";

import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap } from "lucide-react";

interface RoleSelectorProps {
  readonly value: UserRole;
  readonly onChange: (role: UserRole) => void;
}

const roles: {
  id: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "STUDENT",
    label: "Student",
    description: "Submit artifacts & track traceability",
    icon: GraduationCap,
  },
  {
    id: "FACULTY_ADVISER",
    label: "Adviser",
    description: "Review audits & monitor groups",
    icon: BookOpen,
  },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map(({ id, label, description, icon: Icon }) => {
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "relative flex flex-col items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-150",
              selected
                ? "border-brand-gold bg-brand-gold/10 shadow-md shadow-brand-gold/15"
                : "border-gray-200 bg-white hover:border-brand-gold/40 hover:shadow-sm"
            )}
          >
            {/* Selection indicator */}
            <div className={cn(
              "absolute right-3.5 top-3.5 h-4 w-4 rounded-full border-2 transition-all",
              selected
                ? "border-brand-gold bg-brand-gold"
                : "border-gray-300 bg-white"
            )}>
              {selected && (
                <svg viewBox="0 0 10 10" className="h-full w-full" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            {/* Icon */}
            <div className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              selected ? "bg-brand-gold/20" : "bg-gray-100"
            )}>
              <Icon className={cn("h-5 w-5", selected ? "text-brand-gold" : "text-slate-500")} />
            </div>

            {/* Label */}
            <div>
              <p className={cn("text-sm font-bold", selected ? "text-[#0a1628]" : "text-slate-700")}>
                {label}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-slate-400">{description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
