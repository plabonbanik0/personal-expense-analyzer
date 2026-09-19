import type { ReactNode } from "react";
export const money = (v: string | number | null | undefined) =>
  v == null
    ? "—"
    : Number(v).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
export const dateText = (v: string) =>
  new Date(v + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
export function Button({
  children,
  variant = "primary",
  ...p
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${variant === "primary" ? "bg-slate-900 text-white" : variant === "danger" ? "bg-red-600 text-white" : variant === "secondary" ? "border border-slate-300 bg-white" : "text-slate-600 hover:bg-slate-100"}`}
    >
      {children}
    </button>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm " +
        className
      }
    >
      {children}
    </section>
  );
}
export function Input({
  label,
  ...p
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      <input
        {...p}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-500"
      />
    </label>
  );
}
export function Select({
  label,
  children,
  ...p
}: {
  label: string;
  children: ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      <select
        {...p}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
      >
        {children}
      </select>
    </label>
  );
}
export function Alert({
  children,
  type = "error",
}: {
  children: ReactNode;
  type?: "error" | "success" | "info";
}) {
  return (
    <div
      className={`rounded-lg border p-3 text-sm ${type === "error" ? "border-red-200 bg-red-50 text-red-700" : type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}
    >
      {children}
    </div>
  );
}
export function Empty({ children = "No data yet." }: { children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}
export function Spinner() {
  return (
    <div className="flex justify-center p-12">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
    </div>
  );
}
export function Page({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
export function ConfirmDelete({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Button
      variant="danger"
      onClick={() => window.confirm("Delete this item?") && onConfirm()}
    >
      Delete
    </Button>
  );
}
