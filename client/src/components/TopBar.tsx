import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopBar({ hasUnread = false }: { hasUnread?: boolean }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        background: "rgba(20,23,28,0.96)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Link to="/feed" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)" }} />
        <div className="heading" style={{ fontSize: 13, letterSpacing: "0.16em", color: "var(--text)" }}>
          TRAVELWITHME
        </div>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 15, color: "var(--text-dim)" }}>
        <span
          role="link"
          tabIndex={0}
          title="Messages"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/chat")}
        >
          ✉
        </span>
        <span
          role="link"
          tabIndex={0}
          title="Notifications"
          style={{ position: "relative", cursor: "pointer" }}
          onClick={() => navigate("/notifications")}
        >
          ◉
          {hasUnread && (
            <span
              style={{
                position: "absolute",
                top: -3,
                right: -5,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--orange)",
              }}
            />
          )}
        </span>
        <span
          role="link"
          tabIndex={0}
          title={user?.name}
          onClick={() => navigate("/profile/me")}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: user?.avatarUrl ? `url(${user.avatarUrl}) center/cover` : "var(--avatar)",
            border: "1px solid rgba(255,255,255,0.18)",
            cursor: "pointer",
          }}
        />
        <span
          role="link"
          tabIndex={0}
          title="Log out"
          onClick={logout}
          style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", cursor: "pointer" }}
        >
          LOG OUT
        </span>
      </div>
    </div>
  );
}
