"use client";

import { useEffect, useState, useTransition } from "react";
import { CreditCard, Landmark, Lock, Smartphone } from "lucide-react";
import { useLocale, useT } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn, formatINR } from "@/lib/utils";
import { hash } from "@/lib/app/helpers";
import { confirmRazorpayAction, failPaymentAction, payNowAction } from "@/lib/app/payment-actions";

type Method = "upi" | "card" | "netbanking";

const BANKS = ["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Punjab National Bank", "Kotak Mahindra Bank", "Bank of Baroda", "Canara Bank"];

/** Deterministic QR-looking grid so the demo gateway feels real without a QR library. */
function FakeQr({ seed }: { seed: string }) {
  const n = 21;
  const h = hash(seed);
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) cells.push(((hash(`${seed}:${i}`) >> (i % 7)) & 1) === 1 || ((h >> i % 31) & 1) === 1);
  const finder = (x: number, y: number) => (
    <g key={`f${x}${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="currentColor" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="currentColor" />
    </g>
  );
  const inFinder = (r: number, c: number) => (r < 8 && c < 8) || (r < 8 && c > n - 9) || (r > n - 9 && c < 8);
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="h-40 w-40 text-foreground" role="img" aria-label="QR">
      <rect width={n} height={n} fill="#fff" />
      {cells.map((on, i) => {
        const r = Math.floor(i / n);
        const c = i % n;
        if (!on || inFinder(r, c)) return null;
        return <rect key={i} x={c} y={r} width={1} height={1} fill="currentColor" />;
      })}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}

export function PayForm({
  paymentId,
  amount,
  provider,
  razorpayKey,
  orderId,
  serviceName,
  bookingCode,
  imageUrl,
  scheduleLine,
}: {
  paymentId: string;
  amount: number;
  provider: string;
  razorpayKey?: string | null;
  orderId?: string | null;
  serviceName: string;
  bookingCode: string;
  imageUrl: string;
  scheduleLine: string;
}) {
  const t = useT();
  const locale = useLocale();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [method, setMethod] = useState<Method>("upi");
  const [vpa, setVpa] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [bank, setBank] = useState(BANKS[0]);
  const [rzpReady, setRzpReady] = useState(false);

  useEffect(() => {
    if (provider !== "razorpay" || !razorpayKey) return;
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => setRzpReady(true);
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, [provider, razorpayKey]);

  function openRazorpay() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Rzp = (window as any).Razorpay;
    if (!Rzp || !orderId) return;
    const rzp = new Rzp({
      key: razorpayKey,
      amount: amount * 100,
      currency: "INR",
      name: "DivyaDham",
      description: serviceName,
      order_id: orderId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: (res: any) => {
        start(async () => {
          const out = await confirmRazorpayAction(paymentId, res.razorpay_payment_id);
          if (out.ok) window.location.href = `/bookings/${out.data!.bookingId}?paid=1`;
          else toast(t("common.somethingWrong"), "error");
        });
      },
      theme: { color: "#f0642a" },
    });
    rzp.open();
  }

  const tabs: { value: Method; label: string; icon: typeof Smartphone }[] = [
    { value: "upi", label: t("app.payUpi"), icon: Smartphone },
    { value: "card", label: t("app.payCard"), icon: CreditCard },
    { value: "netbanking", label: t("app.payNetbanking"), icon: Landmark },
  ];

  return (
    <div className="pb-32">
      <header className="border-b border-border bg-surface px-4 py-3">
        <h1 className="flex items-center gap-2 text-[16px] font-bold">
          <Lock className="h-4 w-4 text-success" /> {t("app.payTitle")}
        </h1>
        <p className="mt-0.5 text-[11.5px] text-muted">{t("app.paymentSecured")}</p>
      </header>

      {/* order summary */}
      <section className="px-4 pt-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-muted">{t("app.payingFor")}</p>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold leading-tight">{serviceName}</p>
            <p className="truncate text-[11.5px] text-muted">{scheduleLine}</p>
            <p className="truncate text-[11px] text-muted">{t("app.bookingCode", { code: bookingCode })}</p>
          </div>
          <p className="shrink-0 text-[16px] font-bold">{formatINR(amount, locale)}</p>
        </div>
      </section>

      {provider === "razorpay" && razorpayKey && (
        <section className="px-4 pt-4">
          <Button full size="lg" variant="maroon" disabled={!rzpReady} onClick={openRazorpay}>
            {t("app.razorpayPay")}
          </Button>
        </section>
      )}

      {/* method tabs */}
      <section className="mt-4">
        <div className="flex gap-1 border-b border-border px-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const on = method === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setMethod(tab.value)}
                className={cn("relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[12px] font-medium", on ? "text-primary" : "text-muted")}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {on && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>

        <div className="px-4 pt-4">
          {method === "upi" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-4">
                <FakeQr seed={paymentId} />
                <p className="mt-2 text-[12px] text-muted">{t("app.scanToPay")}</p>
              </div>
              <Field label={t("app.vpaLabel")}>
                <Input value={vpa} onChange={(e) => setVpa(e.target.value)} placeholder={t("app.vpaPlaceholder")} inputMode="email" />
              </Field>
            </div>
          )}

          {method === "card" && (
            <div className="space-y-2.5">
              <Field label={t("app.cardNumber")}>
                <Input
                  value={card}
                  onChange={(e) => setCard(e.target.value.replace(/[^\d ]/g, "").slice(0, 19))}
                  placeholder="4111 1111 1111 1111"
                  inputMode="numeric"
                />
              </Field>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label={t("app.cardExpiry")}>
                  <Input value={expiry} onChange={(e) => setExpiry(e.target.value.slice(0, 5))} placeholder="MM/YY" inputMode="numeric" />
                </Field>
                <Field label={t("app.cardCvv")}>
                  <Input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="123" inputMode="numeric" type="password" />
                </Field>
              </div>
              <Field label={t("app.cardName")}>
                <Input value={cardName} onChange={(e) => setCardName(e.target.value)} />
              </Field>
            </div>
          )}

          {method === "netbanking" && (
            <Field label={t("app.selectBank")}>
              <Select value={bank} onChange={(e) => setBank(e.target.value)}>
                {BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      </section>

      <p className="mt-5 px-4 text-center text-[11.5px] text-muted">{t("app.mockNote")}</p>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <div className="pointer-events-auto w-full max-w-md border-t border-border bg-surface/95 px-4 pb-safe pt-3 backdrop-blur">
          <Button full size="lg" loading={pending} onClick={() => start(async () => void (await payNowAction(paymentId, method)))}>
            {t("app.payButton", { amount: formatINR(amount, locale) })}
          </Button>
          <button
            onClick={() => start(async () => void (await failPaymentAction(paymentId)))}
            className="mt-2 block w-full py-1.5 text-center text-[12px] font-medium text-danger"
          >
            {t("app.simulateFailure")}
          </button>
        </div>
      </div>
    </div>
  );
}
