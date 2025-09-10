import { generateChunk } from './src/world.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './src/config.js';
import { TILES } from './src/tiles.js';
console.log("main.js loaded");
import * as ROT from 'rot-js';

const canvas = document.getElementById('gameCanvas');

// Initialize ROT.Display
const display = new ROT.Display({
    width: CHUNK_WIDTH,
    height: CHUNK_HEIGHT,
    fontSize: 12,
    spacing: 1,
    forceSquareRatio: true,
    fontFamily: "monospace",
    bg: "black",
    fg: "white"
});

// Append the display's container to the canvas element
canvas.parentNode.replaceChild(display.getContainer(), canvas);

// Generate a chunk
const chunk = generateChunk({ seed: 123 }); // Use a fixed seed for consistency

// Render the chunk
for (let y = 0; y < CHUNK_HEIGHT; y++) {
    for (let x = 0; x < CHUNK_WIDTH; x++) {
        const index = y * CHUNK_WIDTH + x;
        const tile = chunk.tiles[index];

        if (tile) {
            const tileInfo = TILES[tile.type];
            if (tileInfo) {
                display.draw(x, y, tileInfo.symbol, tileInfo.fg, tileInfo.bg);
            } else {
                display.draw(x, y, '?', 'white', 'black');
            }
        }
    }
}
