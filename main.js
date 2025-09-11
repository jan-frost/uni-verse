import { CHUNK_WIDTH, CHUNK_HEIGHT } from './src/config.js';
import { TILES } from './src/tiles.js';
import { calculateVisibility } from './src/visibility.js';
import { adjustDisplayForZoom, getInitialViewportSettings } from './src/viewport.js';
import { WorldManager } from './src/world-manager.js';

console.log("main.js loaded");
import * as ROT from 'rot-js';

const canvas = document.getElementById('gameCanvas');

const { initialZoomLevel } = getInitialViewportSettings();
let zoomLevel = initialZoomLevel;

// Viewport world coordinates (top-left corner of the viewport in world tiles)
let viewportWorldX = 0;
let viewportWorldY = 0;

// Initialize ROT.Display
const display = new ROT.Display({
    forceSquareRatio: true,
    fontFamily: "monospace",
    bg: "black",
    fg: "white"
});
adjustDisplayForZoom(display, zoomLevel); // Apply initial zoom, sets width/height

// Append the display's container to the canvas element
const rotCanvas = display.getContainer();
rotCanvas.style.border = '2px solid white';
rotCanvas.style.boxSizing = 'border-box'; // Include padding and border in the element\'s total width and height.
canvas.parentNode.replaceChild(rotCanvas, canvas);

// Initialize WorldManager
const worldManager = new WorldManager(123); // Use a fixed seed for consistency

// Function to draw the game state
const drawGame = (worldManager, display) => {
    display.clear(); // Clear the display before redrawing

    const currentViewportWidth = display.getOptions().width;
    const currentViewportHeight = display.getOptions().height;

    console.log(`Viewport: (${viewportWorldX}, ${viewportWorldY}) - Size: ${currentViewportWidth}x${currentViewportHeight}`);

    // Calculate the range of chunk coordinates visible in the current viewport
    const startChunkX = Math.floor(viewportWorldX / CHUNK_WIDTH);
    const endChunkX = Math.floor((viewportWorldX + currentViewportWidth - 1) / CHUNK_WIDTH);
    const startChunkY = Math.floor(viewportWorldY / CHUNK_HEIGHT);
    const endChunkY = Math.floor((viewportWorldY + currentViewportHeight - 1) / CHUNK_HEIGHT);

    console.log(`Visible Chunks: X[${startChunkX}, ${endChunkX}], Y[${startChunkY}, ${endChunkY}]`);

    for (let y = 0; y < currentViewportHeight; y++) {
        for (let x = 0; x < currentViewportWidth; x++) {
            const worldX = viewportWorldX + x;
            const worldY = viewportWorldY + y;

            const chunkX = Math.floor(worldX / CHUNK_WIDTH);
            const chunkY = Math.floor(worldY / CHUNK_HEIGHT);

            const localX = worldX % CHUNK_WIDTH;
            const localY = worldY % CHUNK_HEIGHT;

            const chunk = worldManager.getChunk(chunkX, chunkY);
            const tileIndex = localY * CHUNK_WIDTH + localX;
            const tile = chunk.tiles[tileIndex];

            // Calculate visibility for the current tile
            // For now, we'll calculate visibility per chunk. This might need optimization later.
            const visibility = calculateVisibility({ tiles: chunk.tiles });
            const isVisible = visibility[tileIndex];

            if (x === 0 && y === 0) { // Log for top-left tile of viewport
                console.log(`  Tile (${worldX}, ${worldY}) -> Chunk (${chunkX}, ${chunkY}) Local (${localX}, ${localY}) - Type: ${tile ? tile.type : 'N/A'}, Visible: ${isVisible}`);
            }

            if (isVisible) { // Check visibility
                if (tile) {
                    const tileInfo = TILES[tile.type];
                    if (tileInfo) {
                        display.draw(x, y, tileInfo.symbol, tileInfo.fg, tileInfo.bg);
                    } else {
                        display.draw(x, y, '?', 'white', 'black');
                    }
                }
            } else {
                display.draw(x, y, ' ', 'black', 'black'); // Hidden tile: black background, black foreground (or space)
            }
        }
    }
};

// Initial draw
drawGame(worldManager, display);

// Add zoom button event listeners
document.getElementById('zoomInBtn').addEventListener('click', () => {
    zoomLevel++;
    adjustDisplayForZoom(display, zoomLevel); // This now updates display.width/height
    drawGame(worldManager, display);
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
    zoomLevel--;
    adjustDisplayForZoom(display, zoomLevel); // This now updates display.width/height
    drawGame(worldManager, display);
});

    drawGame(worldManager, display);
});

// Add keyboard event listener for viewport movement
document.addEventListener('keydown', (event) => {
    const step = 1; // Movement step in tiles
    switch (event.key) {
        case 'ArrowUp':
            viewportWorldY -= step;
            break;
        case 'ArrowDown':
            viewportWorldY += step;
            break;
        case 'ArrowLeft':
            viewportWorldX -= step;
            break;
        case 'ArrowRight':
            viewportWorldX += step;
            break;
    }
    drawGame(worldManager, display);
});


