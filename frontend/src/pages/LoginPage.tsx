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
      <div className="auth-glow auth-glow-left" aria-hidden="true" />
      <div className="auth-glow auth-glow-right" aria-hidden="true" />
      <section className="auth-layout">
        <div className="auth-intro">
          <div className="brand-mark" aria-hidden="true">D</div>
          <span className="eyebrow">每日状态复盘</span>
          <h1>DayMind</h1>
          <p>记录真实一天，看清自己的状态。</p>
          <div className="auth-note">
            <span aria-hidden="true" />
            每天结束时，留一点时间给自己。
          </div>
        </div>

        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card-header">
            <span>欢迎回来</span>
            <h2>登录 DayMind</h2>
            <p>继续记录今天，也继续理解自己。</p>
          </div>
          <label className="field-label">
            <span>电子邮箱</span>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="field-label">
            <span>密码</span>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="输入你的密码"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <div className="error-text auth-error" role="alert">{error}</div>}
          <Button className="auth-submit" disabled={loading}>
            {loading ? "登录中…" : "登录"}
          </Button>
          <span className="auth-link">还没有账号？<Link to="/register">创建账号</Link></span>
        </form>
      </section>
    </main>
  );
}
