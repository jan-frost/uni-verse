import { generateChunk, manageChunkMemory } from './src/world.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './src/config.js';
import { TILES } from './src/tiles.js';
import { calculateVisibility } from './src/visibility.js';
import { calculateViewport, adjustDisplayForZoom } from './src/viewport.js';

console.log("main.js loaded");
import * as ROT from 'rot-js';

const canvas = document.getElementById('gameCanvas');

// Parse URL query parameters
const urlParams = new URLSearchParams(window.location.search);

// Global World Seed
let WORLD_SEED = urlParams.has('seed') ? parseInt(urlParams.get('seed')) : Date.now(); // Default to a random seed if no seed parameter is provided

// Ensure WORLD_SEED is within a safe integer range for ROT.Noise.Simplex and never 0
WORLD_SEED = (WORLD_SEED % 65536) + 1; // Use modulo to keep it within range and ensure it's at least 1

console.log(`Initial WORLD_SEED (before clamp): ${WORLD_SEED}`);

// Set ROT.RNG seed globally
ROT.RNG.setSeed(WORLD_SEED);

// Global Noise Instances
const worldNoise = new ROT.Noise.Simplex(WORLD_SEED);
const worldCaveNoise = new ROT.Noise.Simplex(WORLD_SEED + 2); // Offset for cave noise

console.log(`Final WORLD_SEED (after clamp and before noise instantiation): ${WORLD_SEED}`);

// Current chunk coordinates
let currentChunkX = parseInt(urlParams.get('chunkX')) || 0; // Default to 0
let currentChunkY = 0; // Fixed to 0 for horizontal scrolling

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

// Player position (for now, fixed at center of chunk)
let playerX = (currentChunkX * CHUNK_WIDTH) + Math.floor(display.getOptions().width / 2);
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

// Generate the initial chunk
const initialChunk = getChunk(currentChunkX, currentChunkY);
// const visibility = calculateVisibility({ tiles: initialChunk.tiles }); // Calculate visibility - now calculated per chunk

// Function to draw the game state
const drawGame = (playerX, playerY, currentChunkX, currentChunkY, display) => {
    display.clear(); // Clear the display before redrawing

    const { startX, startY } = calculateViewport(playerX, playerY, display);
    const currentViewportWidth = display.getOptions().width;
    const currentViewportHeight = display.getOptions().height;

    // Calculate center of viewport in world coordinates
    const centerViewportWorldX = startX + Math.floor(currentViewportWidth / 2);
    const centerViewportWorldY = startY + Math.floor(currentViewportHeight / 2);

    // Determine chunk coordinates of center tile
    const centerChunkX = Math.floor(centerViewportWorldX / CHUNK_WIDTH);
    const centerChunkY = Math.floor(centerViewportWorldY / CHUNK_HEIGHT);

    // Get the chunk containing the center tile
    const centerChunk = getChunk(centerChunkX, centerChunkY);

    // Calculate local coordinates within the center chunk
    const centerLocalX = centerViewportWorldX % CHUNK_WIDTH;
    const centerLocalY = (centerViewportWorldY % CHUNK_HEIGHT + CHUNK_HEIGHT) % CHUNK_HEIGHT;

    // Get the tile at the center of the viewport
    const centerTileIndex = centerLocalY * CHUNK_WIDTH + centerLocalX;
    const centerTile = centerChunk.tiles[centerTileIndex];

    console.log(`Center viewport tile: WorldX=${centerViewportWorldX}, WorldY=${centerViewportWorldY}, Type=${centerTile ? centerTile.type : 'N/A'}`);

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

    // Draw the player
    const playerTileInfo = TILES.PLAYER;
    if (playerTileInfo) {
        const playerViewportX = playerX - startX;
        const playerViewportY = playerY - startY;
        // Only draw player if within viewport bounds
        if (playerViewportX >= 0 && playerViewportX < currentViewportWidth &&
            playerViewportY >= 0 && playerViewportY < currentViewportHeight) {
            display.draw(playerViewportX, playerViewportY, playerTileInfo.symbol, playerTileInfo.fg, playerTileInfo.bg);
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