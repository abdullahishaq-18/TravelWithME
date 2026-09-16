interface PlaceholderProps {
  label: string;
  height?: number | string;
  photoUrl?: string | null;
  variant?: "default" | "hero";
  style?: React.CSSProperties;
}

export default function Placeholder({ label, height = 200, photoUrl, variant = "default", style }: PlaceholderProps) {
  if (photoUrl) {
    return (
      <div
        style={{
          height,
          backgroundImage: `url(${photoUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          ...style,
        }}
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
