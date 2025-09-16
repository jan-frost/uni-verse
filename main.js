import { createInitialState } from './src/game-state.js';
import * as ROT from 'rot-js'; // Import the entire 'rot-js' library
import { BrowserStorage } from './src/browser-storage.js';
import { generateChunk } from './src/world.js';
import { TILES } from './src/tiles.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './src/config.js';
import { calculateViewport, adjustDisplayForZoom } from './src/viewport.js';
import { calculateVisibility } from './src/visibility.js';
import { movePlayer } from './src/player-movement.js';

const urlParams = new URLSearchParams(window.location.search);
const isDebugMode = urlParams.has('debug');

// Initialize game state
let gameState = createInitialState(urlParams);

console.log(`Initial WORLD_SEED (from gameState): ${gameState.seed}`);

const storage = new BrowserStorage(gameState.seed);

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

// Player position (for now, fixed at center of chunk)
gameState.player.x = (gameState.currentChunk.x * CHUNK_WIDTH) + Math.floor(display.getOptions().width / 2);
gameState.player.y = Math.floor(CHUNK_HEIGHT / 2);

// Function to get or generate a chunk
const getChunk = async (currentGameState, chunkX) => {
    const chunkKey = `${chunkX},0`;
    if (currentGameState.chunks.has(chunkKey)) {
        return [currentGameState.chunks.get(chunkKey), currentGameState];
    }

    const newChunk = await generateChunk({
        chunkX,
        worldNoise: currentGameState.noise.worldNoise,
        worldCaveNoise: currentGameState.noise.worldCaveNoise,
    }, storage);
    const newChunks = new Map(currentGameState.chunks).set(chunkKey, newChunk);
    const newGameState = { ...currentGameState, chunks: newChunks };
    return [newChunk, newGameState];
};

const getTile = async (currentGameState, worldX, worldY) => {
    const chunkX = Math.floor(worldX / CHUNK_WIDTH);
    let [chunk, updatedGameState] = await getChunk(currentGameState, chunkX); // getChunk now returns [chunk, newGameState]

    const localX = (worldX % CHUNK_WIDTH + CHUNK_WIDTH) % CHUNK_WIDTH;
    const localY = (worldY % CHUNK_HEIGHT + CHUNK_HEIGHT) % CHUNK_HEIGHT;

    const index = localY * CHUNK_WIDTH + localX;
    const tile = chunk.tiles[index];

    if (tile) {
        return [{ ...tile, ...TILES[tile.type] }, updatedGameState];
    }
    return [null, updatedGameState];
};

// Function to draw the game state
const drawGame = async (gameState, display) => {
    display.clear(); // Clear the display before redrawing

    const playerX = gameState.player.x;
    const playerY = gameState.player.y;
    const currentChunkX = gameState.currentChunk.x;
    const currentChunkY = gameState.currentChunk.y;

    const { startX, startY } = calculateViewport(playerX, playerY, display);
    const currentViewportWidth = display.getOptions().width;
    const currentViewportHeight = display.getOptions().height;

    // Calculate center of viewport in world coordinates
    const centerViewportWorldX = startX + Math.floor(currentViewportWidth / 2);
    const centerViewportWorldY = startY + Math.floor(currentViewportHeight / 2);

    // Determine chunk coordinates of center tile
    const centerChunkX = Math.floor(centerViewportWorldX / CHUNK_WIDTH);

    // Get the chunk containing the center tile
    let [centerChunk, updatedGameState1] = await getChunk(gameState, centerChunkX);
    gameState = updatedGameState1;

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
        let [chunk, updatedGameState2] = await getChunk(gameState, chunkX);
        gameState = updatedGameState2;
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
        const playerViewportX = gameState.player.x - startX;
        const playerViewportY = gameState.player.y - startY;
        // Only draw player if within viewport bounds
        if (playerViewportX >= 0 && playerViewportX < currentViewportWidth &&
            playerViewportY >= 0 && playerViewportY < currentViewportHeight) {
            display.draw(playerViewportX, playerViewportY, playerTileInfo.symbol, playerTileInfo.fg, playerTileInfo.bg);
        }
    }

    if (isDebugMode && debugOutputElement) {
        debugOutputElement.textContent = `Player: (${gameState.player.x}, ${gameState.player.y}) | Chunk: (${gameState.currentChunk.x}, ${gameState.currentChunk.y})`;
    }
};

// Initial draw
(async () => {
    await drawGame(gameState, display);
})();

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