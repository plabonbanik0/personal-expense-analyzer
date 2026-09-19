import { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../hooks/auth";
import { Alert, Button, Card, Input, Page } from "../components/ui";

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

export function ProfilePage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    try {
      await api.users.update({ name, email });
      await refresh();
      setMessage("Your profile details have been updated.");
    } catch (x) {
      setError(x instanceof Error ? x.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page
      title="Profile"
      description="Manage your personal details and account preferences."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
        <Card className="overflow-hidden p-0">
          <div className="bg-slate-900 px-6 py-8 text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-bold text-slate-900 shadow-lg">
              {initials(user.name)}
            </div>
            <h2 className="mt-5 text-xl font-bold">{user.name}</h2>
            <p className="mt-1 break-all text-sm text-slate-300">
              {user.email}
            </p>
          </div>
          <div className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">Account status</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${user.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Account access
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your account is protected by authenticated access. Passwords are
                never displayed here.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="border-b border-slate-100 pb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Personal details
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Keep your account up to date
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              These details are used across your expense workspace.
            </p>
          </div>
          <form className="mt-6 space-y-5" onSubmit={save}>
            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert>{error}</Alert>}
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Changes are saved securely to your account.
              </p>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Card className="flex flex-col gap-4 border-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Security
          </p>
          <h2 className="mt-1 font-bold text-slate-900">
            Your account is connected
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Authentication is handled by the Personal Expense Analyzer API.
          </p>
        </div>
        <span className="whitespace-nowrap rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          Protected account
        </span>
      </Card>
    </Page>
  );
}
