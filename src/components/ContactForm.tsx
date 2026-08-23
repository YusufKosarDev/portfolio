"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/components/Providers";
import { MailIcon } from "@/components/icons";

type Status = "idle" | "sending" | "success" | "error" | "rateLimited";
type Errors = Partial<Record<"name" | "email" | "message", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const { t } = useApp();
  const f = t.contact.form;

  const [values, setValues] = useState({ name: "", email: "", message: "" });
  // Honeypot: yalnızca botlar doldurur, gönderimde sunucuya iletilir.
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  const validate = (): boolean => {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = f.errName;
    if (!EMAIL_RE.test(values.email.trim())) next.email = f.errEmail;
    if (values.message.trim().length < 10) next.message = f.errMessage;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!validate()) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company }),
      });
      if (res.status === 429) {
        setStatus("rateLimited");
        return;
      }
      if (!res.ok) throw new Error("request_failed");
      setStatus("success");
      setValues({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const field =
    "w-full rounded-xl field px-4 py-3 text-sm text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-accent-to/60 focus:ring-2 focus:ring-accent-to/20";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 text-left">
      {/* İsim */}
      <div>
        <label htmlFor="cf-name" className="mb-1.5 block text-xs font-medium text-muted">
          {f.name}
        </label>
        <input
          id="cf-name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder={f.namePlaceholder}
          aria-invalid={!!errors.name}
          className={field}
        />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
      </div>

      {/* E-posta */}
      <div>
        <label htmlFor="cf-email" className="mb-1.5 block text-xs font-medium text-muted">
          {f.email}
        </label>
        <input
          id="cf-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          placeholder={f.emailPlaceholder}
          aria-invalid={!!errors.email}
          className={field}
        />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
      </div>

      {/* Mesaj */}
      <div>
        <label htmlFor="cf-message" className="mb-1.5 block text-xs font-medium text-muted">
          {f.message}
        </label>
        <textarea
          id="cf-message"
          rows={4}
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          placeholder={f.messagePlaceholder}
          aria-invalid={!!errors.message}
          className={`${field} resize-none`}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-400">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-from via-accent-mid to-accent-to px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-mid/25 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            {f.sending}
          </>
        ) : (
          <>
            <MailIcon width={16} height={16} />
            {f.submit}
          </>
        )}
      </button>

      {/* Durum mesajı */}
      <AnimatePresence mode="wait">
        {(status === "success" || status === "error" || status === "rateLimited") && (
          <motion.p
            key={status}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl px-4 py-3 text-sm ${
              status === "success"
                ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
            }`}
          >
            {status === "success"
              ? f.success
              : status === "rateLimited"
                ? f.errRateLimit
                : f.error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Honeypot. Ekran dışında konumlanır; klavyeyle odaklanılamaz ve
          ekran okuyuculardan gizlidir, bu yüzden yalnızca botlar doldurur.
          Konumu mutlak olduğundan form yerleşimini etkilemez. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="cf-company">Company</label>
        <input
          id="cf-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
    </form>
  );
}
