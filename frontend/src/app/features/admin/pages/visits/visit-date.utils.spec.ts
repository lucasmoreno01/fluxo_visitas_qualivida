import { describe, expect, it } from 'vitest';
import { serializeScheduleDateTime } from './visit-date.utils';

describe('serializeScheduleDateTime', () => {
  it('preserves the selected local date and time when sending it to the backend', () => {
    const value = '2026-07-02T15:00';

    expect(serializeScheduleDateTime(value)).toBe(new Date(2026, 6, 2, 15, 0, 0, 0).toISOString());
  });

  it('returns null for invalid input', () => {
    expect(serializeScheduleDateTime('')).toBeNull();
    expect(serializeScheduleDateTime('data-invalida')).toBeNull();
  });
});
