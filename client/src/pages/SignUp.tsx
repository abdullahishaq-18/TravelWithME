import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Placeholder from "../components/Placeholder";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(name, email, password);
      navigate("/verify");
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
        <div className="heading" style={{ fontSize: 32, lineHeight: 1.05 }}>Create your<br />account</div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label className="field-label" htmlFor="name">Name</label>
            <input id="name" className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mira K." required />
          </div>
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
                minLength={8}
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
            {submitting ? "Creating…" : "Continue →"}
          </button>
        </form>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-faintest)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em" }}>
          <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />OR<span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button type="button" className="btn btn-outline" style={{ width: "100%" }}>Continue with Apple</button>
          <button type="button" className="btn btn-outline" style={{ width: "100%" }}>Continue with Google</button>
        </div>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 14, paddingTop: 24 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", borderLeft: "2px solid var(--green)", paddingLeft: 12 }}>
            <div style={{ fontSize: 13, color: "var(--text-dimmer)", lineHeight: 1.55 }}>
              Every account is identity-checked. Nobody can message you before their ID clears.
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-dimmer)" }}>
            Already a member? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
