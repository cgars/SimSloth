chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeData") {
        try {
            let flightData = {
                leftPart: "",  // LH2
                rightPart: "", // DLH1TN
                orig: "",
                dest: ""
            };

            // --- 1. HEADER ELEMENT (Playback ID) ---
            // <h1 id="txt-playback-header">Playback of flight LH2 <small>/ DLH1TN</small></h1>
            const headerEl = document.getElementById("txt-playback-header");
            
            if (headerEl) {
                // Roh-Text: "Playback of flight LH2 / DLH1TN"
                let text = headerEl.innerText.replace("Playback of flight", "").trim();
                
                if (text.includes('/')) {
                    const parts = text.split('/');
                    flightData.leftPart = parts[0].trim();  // "LH2"
                    flightData.rightPart = parts[1].trim(); // "DLH1TN"
                } else {
                    flightData.leftPart = text;
                }
            } else {
                // Fallback URL: /data/flights/lh2
                const pathParts = window.location.pathname.split('/');
                const raw = pathParts[pathParts.length - 1].split('#')[0];
                flightData.leftPart = raw.toUpperCase(); 
            }

            // --- 2. ROUTE (IDs) ---
            const getCode = (id) => {
                const el = document.getElementById(id);
                if (!el) return "";
                const match = el.innerText.match(/\(([A-Z0-9]{3,4})\)/);
                return match ? match[1] : "";
            };

            flightData.orig = getCode("txt-airport-origin");
            flightData.dest = getCode("txt-airport-dest");

            sendResponse({ success: true, data: flightData });

        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }
});