import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../hooks/auth";
import type {
  AnalyticsSummary,
  Category,
  Expense,
  Income,
  Budget,
  RecurringTransaction,
  CategoryType,
  PaymentMethod,
  TransactionType,
  Frequency,
  MonthlyTotal,
  CategoryTotal,
  MonthlyComparison,
} from "../types/api";
import {
  Alert,
  Button,
  Card,
  ConfirmDelete,
  Empty,
  Input,
  Page,
  Select,
  Spinner,
  money,
  dateText,
} from "../components/ui";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
const localDate = (value: Date) => {
  const year = value.getFullYear(),
    month = String(value.getMonth() + 1).padStart(2, "0"),
    day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const today = () => localDate(new Date());
const nav = [
  ["/dashboard", "Dashboard"],
  ["/expenses", "Expenses"],
  ["/income", "Income"],
  ["/categories", "Categories"],
  ["/budgets", "Budgets"],
  ["/recurring-transactions", "Recurring"],
  ["/analytics", "Analytics"],
  ["/profile", "Profile"],
];
export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <NavLink to="/dashboard" className="font-extrabold">
            Expense Analyzer
          </NavLink>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 sm:block">{user?.name}</span>
            <button onClick={logout} className="font-semibold">
              Logout
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {nav.map(([to, l]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                "whitespace-nowrap rounded-lg px-3 py-2 text-sm " +
                (isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100")
              }
            >
              {l}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
function useFetch<T>(fn: () => Promise<T>, deps: any[]) {
  const [data, setData] = useState<T | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    fn()
      .then(setData)
      .catch((x) => setError(x instanceof Error ? x.message : "Request failed"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, deps);
  return { data, loading, error, reload: load, setError };
}
export function Dashboard() {
  const [s, setS] = useState<AnalyticsSummary | null>(null),
    [c, setC] = useState<CategoryTotal[]>([]),
    [m, setM] = useState<MonthlyTotal[]>([]),
    [e, setE] = useState<Expense[]>([]),
    [i, setI] = useState<Income[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    const n = new Date(),
      a = localDate(new Date(n.getFullYear(), n.getMonth(), 1)),
      b = localDate(new Date(n.getFullYear(), n.getMonth() + 1, 0));
    Promise.all([
      api.analytics.summary({ date_from: a, date_to: b }),
      api.analytics.categories({ date_from: a, date_to: b }),
      api.analytics.monthly(n.getFullYear()),
      api.expenses.list({
        date_from: a,
        date_to: b,
        page: 1,
        limit: 5,
        sort_by: "expense_date",
        sort_order: "desc",
      }),
      api.income.list({ date_from: a, date_to: b, page: 1, limit: 5 }),
    ])
      .then(([s, c, m, e, i]) => {
        setS(s);
        setC(c);
        setM(m);
        setE(e);
        setI(i);
      })
      .catch((x) =>
        setError(x instanceof Error ? x.message : "Unable to load dashboard"),
      );
  }, []);
  if (!s && !error) return <Spinner />;
  return (
    <Page
      title="Dashboard"
      description="Backend-generated current-month overview."
    >
      {error && <Alert>{error}</Alert>}
      {s && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Income", s.total_income],
              ["Expenses", s.total_expenses],
              ["Balance", s.remaining_balance],
              ["Savings", s.savings],
            ].map(([l, v]) => (
              <Card key={l}>
                <p className="text-sm text-slate-500">{l}</p>
                <p className="mt-2 text-2xl font-bold">{money(v)}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 font-semibold">Monthly spending</h2>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={m}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v) => money(v as number)} />
                    <Bar dataKey="total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <h2 className="mb-4 font-semibold">Category spending</h2>
              {c.length ? (
                <div className="h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={c}
                        dataKey="total"
                        nameKey="category_name"
                        innerRadius={50}
                        outerRadius={85}
                      >
                        {c.map((_, x) => (
                          <Cell key={x} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => money(v as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Empty>No expense categories this month.</Empty>
              )}
            </Card>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 font-semibold">Recent expenses</h2>
              {e.length ? (
                e.map((x) => (
                  <div
                    key={x.id}
                    className="flex justify-between border-b py-3"
                  >
                    <div>
                      <b>{x.description || "Expense"}</b>
                      <p className="text-xs text-slate-500">
                        {dateText(x.expense_date)}
                      </p>
                    </div>
                    <b>-{money(x.amount)}</b>
                  </div>
                ))
              ) : (
                <Empty>No expenses this month.</Empty>
              )}
            </Card>
            <Card>
              <h2 className="mb-4 font-semibold">Recent income</h2>
              {i.length ? (
                i.map((x) => (
                  <div
                    key={x.id}
                    className="flex justify-between border-b py-3"
                  >
                    <div>
                      <b>{x.source}</b>
                      <p className="text-xs text-slate-500">
                        {dateText(x.income_date)}
                      </p>
                    </div>
                    <b>+{money(x.amount)}</b>
                  </div>
                ))
              ) : (
                <Empty>No income this month.</Empty>
              )}
            </Card>
          </div>
          <Card>
            <b>Budget utilization:</b>{" "}
            {s.budget_utilization == null
              ? "—"
              : money(s.budget_utilization) + "%"}
          </Card>
        </>
      )}
    </Page>
  );
}
export function Expenses() {
  const { data: cats } = useFetch(api.categories.list, []);
  const [items, setItems] = useState<Expense[]>([]),
    [edit, setEdit] = useState<Expense | null>(null),
    [error, setError] = useState("");
  const [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [pm, setPm] = useState("");
  const load = () =>
    api.expenses
      .list({
        date_from: from || undefined,
        date_to: to || undefined,
        payment_method: pm || undefined,
        page: 1,
        limit: 100,
        sort_by: "expense_date",
        sort_order: "desc",
      })
      .then(setItems)
      .catch((x) =>
        setError(x instanceof Error ? x.message : "Unable to load expenses"),
      );
  useEffect(() => {
    load();
  }, [from, to, pm]);
  return (
    <Page
      title="Expenses"
      description="Expense CRUD, filters and sorting."
      actions={
        <Button
          onClick={() =>
            setEdit({
              id: 0,
              user_id: 0,
              category_id: cats?.find((c) => c.type === "expense")?.id || 0,
              amount: "",
              description: null,
              expense_date: today(),
              payment_method: "cash",
            })
          }
        >
          Add expense
        </Button>
      }
    >
      {error && <Alert>{error}</Alert>}
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="From"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Select
            label="Payment method"
            value={pm}
            onChange={(e) => setPm(e.target.value)}
          >
            <option value="">All</option>
            {["cash", "card", "bank_transfer", "mobile_payment", "other"].map(
              (x) => (
                <option key={x}>{x}</option>
              ),
            )}
          </Select>
        </div>
      </Card>
      {edit && (
        <ExpenseForm
          item={edit}
          cats={cats || []}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            load();
          }}
          setError={setError}
        />
      )}
      <Card>
        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-500">
                  <th className="p-3">Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr className="border-b" key={x.id}>
                    <td className="p-3">{dateText(x.expense_date)}</td>
                    <td>{x.description || "—"}</td>
                    <td>
                      {cats?.find((c) => c.id === x.category_id)?.name ||
                        "#" + x.category_id}
                    </td>
                    <td>{x.payment_method}</td>
                    <td>{money(x.amount)}</td>
                    <td>
                      <Button variant="ghost" onClick={() => setEdit(x)}>
                        Edit
                      </Button>{" "}
                      <ConfirmDelete
                        onConfirm={async () => {
                          try {
                            await api.expenses.remove(x.id);
                            load();
                          } catch (z) {
                            setError(
                              z instanceof Error ? z.message : "Delete failed",
                            );
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No expenses match these filters.</Empty>
        )}
      </Card>
    </Page>
  );
}
function ExpenseForm({
  item,
  cats,
  onClose,
  onSaved,
  setError,
}: {
  item: Expense;
  cats: Category[];
  onClose: () => void;
  onSaved: () => void;
  setError: (s: string) => void;
}) {
  const [f, setF] = useState({
    category_id: String(item.category_id || ""),
    amount: item.amount,
    description: item.description || "",
    expense_date: item.expense_date,
    payment_method: item.payment_method,
  });
  return (
    <Card>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const d = {
              ...f,
              category_id: Number(f.category_id),
              description: f.description || null,
            };
            if (item.id) await api.expenses.update(item.id, d);
            else await api.expenses.create(d);
            onSaved();
          } catch (x) {
            setError(x instanceof Error ? x.message : "Save failed");
          }
        }}
      >
        <Select
          label="Category"
          value={f.category_id}
          onChange={(e) => setF({ ...f, category_id: e.target.value })}
          required
        >
          <option value="">Select</option>
          {cats
            .filter((c) => c.type === "expense")
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </Select>
        <Input
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={f.amount}
          onChange={(e) => setF({ ...f, amount: e.target.value })}
          required
        />
        <Input
          label="Date"
          type="date"
          value={f.expense_date}
          onChange={(e) => setF({ ...f, expense_date: e.target.value })}
          required
        />
        <Select
          label="Payment method"
          value={f.payment_method}
          onChange={(e) =>
            setF({ ...f, payment_method: e.target.value as PaymentMethod })
          }
        >
          {["cash", "card", "bank_transfer", "mobile_payment", "other"].map(
            (x) => (
              <option key={x}>{x}</option>
            ),
          )}
        </Select>
        <Input
          label="Description"
          value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })}
          maxLength={1000}
        />
        <div className="flex gap-2">
          <Button>Save</Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
export function Income() {
  const [items, setItems] = useState<Income[]>([]),
    [edit, setEdit] = useState<Income | null>(null),
    [error, setError] = useState("");
  const load = () =>
    api.income
      .list({ page: 1, limit: 100 })
      .then(setItems)
      .catch((x) =>
        setError(x instanceof Error ? x.message : "Unable to load income"),
      );
  useEffect(() => {
    load();
  }, []);
  return (
    <Page
      title="Income"
      description="Track salary and other income."
      actions={
        <Button
          onClick={() =>
            setEdit({
              id: 0,
              user_id: 0,
              amount: "",
              source: "",
              income_date: today(),
              description: null,
            })
          }
        >
          Add income
        </Button>
      }
    >
      {error && <Alert>{error}</Alert>}
      {edit && (
        <IncomeForm
          item={edit}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            load();
          }}
          setError={setError}
        />
      )}
      <Card>
        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-500">
                  <th className="p-3">Date</th>
                  <th>Source</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr className="border-b" key={x.id}>
                    <td className="p-3">{dateText(x.income_date)}</td>
                    <td>{x.source}</td>
                    <td>{x.description || "—"}</td>
                    <td>{money(x.amount)}</td>
                    <td>
                      <Button variant="ghost" onClick={() => setEdit(x)}>
                        Edit
                      </Button>{" "}
                      <ConfirmDelete
                        onConfirm={async () => {
                          try {
                            await api.income.remove(x.id);
                            load();
                          } catch (z) {
                            setError(
                              z instanceof Error ? z.message : "Delete failed",
                            );
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No income records yet.</Empty>
        )}
      </Card>
    </Page>
  );
}
function IncomeForm({
  item,
  onClose,
  onSaved,
  setError,
}: {
  item: Income;
  onClose: () => void;
  onSaved: () => void;
  setError: (s: string) => void;
}) {
  const [f, setF] = useState({
    amount: item.amount,
    source: item.source,
    income_date: item.income_date,
    description: item.description || "",
  });
  return (
    <Card>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const d = { ...f, description: f.description || null };
            if (item.id) await api.income.update(item.id, d);
            else await api.income.create(d);
            onSaved();
          } catch (x) {
            setError(x instanceof Error ? x.message : "Save failed");
          }
        }}
      >
        <Input
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={f.amount}
          onChange={(e) => setF({ ...f, amount: e.target.value })}
          required
        />
        <Input
          label="Source"
          value={f.source}
          onChange={(e) => setF({ ...f, source: e.target.value })}
          required
          maxLength={100}
        />
        <Input
          label="Date"
          type="date"
          value={f.income_date}
          onChange={(e) => setF({ ...f, income_date: e.target.value })}
          required
        />
        <Input
          label="Description"
          value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })}
          maxLength={1000}
        />
        <div className="flex gap-2">
          <Button>Save</Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
export function Categories() {
  const { data, loading, error, reload, setError } = useFetch(
    api.categories.list,
    [],
  );
  const [edit, setEdit] = useState<Category | null>(null),
    [name, setName] = useState(""),
    [type, setType] = useState<CategoryType>("expense");
  const open = (c?: Category) => {
    setEdit(c || { id: 0, name: "", type: "expense", user_id: 0 });
    setName(c?.name || "");
    setType(c?.type || "expense");
  };
  if (loading) return <Spinner />;
  return (
    <Page
      title="Categories"
      description="Manage user-owned categories; global categories are read-only."
      actions={<Button onClick={() => open()}>Add category</Button>}
    >
      {error && <Alert>{error}</Alert>}
      {edit && (
        <Card>
          <form
            className="grid gap-4 md:grid-cols-3"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (edit.id)
                  await api.categories.update(edit.id, { name, type });
                else await api.categories.create({ name, type });
                setEdit(null);
                reload();
              } catch (x) {
                setError(x instanceof Error ? x.message : "Save failed");
              }
            }}
          >
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as CategoryType)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
            <div className="flex items-end gap-2">
              <Button>Save</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEdit(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card>
        {data?.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c) => (
              <div key={c.id} className="rounded-xl border p-4">
                <div className="flex justify-between">
                  <div>
                    <b>{c.name}</b>
                    <p className="text-xs uppercase text-slate-500">
                      {c.type}
                      {c.user_id === null ? " · global" : ""}
                    </p>
                  </div>
                  {c.user_id !== null && (
                    <>
                      <Button variant="ghost" onClick={() => open(c)}>
                        Edit
                      </Button>
                      <ConfirmDelete
                        onConfirm={async () => {
                          try {
                            await api.categories.remove(c.id);
                            reload();
                          } catch (x) {
                            setError(
                              x instanceof Error ? x.message : "Delete failed",
                            );
                          }
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty>No categories available.</Empty>
        )}
      </Card>
    </Page>
  );
}
export function Budgets() {
  const { data: cats } = useFetch(api.categories.list, []);
  const [items, setItems] = useState<Budget[]>([]),
    [edit, setEdit] = useState<Budget | null>(null),
    [error, setError] = useState("");
  const load = () =>
    api.budgets
      .list({ page: 1, limit: 100 })
      .then(setItems)
      .catch((x) =>
        setError(x instanceof Error ? x.message : "Unable to load budgets"),
      );
  useEffect(() => {
    load();
  }, []);
  return (
    <Page
      title="Budgets"
      description="Monthly category budgets."
      actions={
        <Button
          onClick={() =>
            setEdit({
              id: 0,
              user_id: 0,
              category_id: cats?.find((c) => c.type === "expense")?.id || 0,
              amount: "",
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
            })
          }
        >
          Add budget
        </Button>
      }
    >
      {error && <Alert>{error}</Alert>}
      {edit && (
        <BudgetForm
          item={edit}
          cats={cats || []}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            load();
          }}
          setError={setError}
        />
      )}
      <Card>
        {items.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((x) => (
              <div className="rounded-xl border p-4" key={x.id}>
                <div className="flex justify-between">
                  <div>
                    <b>
                      {cats?.find((c) => c.id === x.category_id)?.name ||
                        "#" + x.category_id}
                    </b>
                    <p className="text-sm text-slate-500">
                      {new Date(2000, x.month - 1).toLocaleString(undefined, {
                        month: "long",
                      })}{" "}
                      {x.year}
                    </p>
                  </div>
                  <b>{money(x.amount)}</b>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Per-budget utilization is not available from the current API.
                </p>
                <div className="mt-3">
                  <Button variant="ghost" onClick={() => setEdit(x)}>
                    Edit
                  </Button>{" "}
                  <ConfirmDelete
                    onConfirm={async () => {
                      try {
                        await api.budgets.remove(x.id);
                        load();
                      } catch (z) {
                        setError(
                          z instanceof Error ? z.message : "Delete failed",
                        );
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty>No budgets yet.</Empty>
        )}
      </Card>
    </Page>
  );
}
function BudgetForm({
  item,
  cats,
  onClose,
  onSaved,
  setError,
}: {
  item: Budget;
  cats: Category[];
  onClose: () => void;
  onSaved: () => void;
  setError: (s: string) => void;
}) {
  const [f, setF] = useState({
    category_id: String(item.category_id || ""),
    amount: item.amount,
    month: String(item.month),
    year: String(item.year),
  });
  return (
    <Card>
      <form
        className="grid gap-4 md:grid-cols-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const d = {
              category_id: Number(f.category_id),
              amount: f.amount,
              month: Number(f.month),
              year: Number(f.year),
            };
            if (item.id) await api.budgets.update(item.id, d);
            else await api.budgets.create(d);
            onSaved();
          } catch (x) {
            setError(x instanceof Error ? x.message : "Save failed");
          }
        }}
      >
        <Select
          label="Category"
          value={f.category_id}
          onChange={(e) => setF({ ...f, category_id: e.target.value })}
        >
          {cats
            .filter((c) => c.type === "expense")
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </Select>
        <Input
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={f.amount}
          onChange={(e) => setF({ ...f, amount: e.target.value })}
          required
        />
        <Input
          label="Month"
          type="number"
          min="1"
          max="12"
          value={f.month}
          onChange={(e) => setF({ ...f, month: e.target.value })}
          required
        />
        <Input
          label="Year"
          type="number"
          min="2000"
          max="2100"
          value={f.year}
          onChange={(e) => setF({ ...f, year: e.target.value })}
          required
        />
        <div className="flex gap-2 md:col-span-4">
          <Button>Save</Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
export function Recurring() {
  const { data: cats } = useFetch(api.categories.list, []);
  const [items, setItems] = useState<RecurringTransaction[]>([]),
    [edit, setEdit] = useState<RecurringTransaction | null>(null),
    [error, setError] = useState("");
  const load = () =>
    api.recurring
      .list({ page: 1, limit: 100 })
      .then(setItems)
      .catch((x) =>
        setError(
          x instanceof Error
            ? x.message
            : "Unable to load recurring transactions",
        ),
      );
  useEffect(() => {
    load();
  }, []);
  return (
    <Page
      title="Recurring transactions"
      description="Recurring definitions supported by the backend."
      actions={
        <Button
          onClick={() =>
            setEdit({
              id: 0,
              user_id: 0,
              category_id: cats?.[0]?.id || 0,
              amount: "",
              transaction_type: "expense",
              frequency: "monthly",
              next_date: today(),
              is_active: true,
            })
          }
        >
          Add recurring
        </Button>
      }
    >
      {error && <Alert>{error}</Alert>}
      {edit && (
        <RecurringForm
          item={edit}
          cats={cats || []}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            load();
          }}
          setError={setError}
        />
      )}
      <Card>
        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-500">
                  <th className="p-3">Next date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Frequency</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr className="border-b" key={x.id}>
                    <td className="p-3">{dateText(x.next_date)}</td>
                    <td>
                      {cats?.find((c) => c.id === x.category_id)?.name ||
                        "#" + x.category_id}
                    </td>
                    <td>{x.transaction_type}</td>
                    <td>{x.frequency}</td>
                    <td>{money(x.amount)}</td>
                    <td>{x.is_active ? "Active" : "Inactive"}</td>
                    <td>
                      <Button variant="ghost" onClick={() => setEdit(x)}>
                        Edit
                      </Button>{" "}
                      <ConfirmDelete
                        onConfirm={async () => {
                          try {
                            await api.recurring.remove(x.id);
                            load();
                          } catch (z) {
                            setError(
                              z instanceof Error ? z.message : "Delete failed",
                            );
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No recurring transactions yet.</Empty>
        )}
      </Card>
    </Page>
  );
}
function RecurringForm({
  item,
  cats,
  onClose,
  onSaved,
  setError,
}: {
  item: RecurringTransaction;
  cats: Category[];
  onClose: () => void;
  onSaved: () => void;
  setError: (s: string) => void;
}) {
  const [f, setF] = useState({
    ...item,
    category_id: String(item.category_id),
  });
  const typeCats = cats.filter((c) => c.type === f.transaction_type);
  return (
    <Card>
      <form
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const d = { ...f, category_id: Number(f.category_id) };
            if (f.id) await api.recurring.update(f.id, d);
            else await api.recurring.create(d);
            onSaved();
          } catch (x) {
            setError(x instanceof Error ? x.message : "Save failed");
          }
        }}
      >
        <Select
          label="Type"
          value={f.transaction_type}
          onChange={(e) =>
            setF({
              ...f,
              transaction_type: e.target.value as TransactionType,
              category_id: "",
            })
          }
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
        <Select
          label="Category"
          value={f.category_id}
          onChange={(e) => setF({ ...f, category_id: e.target.value })}
        >
          <option value="">Select</option>
          {typeCats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={f.amount}
          onChange={(e) => setF({ ...f, amount: e.target.value })}
          required
        />
        <Select
          label="Frequency"
          value={f.frequency}
          onChange={(e) =>
            setF({ ...f, frequency: e.target.value as Frequency })
          }
        >
          {["daily", "weekly", "monthly", "yearly"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Select>
        <Input
          label="Next date"
          type="date"
          value={f.next_date}
          onChange={(e) => setF({ ...f, next_date: e.target.value })}
          required
        />
        <label className="flex items-center gap-2 pt-8 text-sm">
          <input
            type="checkbox"
            checked={f.is_active}
            onChange={(e) => setF({ ...f, is_active: e.target.checked })}
          />
          Active
        </label>
        <div className="flex gap-2 lg:col-span-3">
          <Button>Save</Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
export function Analytics() {
  const [s, setS] = useState<AnalyticsSummary | null>(null),
    [c, setC] = useState<CategoryTotal[]>([]),
    [m, setM] = useState<MonthlyTotal[]>([]),
    [t, setT] = useState<MonthlyComparison | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const n = new Date(),
      a = localDate(new Date(n.getFullYear(), n.getMonth(), 1)),
      b = localDate(new Date(n.getFullYear(), n.getMonth() + 1, 0));
    Promise.all([
      api.analytics.summary({ date_from: a, date_to: b }),
      api.analytics.categories({ date_from: a, date_to: b }),
      api.analytics.monthly(n.getFullYear()),
      api.analytics.trends(n.getFullYear(), n.getMonth() + 1),
    ])
      .then(([s, c, m, t]) => {
        setS(s);
        setC(c);
        setM(m);
        setT(t);
      })
      .catch((x) =>
        setError(x instanceof Error ? x.message : "Unable to load analytics"),
      );
  }, []);
  if (!s && !error) return <Spinner />;
  return (
    <Page
      title="Analytics"
      description="Actual backend analytics; no fabricated financial data."
    >
      {error && <Alert>{error}</Alert>}
      {s && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Average expense", money(s.average_transaction_amount)],
              ["Largest expense", money(s.largest_expense)],
              ["Transactions", String(s.transaction_count)],
              [
                "Budget utilization",
                s.budget_utilization == null
                  ? "—"
                  : money(s.budget_utilization) + "%",
              ],
            ].map(([l, v]) => (
              <Card key={l}>
                <p className="text-sm text-slate-500">{l}</p>
                <p className="mt-2 text-2xl font-bold">{v}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 font-semibold">Monthly spending</h2>
              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart data={m}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v) => money(v as number)} />
                    <Line type="monotone" dataKey="total" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <h2 className="mb-4 font-semibold">Category totals</h2>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={c}>
                    <XAxis dataKey="category_name" />
                    <YAxis />
                    <Tooltip formatter={(v) => money(v as number)} />
                    <Bar dataKey="total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          {t && (
            <Card>
              <h2 className="font-semibold">Month-over-month</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {[
                  ["Current", money(t.current_total)],
                  ["Previous", money(t.previous_total)],
                  ["Change", money(t.absolute_change)],
                  [
                    "Change %",
                    t.percentage_change == null
                      ? "—"
                      : money(t.percentage_change) + "%",
                  ],
                ].map(([l, v]) => (
                  <div className="rounded-xl bg-slate-50 p-4" key={l}>
                    <p className="text-xs text-slate-500">{l}</p>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </Page>
  );
}
