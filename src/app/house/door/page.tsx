import { redirect } from "next/navigation";
import { UnmarkedDoor } from "@/components/rooms/UnmarkedDoor";
import { getHouse } from "@/lib/house/session";

export const metadata = { title: "—" };

export default async function Door() {
  const { view } = await getHouse();
  // A door that isn't there for you simply isn't there.
  if (view.rooms.find((r) => r.key === "door")?.state !== "open") redirect("/house");
  return <UnmarkedDoor letters={view.door.letters} />;
}
