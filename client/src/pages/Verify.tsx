import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import Placeholder from "../components/Placeholder";

export default function Verify() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function advanceTier(tier: 2 | 3, extra?: { phone?: string }) {
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post("/users/me/verify", { tier, ...extra });
      setUser(data.user);
      if (tier === 3) navigate("/feed");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const step = Math.min(user.tier + 1, 3);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 520, margin: "0 auto", width: "100%" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--text-dim)", cursor: "pointer" }} onClick={() => navigate(-1)}>←</span>
        <div className="mono-label">Step {step} of 3</div>
        <span className="mono-label" style={{ color: "var(--orange)", cursor: "pointer" }} onClick={() => navigate("/feed")}>Skip</span>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "18px 22px 0", maxWidth: 520, margin: "0 auto", width: "100%" }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ flex: 1, height: 3, background: n <= user.tier ? "var(--green)" : n === step ? "var(--orange)" : "rgba(255,255,255,0.12)" }} />
        ))}
      </div>
      <div style={{ padding: "24px 22px", display: "flex", flexDirection: "column", gap: 14, flex: 1, maxWidth: 520, margin: "0 auto", width: "100%" }}>
        <div className="heading" style={{ fontSize: 30, lineHeight: 1.05 }}>Verify your<br />identity</div>
        <div style={{ fontSize: 14, color: "var(--text-dimmer)", lineHeight: 1.6 }}>
          Tier 3 unlocks messaging, hosting meetups and the verified badge on your cards.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
          <TierRow done label="Tier 1 · Email" detail={`Confirmed`} />

          {user.tier >= 2 ? (
            <TierRow done label="Tier 2 · Phone" detail={user.phone ? `${user.phone} confirmed` : "Confirmed"} />
          ) : (
            <div style={{ border: "1px solid var(--orange)", background: "var(--card)", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              <TierHeader n={2} label="Tier 2 · Phone" detail="We'll send a one-time code by SMS" />
              <input
                className="text-input"
                placeholder="+351 900 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button
                className="btn btn-primary"
                disabled={submitting || !phone}
                onClick={() => advanceTier(2, { phone })}
              >
                Confirm phone
              </button>
            </div>
          )}

          {user.tier >= 3 ? (
            <TierRow done label="Tier 3 · Government ID" detail="Confirmed" />
          ) : (
            <div
              style={{
                border: user.tier >= 2 ? "1px solid var(--orange)" : "1px solid rgba(255,255,255,0.1)",
                background: "var(--card)",
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                opacity: user.tier >= 2 ? 1 : 0.5,
              }}
            >
              <TierHeader n={3} label="Tier 3 · Government ID" detail="Passport, ID card or driving licence" />
              <Placeholder label="[ CAMERA FRAME — SCAN DOCUMENT ]" height={150} style={{ border: "1px dashed rgba(255,255,255,0.2)" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} disabled={submitting || user.tier < 2} onClick={() => advanceTier(3)}>
                  Scan now
                </button>
                <button className="btn btn-outline" style={{ flex: 1 }} disabled={submitting || user.tier < 2} onClick={() => advanceTier(3)}>
                  Upload file
                </button>
              </div>
            </div>
          )}
        </div>
        {error && <div className="error-text">{error}</div>}
        <div style={{ marginTop: "auto", fontSize: 12, color: "var(--text-faintest)", lineHeight: 1.6, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          Documents are checked by our provider and deleted after 30 days. Your ID is never shown to other travelers — only your tier is.
        </div>
      </div>
    </div>
  );
}

function TierHeader({ n, label, detail }: { n: number; label: string; detail: string }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid var(--orange)", color: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 13 }}>
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div className="heading" style={{ fontSize: 16, letterSpacing: "0.1em" }}>{label}</div>
        <div style={{ fontSize: 13, color: "var(--text-dimmer)", marginTop: 3 }}>{detail}</div>
      </div>
    </div>
  );
}

function TierRow({ done, label, detail }: { done: boolean; label: string; detail: string }) {
  return (
    <div style={{ border: "1px solid rgba(90,194,160,0.4)", background: "rgba(90,194,160,0.07)", padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--green)", color: "#10221c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600 }}>
        {done ? "✓" : ""}
      </div>
      <div style={{ flex: 1 }}>
        <div className="heading" style={{ fontSize: 16, letterSpacing: "0.1em" }}>{label}</div>
        <div style={{ fontSize: 13, color: "#8fb8ab", marginTop: 3 }}>{detail}</div>
      </div>
    </div>
  );
}
