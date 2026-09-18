import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import TopBar from "../components/TopBar";
import Placeholder from "../components/Placeholder";
import TierBadge from "../components/TierBadge";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import type { FeedItem } from "../types";

const TABS = [
  { key: "all", label: "All" },
  { key: "posts", label: "Posts" },
  { key: "travelers", label: "Travelers" },
  { key: "meetups", label: "Meetups" },
] as const;

export default function Feed() {
  const { user: me } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [joinErrors, setJoinErrors] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [composerCaption, setComposerCaption] = useState("");
  const [composerPhotoUrl, setComposerPhotoUrl] = useState("");
  const [composerLocation, setComposerLocation] = useState("");
  const [posting, setPosting] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    api.get<{ items: FeedItem[] }>("/feed", { params: { type: tab } }).then(({ data }) => {
      if (!cancelled) setItems(data.items);
    });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  useEffect(() => {
    api.get("/notifications").then(({ data }) => {
      setHasUnread(data.notifications.some((n: { read: boolean }) => !n.read));
    });
  }, []);

  async function messageUser(userId: string) {
    setActionError(null);
    try {
      const { data } = await api.post("/conversations/direct", { userId });
      navigate(`/chat/${data.conversation.id}`);
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Could not start a conversation.");
    }
  }

  async function joinMeetup(meetupId: string) {
    setJoinErrors((prev) => ({ ...prev, [meetupId]: "" }));
    try {
      await api.post(`/meetups/${meetupId}/join`);
      setItems((prev) =>
        prev
          ? prev.map((item) =>
              item.kind === "meetup" && item.id === meetupId
                ? { ...item, joined: true, attendeeCount: item.attendeeCount + 1 }
                : item
            )
          : prev
      );
    } catch (err: any) {
      setJoinErrors((prev) => ({
        ...prev,
        [meetupId]: err?.response?.data?.message || "Could not join this meetup.",
      }));
    }
  }

  async function submitPost(e: FormEvent) {
    e.preventDefault();
    if (!composerCaption.trim()) return;
    setPosting(true);
    setComposerError(null);
    try {
      const { data } = await api.post("/posts", {
        caption: composerCaption.trim(),
        photoUrl: composerPhotoUrl.trim() || undefined,
        location: composerLocation.trim(),
      });
      setComposerCaption("");
      setComposerPhotoUrl("");
      setComposerLocation("");
      if (tab === "all" || tab === "posts") {
        setItems((prev) => (prev ? [{ kind: "post", ...data.post }, ...prev] : prev));
      }
    } catch (err: any) {
      setComposerError(err?.response?.data?.message || "Could not create this post.");
    } finally {
      setPosting(false);
    }
  }

  async function leaveMeetup(meetupId: string) {
    setJoinErrors((prev) => ({ ...prev, [meetupId]: "" }));
    try {
      await api.post(`/meetups/${meetupId}/leave`);
      setItems((prev) =>
        prev
          ? prev.map((item) =>
              item.kind === "meetup" && item.id === meetupId
                ? { ...item, joined: false, attendeeCount: Math.max(0, item.attendeeCount - 1) }
                : item
            )
          : prev
      );
    } catch (err: any) {
      setJoinErrors((prev) => ({
        ...prev,
        [meetupId]: err?.response?.data?.message || "Could not leave this meetup.",
      }));
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar hasUnread={hasUnread} />
      <div style={{ padding: "12px 18px", display: "flex", gap: 8, borderBottom: "1px solid var(--border-soft)", overflowX: "auto" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="mono-label"
            style={{
              padding: "7px 12px",
              border: tab === t.key ? "none" : "1px solid rgba(255,255,255,0.16)",
              background: tab === t.key ? "var(--orange)" : "transparent",
              color: tab === t.key ? "#12151a" : "#c3cad2",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, padding: "12px 14px 30px" }}>
        <form onSubmit={submitPost} className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            className="text-input"
            placeholder="Share something with nearby travelers…"
            value={composerCaption}
            onChange={(e) => setComposerCaption(e.target.value)}
            rows={2}
            style={{ resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="text-input"
              style={{ flex: "2 1 200px" }}
              placeholder="Photo URL (optional)"
              value={composerPhotoUrl}
              onChange={(e) => setComposerPhotoUrl(e.target.value)}
            />
            <input
              className="text-input"
              style={{ flex: "1 1 120px" }}
              placeholder="Location (optional)"
              value={composerLocation}
              onChange={(e) => setComposerLocation(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={posting || !composerCaption.trim()} style={{ flex: "0 0 auto" }}>
              {posting ? "Posting…" : "Post"}
            </button>
          </div>
          {composerError && <div className="error-text">{composerError}</div>}
        </form>
        {actionError && <div className="error-text">{actionError}</div>}
        {items === null && <SkeletonCard />}
        {items?.length === 0 && <EmptyState message="Nothing here yet" />}
        {items?.map((item) => {
          if (item.kind === "post") {
            return (
              <div key={item.id} className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12 }}>
                  <Avatar src={item.author.avatarUrl} size={34} alt={item.author.name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{item.author.name}</span>
                      <TierBadge tier={item.author.tier} />
                    </div>
                    <div className="mono-label" style={{ fontSize: 10, marginTop: 3 }}>
                      {item.location.toUpperCase()} · {timeAgo(item.createdAt)}
                    </div>
                  </div>
                </div>
                <Placeholder label="[ TRAVEL POST PHOTO 4:5 ]" photoUrl={item.photoUrl} height={260} />
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 14, color: "#dbe1e7", lineHeight: 1.55 }}>{item.caption}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn btn-outline" style={{ flex: 1, padding: 10, fontSize: 10 }} onClick={() => messageUser(item.author.id)}>Message</button>
                    <button className="btn btn-outline" style={{ flex: 1, padding: 10, fontSize: 10 }} onClick={() => navigate(`/profile/${item.author.id}`)}>View profile</button>
                  </div>
                </div>
              </div>
            );
          }

          if (item.kind === "traveler") {
            return (
              <div key={item.id} className="card" style={{ borderLeft: "3px solid var(--orange)" }}>
                <div className="mono-label" style={{ padding: "10px 12px 0", color: "var(--orange)" }}>Nearby traveler</div>
                <div style={{ display: "flex", gap: 12, padding: 12 }}>
                  <Placeholder label="[ AVATAR ]" photoUrl={item.user.avatarUrl} kind="avatar" style={{ width: 96, height: 120, flexShrink: 0 }} height={120} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="heading" style={{ fontSize: 19 }}>{item.user.name}</span>
                      <TierBadge tier={item.user.tier} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="stars">{"★".repeat(Math.round(item.user.ratingAvg)) || "☆"}</span>
                      <span className="mono-label" style={{ fontSize: 10 }}>{item.user.ratingAvg || "—"} · {item.user.ratingCount} RATINGS</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-dimmer)", lineHeight: 1.5 }}>{item.user.bio}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {item.user.interests.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag-pill">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, padding: "0 12px 12px" }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: 10, fontSize: 10 }} onClick={() => messageUser(item.user.id)}>Message</button>
                  <button className="btn btn-outline" style={{ flex: 1, padding: 10, fontSize: 10 }} onClick={() => navigate(`/profile/${item.user.id}`)}>View profile</button>
                </div>
              </div>
            );
          }

          return (
            <div key={item.id} className="card" style={{ borderLeft: "3px solid var(--green)" }}>
              <div className="mono-label" style={{ padding: "10px 12px 0", color: "var(--green)" }}>Suggested meetup</div>
              <div style={{ margin: "10px 12px 0" }}>
                <Placeholder label="[ MAP SNAPSHOT ]" photoUrl={item.photoUrl} height={150} />
              </div>
              <div style={{ padding: 12 }}>
                <div className="heading" style={{ fontSize: 20 }}>{item.title}</div>
                <div className="mono-label" style={{ marginTop: 6 }}>
                  {formatDateTime(item.startsAt)} · {item.placeName.toUpperCase()} · {item.attendeeCount} GOING
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--text-dimmer)" }}>Hosted by {item.host.name} · Tier {item.minTier}+</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {item.host.id === me?.id ? (
                    <button className="btn btn-outline" style={{ flex: 1, padding: 10, fontSize: 10 }} disabled>
                      Hosting
                    </button>
                  ) : item.joined ? (
                    <button className="btn btn-outline" style={{ flex: 1, padding: 10, fontSize: 10 }} onClick={() => leaveMeetup(item.id)}>
                      Leave
                    </button>
                  ) : (
                    <button className="btn btn-success" style={{ flex: 1, padding: 10, fontSize: 10 }} onClick={() => joinMeetup(item.id)}>
                      Join meetup
                    </button>
                  )}
                  <button className="btn btn-outline" style={{ flex: 1, padding: 10, fontSize: 10 }} onClick={() => navigate(`/meetups/${item.id}`)}>Details</button>
                </div>
                {joinErrors[item.id] && <div className="error-text" style={{ marginTop: 8 }}>{joinErrors[item.id]}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div className="spinner-shimmer" style={{ width: 34, height: 34, borderRadius: "50%" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="spinner-shimmer" style={{ height: 10, width: "45%" }} />
          <div className="spinner-shimmer" style={{ height: 8, width: "28%" }} />
        </div>
      </div>
      <div className="spinner-shimmer" style={{ height: 180 }} />
      <div className="spinner-shimmer" style={{ height: 10, width: "80%" }} />
    </div>
  );
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "JUST NOW";
  if (hours < 24) return `${hours}H AGO`;
  return `${Math.floor(hours / 24)}D AGO`;
}

function formatDateTime(iso: string) {
  return new Date(iso)
    .toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })
    .toUpperCase();
}
