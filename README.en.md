# 🎛️ MusicX Studio — Web FL Studio DAW (v2.0 Pro)

[🇧🇷 Português](README.md) | [🇺🇸 English](README.en.md)

> Digital Audio Workstation (DAW) in the browser inspired by the classic **FL Studio** workflow, built with **React 18**, **Tailwind CSS**, **TypeScript**, **Zustand**, and a low-latency, sample-accurate **Web Audio API** engine.

---

## 🌟 Overview

**MusicX Studio v2.0** recreates the beloved FL Studio music production ecosystem directly in the browser. All audio processing (analog drum synthesis, 16-channel mixer routing, acoustic SoundFont instruments, FX sends, and offline rendering) runs inside a **decoupled Audio Engine isolated from the React render cycle**, synchronized atomically via **Zustand** state stores.

---

## 🌊 Architecture & Modernized Core

```mermaid
graph TD
    subgraph UI ["React 18 + Tailwind CSS Layer"]
        TopBar["TopToolbar (Transport, BPM, PAT/SONG, Pattern Manager, i18n)"]
        Rack["ChannelRack (1 to 16 Dynamic Channels, 16 Steps, Drag & Drop)"]
        PR["PianoRoll (C3-B4 Grid, Velocity)"]
        MixerUI["Mixer (Master + 16 Strips, 3-Band EQ, FX Sends, All/Active Filter)"]
        PlaylistUI["PlaylistArranger (16 Bars Timeline, Dynamic Channel Tracks)"]
        StatusBar["BottomBar (Brand Logo, Engine Status, Global Shortcuts)"]
    end

    subgraph State ["Global State (Zustand Stores)"]
        useProjectStore["useProjectStore (BPM, Swing, Dynamic Channels, Patterns, Clips)"]
        useMixerStore["useMixerStore (16 Insert Strips + Master, EQs, Sends)"]
        useLanguageStore["useLanguageStore (pt-BR / en, localStorage)"]
    end

    subgraph Engine ["Decoupled DSP Engine (Web Audio API)"]
        Scheduler["Lookahead Scheduler (Sample-Accurate Timing)"]
        Synths["Analog Drum Synthesis (Kick, Snare, Hat, Clap, Synth)"]
        SFManager["SoundFontManager (MusyngKite Presets & .sf2 Decoder)"]
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

### 1. 🎛️ Channel Rack & Dynamic Channels (1 to 16 Channels)
- **Dynamic DSP Channels (1 to 16 Channels)**: Add new channels dynamically with the `+ Add Channel` button, accompanied by a real-time header counter badge (`X/16`) and smooth button disabling once the 16-channel ceiling is reached.
- **Fast Deletion & Inline Renaming**:
  - Individual trash can icon on each channel row for instant deletion (with safeguard requiring at least 1 active channel).
  - Hover pencil icon for inline editing of channel names, automatically syncing with the corresponding Mixer insert strip in real time.
- **16-Step Grid**: Classic 4/4 rhythm grouping with alternating beat block colors (`fl-step-off-a` and `fl-step-off-b`).
- **Tactile Rotary Knobs (`<RotaryKnob />`)**: Smooth vertical dragging with pointer capture, fine sensitivity, bipolar support (Pan), and double-click to reset.
- **Instrument Selector & General MIDI SoundFonts**: Instantly switch any channel between analog drum synthesizers and real sampled/acoustic instruments:
  - 🎹 **Acoustic Grand Piano**
  - 🎹 **Rhodes Electric Piano**
  - 🎸 **Electric Bass (Finger)**
  - 🎻 **String Ensemble / Violins**
  - 🎸 **Nylon Acoustic Guitar**
  - 🎺 **80s Synth Brass**
  - 🪈 **Orchestral Flute**
- **Custom SoundFont 2 (`.sf2`) Support**: Drag and drop any `.sf2` instrument file onto any channel row for instantaneous PCM sample decoding and pitch-tracked playback.
- **Audio Sample Drag & Drop**: Drag `.wav` or `.mp3` audio files directly from your desktop onto any channel row to decode and play them instantly.
- **Swing / Groove Control**: Global shuffle timing slider (0% to 100%) dynamically adjusting odd 16th-note timings.

### 2. 🎚️ Dedicated Mixer & DSP Effects Rack (16 Inserts + Master)
- **16-Track Independent Mixer Console**:
  - Dedicated **Master (MST)** strip with safety Master Limiter (-0.5 dB).
  - **16 Independent Insert Strips** pre-connected in the Web Audio graph with zero latency and virtually zero memory footprint (~150 KB).
- **View Filter `[All (16) | Active (X)]`**: Toggle between viewing the full 16-strip mixing desk or filtering down to only tracks currently active in the project.
- **3-Band Equalizer**: Individual `HI` (highshelf 4500 Hz), `MID` (peaking 1200 Hz), and `LOW` (lowshelf 250 Hz) filters (-12 dB to +12 dB) per track.
- **Auxiliary FX Sends**: Dedicated send knobs for **Reverb** (convolver impulse), **Stereo Delay** (feedback delay), and **Fast Distortion** (analog wave shaper with sigmoid curve).
- **Decibel-Calibrated Vertical Faders**: High-precision faders with numerical dB readouts (`0.0 dB`, `-6.0 dB`, `-inf`) and animated stereo VU peak meters.
- **60 FPS Real-Time Canvas Visualizer**: Toggle instantly between **Spectrum Analyzer (48-band FFT)** and **Oscilloscope (Stereo Waveform)**.

### 3. 🎹 Melodic Piano Roll & Velocity Graph
- **2-Octave Chromatic Grid (C3 to B4, 24 Semitones)**: Click to place or delete melodic notes with dedicated polyphonic synthesis or SoundFont instruments.
- **Interactive Vertical Keyboard**: Clickable black and white keys with audio preview and root key indicators (*Root C*).
- **Note Duration Selector**: Support for 1/16, 1/8, or 1/4 bar note lengths.
- **Per-Step Velocity Graph Editor**: Bottom drawer with 16 vertical dynamic bars to tweak velocity per step (5% to 100%).

### 4. 🎵 Playlist Arranger & Offline WAV Export
- **16-Bar Multi-Track Timeline**: Adaptive horizontal tracks synchronized with active channels (1 to 16 tracks), showing channel color dot, custom name, and track index (`Trk X`).
- **Pattern Manager & Inline Renaming**: Switch patterns easily, create new ones with `+`, or click/double-click the pattern name in the toolbar or playlist to rename it on the fly with real-time sync across the timeline.
- **Dual Playback Modes (`[PAT]` / `[SONG]`)**: Loop the active pattern or play the entire song arrangement with a timeline playhead ruler.
- **Demo Song Preset**: 1-click button to load a full demonstration track with Intro, Drop, and Outro sections.
- **Master WAV Export**: High-speed offline rendering via `OfflineAudioContext` for 16-bit stereo PCM WAV (44.1 kHz) instant downloads, fully compatible with dynamic channels and SoundFonts.

### 5. 🌐 Multilingual Support (i18n)
- **Brazilian Portuguese (`pt-BR`) by default**: Full Portuguese musical terminology.
- **English (`en`) selectable**: Instant toggle button **`[🌐 PT | EN]`** on the top toolbar translating the entire interface in real-time.
- **Automatic Persistence**: Language preference saved to `localStorage` (`musicx_lang`).

---

## 🔬 DSP Synthesis Architecture

All native sounds are generated mathematically in real time:

| Instrument | Channel | Synthesis Method | Technical Details |
| :--- | :--- | :--- | :--- |
| **Kick 808** | In 1 (or dynamic) | Sine Wave + Exponential Pitch Modulation | Frequency drop from 150 Hz $\to$ 32 Hz in 120ms with 350ms exponential decay. |
| **Snare Hard** | In 2 (or dynamic) | Triangle Wave + Filtered White Noise | Triangle body (180 Hz $\to$ 45 Hz) layered with high-pass filtered noise burst (1000 Hz). |
| **HiHat Clsd** | In 3 (or dynamic) | 6 Square Oscillators + Bandpass/Highpass Filters | Classic 808 metallic ratios routed through band-pass (10 kHz) and high-pass (7.5 kHz). |
| **Clap 909** | In 4 (or dynamic) | White Noise Micro-Bursts + Bandpass Filter | 3 consecutive bursts spaced by ~11ms followed by a decay tail centered at 1200 Hz ($Q=2$). |
| **Melodic Synth**| Dynamic | Sawtooth Wave + Polyphonic ADSR Envelope | Subtractive synthesis tuned via standard MIDI pitch formula ($f = 440 \times 2^{(midi-69)/12}$). |
| **SoundFonts GM** | Dynamic (1-16) | High-Definition Sampled SoundFont Banks (MusyngKite) | Multi-sampled acoustic stereo audio with velocity dynamics and authentic decay. |
| **SoundFont 2 (.sf2)** | Dynamic (1-16) | RIFF/SFBK 16-bit PCM Sample Decoder | Zero-dependency chunk parser with dynamic playback rate pitch-shifting. |
| **Custom Audio** | Dynamic (1-16) | Native `AudioBufferSourceNode` | Decoded on the fly via `AudioContext.decodeAudioData()`. |

---

## ⌨️ Global Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Toggle Play / Pause |
| <kbd>Enter</kbd> | Stop playback and reset playhead to start |
| <kbd>L</kbd> | Toggle between `PAT` (Pattern) and `SONG` (Playlist) modes |
| <kbd>1</kbd> | Open **Channel Rack** |
| <kbd>2</kbd> | Open **Piano Roll** |
| <kbd>3</kbd> | Open **Mixer** |
| <kbd>4</kbd> | Open **Playlist Arranger** |

---

## 📁 Project Structure

```
musicx-studio/
├── .devcontainer/
│   └── devcontainer.json      # GitHub Codespaces config (Public port 3000 forwarding)
├── src/
│   ├── audio/
│   │   ├── AudioEngine.ts     # Decoupled Web Audio singleton, DSP synths, 16-channel routing & scheduler
│   │   ├── SoundFontManager.ts# Acoustic SoundFonts manager and custom .sf2 parser
│   │   └── WavExporter.ts     # Offline 16-bit PCM stereo WAV exporter (supports 1-16 channels)
│   ├── components/
│   │   ├── common/            # RotaryKnob dial, LcdDisplay
│   │   ├── mixer/             # Mixer rack (16 inserts + master), MixerStrip, AudioVisualizer Canvas
│   │   ├── pianoroll/         # PianoRoll chromatic matrix, VelocityGraph
│   │   ├── playlist/          # PlaylistArranger dynamic multi-track timeline
│   │   ├── rack/              # ChannelRack (1 to 16 channels), ChannelRow (Drag & Drop, Rename, Delete)
│   │   └── toolbar/           # Compact responsive TopToolbar (Transport, LCD BPM, Language Switcher)
│   ├── i18n/
│   │   └── translations.ts    # Complete pt-BR and en dictionaries
│   ├── store/
│   │   ├── useLanguageStore.ts# Zustand store with localStorage persistence
│   │   ├── useMixerStore.ts   # Zustand store for 16 strips, faders, EQs and FX sends
│   │   └── useProjectStore.ts # Zustand store for dynamic channels (1-16), BPM, patterns, clips
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces and domain models
│   ├── App.tsx                # Main application layout, window manager & bottom status bar
│   ├── index.css              # Tailwind CSS directives & FL Studio dark scrollbars
│   ├── main.tsx               # React 18 DOM mount entry point
│   └── vite-env.d.ts          # Vite environment types
├── legacy/                    # Intact backup of the original version (Vanilla HTML/CSS/JS)
├── vite.config.ts             # Vite 6 configuration (host: true, allowedHosts: true)
├── tailwind.config.js         # FL Studio dark theme palette and tokens
├── tsconfig.json              # TypeScript compiler configuration
├── start.bat                  # 1-click quick launcher for Windows
├── package.json               # Dependencies and build scripts
├── README.md                  # Documentation in Portuguese
└── README.en.md               # Documentation in English
```

---

## 🚀 How to Run Locally

### Option 1: Automatic 1-Click Launcher (Windows)
Double-click [`start.bat`](start.bat) in the project root! It starts Vite and opens `http://localhost:3000` automatically.

### Option 2: Command Line (Node.js / NPM)
Ensure Node.js (v18+) is installed and run:
```bash
npm run dev
```

### Build Production Bundle:
```bash
npm run build
```

### Run Legacy Version (Vanilla JS):
```bash
npm run legacy
```

---

## ☁️ Running on GitHub Codespaces

Pre-configured in `.devcontainer/devcontainer.json`:
1. On GitHub, click **Code** > **Codespaces** > **Create codespace on main**.
2. In the Codespaces terminal, run:
   ```bash
   npm run dev
   ```
3. Open **port 3000** (`https://<codespace-name>-3000.app.github.dev/`).
4. *Tip*: If encountering authentication errors on external tabs, open the **PORTS** tab in VS Code, right-click port 3000, and set **Port Visibility** to **Public**.

---

## 🛠️ Tech Stack

- **React 18**: Modular components and reactive state.
- **Tailwind CSS 3.4**: Industrial dark design system faithful to FL Studio.
- **TypeScript 5.7**: Strict type definitions for notes, channels, patterns, and audio nodes.
- **Zustand 5**: Ultra-fast atomic state store free of unnecessary re-renders.
- **Web Audio API**: Real-time digital signal processing (DSP), biquad filters, convolvers, gain nodes, and FFT analyzers.
- **SoundFonts & SF2**: Hybrid engine using soundfont-player (MusyngKite) and soundfont2 sample decoder.
- **Vite 6**: Instant HMR and lightning-fast build toolchain.
- **Lucide React**: Crisp iconography for music workstation UI.

---

## 📄 License
Distributed under the [MIT](https://opensource.org/licenses/MIT) License.
