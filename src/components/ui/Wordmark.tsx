/** The Intimate Table, stacked as on the book cover. */
export function Wordmark({ className = "", size = "1.05rem" }: { className?: string; size?: string }) {
  return (
    <span className={`wordmark block ${className}`} style={{ fontSize: size }}>
      The
      <br />
      Intimate
      <br />
      Table
    </span>
  );
}
