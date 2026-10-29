# 🎛️ MusicX Studio — Web FL Studio DAW (v2.0 Pro)

[🇧🇷 Português](README.md) | [🇺🇸 English](README.en.md)

> Digital Audio Workstation (DAW) in the browser inspired by the classic **FL Studio** workflow, built with **React 18**, **Tailwind CSS**, **TypeScript**, **Zustand**, and a low-latency, sample-accurate **Web Audio API** engine.

---

## 🌟 Overview

**MusicX Studio v2.0** recreates the beloved FL Studio music production ecosystem directly in the browser. All audio processing (analog drum synthesis, mixer routing, FX sends, and offline rendering) runs inside a **decoupled Audio Engine isolated from the React render cycle**, synchronized atomically via **Zustand** state stores.

---

## 🌊 Architecture & Modernized Core

```mermaid
graph TD
    subgraph UI ["React 18 + Tailwind CSS Layer"]
        TopBar["TopToolbar (Transport, BPM, PAT/SONG)"]
        Rack["ChannelRack (16 Steps, Drag & Drop)"]
        PR["PianoRoll (C3-B4 Grid, Velocity Editor)"]
        MixerUI["Mixer (5 Strips, 3-Band EQ, FX Sends)"]
        PlaylistUI["PlaylistArranger (16 Bars Timeline, Clips)"]
    end

    subgraph State ["Global State (Zustand Stores)"]
        useProjectStore["useProjectStore (BPM, Swing, Patterns, Clips)"]
        useMixerStore["useMixerStore (Volumes, Pans, EQs, Sends)"]
    end

    subgraph Engine ["Decoupled DSP Engine (Web Audio API)"]
        Scheduler["Lookahead Scheduler (Sample-Accurate Timing)"]
        Synths["Analog Drum Synthesis (Kick, Snare, Hat, Clap, Synth)"]
        Visualizer["Canvas Visualizer (60 FPS FFT Spectrum & Oscilloscope)"]
        OfflineRender["OfflineAudioContext (16-bit Stereo WAV Exporter)"]
    end

    UI -->|User Dispatched Actions| State
    State -.->|Reactive Selectors| UI
    State -->|Atomic Read via getState| Engine
    Engine -->|RequestAnimationFrame| Visualizer
```

---

## ✨ Features

### 1. 🎛️ Channel Rack & Step Sequencer
- **16-Step Grid**: Classic 4/4 rhythm grouping with alternating beat block colors.
- **Tactile Rotary Knobs (`<RotaryKnob />`)**: Smooth vertical dragging with pointer capture, fine sensitivity, and double-click to reset.
- **Audio Sample Drag & Drop**: Drag `.wav` or `.mp3` audio files directly from your desktop onto any channel row to decode and play them instantly.
- **Swing / Groove Control**: Global shuffle timing slider (0% to 100%) dynamically adjusting odd 16th-note timings.

### 2. 🎚️ Dedicated Mixer & DSP Effects Rack
- **5 Audio Channels**: Dedicated **Master (MST)** strip with safety Master Limiter (-0.5 dB) + 4 independent insert tracks (`Kick`, `Snare`, `HiHat`, `Clap`).
- **3-Band Equalizer**: Individual `HI`, `MID`, and `LOW` shelf/peaking filters (-12 dB to +12 dB) per track.
- **Auxiliary FX Sends**: Dedicated send knobs for **Reverb** (convolver impulse), **Stereo Delay** (feedback), and **Fast Distortion** (analog wave shaper).
- **Decibel-Calibrated Vertical Faders**: High-precision faders with numerical dB readouts (`0.0 dB`, `-6.0 dB`, `-inf`) and animated stereo VU peak meters.
- **60 FPS Real-Time Canvas Visualizer**: Toggle instantly between **Spectrum Analyzer (48-band FFT)** and **Oscilloscope (Stereo Waveform)**.

### 3. 🎹 Melodic Piano Roll & Velocity Graph
- **2-Octave Chromatic Grid (C3 to B4, 24 Semitones)**: Click to place or delete melodic notes.
- **Interactive Vertical Keyboard**: Clickable black and white keys with audio preview and root key indicators (*Root C*).
- **Note Duration Selector**: Support for 1/16, 1/8, or 1/4 bar note lengths.
- **Per-Step Velocity Graph Editor**: Bottom drawer with 16 vertical dynamic bars to tweak velocity per step.

### 4. 🎵 Playlist Arranger & Offline WAV Export
- **16-Bar Multi-Track Timeline**: 4 horizontal tracks to arrange and sequence pattern clips.
- **Multi-Pattern Manager**: Switch between patterns or create new ones (`Pattern 1`, `Pattern 2`, etc.) via `< >` selectors and `+`.
- **Dual Playback Modes (`[PAT]` / `[SONG]`)**: Loop the active pattern or play the entire song arrangement with a timeline playhead ruler.
- **Demo Song Preset**: 1-click button to load a full demonstration track with Intro, Drop, and Outro sections.
- **Master WAV Export**: High-speed offline rendering via `OfflineAudioContext` for 16-bit stereo PCM WAV (44.1 kHz) instant downloads.

---

## ⌨️ Global Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Toggle Play / Pause |
| <kbd>Enter</kbd> | Stop playback and reset playhead to start |
| <kbd>L</kbd> | Toggle between `PAT` (Pattern) and `SONG` modes |
| <kbd>1</kbd> | Open **Channel Rack** |
| <kbd>2</kbd> | Open **Piano Roll** |
| <kbd>3</kbd> | Open **Mixer** |
| <kbd>4</kbd> | Open **Playlist Arranger** |

---

## 📁 Project Structure

```
musicx-studio/
├── src/
│   ├── audio/
│   │   ├── AudioEngine.ts     # Decoupled Web Audio singleton, DSP synths & scheduler
│   │   └── WavExporter.ts     # Offline 16-bit PCM stereo WAV exporter
│   ├── components/
│   │   ├── common/            # RotaryKnob dial, LcdDisplay
│   │   ├── mixer/             # Mixer rack, MixerStrip, AudioVisualizer Canvas
│   │   ├── pianoroll/         # PianoRoll chromatic matrix, VelocityGraph
│   │   ├── playlist/          # PlaylistArranger multi-track timeline
│   │   ├── rack/              # ChannelRack, ChannelRow (Drag & Drop zone)
│   │   └── toolbar/           # TopToolbar (Transport, LCD BPM, Window Toggles)
│   ├── store/
│   │   ├── useMixerStore.ts   # Zustand store for strips, faders, EQs and FX sends
│   │   └── useProjectStore.ts # Zustand store for BPM, swing, channels, patterns, clips
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces and domain models
│   ├── App.tsx                # Main application layout and window manager
│   ├── index.css              # Tailwind CSS directives & FL Studio dark scrollbars
│   └── main.tsx               # React 18 DOM mount entry point
├── legacy/                    # Intact backup of original vanilla HTML/CSS/JS version
├── vite.config.ts             # Vite 6 configuration (host: true, allowedHosts: true)
├── tailwind.config.js         # FL Studio dark theme palette and grid definitions
├── tsconfig.json              # TypeScript compiler configuration
├── start.bat                  # 1-Click launcher for Windows
├── package.json               # Dependencies and build scripts
└── README.md                  # Portuguese documentation
```

---

## 🚀 Running Locally

### Option 1: Automatic 1-Click Launcher (Windows)
Double-click [`start.bat`](start.bat) in the project root folder. It will start Vite and automatically launch your default browser at `http://localhost:3000`.

### Option 2: Using NPM / Terminal
Ensure you have Node.js (v18+) installed and run:
```bash
npm run dev
```

### To Generate an Optimized Production Build:
```bash
npm run build
```

### To Run the Legacy Vanilla Version:
```bash
npm run legacy
```

---

## ☁️ Running on GitHub Codespaces

This repository includes a configured `.devcontainer/devcontainer.json`:
1. On GitHub, click **Code** > **Codespaces** > **Create codespace on main**.
2. Run in the Codespace terminal:
   ```bash
   npm run dev
   ```
3. Open port **3000** (`https://<codespace-name>-3000.app.github.dev/`). Ensure port visibility is set to **Public** if opening from an external tab.

---

## 🛠️ Tech Stack

- **React 18**: Declarative, component-based user interface.
- **Tailwind CSS 3.4**: Hardware-inspired FL Studio dark theme.
- **TypeScript 5.7**: Strict type safety across audio nodes, patterns, and channels.
- **Zustand 5**: Ultra-performant atomic state management preventing unnecessary React re-renders.
- **Web Audio API**: Native digital signal processing (DSP), synthesis, biquad filters, convolvers, and FFT analyzers.
- **Vite 6**: Next-generation frontend tooling and instant HMR.
- **Lucide React**: Clean vector iconography for audio controls.

---

## 📄 License
Distributed under the [MIT](https://opensource.org/licenses/MIT) License.
