#  CarbonLens – AI Carbon Footprint Tracker

> Track daily activities, measure your carbon footprint, and get personalized AI-powered tips to live greener.

## Live Demo
**[https://astonishing-paletas-73b660.netlify.app](https://astonishing-paletas-73b660.netlify.app)**

---

##  Challenge Vertical
**Individual Carbon Footprint Tracker** – Helps individuals understand, track, and reduce their carbon footprint through simple daily inputs and personalized AI-driven insights powered by Claude AI.

---

##  Features
-  **Real-time carbon score** with animated ring visualization
-  **Transport tracking** – petrol car, diesel car, EV, bike, auto, bus, train, walk
- **Food footprint** – diet type (vegan → heavy meat) and meals per day
-  **Energy usage** – electricity (kWh) and AC/fan hours
-  **Shopping & waste** – online orders and waste level
-  **AI Chat Assistant** – powered by Claude AI via secure backend proxy
-  **Personalized tips** – dynamic recommendations based on your highest emission categories
- **History tracking** – track your progress over time with trend indicators
- **Accessible design** – ARIA labels, keyboard navigation, skip links, screen reader support
-  **Secure backend** – API key never exposed to frontend, rate limiting, input validation

---

## Project Structure
```
carbonlens/
├── server.js          # Express backend — proxies Claude API securely
├── package.json       # Dependencies and scripts
├── public/
│   ├── index.html     # Semantic HTML with full ARIA support
│   ├── styles.css     # All styles, responsive + reduced motion
│   ├── utils.js       # Pure calculation functions (testable)
│   └── app.js         # UI logic, chat, history
└── tests/
    └── tests.js       # 46 unit tests covering all logic
```

---

## Approach & Logic

### Emission Factors Used
| Category | Factor |
|---|---|
| Petrol Car | 0.21 kg CO₂/km |
| Diesel Car | 0.17 kg CO₂/km |
| Electric Vehicle | 0.05 kg CO₂/km |
| Motorbike | 0.11 kg CO₂/km |
| Auto Rickshaw | 0.13 kg CO₂/km |
| Bus / Metro | 0.089 kg CO₂/km |
| Train | 0.041 kg CO₂/km |
| Walk / Cycle | 0 kg CO₂/km |
| Electricity (India grid) | 0.82 kg CO₂/kWh |
| Vegan diet | 1.5 kg CO₂/day |
| Vegetarian diet | 2.0 kg CO₂/day |
| Mixed diet | 4.5 kg CO₂/day |
| Heavy meat diet | 7.5 kg CO₂/day |

### Score Grading
| Grade | Range |
|---|---|
|  Excellent | < 4 kg CO₂/day |
| Good | 4–8 kg CO₂/day |
| Average | 8–13 kg CO₂/day |
|  High Impact | > 13 kg CO₂/day |

---

##  Security
- **API key server-side only** — Claude API called from `server.js`, never exposed to browser
- Input validation and sanitization on both client and server
- Server-side rate limiting (20 requests/min per IP)
- Client-side rate limiting (15 messages/min)
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection` headers
- Request body size limited to 10kb
- XSS prevention via `textContent` for all user-generated content

---

##  Testing
Unit tests in `tests/tests.js` — 46 tests covering:
- Transport, food, energy, shopping calculations
- Grade system (Excellent / Good / Average / High Impact)
- Input sanitization and boundary clamping
- Error handling for invalid/malicious inputs
- Real-world Indian user scenarios

```bash
npm test
# or
node tests/tests.js
```

---

##  Tech Stack
- **Node.js + Express** backend (API proxy)
- **Vanilla HTML/CSS/JS** frontend (no frameworks)
- **Claude AI** (claude-sonnet-4-6) for AI chat
- `localStorage` for history persistence
- Google Fonts (Space Grotesk + Space Mono)

---

##  How to Run Locally
```bash
git clone https://github.com/reshmasparkle123-prog/carbon_lens
cd carbon_lens
npm install
ANTHROPIC_API_KEY=your_key_here npm start
# Open http://localhost:3000
```

---

##  Assumptions Made
- India's electricity grid emission factor: **0.82 kg CO₂/kWh** (CEA 2023)
- Indian average carbon footprint: **~5.2 kg CO₂/day** (~1.9 tonnes/year)
- AC usage estimated at **0.5 kg CO₂/hour** (standard 1.5-ton split AC)
- Online delivery: **0.5 kg CO₂ per order** (last-mile delivery estimate)
- Food emissions averaged per meal count across the day

---

## 👩‍💻 Built By
**Reshma K** – CSE Student, Presidency University Bangalore  
PromptWars Virtual – Challenge 3 | Built with Google Antigravity + Claude AI
