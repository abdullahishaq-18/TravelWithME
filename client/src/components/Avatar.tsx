import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const AVATAR_PLACEHOLDER = "/images/placeholders/avatar-placeholder.jpeg";

interface AvatarProps {
  src?: string | null;
  size: number;
  alt?: string;
  style?: CSSProperties;
}

export default function Avatar({ src, size, alt = "", style }: AvatarProps) {
  const [errored, setErrored] = useState(false);

  useEffect(() => setErrored(false), [src]);

  const resolved = !src || errored ? AVATAR_PLACEHOLDER : src;

  return (
    <img
      src={resolved}
      alt={alt}
      onError={() => setErrored(true)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
