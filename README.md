# 💪 GymBot — AI Bodybuilding Coach

A sleek, dark-themed AI chatbot built for bodybuilders and fitness enthusiasts. Powered by **Claude AI (Anthropic)**.

![GymBot Screenshot](public/screenshot.png)

---

## Features

- 🏋️ **Workout Plans** — Push/Pull/Legs, Bro Split, Full Body, and more
- 📐 **Exercise Form Guides** — Step-by-step instructions with cues and common mistakes
- 🔥 **Calorie Calculator** — Based on your height, weight, age, gender & goal
- 🏃 **Cardio Planning** — Duration & intensity based on your goals
- 💊 **Supplement Advice** — Protein, creatine, pre-workout, vitamins
- 😴 **Recovery Tips** — Sleep, periodization, and deload advice
- 📱 **Responsive Design** — Works on desktop and mobile

---

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks needed)
- **AI**: Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Fonts**: Bebas Neue + DM Sans (Google Fonts)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/gymbot.git
cd gymbot
```

### 2. Get your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / log in
3. Navigate to **API Keys** and create a new key
4. Copy your key

### 3. Add your API Key

Open `src/app.js` and find the config section at the top. Add your API key:

```js
const API_KEY = "your-anthropic-api-key-here";
```

Then update the fetch headers in the `sendMessage` function:

```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
},
```

> ⚠️ **Security Note**: Never commit your API key to GitHub! See the [Securing Your API Key](#securing-your-api-key) section below.

### 4. Open in browser

Just open `index.html` in your browser — no build step needed!

```bash
# Option 1: Direct open
open index.html

# Option 2: Use VS Code Live Server extension (recommended)
# Right-click index.html → Open with Live Server
```

---

## Project Structure

```
gymbot/
├── index.html          # Main HTML file
├── src/
│   ├── style.css       # All styles (dark theme)
│   └── app.js          # Chat logic & API calls
├── public/             # Static assets (screenshots, icons)
├── .gitignore          # Ignores node_modules, .env, etc.
└── README.md           # This file
```

---

## Securing Your API Key

For production use, **never expose your API key in frontend code**. Instead:

1. Create a simple backend (Node.js/Express, Python/Flask) that proxies requests to Anthropic
2. Store the API key in a `.env` file on the server
3. Your frontend calls your backend, your backend calls Anthropic

Example `.env`:
```
ANTHROPIC_API_KEY=your-key-here
```

---

## Customization

### Change the AI personality
Edit the `SYSTEM_PROMPT` in `src/app.js` to adjust GymBot's tone, expertise, or focus areas.

### Add more quick topics
In `index.html`, add a new button inside `.quick-topics`:

```html
<button class="topic-btn" data-msg="Your question here">🎯 Button Label</button>
```

### Change the color theme
All colors are CSS variables in `src/style.css`. Edit the `:root` block to change the theme.

---

## License

MIT — free to use, modify, and distribute.

---

Made with 💪 and Claude AI
# AI-Gym-Bot
