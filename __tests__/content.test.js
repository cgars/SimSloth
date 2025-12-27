const { getFlightIdentifiers, getAirportCode, scrapeFlightData } = require('../content.js');

describe('content scraping', () => {
  beforeEach(() => {
    // Clear document body
    document.body.innerHTML = '';
  });

  test('getFlightIdentifiers parses header text with slash', () => {
    const header = document.createElement('div');
    header.id = 'txt-playback-header';
    header.innerText = 'Playback of flight LH2 / DLH1TN';
    document.body.appendChild(header);

    const ids = getFlightIdentifiers();
    expect(ids.leftPart).toBe('LH2');
    expect(ids.rightPart).toBe('DLH1TN');
  });

  test('getFlightIdentifiers falls back to URL path', () => {
    // Simulate location.pathname
    delete window.location;
    window.location = { pathname: '/something/LH123' };

    const ids = getFlightIdentifiers();
    expect(ids.leftPart).toBe('LH123');
  });

  test('getAirportCode returns code from innerText', () => {
    const el = document.createElement('div');
    el.id = 'txt-airport-origin';
    el.innerText = 'Frankfurt (EDDF)';
    document.body.appendChild(el);

    expect(getAirportCode('txt-airport-origin')).toBe('EDDF');
    expect(getAirportCode('missing')).toBe('');
  });

  test('scrapeFlightData combines pieces', () => {
    const header = document.createElement('div');
    header.id = 'txt-playback-header';
    header.innerText = 'Playback of flight LH2 / DLH1TN';
    document.body.appendChild(header);

    const orig = document.createElement('div');
    orig.id = 'txt-airport-origin';
    orig.innerText = 'Frankfurt (EDDF)';
    document.body.appendChild(orig);

    const dest = document.createElement('div');
    dest.id = 'txt-airport-dest';
    dest.innerText = 'New York (KJFK)';
    document.body.appendChild(dest);

    const data = scrapeFlightData();
    expect(data.leftPart).toBe('LH2');
    expect(data.rightPart).toBe('DLH1TN');
    expect(data.orig).toBe('EDDF');
    expect(data.dest).toBe('KJFK');
  });
});
