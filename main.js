import { createInitialState } from './src/game-state.js';
import * as ROT from 'rot-js'; // Import the entire 'rot-js' library
import { BrowserStorage } from './src/browser-storage.js';
import { generateChunk } from './src/world.js';
import { TILES } from './src/tiles.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './src/config.js';
import { calculateViewport, adjustDisplayForZoom } from './src/viewport.js';
import { calculateVisibility } from './src/visibility.js';
import { movePlayer } from './src/player-movement.js';
import { toggleInventory, updateInventory } from './src/inventory.js';

const urlParams = new URLSearchParams(window.location.search);
const isDebugMode = urlParams.has('debug');

function generatePlayerName() {
    const adjectives = ['Cyber', 'Giga', 'Nano', 'Data', 'Net', 'Zero', 'Omega'];
    const nouns = ['Runner', 'Jacker', 'Glitch', 'Node', 'Byte', 'Ware', 'Core'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${adjective}${noun}${number}`;
}

const playerName = urlParams.get('playerName') || generatePlayerName();

// Initialize ROT.Display
const display = new ROT.Display({
    forceSquareRatio: true,
    fontFamily: "monospace",
    bg: "black",
    fg: "white"
});
adjustDisplayForZoom(display); // Apply initial zoom, sets width/height

// Append the display's container to the canvas element
const canvas = document.getElementById('gameCanvas');
const rotCanvas = display.getContainer();
rotCanvas.style.border = '2px solid white';
rotCanvas.style.boxSizing = 'border-box'; // Include padding and border in the element's total width and height.
canvas.parentNode.replaceChild(rotCanvas, canvas);

let debugOutputElement;
if (isDebugMode) {
    debugOutputElement = document.createElement('div');
    debugOutputElement.style.position = 'absolute';
    debugOutputElement.style.top = '10px';
    debugOutputElement.style.left = '10px';
    debugOutputElement.style.color = 'white';
    debugOutputElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
    debugOutputElement.style.padding = '5px';
    debugOutputElement.style.fontFamily = 'monospace';
    debugOutputElement.style.zIndex = '1000';
    rotCanvas.parentNode.appendChild(debugOutputElement);
}

async function main() {
    const storage = new BrowserStorage(urlParams.get('seed'));
    const inventory = await storage.getInventory(playerName) || {};
    let gameState = createInitialState(urlParams, playerName, inventory);

    storage.events.on("tile-changed", async (data) => {
        console.log("tile-changed event received", data);
        const { chunkX, x, y, tile } = data;
        const chunkKey = `${chunkX},0`;
        const chunk = gameState.chunks.get(chunkKey);
        if (chunk) {
            const index = y * CHUNK_WIDTH + x;
            if (index >= 0 && index < chunk.tiles.length) {
                chunk.tiles[index] = tile;
            }
            const newChunks = new Map(gameState.chunks).set(chunkKey, chunk);
            gameState = { ...gameState, chunks: newChunks };
            await drawGame(gameState, display);
        }
    });

    console.log("main.js loaded");

    // Player position (for now, fixed at center of chunk)
    gameState.player.x = (gameState.currentChunk.x * CHUNK_WIDTH) + Math.floor(display.getOptions().width / 2);
    gameState.player.y = Math.floor(CHUNK_HEIGHT / 2);

    // Initial draw
    await drawGame(gameState, display);

    // Handle window resizing
    window.addEventListener('resize', () => {
        adjustDisplayForZoom(display);
        drawGame(gameState, display);
    });

    // Handle player movement
    document.addEventListener('keydown', (event) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            console.log(`Keydown event triggered: ${event.key}`);
            (async () => {
                const newGameState = await movePlayer(gameState, event.key, (state, x, y) => getTile(state, x, y), storage);
                if (newGameState !== gameState) { // Only redraw if state actually changed
                    gameState = newGameState;
                    await drawGame(gameState, display);
                }
            })();
        }
    });

    // Touch controls for mobile devices
    let touchInterval = null;
    let currentTouchX = 0;
    let currentTouchY = 0;

    const handleTouch = (event) => {
        event.preventDefault(); // Prevent scrolling

        if (event.type === 'touchend') {
            clearInterval(touchInterval);
            touchInterval = null;
            return;
        }

        const touch = event.touches[0];
        const rect = rotCanvas.getBoundingClientRect();
        currentTouchX = touch.clientX - rect.left;
        currentTouchY = touch.clientY - rect.top;

        if (!touchInterval) {
            touchInterval = setInterval(move, 100);
            move(); // Execute immediately on touchstart
        }
    };

    const move = async () => {
        const { player } = gameState;
        const { startX, startY } = calculateViewport(player.x, player.y, display);

        // Calculate player's screen position
        const playerScreenX = player.x - startX;
        const playerScreenY = player.y - startY;

        // Calculate touch offset from player's screen position
        const offsetX = currentTouchX - playerScreenX * display.getOptions().fontSize;
        const offsetY = currentTouchY - playerScreenY * display.getOptions().fontSize;

        // Define dead zone (e.g., 2 tiles radius)
        const deadZone = 2 * display.getOptions().fontSize;

        let eventKey = '';

        if (Math.abs(offsetX) > deadZone || Math.abs(offsetY) > deadZone) {
            if (Math.abs(offsetX) > Math.abs(offsetY)) {
                // Horizontal movement is dominant
                eventKey = offsetX > 0 ? 'ArrowRight' : 'ArrowLeft';
            } else {
                // Vertical movement is dominant
                eventKey = offsetY > 0 ? 'ArrowDown' : 'ArrowUp';
            }
        }

        if (eventKey) {
            const newGameState = await movePlayer(gameState, eventKey, (state, x, y) => getTile(state, x, y), storage);
            if (newGameState !== gameState) { // Only redraw if state actually changed
                gameState = newGameState;
                await drawGame(gameState, display);
            }
        }
    };

    rotCanvas.addEventListener('touchstart', handleTouch, { passive: false });
    rotCanvas.addEventListener('touchmove', handleTouch, { passive: false });
    rotCanvas.addEventListener('touchend', handleTouch, { passive: false });

    rotCanvas.addEventListener('click', (event) => {
        const { player } = gameState;
        const { startX, startY } = calculateViewport(player.x, player.y, display);

        const clickX = event.clientX;
        const clickY = event.clientY;

        const playerScreenX = (player.x - startX) * display.getOptions().fontSize;
        const playerScreenY = (player.y - startY) * display.getOptions().fontSize;

        const deadZone = 2 * display.getOptions().fontSize;

        if (Math.abs(clickX - playerScreenX) < deadZone && Math.abs(clickY - playerScreenY) < deadZone) {
            toggleInventory(gameState);
        }
    });
}

main();