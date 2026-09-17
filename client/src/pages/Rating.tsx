import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import StarRating from "../components/StarRating";
import Avatar from "../components/Avatar";
import type { User } from "../types";

const STAR_LABELS: Record<number, string> = {
  0: "TAP TO RATE",
  1: "DIFFICULT",
  2: "MIXED",
  3: "FINE",
  4: "GREAT — WOULD MEET AGAIN",
  5: "EXCELLENT",
};

const ALL_TAGS = ["RELIABLE", "FRIENDLY", "SAFE", "PUNCTUAL", "GOOD PLANNER", "RESPECTFUL"];

export default function Rating() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meetupTitle, setMeetupTitle] = useState("");
  const [queue, setQueue] = useState<User[] | null>(null);
  const [index, setIndex] = useState(0);
  const [stars, setStars] = useState(4);
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/meetups/${id}/rating-queue`).then(({ data }) => {
      setMeetupTitle(data.meetupTitle);
      setQueue(data.queue);
    });
  }, [id]);

  if (!queue) {
    return <div className="mono-label" style={{ padding: 40, textAlign: "center" }}>Loading…</div>;
  }

  if (queue.length === 0 || index >= queue.length) {
    return (
      <div style={{ maxWidth: 440, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
        <div className="heading" style={{ fontSize: 26 }}>All rated</div>
        <div style={{ color: "var(--text-dimmer)", fontSize: 14 }}>Thanks — your feedback for {meetupTitle} has been recorded.</div>
        <button className="btn btn-primary" onClick={() => navigate("/feed")}>Back to feed</button>
      </div>
    );
  }

  const current = queue[index];

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length >= 3 ? prev : [...prev, tag]));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/meetups/${id}/ratings`, { rateeId: current.id, stars, tags });
      setIndex((i) => i + 1);
      setStars(4);
      setTags([]);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not submit this rating.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--text-dim)", cursor: "pointer" }} onClick={() => navigate(-1)}>✕</span>
        <div className="mono-label">{index + 1} of {queue.length} attendees</div>
      </div>
      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
        <div>
          <div className="mono-label" style={{ color: "var(--orange)" }}>{meetupTitle} · recent meetup</div>
          <div className="heading" style={{ fontSize: 30, lineHeight: 1.05, marginTop: 10 }}>How was<br />meeting {current.name.split(" ")[0]}?</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Avatar src={current.avatarUrl} size={44} alt={current.name} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{current.name}</div>
            <div className="mono-label" style={{ color: "var(--green)", fontSize: 9 }}>✓ TIER {current.tier}</div>
          </div>
        </div>
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field-label">Your rating</div>
          <StarRating value={stars} interactive size={36} onChange={setStars} />
          <div className="mono-label" style={{ color: "#c3cad2" }}>{STAR_LABELS[stars]}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="field-label">Trust tags — pick up to three</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ALL_TAGS.map((tag) => {
              const on = tags.includes(tag);
              return (
                <div
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="mono-label"
                  style={{
                    cursor: "pointer",
                    padding: "10px 13px",
                    border: `1px solid ${on ? "var(--green)" : "rgba(255,255,255,0.16)"}`,
                    background: on ? "rgba(90,194,160,0.12)" : "transparent",
                    color: on ? "var(--green)" : "#c3cad2",
                  }}
                >
                  {tag}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ borderLeft: "2px solid var(--green)", padding: "2px 0 2px 12px" }}>
          <div className="heading" style={{ fontSize: 14, letterSpacing: "0.12em", color: "var(--green)" }}>Completely anonymous</div>
          <div style={{ fontSize: 13, color: "var(--text-dimmer)", lineHeight: 1.55, marginTop: 5 }}>
            {current.name.split(" ")[0]} sees a new average and tag counts — never who rated, when, or in what order. Free text isn't collected.
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {error && <div className="error-text">{error}</div>}
          <button className="btn btn-primary" disabled={submitting} onClick={submit}>
            {index === queue.length - 1 ? "Submit →" : "Submit & rate next →"}
          </button>
          <button className="mono-label" style={{ textAlign: "center", background: "none", border: "none", color: "var(--text-faint)" }}>
            Report a safety concern instead
          </button>
        </div>
      </div>
    </div>
  );
}
