import { Link } from "react-router-dom";
import Placeholder from "../components/Placeholder";

const FEATURES = [
  {
    title: "Three-tier ID check",
    body: "Email, phone, then government ID. Your tier is visible on every card you appear in.",
  },
  {
    title: "Anonymous trust ratings",
    body: "After a meetup, both sides rate with stars and fixed tags. No public comments, ever.",
  },
  {
    title: "Public meetups only",
    body: "Meetups list a real place, a time, and who is coming. Attendee lists are never hidden.",
  },
];

const HOW_IT_WORKS = [
  { step: "1 — Verify", body: "Work up the tiers at your own pace. Tier 3 unlocks messaging and hosting meetups.", label: "ID SCAN ILLUSTRATION" },
  { step: "2 — Meet", body: "Scroll one feed of posts, nearby travelers and meetups. Join, message, or keep scrolling.", label: "FEED SCREENSHOT" },
  { step: "3 — Rate", body: "Rate anonymously afterwards. Ratings only show as an average and the top three tags.", label: "RATING UI ILLUSTRATION" },
];

const FEED_PREVIEW = [
  { label: "Post · Alfama", sub: "Sunset stairs, 6pm" },
  { label: "Profile · Mira", sub: "Tier 3 · 4.9 ★", accent: true },
  { label: "Meetup · Tram 28", sub: "Sat 10:00 · 6 going" },
  { label: "Post · Sintra", sub: "Day trip, 3 seats" },
];

export default function Landing() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 44px",
          borderBottom: "1px solid var(--border)",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "var(--orange)" }} />
          <div className="heading" style={{ fontSize: 17, letterSpacing: "0.18em" }}>TRAVELWITHME</div>
        </div>
        <div
          className="mono-label"
          style={{ display: "flex", gap: 34, color: "var(--text-dim)" }}
        >
          <Link to="/" style={{ color: "#fff", borderBottom: "2px solid var(--orange)", paddingBottom: 4 }}>Home</Link>
          <a href="#how-trust-works" style={{ color: "var(--text-dim)" }}>How trust works</a>
          <a href="#meetups-preview" style={{ color: "var(--text-dim)" }}>Meetups</a>
          <span title="Coming soon" style={{ color: "var(--text-faintest)", cursor: "default" }}>Safety</span>
          <span title="Coming soon" style={{ color: "var(--text-faintest)", cursor: "default" }}>Support</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Link to="/login" className="mono-label" style={{ color: "var(--text-dim)" }}>Log in</Link>
          <Link to="/signup" className="btn btn-primary" style={{ padding: "11px 18px" }}>Get verified</Link>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          minHeight: 620,
          backgroundImage: "url(/images/landing/hero-bg.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: 64,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(12,14,18,0.35) 0%,rgba(12,14,18,0.15) 40%,rgba(12,14,18,0.92) 100%)" }} />
        <div style={{ position: "relative", padding: "0 44px" }}>
          <div className="heading" style={{ fontSize: "clamp(40px, 7vw, 104px)", lineHeight: 0.94, fontWeight: 700, maxWidth: 760 }}>
            Travel alone.<br />Never arrive<br />a stranger.
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 28, flexWrap: "wrap" }}>
            <Link to="/signup" className="btn btn-primary">Create account →</Link>
            <Link to="/signup" className="btn btn-outline">See how verification works</Link>
          </div>
          <div style={{ fontSize: 16, color: "var(--text-dim)", maxWidth: 520, marginTop: 22, lineHeight: 1.6 }}>
            A feed of verified travelers near you — their posts, their meetups, their trust record. Identity checked before anyone can message you.
          </div>
        </div>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 46, borderTop: "1px solid rgba(255,255,255,0.14)" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ padding: "26px 44px", borderRight: "1px solid rgba(255,255,255,0.10)" }}>
              <div className="heading" style={{ fontSize: 13, letterSpacing: "0.16em", color: "var(--green)", marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.55 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div id="how-trust-works" style={{ padding: "76px 44px", background: "var(--panel)" }}>
        <div className="mono-label" style={{ textAlign: "center" }}>Built for people travelling solo</div>
        <div className="heading" style={{ textAlign: "center", fontSize: 42, marginTop: 14 }}>How trust works</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28, marginTop: 52 }}>
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="card">
              <Placeholder label={`[ ${item.label} ]`} height={180} />
              <div style={{ padding: 24 }}>
                <div className="heading" style={{ fontSize: 20, letterSpacing: "0.1em" }}>{item.step}</div>
                <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginTop: 10 }}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="meetups-preview" style={{ padding: "34px 44px 76px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 34, flexWrap: "wrap", gap: 12 }}>
          <div className="heading" style={{ fontSize: 30, letterSpacing: "0.08em" }}>Live near Lisbon</div>
          <Link to="/signup" className="mono-label" style={{ color: "var(--orange)" }}>Open the feed →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginTop: 26 }}>
          {FEED_PREVIEW.map((item) => (
            <div key={item.label} className="card">
              <Placeholder label="[ PHOTO ]" height={210} />
              <div style={{ padding: 16 }}>
                <div className="heading" style={{ fontSize: 15, letterSpacing: "0.1em" }}>{item.label}</div>
                <div style={{ fontSize: 13, color: item.accent ? "var(--green)" : "var(--text-dimmer)", marginTop: 6 }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "72px 44px", background: "var(--placeholder-hero)", borderTop: "1px solid var(--border)" }}>
        <div className="heading" style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, lineHeight: 1, maxWidth: 640 }}>
          Verified before<br />you say hello
        </div>
        <div style={{ fontSize: 16, color: "var(--text-dim)", maxWidth: 480, marginTop: 18, lineHeight: 1.6 }}>
          Verification takes about four minutes. You can browse the feed after email, and message once your ID clears.
        </div>
        <Link to="/signup" className="btn btn-primary" style={{ marginTop: 26, display: "inline-flex" }}>Start verification →</Link>
      </div>
      <div className="mono-label" style={{ display: "flex", justifyContent: "space-between", padding: "24px 44px", borderTop: "1px solid var(--border)", flexWrap: "wrap", gap: 12 }}>
        <div>TravelWithMe © 2026</div>
        <div style={{ display: "flex", gap: 26 }}>
          <span title="Coming soon" style={{ color: "var(--text-faintest)", cursor: "default" }}>Safety centre</span>
          <span title="Coming soon" style={{ color: "var(--text-faintest)", cursor: "default" }}>Report a user</span>
          <span title="Coming soon" style={{ color: "var(--text-faintest)", cursor: "default" }}>Privacy</span>
        </div>
      </div>
    </div>
  );
}
