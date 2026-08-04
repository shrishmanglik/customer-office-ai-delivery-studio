import type { HTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300",
        className,
      )}
      {...props}
    />
  );
}
