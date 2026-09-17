import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import Placeholder from "../components/Placeholder";
import type { User } from "../types";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [sharedMeetups, setSharedMeetups] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isSelf = id === "me" || id === me?.id;

  useEffect(() => {
    if (isSelf) {
      setProfile(me);
      setSharedMeetups(0);
      return;
    }
    api.get(`/users/${id}`).then(({ data }) => {
      setProfile(data.user);
      setSharedMeetups(data.sharedMeetups);
    });
  }, [id, isSelf, me]);

  if (!profile) {
    return <div className="mono-label" style={{ padding: 40, textAlign: "center" }}>Loading…</div>;
  }

  const tagEntries = Object.entries(profile.ratingTagCounts || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const maxTagCount = Math.max(1, ...tagEntries.map(([, c]) => c));

  async function messageUser() {
    if (!profile) return;
    setError(null);
    try {
      const { data } = await api.post("/conversations/direct", { userId: profile.id });
      navigate(`/chat/${data.conversation.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not start a conversation.");
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", minHeight: "100vh", background: "var(--panel)" }}>
      <Placeholder label="[ PROFILE PHOTO ]" photoUrl={profile.avatarUrl} kind="avatar" height={220} />
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div className="heading" style={{ fontSize: 28 }}>{profile.name}</div>
            {profile.tier === 3 && <span className="tier-badge">✓ ID VERIFIED</span>}
          </div>
          <div className="mono-label" style={{ marginTop: 5 }}>
            {[profile.city, profile.country].filter(Boolean).join(", ").toUpperCase()}
            {profile.memberSince && ` · MEMBER SINCE ${new Date(profile.memberSince).getFullYear()}`}
          </div>
        </div>
        {profile.bio && <div style={{ fontSize: 14, color: "#c3cad2", lineHeight: 1.6 }}>{profile.bio}</div>}
        {profile.interests.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {profile.interests.map((tag) => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
          </div>
        )}

        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div className="field-label">Anonymous trust rating</div>
            <div className="heading" style={{ fontSize: 24, color: "var(--gold)" }}>{profile.ratingAvg || "—"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <span className="stars" style={{ fontSize: 14 }}>{"★".repeat(Math.round(profile.ratingAvg)) || "☆"}</span>
            <span className="mono-label" style={{ fontSize: 10 }}>FROM {profile.ratingCount} MEETUPS</span>
          </div>
          {tagEntries.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
              {tagEntries.map(([tag, count]) => (
                <div key={tag} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="mono-label" style={{ width: 74, fontSize: 10 }}>{tag}</span>
                  <span style={{ flex: 1, height: 5, background: "#262c35" }}>
                    <span style={{ display: "block", width: `${(count / maxTagCount) * 100}%`, height: 5, background: "var(--green)" }} />
                  </span>
                  <span className="mono-label" style={{ fontSize: 10 }}>{count}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: 11, color: "var(--text-faintest)", marginTop: 10, lineHeight: 1.5 }}>
            Ratings are anonymous and shown only as averages. Free-text reviews are not allowed.
          </div>
        </div>

        {profile.nextDestination?.city && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="field-label">Next destination</div>
              <div className="heading" style={{ fontSize: 19, marginTop: 4 }}>
                {profile.nextDestination.city}
                {profile.nextDestination.date && ` · ${new Date(profile.nextDestination.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
              </div>
            </div>
            {!isSelf && sharedMeetups > 0 && (
              <div className="mono-label" style={{ color: "var(--orange)" }}>{sharedMeetups} shared meetups</div>
            )}
          </div>
        )}

        {error && <div className="error-text">{error}</div>}
        {!isSelf && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={messageUser}>Message {profile.name.split(" ")[0]}</button>
            <button className="btn btn-outline" style={{ flex: 1 }}>Report</button>
          </div>
        )}
      </div>
    </div>
  );
}
