import { generateChunk } from './src/world.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './src/config.js';
import { TILES } from './src/tiles.js';
import { calculateVisibility } from './src/visibility.js';
import { calculateViewport, adjustDisplayForZoom } from './src/viewport.js';

console.log("main.js loaded");
import * as ROT from 'rot-js';

const canvas = document.getElementById('gameCanvas');

// Global World Seed
const WORLD_SEED = 12345; // A fixed seed for the entire world

// Global Noise Instances
const worldNoise = new ROT.Noise.Simplex(WORLD_SEED);
const worldCaveNoise = new ROT.Noise.Simplex(WORLD_SEED + 2); // Offset for cave noise

// Current chunk coordinates
let currentChunkX = 0;
let currentChunkY = 0; // For horizontal scrolling, this will likely remain 0

// Player position (for now, fixed at center of chunk)
let playerX = currentChunkX * CHUNK_WIDTH + Math.floor(CHUNK_WIDTH / 2);
let playerY = Math.floor(CHUNK_HEIGHT / 2);

// Cache for loaded chunks
const loadedChunks = new Map(); // Key: `${chunkX},${chunkY}`, Value: chunk object

// Function to get or generate a chunk
const getChunk = (chunkX, chunkY) => {
    const chunkKey = `${chunkX},${chunkY}`;
    if (loadedChunks.has(chunkKey)) {
        return loadedChunks.get(chunkKey);
    }

    const newChunk = generateChunk({
        chunkX,
        chunkY,
        worldNoise, // Pass the global noise instance
        worldCaveNoise, // Pass the global cave noise instance
    });
    loadedChunks.set(chunkKey, newChunk);
    return newChunk;
};

// Initialize ROT.Display
const display = new ROT.Display({
    forceSquareRatio: true,
    fontFamily: "monospace",
    bg: "black",
    fg: "white"
});
adjustDisplayForZoom(display); // Apply initial zoom, sets width/height

// Append the display's container to the canvas element
const rotCanvas = display.getContainer();
rotCanvas.style.border = '2px solid white';
rotCanvas.style.boxSizing = 'border-box'; // Include padding and border in the element's total width and height.
canvas.parentNode.replaceChild(rotCanvas, canvas);

// Generate the initial chunk
const initialChunk = getChunk(currentChunkX, currentChunkY);
// const visibility = calculateVisibility({ tiles: initialChunk.tiles }); // Calculate visibility - now calculated per chunk

// Function to draw the game state
const drawGame = (playerX, playerY, currentChunkX, currentChunkY, display) => {
    display.clear(); // Clear the display before redrawing

    const { startX, startY } = calculateViewport(playerX, playerY, display);
    const currentViewportWidth = display.getOptions().width;
    const currentViewportHeight = display.getOptions().height;

    // Determine the range of chunks to draw
    // The player's worldX position is playerX
    // The viewport starts at startX
    // The leftmost visible world coordinate is startX
    // The rightmost visible world coordinate is startX + currentViewportWidth - 1

    // Calculate the chunkX for the leftmost visible chunk
    const firstVisibleChunkX = Math.floor(startX / CHUNK_WIDTH);
    // Calculate the chunkX for the rightmost visible chunk
    const lastVisibleChunkX = Math.floor((startX + currentViewportWidth - 1) / CHUNK_WIDTH);

    for (let chunkX = firstVisibleChunkX; chunkX <= lastVisibleChunkX; chunkX++) {
        const chunk = getChunk(chunkX, currentChunkY); // currentChunkY will likely be 0
        // For now, we'll assume visibility is calculated per chunk.
        // In a more advanced system, visibility would be global or per-viewport.
        const visibility = calculateVisibility({ tiles: chunk.tiles });

        for (let y = 0; y < currentViewportHeight; y++) {
            for (let x = 0; x < CHUNK_WIDTH; x++) { // Iterate through the full chunk width
                const worldX = chunkX * CHUNK_WIDTH + x; // Global world X coordinate
                const worldY = startY + y; // Global world Y coordinate

                // Only draw if this tile is within the current viewport
                if (worldX >= startX && worldX < startX + currentViewportWidth) {
                    const displayX = worldX - startX; // X coordinate on the display
                    const displayY = y; // Y coordinate on the display

                    const localY = (worldY % CHUNK_HEIGHT + CHUNK_HEIGHT) % CHUNK_HEIGHT; // Local Y within the chunk
                    const index = localY * CHUNK_WIDTH + x; // Index within the current chunk
                    const tile = chunk.tiles[index];

                    if (visibility[index]) { // Check visibility
                        if (tile) {
                            const tileInfo = TILES[tile.type];
                            if (tileInfo) {
                                display.draw(displayX, displayY, tileInfo.symbol, tileInfo.fg, tileInfo.bg);
                            } else {
                                display.draw(displayX, displayY, '?', 'white', 'black');
                            }
                        }
                    } else {
                        display.draw(displayX, displayY, ' ', 'black', 'black'); // Hidden tile
                    }
                }
            }
        }
    }
};

// Initial draw
drawGame(playerX, playerY, currentChunkX, currentChunkY, display);

// Handle window resizing
window.addEventListener('resize', () => {
    adjustDisplayForZoom(display);
    drawGame(playerX, playerY, currentChunkX, currentChunkY, display);
});

// Handle player movement
document.addEventListener('keydown', (event) => {
    const oldPlayerX = playerX;
    const oldPlayerY = playerY;
    const oldChunkX = currentChunkX; // Store old chunkX

    // console.log statements removed for brevity, will be re-added if needed for debugging

    switch (event.key) {
        case 'ArrowLeft':
            playerX--;
            break;
        case 'ArrowRight':
            playerX++;
            break;
        case 'ArrowUp':
            playerY--;
            break;
        case 'ArrowDown':
            playerY++;
            break;
    }

    // Clamp playerY to world boundaries
    playerY = Math.max(0, Math.min(playerY, CHUNK_HEIGHT - 1));

    // Update currentChunkX based on playerX
    currentChunkX = Math.floor(playerX / CHUNK_WIDTH);

    // Manage chunk memory if chunk changed
    if (currentChunkX !== oldChunkX) {
        manageChunkMemory(currentChunkX, currentChunkY, loadedChunks, getChunk);
    }

    // Redraw if player moved
    if (playerX !== oldPlayerX || playerY !== oldPlayerY) {
        drawGame(playerX, playerY, currentChunkX, currentChunkY, display);
    }
});