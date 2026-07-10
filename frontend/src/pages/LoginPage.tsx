import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/errors";
import { Button } from "../components/base/Button";
import { Input } from "../components/base/Input";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError(getApiErrorMessage(err, "登录失败"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>DayMind</h1>
        <p>登录后继续你的每日状态复盘。</p>
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="邮箱" required />
        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="密码" required />
        {error && <div className="error-text">{error}</div>}
        <Button disabled={loading}>{loading ? "登录中" : "登录"}</Button>
        <span className="auth-link">还没有账号？<Link to="/register">注册</Link></span>
      </form>
    </main>
  );
}
