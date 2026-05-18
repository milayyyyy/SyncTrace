import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        /* Traceability matrix */
        pass: "border-transparent bg-[#10B981]/15 text-[#059669]",
        partial: "border-transparent bg-[#F59E0B]/15 text-[#B45309]",
        fail: "border-transparent bg-[#EF4444]/15 text-[#DC2626]",
        critical: "border-transparent bg-[#B91C1C]/15 text-[#B91C1C]",
        drift: "border-transparent bg-[#EA580C]/15 text-[#C2410C]",
        ai: "border-transparent bg-[#8B5CF6]/15 text-[#7C3AED]",
        ready: "border-transparent bg-[#22C55E]/15 text-[#16A34A]",
        revision: "border-transparent bg-[#EAB308]/15 text-[#A16207]",
        /* Legacy aliases */
        success: "border-transparent bg-[#10B981]/15 text-[#059669]",
        warning: "border-transparent bg-[#F59E0B]/15 text-[#B45309]",
        info: "border-transparent bg-brand-indigo/10 text-brand-indigo",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
