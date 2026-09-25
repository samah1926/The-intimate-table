"use client";

// Starting points for the most common rules. They fill the JSON below; edit ids after.
const PRESETS: { label: string; value: unknown }[] = [
  { label: "Attended a Chapter", value: { type: "attended_chapter", chapter_id: "ch-0" } },
  { label: "N days after a Chapter", value: { type: "days_since_chapter", chapter_id: "ch-0", days: 180 } },
  { label: "Invited to a Chapter", value: { type: "invited_to_chapter", chapter_id: "ch-02" } },
  { label: "During a Chapter", value: { type: "chapter_phase", chapter_id: "ch-0", phase: "during" } },
  { label: "After a date", value: { type: "date_after", date: "2027-01-01T09:00:00Z" } },
  { label: "Anniversary", value: { type: "anniversary_of_chapter", chapter_id: "ch-0", window_days: 3 } },
  { label: "Season", value: { type: "season", months: [12, 1, 2] } },
  { label: "Scanned a card", value: { type: "scanned_code", code: "under-your-glass" } },
  { label: "Mutual connection", value: { type: "mutual_connection", person_id: "…" } },
  { label: "Another thing is open", value: { type: "has_unlocked", target_type: "memory_object", target_id: "obj-key" } },
  {
    label: "Attended X and invited to Y",
    value: { all: [{ type: "attended_chapter", chapter_id: "ch-0" }, { type: "invited_to_chapter", chapter_id: "ch-02" }] },
  },
];

export function RulePresets({ target }: { target: string }) {
  return (
    <span className="mt-2 flex flex-wrap gap-1.5">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          className="rounded-full border border-neutral-300 px-2.5 py-0.5 text-xs text-neutral-700 hover:bg-neutral-100"
          onClick={() => {
            const el = document.getElementById(target) as HTMLTextAreaElement | null;
            if (el) el.value = JSON.stringify(p.value, null, 2);
          }}
        >
          {p.label}
        </button>
      ))}
    </span>
  );
}
