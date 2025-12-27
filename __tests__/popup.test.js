const {
  parseAirlineAndFlightNum,
  cleanCallsign,
  buildSimBriefUrl,
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
});
