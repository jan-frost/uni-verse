import { generateChunk } from './src/world.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './src/config.js';
import { TILES } from './src/tiles.js';
import { calculateVisibility } from './src/visibility.js';
import { calculateViewport, adjustDisplayForZoom, getInitialViewportSettings } from './src/viewport.js';

console.log("main.js loaded");
import * as ROT from 'rot-js';

const canvas = document.getElementById('gameCanvas');

const { initialZoomLevel } = getInitialViewportSettings();
let zoomLevel = initialZoomLevel;

// Player position (for now, fixed at center of chunk)
let playerX = Math.floor(CHUNK_WIDTH / 2);
let playerY = Math.floor(CHUNK_HEIGHT / 2);

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

// Generate a chunk
const chunk = generateChunk({ seed: 123 }); // Use a fixed seed for consistency
const visibility = calculateVisibility({ tiles: chunk.tiles }); // Calculate visibility

// Function to draw the game state
const drawGame = (playerX, playerY, chunk, visibility, display) => {
    display.clear(); // Clear the display before redrawing

    const { startX, startY } = calculateViewport(playerX, playerY, display);
    const currentViewportWidth = display.getOptions().width;
    const currentViewportHeight = display.getOptions().height;

    for (let y = 0; y < currentViewportHeight; y++) {
        for (let x = 0; x < currentViewportWidth; x++) {
            const worldX = startX + x;
            const worldY = startY + y;
            const index = worldY * CHUNK_WIDTH + worldX;
            const tile = chunk.tiles[index];

            // Check if the world coordinates are within the chunk boundaries
            if (worldX >= 0 && worldX < CHUNK_WIDTH && worldY >= 0 && worldY < CHUNK_HEIGHT) {
                if (visibility[index]) { // Check visibility
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
            } else {
                // Draw gray tile for out-of-bounds areas
                display.draw(x, y, ' ', '#333333', '#333333'); // Dark gray
            }
        }
    }
};

// Initial draw
drawGame(playerX, playerY, chunk, visibility, display);

// Add zoom button event listeners
document.getElementById('zoomInBtn').addEventListener('click', () => {
    zoomLevel++;
    adjustDisplayForZoom(display, zoomLevel); // This now updates display.width/height
    drawGame(playerX, playerY, chunk, visibility, display);
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
    zoomLevel--;
    adjustDisplayForZoom(display, zoomLevel); // This now updates display.width/height
    drawGame(playerX, playerY, chunk, visibility, display);
});
