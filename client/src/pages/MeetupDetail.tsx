import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import Placeholder from "../components/Placeholder";
import Avatar from "../components/Avatar";
import type { Meetup } from "../types";

export default function MeetupDetail() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/meetups/${id}`).then(({ data }) => setMeetup(data.meetup));
  }, [id]);

  if (!meetup) {
    return <div className="mono-label" style={{ padding: 40, textAlign: "center" }}>Loading…</div>;
  }

  const starts = new Date(meetup.startsAt);
  const durationHours = Math.round((meetup.durationMinutes / 60) * 10) / 10;

  async function handleRsvp() {
    setError(null);
    try {
      const { data } = await api.post(`/meetups/${id}/join`);
      setMeetup(data.meetup);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not join this meetup.");
    }
  }

  async function handleLeave() {
    setError(null);
    try {
      const { data } = await api.post(`/meetups/${id}/leave`);
      setMeetup(data.meetup);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not leave this meetup.");
    }
  }

  async function openGroupChat() {
    setError(null);
    try {
      const { data } = await api.post(`/conversations/meetup/${id}`);
      navigate(`/chat/${data.conversation.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not open the group chat.");
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", minHeight: "100vh", background: "var(--panel)" }}>
      <div style={{ position: "relative", margin: "14px 16px 0" }}>
        <Placeholder label={`[ MAP — ${meetup.placeName.toUpperCase()} ]`} photoUrl={meetup.photoUrl} height={200} />
        <div style={{ position: "absolute", top: 78, left: "50%", width: 16, height: 16, marginLeft: -8, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", background: "var(--orange)", border: "2px solid var(--panel)" }} />
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div className="mono-label" style={{ color: "var(--green)" }}>Public meetup{meetup.category ? ` · ${meetup.category}` : ""}</div>
          <div className="heading" style={{ fontSize: 30, lineHeight: 1.05, marginTop: 8 }}>{meetup.title}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <InfoCell label="When" value={starts.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} />
          <InfoCell label="Where" value={meetup.placeName} />
          <InfoCell label="Duration" value={`About ${durationHours} hour${durationHours === 1 ? "" : "s"}`} />
          <InfoCell label="Group size" value={`${meetup.attendees.length} of ${meetup.capacity} joined`} />
        </div>
        {meetup.description && <div style={{ fontSize: 14, color: "#c3cad2", lineHeight: 1.6 }}>{meetup.description}</div>}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div className="field-label">Attendees</div>
            <div className="mono-label" style={{ color: "var(--green)" }}>ALL TIER {meetup.minTier}+</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {meetup.attendees.slice(0, 3).map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar src={a.avatarUrl} size={32} alt={a.name} />
                <span style={{ flex: 1, fontSize: 14 }}>
                  {a.name}{" "}
                  <span className="mono-label" style={{ color: a.id === meetup.host.id ? "var(--green)" : "var(--text-dimmer)" }}>
                    {a.id === meetup.host.id ? "· HOST · " : "· "}TIER {a.tier}
                  </span>
                </span>
                <span style={{ color: "var(--gold)", fontSize: 11 }}>★ {a.ratingAvg || "—"}</span>
              </div>
            ))}
            {meetup.attendees.length > 3 && (
              <div className="mono-label">+ {meetup.attendees.length - 3} MORE GOING</div>
            )}
          </div>
        </div>
        {error && <div className="error-text">{error}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
          {meetup.host.id === me?.id ? (
            <button className="btn btn-success" style={{ flex: 2 }} disabled>
              You're hosting
            </button>
          ) : meetup.joined ? (
            <button className="btn btn-outline" style={{ flex: 2 }} onClick={handleLeave}>
              Leave meetup
            </button>
          ) : (
            <button className="btn btn-success" style={{ flex: 2 }} onClick={handleRsvp}>
              RSVP — I'm going
            </button>
          )}
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={openGroupChat} disabled={!meetup.joined}>
            Group chat
          </button>
        </div>
        {meetup.joined && me && new Date(meetup.startsAt) < new Date() && (
          <button className="mono-label" style={{ textAlign: "center", background: "none", border: "none", color: "var(--orange)" }} onClick={() => navigate(`/meetups/${id}/rate`)}>
            Rate attendees →
          </button>
        )}
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--card)", padding: 13 }}>
      <div className="mono-label" style={{ fontSize: 9 }}>{label}</div>
      <div style={{ fontSize: 14, color: "var(--text)", marginTop: 5 }}>{value}</div>
    </div>
  );
}
