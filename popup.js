// ============================================
// DOM ELEMENT REFERENCES
// ============================================

const DOM = {
    iataInput: document.getElementById('input_iata'),
    callsignInput: document.getElementById('input_callsign'),
    origInput: document.getElementById('input_orig'),
    destInput: document.getElementById('input_dest'),
    statusDiv: document.getElementById('status'),
    loadBtn: document.getElementById('btn_load'),
    sendBtn: document.getElementById('btn_send')
};

// ============================================
// DATA FETCHING
// ============================================

/**
 * Check if current tab is on FlightRadar24
 * @param {Object} tab - Chrome tab object
 * @returns {boolean}
 */
function isFlightRadar24Tab(tab) {
    return tab && tab.url && tab.url.includes("flightradar24.com");
}

/**
 * Request flight data from content script
 * @param {number} tabId - Tab ID
 * @param {Function} callback - Callback with response
 */
function requestFlightData(tabId, callback) {
    chrome.tabs.sendMessage(tabId, { action: "scrapeData" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Message error:", chrome.runtime.lastError);
            return;
        }
        callback(response);
    });
}

/**
 * Populate input fields with flight data
 * @param {Object} data - Flight data object
 */
function populateFlightData(data) {
    if (DOM.iataInput) DOM.iataInput.value = data.leftPart || "";
    if (DOM.callsignInput) DOM.callsignInput.value = data.rightPart || "";
    if (DOM.origInput) DOM.origInput.value = data.orig || "";
    if (DOM.destInput) DOM.destInput.value = data.dest || "";
}

/**
 * Fetch and display flight data from active tab
 */
function datenHolen() {
    if (DOM.statusDiv) DOM.statusDiv.innerText = "Lese...";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!isFlightRadar24Tab(tabs[0])) {
            if (DOM.statusDiv) DOM.statusDiv.innerText = "Nicht FR24.";
            return;
        }

        requestFlightData(tabs[0].id, (response) => {
            if (response && response.success) {
                populateFlightData(response.data);
                if (DOM.statusDiv) DOM.statusDiv.innerText = "OK.";
            }
        });
    });
}

// ============================================
// FORM SUBMISSION / SIMBRIEF LOGIC
// ============================================

/**
 * Parse airline code and flight number from IATA
 * @param {string} iataRaw - Raw IATA input (e.g., "LH2")
 * @returns {Object} { airline, fltnum }
 */
function parseAirlineAndFlightNum(iataRaw) {
    // Clean: remove non-alphanumeric, uppercase
    const cleaned = iataRaw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Match: letters at start (LH), numbers at end (2)
    const match = cleaned.match(/^([A-Z]+)([0-9]+)$/);

    if (match) {
        return {
            airline: match[1],  // "LH"
            fltnum: match[2]    // "2"
        };
    }

    // Fallback: entire cleaned string as airline
    return {
        airline: cleaned,
        fltnum: ""
    };
}

/**
 * Clean callsign input
 * @param {string} callsignRaw - Raw callsign (e.g., "DLH1TN")
 * @returns {string} Cleaned callsign
 */
function cleanCallsign(callsignRaw) {
    return callsignRaw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

/**
 * Build SimBrief dispatch URL
 * @param {Object} params - URL parameters
 * @returns {string} Full URL
 */
function buildSimBriefUrl(params) {
    let url = `https://www.simbrief.com/system/dispatch.php?new=1`;
    url += `&airline=${encodeURIComponent(params.airline)}`;
    url += `&fltnum=${encodeURIComponent(params.fltnum)}`;
    url += `&callsign=${encodeURIComponent(params.atcCallsign)}`;
    url += `&orig=${encodeURIComponent(params.orig)}`;
    url += `&dest=${encodeURIComponent(params.dest)}`;
    url += `&date=today`;
    return url;
}

/**
 * Validate required form inputs
 * @param {string} orig - Origin airport
 * @param {string} dest - Destination airport
 * @returns {boolean}
 */
function validateInputs(orig, dest) {
    if (!orig || !dest) {
        alert("Start/Ziel fehlt.");
        return false;
    }
    return true;
}

/**
 * Handle send button click
 */
function handleSendClick() {
    // Read form values
    const iataRaw = DOM.iataInput.value.trim();
    const callsignRaw = DOM.callsignInput.value.trim();
    const orig = DOM.origInput.value.trim();
    const dest = DOM.destInput.value.trim();

    if (!validateInputs(orig, dest)) {
        return;
    }

    // Parse airline and flight number
    const { airline, fltnum } = parseAirlineAndFlightNum(iataRaw);
    const atcCallsign = cleanCallsign(callsignRaw);

    // Build URL
    const sbUrl = buildSimBriefUrl({
        airline,
        fltnum,
        atcCallsign,
        orig,
        dest
    });

    // Open in new tab
    window.open(sbUrl, '_blank');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Load flight data on popup open
    datenHolen();

    // Load button listener
    if (DOM.loadBtn) {
        DOM.loadBtn.addEventListener('click', datenHolen);
    }

    // Send button listener
    if (DOM.sendBtn) {
        DOM.sendBtn.addEventListener('click', handleSendClick);
    } else {
        console.error("ERROR: Button 'btn_send' not found in HTML!");
    }
});

// Export functions for testing (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isFlightRadar24Tab,
        requestFlightData,
        populateFlightData,
        datenHolen,
        parseAirlineAndFlightNum,
        cleanCallsign,
        buildSimBriefUrl,
        validateInputs,
        handleSendClick
    };
}