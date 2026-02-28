# MoodMap
MoodMap is a smart navigation app that prioritizes the "vibe" of your journey over just the speed. Instead of the fastest route, it lets you choose paths based on moods like Calm, Social, or Safe by analyzing data like park density, street lighting, and cafe popularity. It essentially works like a "Spotify playlist" for your walk, steering you through scenic or peaceful areas rather than busy highways.

Team Members:
1: Ahanya M.A - Muthoot Institute of Technology and Science
2: Gauri Rajagopal  - Muthoot Institute of Technology and Science

Project Link: https://ahanyama.github.io/MoodMap/

The problem Statement:
Standard navigation apps prioritize the **fastest** or **shortest** route, completely ignoring the user's emotional state or intended experience. Whether it's the need for a calm, scenic walk, a socially vibrant street, or a safe late-night path, users are currently limited to binary choices that don't account for their "mood."

The solution:
**MoodMap** is an emotion-based smart navigation tool that transforms how people move through their city. By integrating real-time spatial data, it suggests routes that align with specific user moods.

TECHNICAL DETAILS:
* **Frontend**: HTML5, CSS3, JavaScript
* **Mapping**: Leaflet.js, OpenStreetMap
* **Routing**: OpenRouteService (ORS) API
* **Spatial Analysis**: Turf.js (for buffer analysis)
* **Geocoding**: Nominatim API

##  Key Features
* **Mood Toggle**: Switch between "Fastest" and "Mood-Optimized" routes in one click.
* **POI Visualization**: Instantly see relevant markers (cafes, parks, etc.) along your path.
* **Privacy Controls**: Designed with security-by-design principles for sensitive user data.

IMPLEMENTATION:
1:Clone the repository 
git clone https://github.com/ahanyama/MoodMap.git

2: Navigate to the project folder
Run
Simply open index.html in your browser or use the Live Server extension in VS Code to view the project locally.

  PROJECT DOCUMENTATION
<img width="1600" height="821" alt="image" src="https://github.com/user-attachments/assets/f45bbca6-f2be-4699-bb63-6312662757e7" />
<img width="1600" height="852" alt="image" src="https://github.com/user-attachments/assets/e6c337f9-3e11-4ea5-af96-41992b98a3e0" />
<img width="1600" height="826" alt="image" src="https://github.com/user-attachments/assets/bec74567-54b2-4831-bf8b-fc4400d01e11" />


"Dynamic Spatial Routing: Demonstrating the integration of OpenRouteService and Turf.js. The UI provides real-time path calculations, showing the shortest path versus a mood-optimized path based on local POI density."

Diagrams
System Architecture:

Data flows from the User Input -> Intent Parser -> OpenRouteService (Routes) -> Turf.js (Buffer) -> Nominatim (POIs) -> Leaflet (Render).

Application Workflow:

User enters a "Mood" or "Need."
App fetches 3 alternative paths from ORS.
Turf.js calculates a buffer zone around each path.
Nominatim filters POIs within those zones.
The route with the highest POI density is flagged as "Mood-Optimized."

PROJECT DEMO
VIDEO: https://drive.google.com/file/d/1T16w_Wedu-scCrJy4wMPIDWo9CCLVVZU/view?usp=drivesdk

AI Tools Used
Tool Used: Gemini 3 Flash
Purpose: Refinement of the spatial divergence logic and debugging async API race conditions.
Key Prompts Used: "Optimize this Turf.js buffer to find POIs specifically along a path," "Ensure the alternative route diverges by at least 50% from the fastest route."
Percentage of AI-generated code: Approximately 25% (Mostly boilerplate API structures and spatial math logic).

Team Contributions
Ahanya: Frontend development, Leaflet.js map integration, and UI/UX design.
Gauri: Backend logic, OpenRouteService API integration, and Turf.js spatial analysis implementation.

License
This project is licensed under the MIT License.

