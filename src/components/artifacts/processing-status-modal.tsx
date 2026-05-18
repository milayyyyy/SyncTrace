"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { PROCESSING_STEPS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ProcessingStatusModalProps {
  open: boolean;
  onComplete: () => void;
}

export function ProcessingStatusModal({ open, onComplete }: ProcessingStatusModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= PROCESSING_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [open, onComplete]);

  if (!open) return null;

  const isComplete = currentStep >= PROCESSING_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl mx-4">
        <h3 className="text-lg font-bold text-brand-navy mb-2">Processing Artifacts</h3>
        <p className="text-sm text-brand-slate mb-6">
          Retrieving documents, extracting content, and generating semantic embeddings...
        </p>
        <ul className="space-y-3">
          {PROCESSING_STEPS.map((step, i) => {
            const done = i < currentStep || isComplete;
            const active = i === currentStep && !isComplete;
            return (
              <li key={step} className="flex items-center gap-3">
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-brand-emerald shrink-0" />
                ) : active ? (
                  <Loader2 className="h-5 w-5 text-brand-navy animate-spin shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-brand-slate/40 shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    done && "text-brand-emerald font-medium",
                    active && "text-brand-navy font-medium",
                    !done && !active && "text-brand-slate/70"
                  )}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
