export default function TierBadge({ tier, verified = true }: { tier: number; verified?: boolean }) {
  return <span className="tier-badge">{verified ? "✓ " : ""}TIER {tier}</span>;
}
