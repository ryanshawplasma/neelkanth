import { cn } from "@/lib/utils";

export type Point = { label: string; value: number };

function niceMax(values: number[]) {
  const max = Math.max(1, ...values);
  const mag = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / mag) * mag;
}

/**
 * Inline-SVG line chart (no chart library). Values are plotted against a
 * "nice" rounded maximum with a soft area fill; every 5th label is shown.
 */
export function MiniLineChart({
  data,
  height = 160,
  format = (n: number) => String(n),
  className,
  ariaLabel,
}: {
  data: Point[];
  height?: number;
  format?: (n: number) => string;
  className?: string;
  ariaLabel?: string;
}) {
  const w = 720;
  const h = height;
  const padX = 8;
  const padTop = 12;
  const padBottom = 22;
  const max = niceMax(data.map((d) => d.value));
  const step = data.length > 1 ? (w - padX * 2) / (data.length - 1) : 0;
  const y = (v: number) => padTop + (1 - v / max) * (h - padTop - padBottom);
  const pts = data.map((d, i) => [padX + i * step, y(d.value)] as const);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${(padX + (data.length - 1) * step).toFixed(1)},${h - padBottom} L${padX},${h - padBottom} Z`;

  return (
    <div className={cn("w-full", className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full max-sm:h-28" role="img" aria-label={ariaLabel ?? "chart"} preserveAspectRatio="none">
        <defs>
          <linearGradient id="ddLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={padX} x2={w - padX} y1={y(max * f)} y2={y(max * f)} stroke="var(--border)" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#ddLineFill)" />
        <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {pts.map((p, i) =>
          i === pts.length - 1 ? <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="var(--primary)" /> : null,
        )}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-muted">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted">{format(max)}</p>
    </div>
  );
}

/** Horizontal bar list — used for "bookings by type". */
export function MiniBarChart({
  data,
  format = (n: number) => String(n),
  className,
  tone = "var(--primary)",
}: {
  data: Point[];
  format?: (n: number) => string;
  className?: string;
  tone?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className={cn("space-y-2", className)}>
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[9.5rem_1fr_3rem] items-center gap-2 text-xs max-sm:grid-cols-[7rem_1fr_2.5rem]">
          <span className="truncate text-muted">{d.label}</span>
          <span className="h-3 overflow-hidden rounded-full bg-surface-2">
            <span
              className="block h-full rounded-full"
              style={{ width: `${Math.max(2, (d.value / max) * 100)}%`, background: tone }}
            />
          </span>
          <span className="text-right font-semibold tabular-nums">{format(d.value)}</span>
        </li>
      ))}
    </ul>
  );
}
