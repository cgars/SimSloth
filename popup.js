document.addEventListener('DOMContentLoaded', function() {
    
    // Hilfsfunktion: Elemente sicher holen
    const iataInput = document.getElementById('input_iata');
    const callsignInput = document.getElementById('input_callsign');
    const origInput = document.getElementById('input_orig');
    const destInput = document.getElementById('input_dest');
    const statusDiv = document.getElementById('status');
    const loadBtn = document.getElementById('btn_load');
    const sendBtn = document.getElementById('btn_send'); // Hier suchen wir den Button

    // --- DATEN LADEN ---
    function datenHolen() {
        if(statusDiv) statusDiv.innerText = "Lese...";

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (!tabs[0] || !tabs[0].url.includes("flightradar24.com")) {
                if(statusDiv) statusDiv.innerText = "Nicht FR24.";
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, {action: "scrapeData"}, (response) => {
                if (chrome.runtime.lastError) return;

                if (response && response.success) {
                    const d = response.data;
                    if(iataInput) iataInput.value = d.leftPart || "";
                    if(callsignInput) callsignInput.value = d.rightPart || "";
                    if(origInput) origInput.value = d.orig || "";
                    if(destInput) destInput.value = d.dest || "";
                    if(statusDiv) statusDiv.innerText = "OK.";
                }
            });
        });
    }

    // Starten
    datenHolen();
    if(loadBtn) loadBtn.addEventListener('click', datenHolen);

    // --- SENDE LOGIK ---
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            
            // Werte auslesen
            let iataRaw = iataInput.value.trim();      // "LH2"
            let callsignRaw = callsignInput.value.trim(); // "DLH1TN"
            const start = origInput.value.trim();
            const ziel = destInput.value.trim();

            if (!start || !ziel) {
                alert("Start/Ziel fehlt.");
                return;
            }

            // 1. Airline & Flugnummer aus IATA (LH2)
            let airline = "";
            let fltnum = "";

            // Alles außer Buchstaben und Zahlen weg, Großbuchstaben
            iataRaw = iataRaw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

            // Match: Buchstaben am Anfang (LH), Zahlen am Ende (2)
            const match = iataRaw.match(/^([A-Z]+)([0-9]+)$/);

            if (match) {
                airline = match[1]; // LH
                fltnum = match[2];  // 2
            } else {
                // Fallback (z.B. nur "LH" oder "GEC")
                airline = iataRaw;
                fltnum = ""; 
            }

            // 2. Callsign reinigen (DLH1TN)
            let atcCallsign = callsignRaw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

            // 3. URL
            let sbUrl = `https://www.simbrief.com/system/dispatch.php?new=1`;
            sbUrl += `&airline=${encodeURIComponent(airline)}`;
            sbUrl += `&fltnum=${encodeURIComponent(fltnum)}`;
            sbUrl += `&callsign=${encodeURIComponent(atcCallsign)}`;
            sbUrl += `&orig=${encodeURIComponent(start)}`;
            sbUrl += `&dest=${encodeURIComponent(ziel)}`;
            sbUrl += `&date=today`; 

            // Öffnen
            window.open(sbUrl, '_blank');
        });
    } else {
        console.error("FEHLER: Button 'btn_send' nicht im HTML gefunden!");
    }
});