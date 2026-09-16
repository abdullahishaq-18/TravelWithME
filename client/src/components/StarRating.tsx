interface StarRatingProps {
  value: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export default function StarRating({ value, size = 22, interactive = false, onChange }: StarRatingProps) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={interactive ? () => onChange?.(n) : undefined}
          style={{
            fontSize: size,
            lineHeight: 1,
            cursor: interactive ? "pointer" : "default",
            color: n <= value ? "var(--gold)" : "#39414b",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
