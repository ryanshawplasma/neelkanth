import { cn } from "@/lib/utils";
import { parseJson } from "@/lib/utils";

/** Pretty-prints a JSON string/object (audit meta, payment raw payloads…). */
export function JsonView({ value, className, max = 2000 }: { value: unknown; className?: string; max?: number }) {
  let data: unknown = value;
  if (typeof value === "string") data = parseJson<unknown>(value, value);
  if (data === null || data === undefined || data === "") return <span className="text-xs text-muted">—</span>;
  let text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  if (text.length > max) text = `${text.slice(0, max)}…`;
  return (
    <pre className={cn("overflow-x-auto rounded-xl bg-surface-2 p-3 text-[11px] leading-relaxed text-foreground/80", className)}>
      <code>{text}</code>
    </pre>
  );
}
