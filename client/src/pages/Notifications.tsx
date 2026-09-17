import { useEffect, useState } from "react";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import type { Notification } from "../types";

const ICONS: Record<Notification["type"], { icon: string; color: string; bg: string }> = {
  verification: { icon: "✓", color: "var(--green)", bg: "rgba(90,194,160,0.16)" },
  message: { icon: "", color: "", bg: "" },
  rating_prompt: { icon: "★", color: "var(--gold)", bg: "rgba(232,160,46,0.16)" },
  meetup_join: { icon: "◎", color: "var(--green)", bg: "rgba(90,194,160,0.12)" },
  rating_update: { icon: "★", color: "var(--gold)", bg: "rgba(232,160,46,0.12)" },
  system: { icon: "◈", color: "#9aa3ae", bg: "#232a33" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

  useEffect(() => {
    api.get<{ notifications: Notification[] }>("/notifications").then(({ data }) => setNotifications(data.notifications));
  }, []);

  async function markAllRead() {
    await api.post("/notifications/mark-all-read");
    setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })) || prev);
  }

  const unread = notifications?.filter((n) => !n.read) || [];
  const read = notifications?.filter((n) => n.read) || [];

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", minHeight: "100vh" }}>
      <div style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        <div className="heading" style={{ fontSize: 22 }}>Notifications</div>
        <span className="mono-label" style={{ color: "var(--orange)", cursor: "pointer" }} onClick={markAllRead}>Mark all read</span>
      </div>
      {unread.length > 0 && <div className="mono-label" style={{ fontSize: 9, padding: "14px 18px 8px" }}>New</div>}
      {unread.map((n) => (
        <NotificationRow key={n._id} n={n} />
      ))}
      {read.length > 0 && <div className="mono-label" style={{ fontSize: 9, padding: "18px 18px 8px" }}>Earlier</div>}
      {read.map((n) => (
        <NotificationRow key={n._id} n={n} />
      ))}
      {notifications?.length === 0 && <EmptyState message="You're all caught up" />}
      <div style={{ padding: "20px 18px", fontSize: 12, color: "var(--text-faintest)", lineHeight: 1.6 }}>
        You only receive messages from travelers whose ID has cleared. Adjust this in Settings → Safety.
      </div>
    </div>
  );
}

function NotificationRow({ n }: { n: Notification }) {
  const icon = ICONS[n.type] || ICONS.system;
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 18px",
        borderBottom: "1px solid var(--border-soft)",
        background: !n.read ? "rgba(232,113,46,0.05)" : "transparent",
        borderLeft: !n.read ? "2px solid var(--orange)" : "none",
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: icon.bg || "var(--avatar)", color: icon.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
        {icon.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: n.read ? "#c3cad2" : "var(--text)", lineHeight: 1.5 }}>{n.text}</div>
        <div className="mono-label" style={{ fontSize: 9, marginTop: 5 }}>{timeAgo(n.createdAt)}</div>
      </div>
    </div>
  );
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes} MIN AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "YESTERDAY";
  return `${days} DAYS AGO`;
}
