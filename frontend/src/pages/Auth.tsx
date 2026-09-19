import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth";
import { Alert, Button, Input } from "../components/ui";
export function Login() {
  const { login } = useAuth(),
    nav = useNavigate();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState("");
  return (
    <Shell title="Welcome back">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await login(email, password);
            nav("/dashboard");
          } catch (x) {
            setError(x instanceof Error ? x.message : "Unable to sign in");
          }
        }}
      >
        {error && <Alert>{error}</Alert>}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button className="w-full">Sign in</Button>
        <p className="text-center text-sm text-slate-500">
          No account?{" "}
          <Link to="/register" className="font-semibold text-slate-900">
            Create one
          </Link>
        </p>
      </form>
    </Shell>
  );
}
export function Register() {
  const { register } = useAuth(),
    nav = useNavigate();
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState("");
  return (
    <Shell title="Create your account">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (password.length < 8)
            return setError("Password must be at least 8 characters.");
          try {
            await register(name, email, password);
            nav("/dashboard");
          } catch (x) {
            setError(x instanceof Error ? x.message : "Unable to register");
          }
        }}
      >
        {error && <Alert>{error}</Alert>}
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          maxLength={128}
          required
        />
        <Button className="w-full">Create account</Button>
        <p className="text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-slate-900">
            Sign in
          </Link>
        </p>
      </form>
    </Shell>
  );
}
function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-500">
          Personal Expense Analyzer
        </p>
        <h1 className="mb-6 text-2xl font-bold">{title}</h1>
        {children}
      </div>
    </div>
  );
}
