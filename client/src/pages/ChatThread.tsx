import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { socket } from "../api/socket";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import type { Conversation, Message } from "../types";

export default function ChatThread() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    api.get<{ conversations: Conversation[] }>("/conversations").then(({ data }) => {
      setConversation(data.conversations.find((c) => c.id === id) || null);
    });
    api.get<{ messages: Message[] }>(`/conversations/${id}/messages`).then(({ data }) => setMessages(data.messages));

    socket.connect();
    socket.emit("conversation:join", id);
    const handler = (message: Message) => {
      if (message.conversation === id) setMessages((prev) => [...prev, message]);
    };
    const connectErrorHandler = () => setError("Live updates unavailable — reconnecting…");
    const connectHandler = () => {
      setError(null);
      socket.emit("conversation:join", id);
    };
    socket.on("message:new", handler);
    socket.on("connect_error", connectErrorHandler);
    socket.on("connect", connectHandler);

    return () => {
      socket.emit("conversation:leave", id);
      socket.off("message:new", handler);
      socket.off("connect_error", connectErrorHandler);
      socket.off("connect", connectHandler);
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !id) return;
    const body = text;
    setText("");
    setError(null);
    try {
      await api.post(`/conversations/${id}/messages`, { text: body });
    } catch (err: any) {
      setText(body);
      setError(err?.response?.data?.message || "Message failed to send.");
    }
  }

  const title = conversation?.isGroup ? "Group chat" : conversation?.other?.name || "Traveler";
  const other = conversation?.other;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)" }}>
        <span style={{ color: "var(--text-dim)", fontSize: 15, cursor: "pointer" }} onClick={() => navigate("/chat")}>←</span>
        <Avatar src={other?.avatarUrl} size={32} alt={title} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{title}</span>
            {other?.tier === 3 && <span style={{ color: "var(--green)", fontSize: 11 }}>✓</span>}
          </div>
          {other && <div className="mono-label" style={{ fontSize: 9, marginTop: 2 }}>TIER {other.tier}</div>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card" style={{ background: "rgba(90,194,160,0.08)", border: "1px solid rgba(90,194,160,0.3)", padding: 11, fontSize: 12, color: "#9dc8ba", lineHeight: 1.5 }}>
          You are both ID-verified. Keep plans in public places — meetup locations are visible to attendees only.
        </div>
        {messages.map((m) => {
          const mine = m.sender.id === me?.id;
          return (
            <div
              key={m.id}
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                maxWidth: "78%",
                background: mine ? "var(--orange)" : "#1f242c",
                color: mine ? "#16191d" : "#e3e8ed",
                border: mine ? "none" : "1px solid var(--border-soft)",
                padding: "11px 13px",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {m.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <div className="error-text" style={{ padding: "0 16px" }}>{error}</div>}
      <form onSubmit={handleSend} style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
        <input
          className="text-input"
          style={{ flex: 1 }}
          placeholder="Write a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ width: 42, height: 42, padding: 0 }}>→</button>
      </form>
    </div>
  );
}
