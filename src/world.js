import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';
import * as ROT from 'rot-js';

export const generateChunk = (options) => {
  const tiles = new Array(CHUNK_WIDTH * CHUNK_HEIGHT).fill(null);
  const elevationNoise = new ROT.Noise.Simplex(options.seed || Date.now());
  const caveNoise = new ROT.Noise.Simplex((options.seed || Date.now()) + 2); // Use another different seed for cave noise

  for (let x = 0; x < CHUNK_WIDTH; x++) {
    const height = Math.floor(elevationNoise.get(x / 10, 0) * (CHUNK_HEIGHT * 0.2)) + (CHUNK_HEIGHT / 2);

    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      const index = y * CHUNK_WIDTH + x;

      let type = 'AIR';
      if (y >= height) {
        type = 'GROUND';
      }

      // Apply 3D cave noise
      // The third dimension (z) can represent depth or another spatial dimension
      // Scale x, y, and z to get interesting cave patterns
      const caveValue = caveNoise.get(x / 15, y / 15, y / 10); // Use y as a depth component for 3D noise

      if (type === 'GROUND' && caveValue > 0.3) { // If it's ground and noise value is high enough, make it air (cave)
        type = 'AIR';
      }

      tiles[index] = { type };
    }
  }

  // Post-processing for structures (trees)
  ROT.RNG.setSeed(options.seed || Date.now());

  for (let x = 0; x < CHUNK_WIDTH; x++) {
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      const index = y * CHUNK_WIDTH + x;
      const tile = tiles[index];

      // Check for a valid surface tile: ground with air above it
      if (tile && tile.type === 'GROUND' && y > 0) {
        const aboveIndex = (y - 1) * CHUNK_WIDTH + x;
        const tileAbove = tiles[aboveIndex];

        if (tileAbove && tileAbove.type === 'AIR') {
          // Randomly decide to place a tree
          if (ROT.RNG.getUniform() < 0.05) { // 5% chance to place a tree
            // Place trunk (wood)
            tiles[aboveIndex] = { type: 'WOOD' };
            if (y - 2 >= 0) tiles[(y - 2) * CHUNK_WIDTH + x] = { type: 'WOOD' };

            // Place leaves (simple 3x3 square above trunk)
            for (let lx = x - 1; lx <= x + 1; lx++) {
              for (let ly = y - 3; ly <= y - 2; ly++) { // Leaves above the trunk
                if (lx >= 0 && lx < CHUNK_WIDTH && ly >= 0 && ly < CHUNK_HEIGHT) {
                  const leafIndex = ly * CHUNK_WIDTH + lx;
                  if (tiles[leafIndex].type === 'AIR') { // Only place leaves in air
                    tiles[leafIndex] = { type: 'LEAF' };
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    tiles,
  };
};
