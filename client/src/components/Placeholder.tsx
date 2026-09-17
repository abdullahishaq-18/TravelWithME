import { useEffect, useState } from "react";

const POST_PLACEHOLDER = "/images/placeholders/post-placeholder.jpeg";
const AVATAR_PLACEHOLDER = "/images/placeholders/avatar-placeholder.jpeg";

interface PlaceholderProps {
  label: string;
  height?: number | string;
  photoUrl?: string | null;
  variant?: "default" | "hero";
  /** Only relevant when `photoUrl` is a data-bound field: which placeholder image to fall back to. */
  kind?: "post" | "avatar";
  style?: React.CSSProperties;
}

export default function Placeholder({ label, height = 200, photoUrl, variant = "default", kind = "post", style }: PlaceholderProps) {
  const [errored, setErrored] = useState(false);
  useEffect(() => setErrored(false), [photoUrl]);

  // A data-bound image slot (post/meetup photo, profile picture) always renders a real
  // image — the provided one, or the matching placeholder file — never the striped illustration.
  if (photoUrl !== undefined) {
    const fallback = kind === "avatar" ? AVATAR_PLACEHOLDER : POST_PLACEHOLDER;
    const resolved = !photoUrl || errored ? fallback : photoUrl;
    return (
      <img
        src={resolved}
        alt={label}
        onError={() => setErrored(true)}
        style={{ height, width: "100%", objectFit: "cover", display: "block", ...style }}
      />
    );
  }

  return (
    <div
      className="placeholder-box"
      style={{
        height,
        background: variant === "hero" ? "var(--placeholder-hero)" : "var(--placeholder)",
        ...style,
      }}
    >
      <span className="placeholder-label">{label}</span>
    </div>
  );
}
