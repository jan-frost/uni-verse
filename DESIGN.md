# Asciicraft - Design Document

This document outlines the design and architecture for Asciicraft, a 2D side-scrolling sandbox game inspired by Minecraft and Dwarf Fortress, rendered with Unicode characters.

### 1. Core Concept

- **Genre:** 2D side-scrolling sandbox/survival.
- **Aesthetic:** Text-based graphics using Unicode characters, running in a web browser.
- **Core Loop:** Explore a procedurally generated world, dig to find resources, and build structures.

### 2. Technology Stack

- **Language:** JavaScript (ESM)
- **Core Library:** `rot-js` (primarily for noise generation and display helpers).
- **Runtime:**
    - **Client:** Modern Web Browser (rendering via HTML `<canvas>`).
    - **Server:** Node.js (for the multiplayer phase).
- **Communication:** WebSockets (for the multiplayer phase).
- **Testing:** Vitest (test runner), following a TDD-style workflow.
- **Package Management:** npm.

### 3. Architecture

- **Target Architecture:** A **Client-Server model** to support multiplayer and a persistent, "infinite" world.
- **Authoritative Server:** The Node.js server will be the single source of truth for all game state, including world data, player positions, and game logic.
- **Thin Client:** The browser client will be primarily responsible for rendering state received from the server and sending user input intentions.
- **Code Style:** **Functional approach** ("Functional Core, Imperative Shell").
    - Core game logic will be implemented as pure functions that operate on immutable data structures.
    - Side effects (rendering, networking) will be isolated at the application's boundaries.
- **Data-Driven Design:** Game elements like tiles and biomes will be defined as data objects, not hardcoded in logic.

### 4. World Generation

- **Infinite Map:** The world will be generated on-demand in fixed-size "chunks" to simulate an infinite space.
- **Algorithm:** A multi-pass, layered noise approach inspired by Minecraft.
    - **Pass 1 (Elevation):** 2D Perlin/Simplex noise to define the surface height.
    - **Pass 2 (Biomes):** A second, lower-frequency 2D noise map to determine the biome (e.g., `Plains`, `Desert`, `Ocean`).
    - **Pass 3 (Caves):** 3D Simplex noise to carve out caves from solid stone areas.
    - **Pass 4 (Structures):** A post-processing step to place structures like trees on valid surface tiles.

### 5. Gameplay & Visuals

- **Rendering:** The game will be rendered as a grid of Unicode characters on an HTML `<canvas>`.
- **Visibility:** A "Touching Air" rule will be used. Only tiles that are `air` or are adjacent to an `air` tile will be visible, creating a natural fog-of-war that is cleared by digging.
- **Player View:** The player character will remain centered in the viewport, with the world scrolling around them.
- **Movement:** A simplified control scheme featuring an "auto-jump" mechanic to fluidly move over 1-block-high obstacles.
- **Physics:** A simple gravity system will be implemented.

### 6. Testing Philosophy

- **Methodology:** "Testing Without Mocks" (also known as "Nullables, not Mocks").
- **Internal Logic:** All pure functions (world-gen, game state updates) will be tested directly by providing input and asserting on the output. No mocks or fakes will be used.
- **External Boundaries:** External dependencies (like the `rot-js` renderer) will be wrapped in an **Adapter**. Tests will use a "Fake" implementation of the adapter that records calls, allowing us to verify behavior without producing side effects.
- **TDD-style Workflow:** We will start with a failing test and then write the code to make it pass.

### 7. Phased Development Plan

The project will be built in two main phases to manage complexity.

- **Phase 1: Single-Player Foundation.**
    - **Goal:** Rapidly develop a playable single-player prototype to nail down the core mechanics and game feel.
    - **Implementation:** All logic (generation, rendering, movement) will be implemented client-side in the browser, but structured in a modular way that anticipates the server split.

- **Phase 2: Multiplayer Refactor.**
    - **Goal:** Introduce multiplayer functionality.
    - **Implementation:** Create the Node.js server, move all authoritative logic to it, and implement WebSocket communication. The client will be refactored into a thin rendering terminal.
