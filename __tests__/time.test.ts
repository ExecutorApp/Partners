import { isValidTime, parseTime, clampToMin, formatTime, formatDurationHM, formatPositionByDuration } from '../src/utils/time';

describe('time utils', () => {
  test('isValidTime accepts 00:00 and 23:59', () => {
    expect(isValidTime('00:00')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
  });

  test('isValidTime rejects invalid formats', () => {
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('12:60')).toBe(false);
    expect(isValidTime('aa:bb')).toBe(false);
    expect(isValidTime('1:1')).toBe(false);
  });

  test('parseTime returns null for invalid input', () => {
    expect(parseTime('25:00')).toBeNull();
    expect(parseTime('10:99')).toBeNull();
  });

  test('parseTime returns hour/minute for 00:00', () => {
    const t = parseTime('00:00');
    expect(t).not.toBeNull();
    expect(t!.hour).toBe(0);
    expect(t!.minute).toBe(0);
  });

  test('clampToMin enforces minute when hours equal minimum', () => {
    const min = { hour: 0, minute: 15 };
    expect(clampToMin(0, 0, min)).toEqual({ h: 0, m: 15 });
    expect(clampToMin(0, 30, min)).toEqual({ h: 0, m: 30 });
  });

  test('clampToMin enforces hour when below minimum', () => {
    const min = { hour: 8, minute: 0 };
    expect(clampToMin(7, 45, min)).toEqual({ h: 8, m: 0 });
  });

  test('formatTime pads correctly', () => {
    expect(formatTime(0, 0)).toBe('00:00');
    expect(formatTime(9, 7)).toBe('09:07');
  });

  test('formatDurationHM returns HH:MM', () => {
    expect(formatDurationHM(372000)).toBe('00:06'); // 6m12s -> 00:06
    expect(formatDurationHM(3665000)).toBe('01:01'); // 1h1m5s -> 01:01
  });

  test('formatPositionByDuration adapts by duration', () => {
    // < 1h => MM:SS
    expect(formatPositionByDuration(61000, 3599000)).toBe('01:01');
    // >= 1h => HH:MM:SS
    expect(formatPositionByDuration(3665000, 3600000)).toBe('01:01:05');
  });
});