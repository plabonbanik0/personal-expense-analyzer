import type {
  ApiError,
  User,
  Category,
  Expense,
  Income,
  Budget,
  RecurringTransaction,
  AnalyticsSummary,
  CategoryTotal,
  MonthlyTotal,
  MonthlyComparison,
} from "../types/api";
const BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) || "http://localhost:8000/api/v1";
const KEY = "pea_access_token";
export const authStore = {
  get: () => localStorage.getItem(KEY),
  set: (v: string) => localStorage.setItem(KEY, v),
  clear: () => localStorage.removeItem(KEY),
};
export class ApiException extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
function err(body: unknown, status: number) {
  if (body && typeof body === "object" && "detail" in body) {
    const d = (body as ApiError).detail;
    if (Array.isArray(d)) return d.map(String).join(", ");
    if (typeof d === "string") return d;
  }
  return status === 0
    ? "Network error. Is the backend running?"
    : `Request failed (${status}).`;
}
async function req<T>(path: string, opt: RequestInit = {}): Promise<T> {
  const h = new Headers(opt.headers);
  if (opt.body) h.set("Content-Type", "application/json");
  const t = authStore.get();
  if (t) h.set("Authorization", `Bearer ${t}`);
  let r: Response;
  try {
    r = await fetch(BASE + path, { ...opt, headers: h });
  } catch {
    throw new ApiException(0, err(null, 0));
  }
  const tx = await r.text();
  let b: unknown = null;
  try {
    b = tx ? JSON.parse(tx) : null;
  } catch {}
  if (r.status === 401) {
    authStore.clear();
    window.dispatchEvent(new Event("pea:unauthorized"));
  }
  if (!r.ok) throw new ApiException(r.status, err(b, r.status));
  return b as T;
}
const query = (p: Record<string, string | number | undefined | null>) => {
  const q = new URLSearchParams();
  Object.entries(p).forEach(
    ([k, v]) =>
      v !== undefined && v !== null && v !== "" && q.set(k, String(v)),
  );
  const s = q.toString();
  return s ? "?" + s : "";
};
export const api = {
  auth: {
    register: (d: object) =>
      req<User>("/auth/register", { method: "POST", body: JSON.stringify(d) }),
    login: (d: object) =>
      req<{ access_token: string; token_type: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(d),
      }),
    me: () => req<User>("/auth/me"),
  },
  users: {
    update: (d: object) =>
      req<User>("/users/me", { method: "PATCH", body: JSON.stringify(d) }),
  },
  expenses: {
    list: (p = {}) => req<Expense[]>("/expenses" + query(p)),
    get: (id: number) => req<Expense>("/expenses/" + id),
    create: (d: object) =>
      req<Expense>("/expenses", { method: "POST", body: JSON.stringify(d) }),
    update: (id: number, d: object) =>
      req<Expense>("/expenses/" + id, {
        method: "PATCH",
        body: JSON.stringify(d),
      }),
    remove: (id: number) => req<void>("/expenses/" + id, { method: "DELETE" }),
  },
  income: {
    list: (p = {}) => req<Income[]>("/income" + query(p)),
    get: (id: number) => req<Income>("/income/" + id),
    create: (d: object) =>
      req<Income>("/income", { method: "POST", body: JSON.stringify(d) }),
    update: (id: number, d: object) =>
      req<Income>("/income/" + id, {
        method: "PATCH",
        body: JSON.stringify(d),
      }),
    remove: (id: number) => req<void>("/income/" + id, { method: "DELETE" }),
  },
  categories: {
    list: () => req<Category[]>("/categories"),
    create: (d: object) =>
      req<Category>("/categories", { method: "POST", body: JSON.stringify(d) }),
    update: (id: number, d: object) =>
      req<Category>("/categories/" + id, {
        method: "PATCH",
        body: JSON.stringify(d),
      }),
    remove: (id: number) =>
      req<void>("/categories/" + id, { method: "DELETE" }),
  },
  budgets: {
    list: (p = {}) => req<Budget[]>("/budgets" + query(p)),
    get: (id: number) => req<Budget>("/budgets/" + id),
    create: (d: object) =>
      req<Budget>("/budgets", { method: "POST", body: JSON.stringify(d) }),
    update: (id: number, d: object) =>
      req<Budget>("/budgets/" + id, {
        method: "PATCH",
        body: JSON.stringify(d),
      }),
    remove: (id: number) => req<void>("/budgets/" + id, { method: "DELETE" }),
  },
  recurring: {
    list: (p = {}) =>
      req<RecurringTransaction[]>("/recurring-transactions" + query(p)),
    create: (d: object) =>
      req<RecurringTransaction>("/recurring-transactions", {
        method: "POST",
        body: JSON.stringify(d),
      }),
    update: (id: number, d: object) =>
      req<RecurringTransaction>("/recurring-transactions/" + id, {
        method: "PATCH",
        body: JSON.stringify(d),
      }),
    remove: (id: number) =>
      req<void>("/recurring-transactions/" + id, { method: "DELETE" }),
  },
  analytics: {
    summary: (p = {}) => req<AnalyticsSummary>("/analytics/summary" + query(p)),
    categories: (p = {}) =>
      req<CategoryTotal[]>("/analytics/categories" + query(p)),
    monthly: (year: number) =>
      req<MonthlyTotal[]>("/analytics/monthly" + query({ year })),
    trends: (year: number, month: number) =>
      req<MonthlyComparison>("/analytics/trends" + query({ year, month })),
  },
};
