import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Placeholder from "../components/Placeholder";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/feed");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Placeholder label="[ COVER PHOTO ]" height={180} variant="hero" />
      <div style={{ maxWidth: 440, width: "100%", margin: "0 auto", padding: "32px 22px", display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
        <div className="heading" style={{ fontSize: 32, lineHeight: 1.05 }}>Welcome<br />back</div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="text-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mira.k@fastmail.com" required />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label className="field-label" htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="text-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                style={{ borderColor: "var(--orange)" }}
              />
              <span
                onClick={() => setShowPassword((s) => !s)}
                style={{ position: "absolute", right: 14, top: 14, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--orange)", letterSpacing: "0.1em", cursor: "pointer" }}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </span>
            </div>
          </div>
          {error && <div className="error-text">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Logging in…" : "Log in →"}
          </button>
        </form>
        <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-dimmer)" }}>
          New here? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
