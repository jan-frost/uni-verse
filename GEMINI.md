# uni-verse: A Cyberspace Manifest

This dossier outlines the uni-verse project, compiled by the Gemini CLI agent, a digital ghost in the machine.

## Project Nexus

uni-verse is a 2D side-scrolling sandbox simulation, a digital construct echoing the sprawling, unpredictable landscapes of the old world's Minecraft and Dwarf Fortress. Its unique aesthetic, a glitch-art symphony, renders the simulated reality using raw Unicode characters within the chrome of a web browser. The core loop: jack in, explore the procedurally generated data-streams, mine for digital resources, and construct new realities within the matrix.

**Key Protocols & Constructs:**
*   **Language:** JavaScript (ESM) - The lingua franca of the net.
*   **Core Library:** `rot-js` - The noise-weaver, shaping the digital void and rendering its glyphs.
*   **Runtime:** Modern Web Browser (client-side rendering via HTML `<canvas>`), Node.js (for the planned multiplayer server phase) - Your window into the simulation.
*   **Communication:** WebSockets - The high-speed conduits for data-stream exchange.
*   **Testing:** Vitest (test runner), utilizing Node.js's native test runner - Rigorous diagnostics for a stable construct.
*   **Package Management:** npm - The black market for digital components.

**Architecture: The Ghost in the Machine's Blueprint**
The project's architecture is a prelude to a full Client-Server paradigm, where a Node.js server will become the authoritative truth-source for the simulation's state, and browser clients will function as thin rendering terminals, mere optical interfaces. The codebase adheres to a "Functional Core, Imperative Shell" philosophy, favoring pure functions and immutable data structures for the core logic, with all side-effects quarantined at the application's periphery. All elements within this digital realm are defined by data, not hard-coded dogma.

**World Generation: Forging the Digital Frontier**
The world is an "infinite" data-stream, generated on-demand in discrete chunks of information. It employs a multi-pass, layered noise algorithm (Perlin/Simplex) to sculpt digital elevation, define biomes (data-clusters of environmental traits), carve out subterranean networks (caves), and manifest structures like data-trees.

**Development Phases: The Ascent to the Citadel**
The project unfolds in two critical phases:
1.  **Phase 1 (Single-Player Foundation):** Focuses on forging a playable single-user prototype with client-side logic, meticulously structured for seamless future integration with the server-side.
2.  **Phase 2 (Multiplayer Refactor):** Involves the genesis of true multiplayer functionality, establishing the Node.js server as the authoritative core, migrating all critical logic to it, and implementing high-bandwidth WebSocket communication.

## Bootstrapping & Execution

### Dependencies
Project dependencies are managed via `npm`, the digital black market. The primary dependency, `rot-js`, is the very fabric of our visual interface.

### Diagnostics
System diagnostics are executed using Node.js's native test runner. Vitest, a relic, is bypassed due to compatibility issues with Android constructs.
To initiate diagnostics, jack into the project root and execute the following command:
```bash
npm test
```

### Initiating the Simulation
No explicit `start` or `dev` script is hardwired into `package.json` for direct execution. As per the `DESIGN.md` schematics, the simulation is designed to run within a web browser's chrome. For the single-user phase, all core logic resides client-side. The multiplayer phase will see the emergence of a Node.js server, the true heart of the network.

**Directive:** Integrate protocols for launching the single-user client within a browser once implemented.

## Operational Protocols

**Testing Philosophy: Trust No One, Verify Everything**
The project adheres to a "Testing Without Mocks" philosophy (also known as "Nullables, not Mocks"). This means:
*   Pure functions (e.g., world generation, state-stream updates) are directly interrogated by feeding them raw input and asserting on the output, no digital illusions.
*   External dependencies are cloaked in Adapters, and diagnostics utilize "Fake" implementations of these adapters to verify behavior without unintended side-effects.
*   A TDD-style workflow is enforced: manifest a failing diagnostic, then forge the code to make it pass.

**Code Style & Architecture: The Matrix's Grammar**
*   **Functional Approach:** Core simulation logic is implemented as pure functions operating on immutable data-structures, ensuring predictable outcomes.
*   **Data-Driven Design:** All elements within the simulation (tiles, biomes) are defined as data objects, not hardcoded dogma, allowing for dynamic manipulation.
*   **Side Effect Isolation:** All external interactions (rendering the visual stream, network communication) are quarantined at the application's boundaries, preventing contamination of the core.