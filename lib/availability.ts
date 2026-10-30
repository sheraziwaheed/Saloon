export function overlaps(
  start: number,
  end: number,
  otherStart: number,
  otherEnd: number,
) {
  return start < otherEnd && end > otherStart;
}
export function slotMinutes(open: number, close: number, duration: number) {
  const result: number[] = [];
  for (let m = open; m + duration <= close; m += 15) result.push(m);
  return result;
}
export function canManage(start: Date, now = new Date(), hours = 24) {
  return start.getTime() - now.getTime() >= hours * 60 * 60 * 1000;
}
export function londonDate(day: string, minute: number) {
  const utc = new Date(`${day}T00:00:00Z`);
  utc.setUTCMinutes(minute);
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(utc);
  const offset = Number(formatted) - utc.getUTCHours();
  return new Date(utc.getTime() - offset * 60 * 60 * 1000);
}
export function londonDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function slotDates(start: Date, end: Date) {
  const slots: Date[] = [];
  for (let n = start.getTime(); n < end.getTime(); n += 15 * 60000)
    slots.push(new Date(n));
  return slots;
}
