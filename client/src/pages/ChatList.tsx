import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import TopBar from "../components/TopBar";
import type { Conversation } from "../types";

export default function ChatList() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<{ conversations: Conversation[] }>("/conversations").then(({ data }) => setConversations(data.conversations));
  }, []);

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", minHeight: "100vh" }}>
      <TopBar />
      <div className="heading" style={{ fontSize: 22, padding: 18 }}>Messages</div>
      {conversations?.length === 0 && (
        <div className="mono-label" style={{ textAlign: "center", padding: "40px 0" }}>No conversations yet</div>
      )}
      {conversations?.map((c) => {
        const title = c.isGroup ? "Group chat" : c.other?.name || "Traveler";
        const avatarUrl = c.isGroup ? null : c.other?.avatarUrl;
        return (
          <div
            key={c.id}
            onClick={() => navigate(`/chat/${c.id}`)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--border-soft)", cursor: "pointer" }}
          >
            <span style={{ width: 40, height: 40, borderRadius: "50%", background: avatarUrl ? `url(${avatarUrl}) center/cover` : "var(--avatar)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{title}</div>
              <div className="mono-label" style={{ fontSize: 10, marginTop: 3 }}>
                {new Date(c.lastMessageAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
