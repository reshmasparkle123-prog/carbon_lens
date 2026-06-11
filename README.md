# 🌱 CarbonLens – Carbon Footprint Tracker

> Track daily activities, measure your carbon footprint, and get personalized tips to live greener.

## 🎯 Challenge Vertical
**Individual Carbon Footprint Tracker** – Helps individuals understand, track, and reduce their carbon footprint through simple daily inputs and personalized AI-driven insights.

## 🚀 Live Demo
[Deploy link here]

## ✨ Features
- 📊 **Real-time carbon score** with animated ring visualization
- 🚗 **Transport tracking** – car, EV, bike, bus, train, walk
- 🍽️ **Food footprint** – diet type and meals per day
- ⚡ **Energy usage** – electricity and AC hours
- 🛍️ **Shopping & waste** – online orders and waste level
- 💡 **Personalized tips** – dynamic recommendations based on your inputs
- 📅 **History tracking** – track progress over time
- 🎨 **Beautiful dark UI** – mobile-first, responsive design

## 🧮 Approach & Logic

### Emission Factors Used
| Category | Factor |
|----------|--------|
| Petrol Car | 0.21 kg CO₂/km |
| Diesel Car | 0.17 kg CO₂/km |
| Electric Vehicle | 0.05 kg CO₂/km |
| Bus | 0.089 kg CO₂/km |
| Train | 0.041 kg CO₂/km |
| Electricity (India grid) | 0.82 kg CO₂/kWh |
| Vegan diet | 1.5 kg CO₂/day |
| Vegetarian diet | 2.0 kg CO₂/day |
| Mixed diet | 4.5 kg CO₂/day |
| Heavy meat diet | 7.5 kg CO₂/day |

### Score Grading
- 🌿 **Excellent**: < 4 kg CO₂/day
- ✅ **Good**: 4–8 kg CO₂/day
- ⚠️ **Average**: 8–13 kg CO₂/day
- 🔥 **High Impact**: > 13 kg CO₂/day

### Personalized Tips Logic
Tips are dynamically generated based on the user's highest emission categories, providing actionable, quantified recommendations.

## 🛠️ Tech Stack
- Pure HTML, CSS, JavaScript (no frameworks)
- localStorage for history persistence
- Google Fonts (Space Grotesk + Space Mono)

## 📱 How to Run
1. Clone the repo
2. Open `index.html` in any browser
3. No build step required!

## 🌍 Impact
The average Indian emits ~1.9 tonnes of CO₂/year (~5.2 kg/day). This app helps users benchmark against that and take concrete daily actions.

## 👩‍💻 Built By
Reshma K – Presidency University Bangalore
PromptWars Virtual – Challenge 3
