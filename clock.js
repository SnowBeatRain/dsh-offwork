// Pure calculation. Weekdays belong to the shift's START date, not the clock date.
// Keep helpers inside calculate: the client build embeds this exact function.
export function calculate(settings, timestamp = Date.now()) {
  const now = Number(timestamp);
  if (!Number.isFinite(now)) throw new RangeError('Invalid timestamp');
  const DAY = 86400000;
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: settings.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const civil = (time) => {
    const p = Object.fromEntries(formatter.formatToParts(time).map((p) => [p.type, p.value]));
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  };
  // Convert a timezone-local civil time to an absolute instant. At DST overlaps use
  // the earlier occurrence; at gaps move forward by the gap (Temporal-compatible).
  const instant = (local) => {
    const offsets = [
      ...new Set([-DAY, 0, DAY].map((delta) => civil(local + delta) - (local + delta))),
    ];
    const candidates = offsets.map((offset) => local - offset);
    const exact = candidates.filter((time) => civil(time) === local);
    if (exact.length) return Math.min(...exact);
    const after = candidates.filter((time) => civil(time) >= local);
    return Math.min(...(after.length ? after : candidates));
  };
  const minute = (text) => {
    if (typeof text !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(text)) {
      throw new RangeError('Shift times must be HH:mm');
    }
    const [h, m] = text.split(':').map(Number);
    return h * 60 + m;
  };
  const start = minute(settings.start),
    end = minute(settings.end);
  if (start === end) throw new RangeError('Shift must not be empty');
  const overnight = end < start;
  const duration = (end - start + 1440) % 1440;
  let breakOffset = 0,
    breakDuration = 0;
  if (settings.breakStart != null || settings.breakEnd != null) {
    const bs = minute(settings.breakStart),
      be = minute(settings.breakEnd);
    if (bs !== be) {
      breakOffset = (bs - start + 1440) % 1440;
      breakDuration = (be - bs + 1440) % 1440;
      if (breakOffset + breakDuration > duration || breakDuration >= duration) {
        throw new RangeError('Break must be inside the shift and leave paid work');
      }
    }
  }
  const localNow = civil(now);
  const today = Math.floor(localNow / DAY) * DAY;
  const minuteNow = (localNow - today) / 60000;
  const workday = (day) => settings.weekdays.includes(new Date(day).getUTCDay());
  let shiftDay = today;
  if (overnight && minuteNow < start) {
    // Retain yesterday's finished work shift until the next shift starts. If
    // yesterday was off, a working today is 'before' (e.g. Monday daytime).
    if (minuteNow < end || workday(today - DAY)) shiftDay -= DAY;
  }
  const isWorkday = workday(shiftDay);
  const shiftStart = instant(shiftDay + start * 60000);
  const shiftEnd = instant(shiftDay + (start + duration) * 60000);
  const breakStart = breakDuration ? instant(shiftDay + (start + breakOffset) * 60000) : null;
  const breakEnd = breakDuration
    ? instant(shiftDay + (start + breakOffset + breakDuration) * 60000)
    : null;
  const breakMs = breakDuration ? breakEnd - breakStart : 0;
  const totalMs = shiftEnd - shiftStart - breakMs;
  if (totalMs <= 0 || breakMs < 0) throw new RangeError('Shift has no paid duration');
  const clampedNow = Math.max(shiftStart, Math.min(now, shiftEnd));
  const elapsedMs = isWorkday
    ? Math.max(
        0,
        Math.min(
          totalMs,
          clampedNow -
            shiftStart -
            (breakDuration ? Math.max(0, Math.min(clampedNow, breakEnd) - breakStart) : 0),
        ),
      )
    : 0;
  const status = !isWorkday
    ? 'rest'
    : now < shiftStart
      ? 'before'
      : now >= shiftEnd
        ? 'done'
        : breakDuration && now >= breakStart && now < breakEnd
          ? 'lunch'
          : 'working';
  // Decimal inputs become exact rational numbers before truncation. Never use
  // floor((salary / days * progress) * 100): binary rounding loses whole cents.
  const rational = (number) => {
    if (typeof number !== 'number' || !Number.isFinite(number) || number < 0)
      throw new RangeError('Invalid salary');
    const [mantissa, exponent = '0'] = String(number).toLowerCase().split('e');
    const [integer, fraction = ''] = mantissa.split('.');
    const scale = fraction.length - Number(exponent);
    return scale >= 0
      ? [BigInt(integer + fraction), 10n ** BigInt(scale)]
      : [BigInt(integer + fraction) * 10n ** BigInt(-scale), 1n];
  };
  const payMode = settings.payMode === 'daily' ? 'daily' : 'monthly';
  let [numerator, denominator] = rational(
    payMode === 'daily' ? settings.dailySalary : settings.monthlySalary,
  );
  if (payMode === 'monthly') {
    const [daysN, daysD] = rational(settings.workdaysPerMonth);
    if (daysN === 0n) throw new RangeError('Workdays per month must be positive');
    numerator *= daysD;
    denominator *= daysN;
  }
  const dailyCents = Number((numerator * 100n) / denominator);
  const earnedCents = Math.min(
    dailyCents,
    Number((numerator * 100n * BigInt(Math.floor(elapsedMs))) / (denominator * BigInt(totalMs))),
  );
  const hourlyCents = Number((numerator * 100n * 3600000n) / (denominator * BigInt(totalMs)));
  const dateString = (day) => new Date(day).toISOString().slice(0, 10);
  return {
    status,
    remaining: isWorkday ? Math.max(0, Math.ceil((shiftEnd - now) / 1000)) : 0,
    startRemaining: status === 'before' ? Math.max(0, Math.ceil((shiftStart - now) / 1000)) : 0,
    progress: elapsedMs / totalMs,
    earned: earnedCents / 100,
    daily: dailyCents / 100,
    hourly: hourlyCents / 100,
    date: dateString(today),
    shiftDate: dateString(shiftDay),
    earnedCents,
    dailyCents,
    payMode,
    isWorkday,
    overnight,
    shiftStart,
    shiftEnd,
    breakStart,
    breakEnd,
    elapsed: elapsedMs / 1000,
    total: totalMs / 1000,
  };
}
