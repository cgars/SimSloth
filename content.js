// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract flight identifiers from header element
 * @returns {Object} { leftPart, rightPart }
 */
function getFlightIdentifiers() {
    const headerEl = document.getElementById("txt-playback-header");
    let leftPart = "";
    let rightPart = "";

    if (headerEl) {
        // Parse: "Playback of flight LH2 / DLH1TN"
        let text = headerEl.innerText.replace("Playback of flight", "").trim();

        if (text.includes('/')) {
            const parts = text.split('/');
            leftPart = parts[0].trim();   // "LH2"
            rightPart = parts[1].trim();  // "DLH1TN"
        } else {
            leftPart = text;
        }
    } else {
        // Fallback: extract from URL path
        const pathParts = window.location.pathname.split('/');
        const raw = pathParts[pathParts.length - 1].split('#')[0];
        leftPart = raw.toUpperCase();
    }

    return { leftPart, rightPart };
}

/**
 * Extract airport code from element by ID
 * @param {string} id - Element ID
 * @returns {string} Airport code (e.g., "JFK")
 */
function getAirportCode(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    const match = el.innerText.match(/\(([A-Z0-9]{3,4})\)/);
    return match ? match[1] : "";
}

/**
 * Scrape flight data from page
 * @returns {Object} Flight data object
 */
function scrapeFlightData() {
    const { leftPart, rightPart } = getFlightIdentifiers();

    return {
        leftPart,         // LH2
        rightPart,        // DLH1TN
        orig: getAirportCode("txt-airport-origin"),
        dest: getAirportCode("txt-airport-dest")
    };
}

// ============================================
// MESSAGE LISTENER
// ============================================

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage && chrome.runtime.onMessage.addListener) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "scrapeData") {
            try {
                const flightData = scrapeFlightData();
                sendResponse({ success: true, data: flightData });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        }
    });
}

// Export functions for testing (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getFlightIdentifiers,
        getAirportCode,
        scrapeFlightData
    };
}