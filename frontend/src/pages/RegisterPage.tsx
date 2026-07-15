import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/errors";
import { Button } from "../components/base/Button";
import { Input } from "../components/base/Input";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const { user, register } = useAuth();
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
      await register(email, password);
      navigate("/app");
    } catch (err) {
      setError(getApiErrorMessage(err, "注册失败"));
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
          <p>每天结束时，给自己一份清晰的今日洞察。</p>
          <div className="auth-note">
            <span aria-hidden="true" />
            真实记录，比完美答案更重要。
          </div>
        </div>

        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card-header">
            <span>从今天开始</span>
            <h2>创建账号</h2>
            <p>用几分钟记录一天，慢慢看见自己的节奏。</p>
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
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 6 位密码"
              autoComplete="new-password"
              required
            />
          </label>
          {error && <div className="error-text auth-error" role="alert">{error}</div>}
          <Button className="auth-submit" disabled={loading}>
            {loading ? "注册中…" : "创建账号"}
          </Button>
          <span className="auth-link">已有账号？<Link to="/login">直接登录</Link></span>
        </form>
      </section>
    </main>
  );
}
