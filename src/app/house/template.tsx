/**
 * Walking into a room: it opens from an arch, as if you had stepped through
 * a doorway, while the light of the room behind fades into the next.
 * Pure CSS (see .through-door), so it costs nothing once it has played.
 */
export default function RoomTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="through-door" style={{ transformOrigin: "50% 100%" }}>
      {children}
    </div>
  );
}
