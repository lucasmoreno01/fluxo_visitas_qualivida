export function serializeScheduleDateTime(value: string): string | null {
  if (!value) {
    return null;
  }

  const [datePart, timePart] = value.split('T');

  if (!datePart || !timePart) {
    return null;
  }

  const [year, month, day] = datePart.split('-').map((part) => Number(part));
  const [hour, minute] = timePart.split(':').map((part) => Number(part));

  if ([year, month, day, hour, minute].some((part) => Number.isNaN(part))) {
    return null;
  }

  const localDate = new Date(year, month - 1, day, hour, minute, 0, 0);

  return localDate.toISOString();
}
