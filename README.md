# MacroSpots 🍔🥗

**MacroSpots** is a map-first, mobile-friendly web application designed to help users find the best macro-friendly fast food options around them. By calculating a dynamic "Macro Fit Score" against your daily remaining calories and macronutrients, MacroSpots highlights the restaurants and menu items that best fit your goals.

## 🌟 Features

*   **Interactive Map UI**: A full-screen, highly responsive map built with Leaflet.js and styled with dark CARTO tiles.
*   **Dynamic Colored Pins**: Restaurant markers on the map react in real-time to your dietary needs. 
    *   🟢 **Green**: Excellent match (Score > 80)
    *   🟡 **Yellow**: Good match (Score 50–79)
    *   ⚫ **Grey**: Poor match
*   **Draggable Bottom Sheet**: A fluid, app-like bottom sheet with three snap states (Collapsed, Half, Expanded) to browse results and view item details seamlessly.
*   **Macro Fit Engine**: A custom algorithm that ranks menu items based on closeness to your remaining Calories, Protein, Carbs, and Fats.
*   **Quick Filters**: Easily filter map results by Drive-Thru availability, High Protein, Under 500 Calories, or Low Fat options.
*   **Item Customization**: View common modifications (e.g., "No Mayo", "No Cheese") and see how they impact the nutritional profile in real-time before logging.
*   **Branded Category Icons**: Every restaurant gets a custom-drawn, color-coded glyph (burger, chicken, sub, coffee, pizza, taco, bowl, fries) instead of a plain emoji — shown consistently on map pins, result cards, and the item detail view (`src/data/icons.js`).

## 🛠️ Tech Stack

*   **Frontend**: Vanilla JavaScript (ES6 Modules), HTML5, CSS3
*   **Build Tool**: Vite
*   **Mapping**: Leaflet.js
*   **Architecture**: Custom Pub/Sub state management (`store.js`), component-driven CSS, and a mobile-device frame layout for desktop viewing.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v16 or higher recommended)

### Installation

1.  Clone the repository:
```bash
    git clone https://github.com/Yuvi-Pain/MacroSpots.git
    cd MacroSpots
```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173/` or `http://localhost:5174/`).

## 📂 Project Structure

*   `index.html`: The main entry point and app shell (Map + Overlay + Bottom Sheet).
*   `src/`
    *   `api/`: Mock API layer for data fetching.
    *   `data/`: Mock database containing restaurants, menu items, and geo-coordinates.
    *   `engine/`: Core logic, including the Macro Fit Score algorithm.
    *   `map/`: Leaflet map initialization and dynamic pin rendering.
    *   `state/`: Centralized pub/sub state store.
    *   `styles/`: Modular CSS system (variables, base, components, map overlay).
    *   `ui/`: UI controllers, primarily the complex draggable bottom sheet logic.
    *   `main.js`: The application orchestrator tying everything together.

## ⚡ Performance Notes

*   **Marker diffing**: `mapManager.js` keeps a live registry of one Leaflet marker per restaurant. Renders only add/remove/update the markers whose visibility or score actually changed, instead of clearing and rebuilding the whole pin layer on every macro/filter/search change.
*   **Score memoization**: Macro Fit Scores only depend on remaining macros + priority mode, so they're cached by a signature of those values. Search and quick-filter changes (which don't affect scores) reuse the cached results instead of recomputing.
*   **Surgical DOM updates**: The collapsed sheet's macro rings update via direct attribute/text writes rather than re-rendering the whole sheet on every macro change.

## 💡 Design Philosophy

The application recently underwent an architectural pivot from a traditional screen-based Single Page Application (SPA) to a **Map-First Application**. The goal was to provide an immersive, immediate spatial context similar to modern ride-sharing or delivery apps, enhancing usability for users looking for food "right now" while on the go.
