import {
  CanalListItem,
  CanalMessageWithReactions,
} from "../types/canal.types";

function getDateLabel(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfMessage = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfMessage.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function buildCanalListItems(
  messages: CanalMessageWithReactions[],
): CanalListItem[] {
  const sorted = [...messages].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  );

  const items: CanalListItem[] = [];
  let lastLabel = "";

  for (const message of sorted) {
    const label = getDateLabel(new Date(message.sentAt));
    if (label !== lastLabel) {
      items.push({ type: "date", id: `date-${label}`, label });
      lastLabel = label;
    }
    items.push({ type: "message", id: message.id, data: message });
  }

  return items;
}

export function formatSubscriberCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(".0", "")} M abonnés`;
  }
  if (count >= 1_000) {
    return `${Math.round(count / 100) / 10} K abonnés`.replace(".0 K", " K");
  }
  return `${count.toLocaleString("fr-FR")} abonnés`;
}

export function getTotalReactions(
  reactions: CanalMessageWithReactions["reactions"],
): number {
  return reactions.reduce((sum, reaction) => sum + reaction.count, 0);
}
