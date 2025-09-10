import { generateChunk } from './src/world.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './src/config.js';
console.log("main.js loaded");
import * as ROT from './node_modules/rot-js/lib/index.js';

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
            let char = '?';
            let color = 'white';

            switch (tile.type) {
                case 'ground':
                    char = '#';
                    color = '#8B4513'; // SaddleBrown
                    break;
                case 'air':
                    char = '.';
                    color = '#ADD8E6'; // LightBlue
                    break;
                case 'wood':
                    char = 'T';
                    color = '#A0522D'; // Sienna
                    break;
                case 'leaf':
                    char = 'L';
                    color = '#228B22'; // ForestGreen
                    break;
                default:
                    char = '?';
                    color = 'white';
            }
            display.draw(x, y, char, color, tile.biome === 'desert' ? '#F4A460' : 'black'); // Background color for desert biome
        }
    }
}
