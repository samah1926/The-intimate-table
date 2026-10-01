/** Arriving in a room: the page settles into place. Nothing more. */
export default function RoomTemplate({ children }: { children: React.ReactNode }) {
  return <div className="settle">{children}</div>;
}
