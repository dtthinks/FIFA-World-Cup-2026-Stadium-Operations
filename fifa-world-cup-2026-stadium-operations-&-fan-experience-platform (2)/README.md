# ⚽ FIFA World Cup 2026 Smart Stadium Operations Dashboard

Welcome to the **FIFA World Cup 2026 Smart Stadium Operations Control Center**—a fully full-stack digital-twin dashboard built for stadium directors, arena safety crew, event planners, and local transport operators. This platform integrates cutting-edge **Generative AI** powered by the **Google Gemini SDK** to optimize gate queues, orchestrate volunteer forces, coordinate local rapid transit networks, handle accessibility assistance, and translate real-time spectator signage instantly.

---

## 🛠️ Key Architectural Pillars

### 1. Unified React State Architecture (`/src/hooks/useStadiumTelemetry.ts`)
The entire application is driven by a single-source-of-truth custom hook that holds reactive status streams for:
*   **Spectator Density**: Gate metrics, turnstile scan frequencies, and wait latency curves.
*   **Active Incidents**: Real-time logging of high/med/low severity emergency alerts (Medical, Security, Crowd, Facility).
*   **Transit Connections**: Metro, shuttle, and rideshare dispatch streams.
*   **Clean Sustainability Metrics**: Real-time solar production panels (kW) and recycled material weights.

### 2. High-Assurance Security & Validation
*   **Form Schema Constraints (`zod`)**: Incident reports validate inputs stringently before state inclusion.
*   **Cross-Site Scripting Guard (`/src/utils/sanitizer.ts`)**: Built-in regex filters strip out HTML, brackets, and scripting characters from user inputs to prevent XSS.
*   **Lazy Token API Hooks**: Centralized `/src/services/apiService.ts` implements circuit-breaker timeouts and 3-stage retry intervals.

### 3. Executive Command Intelligence Panel (`/src/components/ExecutiveDashboard.tsx`)
*   **Dynamic Risk Score Gauge**: Combines crowd congestion levels and critical alerts into an unified safety indicator.
*   **Workforce Utilization**: Displays volunteer guide rosters dispatched to incident zones.
*   **Live Decision Feed**: Keeps a real-time ledger of automated overrides.
*   **AI Timeline Recommendations**: Feeds upcoming predictive instructions with contextual score confidence.

### 4. Advanced AI Sub-Modules (`/src/components/AIOperationalIntelligence.tsx`)
A bento-grid dashboard housing 8 dedicated AI-guided cards:
1.  **Crowd Prediction AI**: Forecasts attendance curves and gate jams.
2.  **Smart Wayfinding AI**: Highlights local terminal detours.
3.  **Emergency Dispatch AI**: Triages active medical or security emergencies.
4.  **Volunteer Helper AI**: Calculates efficient personnel placements.
5.  **Transit Optimizer AI**: Tracks municipal bus delays.
6.  **Accessibility AI**: Resolves ramp blockage issues.
7.  **Sustainability Core AI**: Analyzes green energy offsets.
8.  **Translator Broadcast AI**: Translates emergency alerts into 10 world languages instantly.

---

## 📂 File & Directory Structure

```text
/
├── server.ts                       # Express.js backend & Gemini AI proxy endpoint
├── vite.config.ts                  # Vite compilation & dev server configuration
├── package.json                    # Project metadata, dependencies, & build scripts
├── README.md                       # Comprehensive operational guide
├── src/
│   ├── main.tsx                    # React client entrypoint
│   ├── App.tsx                     # Primary layout orchestration
│   ├── types.ts                    # Strict TypeScript type models & enums
│   ├── index.css                   # Global Tailwind styling sheets
│   ├── hooks/
│   │   └── useStadiumTelemetry.ts  # State manager sync & telemetry hooks
│   ├── services/
│   │   └── apiService.ts           # Centralized API with timeouts & retries
│   ├── utils/
│   │   ├── sanitizer.ts            # Input sanitizer (XSS protection)
│   │   └── constants.ts            # Shared operational threshold variables
│   └── components/
│       ├── ExecutiveDashboard.tsx   # Integrated KPIs & Safety risk monitors
│       ├── AIOperationalIntelligence.tsx # 8 live AI modules
│       ├── IncidentManager.tsx     # Zod-validated incident reporting & crew dispatcher
│       ├── OperationsCopilot.tsx   # Interactive chat assistant
│       └── ...                     # Reusable layout panels
```

---

## 🚀 Installation & Deployment

### 1. Prerequisites
*   Node.js v18 or newer
*   A Google Gemini API Key

### 2. Configure Environment Secrets
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="your_google_gemini_api_key_here"
PORT=3000
```

### 3. Local Development Mode
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Production Compilation & Start
The project uses `esbuild` to bundle the backend server into a clean, standalone, self-contained CommonJS target inside `/dist`.
```bash
# Compile client and bundle backend
npm run build

# Start the compiled full-stack application
npm run start
```

---

## 🔒 Security & Accessibility Auditing
*   **Keyboard Friendly Navigation**: Main grid components support sequential `tabIndex` focus highlighting and ARIA landmarks.
*   **Skip-to-Content Link**: Included at the body level for screen-reader users.
*   **Form Validation**: Full validation of input lengths, bounds, and string inputs.
