# NeuroStream Reader

A web-based RSVP (Rapid Serial Visual Presentation) speed reading application built with Next.js 14, TypeScript, and CSS Modules.

![NeuroStream Reader Screenshot](./docs/screenshot.png)

## Features

- **RSVP Display** - Words displayed sequentially with ORP (Optimal Recognition Point) highlighting
- **Adjustable Speed** - 200-1000 WPM with slider and preset buttons
- **Dynamic Pacing** - Intelligent pauses at punctuation for better comprehension
- **Dark/Light Theme** - Automatic system preference detection
- **Keyboard Shortcuts** - Space (play/pause), ←→ (±50 WPM), R (reset)
- **Context Scrubber** - Hold Space to see surrounding paragraph
- **Offline Support** - Works without internet after first load

## Demo

🚀 **[Live Demo](https://yourusername.github.io/neurostream-reader)** (update with your URL)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` | Decrease WPM by 50 |
| `→` | Increase WPM by 50 |
| `R` | Reset to beginning |
| `Hold Space` | Show paragraph context |

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: CSS Modules
- **State**: React Context + Hooks

## How RSVP Works

RSVP presents words one at a time at a fixed focal point, eliminating the need for eye movement across lines of text. The **Optimal Recognition Point (ORP)** - typically around 35% into each word - is highlighted to help your brain process words faster.

## License

MIT
