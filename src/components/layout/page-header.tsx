"use client";

import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ icon: Icon, title, subtitle, badge, actions }: PageHeaderProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="h-1.5 bg-gradient-to-r from-brand-navy via-brand-navy/70 to-brand-gold/60" />
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy/8">
            <Icon className="h-5 w-5 text-brand-navy" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-brand-navy leading-snug truncate">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-brand-slate">{subtitle}</p>
            )}
          </div>
        </div>
        {(badge || actions) && (
          <div className="flex shrink-0 items-center gap-3">
            {badge}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
