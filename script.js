// --- 1. BACKGROUND ANIMATION LOGIC ---
const canvas = document.getElementById('liquid-bg');
const ctx = canvas ? canvas.getContext('2d') : null;
let mouse = { x: 0, y: 0 };
let spheres = [];

function initBg() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    spheres = [];
    for (let i = 0; i < 5; i++) {
        spheres.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 200 + Math.random() * 300,
            color: i % 2 === 0 ? '#3b82f6' : '#8b5cf6',
            speed: 0.02 + Math.random() * 0.05
        });
    }
}

function drawBg() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spheres.forEach(s => {
        const offsetX = (mouse.x - canvas.width / 2) * s.speed;
        const offsetY = (mouse.y - canvas.height / 2) * s.speed;
        ctx.save();
        ctx.filter = 'blur(100px)';
        ctx.beginPath();
        ctx.arc(s.x - offsetX, s.y - offsetY, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color; ctx.globalAlpha = 0.3;
        ctx.fill(); ctx.restore();
    });
    requestAnimationFrame(drawBg);
}

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('resize', initBg);
initBg(); 
drawBg();

// --- 2. MAP INITIALIZATION ---
const map = L.map("map").setView([9.9312, 76.2673], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
}).addTo(map);

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjdjZWQyMjhjMzcwMjRjNGQ5ZWZhYTg1MzEyMmFiNjdhIiwiaCI6Im11cm11cjY0In0=";
let startMarker = null, endMarker = null, routeLayer = null;
let poiMarkers = [], fastRouteData = null, moodRouteData = null;
let bestPlaces = [], currentMood = "";

// --- 3. PAGE TRANSITION (FIXED BUTTON) ---
function launchApp() {
    const landing = document.getElementById('landing-page');
    const mapUI = document.getElementById('map-interface');

    if (landing && mapUI) {
        landing.classList.add('fade-out');
        setTimeout(() => {
            landing.style.display = 'none';
            mapUI.style.display = 'block';
            map.invalidateSize(); // Fixes the "broken tiles" issue
        }, 800);
    }
}

// --- 4. MAP CLICK LOGIC ---
map.on("click", (e) => {
    if (!startMarker) {
        startMarker = L.marker(e.latlng).addTo(map).bindPopup("Start").openPopup();
    } else if (!endMarker) {
        endMarker = L.marker(e.latlng).addTo(map).bindPopup("Destination").openPopup();
        applySearch();
    }
});

// --- 5. RESET LOGIC (STAYS ON MAP) ---
function resetMap() {
    // Clear markers
    if (startMarker) { map.removeLayer(startMarker); startMarker = null; }
    if (endMarker) { map.removeLayer(endMarker); endMarker = null; }
    if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
    
    // Clear POIs
    poiMarkers.forEach(m => map.removeLayer(m));
    poiMarkers = [];
    
    // Reset Data
    fastRouteData = null;
    moodRouteData = null;
    bestPlaces = [];
    currentMood = "";
    
    // Reset UI
    document.getElementById("userInput").value = "";
    document.getElementById("moodToggle").checked = false;
    document.getElementById("status").innerHTML = "Tap map to set Start & Destination";
    
    // Recenters map without reloading page
    map.setView([9.9312, 76.2673], 13);
}

// --- 6. ROUTING ENGINE & HELPERS ---
async function applySearch() {
    const input = document.getElementById("userInput").value;
    if(startMarker && endMarker) {
        getSmartRoute(startMarker.getLatLng(), endMarker.getLatLng(), input);
    }
}

async function getSmartRoute(start, end, userInput) {
    document.getElementById("status").innerHTML = "Analyzing...";
    const keyword = detectNeed(userInput);
    try {
        const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
            method: "POST",
            headers: {"Authorization": ORS_API_KEY, "Content-Type": "application/json"},
            body: JSON.stringify({coordinates: [[start.lng, start.lat], [end.lng, end.lat]], alternative_routes: {target_count: 3}})
        });
        const data = await res.json();
        fastRouteData = data.features[0];
        
        let bestScore = -1;
        for (let route of data.features) {
            let buffer = turf.buffer(route, 0.8, {units: 'kilometers'});
            const bbox = turf.bbox(buffer);
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${keyword}&bounded=1&viewbox=${bbox[0]},${bbox[3]},${bbox[2]},${bbox[1]}&limit=10`;
            const poiRes = await fetch(url);
            const places = await poiRes.json();
            
            if (places.length > bestScore) {
                bestScore = places.length;
                moodRouteData = route;
                bestPlaces = places;
            }
        }
        currentMood = keyword;
        renderComparison();
    } catch (err) { console.error(err); }
}

function detectNeed(i) {
    i = i.toLowerCase();
    if (i.includes("food") || i.includes("hungry") || i.includes("eat")) return "restaurant";
    if (i.includes("fuel") || i.includes("petrol") || i.includes("gas")) return "gas station";
    if (i.includes("book") || i.includes("library") || i.includes("read") ||i.includes("study")) return "library";
    if (i.includes("shop") || i.includes("dress") || i.includes("mall") || i.includes("complex")) return "mall";
    if (i.includes("hospital") || i.includes("sick") || i.includes("doctor") || i.includes("medical")) return "hospital";
    if (i.includes("water") || i.includes("lake") || i.includes("beach") || i.includes("river")) return "water";
    if (i.includes("atm") || i.includes("bank") || i.includes("money") || i.includes("cash")) return "atm";
    if (i.includes("cafe") || i.includes("coffee") || i.includes("tea") || i.includes("break")) return "cafe";
    return "searching";
}
// --- UPDATED RENDER LOGIC ---
function renderComparison() {
    const isMood = document.getElementById("moodToggle").checked;
    const routeToDraw = isMood ? moodRouteData : fastRouteData;
    
    // Clear old route and old markers
    if (routeLayer) map.removeLayer(routeLayer);
    poiMarkers.forEach(m => map.removeLayer(m));
    poiMarkers = [];

    // Draw the route line
    const routeColor = isMood ? '#e67e22' : '#3498db'; // Orange for mood, Blue for fast
    routeLayer = L.geoJSON(routeToDraw, {
        style: { color: routeColor, weight: 6, opacity: 0.8 }
    }).addTo(map);

    // If Mood is enabled, show the emoji bubbles
    if (isMood && bestPlaces.length > 0) {
        displayMoodMarkers(bestPlaces, currentMood, routeColor);
    }

    // Update Status Bar with the "Found X" message
    updateStatusBar(isMood);
    
    map.fitBounds(routeLayer.getBounds());
}

// --- NEW FUNCTION: CUSTOM EMOJI BUBBLES ---
function displayMoodMarkers(places, keyword, color) {
    const moodIcons = { 
        "restaurant": "🍴", 
        "gas station": "⛽", 
        "hospital": "🏥", 
        "library": "📚",
        "mall": "🛍️",
        "water": "💧",
        "atm": "🏧",
        "cafe": "☕",
        "searching": "📍" 
    };

    places.forEach(place => {
        const icon = L.divIcon({
            html: `<div class="poi-bubble" style="border-color: ${color}">
                     ${moodIcons[keyword] || "📍"}
                   </div>`,
            className: 'custom-poi-container',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const marker = L.marker([place.lat, place.lon], { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${place.display_name}</b>`);
        
        poiMarkers.push(marker);
    });
}

function toggleRoute() { if(fastRouteData) renderComparison(); }

function updateStatusBar(isMood) {
    const statusEl = document.getElementById("status");
    if (!fastRouteData) return;

    // Convert meters to km and seconds to minutes from the API summary
    const distance = (fastRouteData.properties.summary.distance / 1000).toFixed(2);
    const duration = Math.round(fastRouteData.properties.summary.duration / 60);

    if (isMood) {
        // Displays the icon, distance, time, and the count of POIs found
        statusEl.innerHTML = `📍 ${distance} km | 🕒 ${duration} mins | <b>Found ${bestPlaces.length} ${currentMood}s</b>`;
    } else {
        statusEl.innerHTML = `📍 ${distance} km | 🕒 ${duration} mins | Fastest Route`;
    }
}