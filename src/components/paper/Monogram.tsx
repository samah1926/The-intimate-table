/**
 * The Intimate Table's monogram: I, T, T set close in a high-contrast serif,
 * the second T a little lower, inside a fine ring — as stamped on the envelopes.
 */
export function Monogram({ size = 48, ring = true, className = "" }: { size?: number; ring?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className} aria-label="The Intimate Table" role="img">
      {ring && <circle cx="30" cy="30" r="27" fill="none" stroke="currentColor" strokeWidth=".6" opacity=".7" />}
      <g fill="currentColor" fontFamily="var(--font-serif)" fontWeight="400">
        <text x="17.5" y="39" fontSize="24">I</text>
        <text x="23" y="37" fontSize="24">T</text>
        <text x="31" y="42" fontSize="24">T</text>
      </g>
    </svg>
  );
}
