# 🕹️ SCUMM-Style Point & Click Adventure Engine

![Status](https://img.shields.io/badge/status-active-success)
![Version](https://img.shields.io/badge/version-0.6-blue)
![JavaScript](https://img.shields.io/badge/javascript-ES2020-yellow)
![License](https://img.shields.io/badge/license-educational-informational)
![Architecture](https://img.shields.io/badge/architecture-modular-important)
![Frameworks](https://img.shields.io/badge/frameworks-none-lightgrey)

---

## 🚀 Overview

SCUMM-Style Point & Click Adventure Engine is a lightweight, modular and extensible engine for building 2D narrative adventure games inspired by classic LucasArts SCUMM titles.

It is built entirely with vanilla JavaScript, HTML and CSS, following a data-driven architecture where scenes, objects and narrative logic are defined declaratively using JSON. No frameworks, no build tools and no external dependencies are required.

The project is designed to be both a production-ready foundation for adventure games and a professional educational reference for frontend architecture, state management and narrative systems.

---

## ✨ Core Features

- Scene system driven by declarative JSON
- Hotspot-based interaction
- Verb system (look, use, talk, take)
- Inventory management (logic and UI)
- Conditional narrative logic using flags and state
- Dialog system
- Debug panel for inspecting internal game state
- Modular and scalable architecture
- Save / Load system ready (planned)
- No frameworks or dependencies

---

## 🧠 Design Philosophy

- Data over logic: narrative lives in JSON, not hardcoded logic
- Clear separation of concerns between engine, UI and game data
- Scalability first: features grow without refactoring
- Readability over cleverness: code is meant to be understood

If you can design a scene, you can build a game.

---

## 🧱 Project Structure

.
├── index.html              # Application entry point  
├── styles.css              # Global styles  
│  
├── engine/  
│   ├── engine.js           # Core game engine  
│   ├── actions.js          # Action execution layer  
│   └── api.js              # Public game API  
│  
├── ui/  
│   ├── renderer.js         # Scene rendering and UI logic  
│   ├── ui_dialog.js        # Dialog system  
│   └── ui_inventory.js    # Inventory UI  
│  
├── game/  
│   ├── scenes.js           # Scene definitions (JSON)  
│   ├── items.js            # Items and inventory definitions  
│   └── flags.js            # Game state and flags  

---

## 🧾 Declarative Scene Definition

Scenes are defined using a simple narrative mini-language based on JSON.

Example:

{
  id: "hall",
  title: "Hall",
  subtitle: "Too quiet to be safe.",
  objects: [
    {
      id: "doormat",
      name: "Doormat",
      hotspot: { x: 90, y: 260, w: 210, h: 90 },
      verbs: {
        look: { type: "say", text: "A suspicious doormat." },
        take: { type: "add_item", item: "doormat" }
      }
    }
  ]
}

This approach allows clear separation between narrative and engine logic, fast iteration on content and easy authoring by non-programmers.

---

## 🧪 Debug System

The engine includes a debug panel that allows inspection of the current scene, active flags, inventory contents and internal state changes. This is especially useful for testing, teaching and debugging narrative flows.

---

## ▶️ Running the Project

Requirements:
- Modern browser with ES Modules support
- Local web server

Start a local server using:

npx serve

or

python -m http.server

Then open:

http://localhost:3000

Opening the file directly using file:// will not work due to ES Modules restrictions.

---

## 🛠️ Technology Stack

- HTML5
- CSS3
- JavaScript (ES2020+)
- ES Modules
- No frameworks
- No bundlers
- No dependencies

---

## 🎯 Use Cases

- Educational projects (DAW / DAM / Web Development)
- Narrative adventure games
- Interactive fiction
- Prototyping gameplay mechanics
- Teaching clean frontend architecture and state machines

---

## 🧭 Roadmap

- Save and load game state
- Compound conditions (all / any / not)
- Puzzle system
- Visual scene editor
- Audio support
- Internationalization (i18n)

---

## 📜 License

Released for educational and learning purposes. Free to study, modify and extend. Commercial use should reference the original project.

---

## 👤 Author

Created as a professional educational engine focused on clean frontend architecture, narrative systems and maintainable game design.

Classic adventures were not magic. They were good architecture.
