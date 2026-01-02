const {
  parseAirlineAndFlightNum,
  cleanCallsign,
  buildSimBriefUrl,
  computeDepartureDateTime,
  validateInputs
} = require('../popup.js');

describe('popup utils', () => {
  test('parseAirlineAndFlightNum splits letters and numbers', () => {
    expect(parseAirlineAndFlightNum('LH2')).toEqual({ airline: 'LH', fltnum: '2' });
    expect(parseAirlineAndFlightNum('aa123')).toEqual({ airline: 'AA', fltnum: '123' });
  });

  test('parseAirlineAndFlightNum fallback', () => {
    expect(parseAirlineAndFlightNum('---')).toEqual({ airline: '', fltnum: '' });
  });

  test('cleanCallsign removes non-alphanum and uppercases', () => {
    expect(cleanCallsign('dlh1 tn')).toBe('DLH1TN');
    expect(cleanCallsign('AB$12')).toBe('AB12');
  });

  test('buildSimBriefUrl encodes params', () => {
    const url = buildSimBriefUrl({ airline: 'LH', fltnum: '2', atcCallsign: 'DLH1TN', orig: 'EDDF', dest: 'KJFK' });
    expect(url).toContain('airline=LH');
    expect(url).toContain('fltnum=2');
    expect(url).toContain('callsign=DLH1TN');
    expect(url).toContain('orig=EDDF');
    expect(url).toContain('dest=KJFK');
  });

  test('validateInputs returns false for missing values', () => {
    // Jest will throw if alert is not defined; stub it
    global.alert = () => {};
    expect(validateInputs('', 'KJFK')).toBe(false);
    expect(validateInputs('EDDF', '')).toBe(false);
    expect(validateInputs('EDDF', 'KJFK')).toBe(true);
  });

  test('buildSimBriefUrl includes dep_date and dep_time when provided', () => {
    const departure = { date: '2026-01-02', time: '1115' };
    const url = buildSimBriefUrl({ airline: 'LH', fltnum: '2', atcCallsign: 'DLH1TN', orig: 'EDDF', dest: 'KJFK', departureDatetime: departure });
    expect(url).toContain('dep_date=2026-01-02');
    expect(url).toContain('dep_time=1115');
  });

  test('computeDepartureDateTime returns formatted date and time about 1 hour ahead', () => {
    const dt = computeDepartureDateTime();
    expect(dt.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dt.time).toMatch(/^\d{4}$/);

    const parsed = new Date(`${dt.date}T${dt.time.slice(0,2)}:${dt.time.slice(2)}:00`);
    const diff = Math.abs(parsed.getTime() - (Date.now() + 60 * 60 * 1000));
    // Allow a small discrepancy (120s) for execution time
    expect(diff).toBeLessThan(120 * 1000);
  });
});
