import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';
import * as ROT from 'rot-js';

export const generateChunk = (options) => {
  const tiles = new Array(CHUNK_WIDTH * CHUNK_HEIGHT).fill(null);
  const elevationNoise = new ROT.Noise.Simplex(options.seed || Date.now());
  const biomeNoise = new ROT.Noise.Simplex((options.seed || Date.now()) + 1); // Use a different seed for biome noise
  const caveNoise = new ROT.Noise.Simplex((options.seed || Date.now()) + 2); // Use another different seed for cave noise

  for (let x = 0; x < CHUNK_WIDTH; x++) {
    const height = Math.floor(elevationNoise.get(x / 10, 0) * (CHUNK_HEIGHT * 0.2)) + (CHUNK_HEIGHT / 2);

    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      const index = y * CHUNK_WIDTH + x;
      const biomeValue = biomeNoise.get(x / 20, y / 20); // Lower frequency for biomes
      let biome = 'forest';
      if (biomeValue < 0) {
        biome = 'desert';
      }

      let type = 'air';
      if (y >= height) {
        type = 'ground';
      }

      // Apply 3D cave noise
      // The third dimension (z) can represent depth or another spatial dimension
      // Scale x, y, and z to get interesting cave patterns
      const caveValue = caveNoise.get(x / 15, y / 15, y / 10); // Use y as a depth component for 3D noise

      if (type === 'ground' && caveValue > 0.3) { // If it's ground and noise value is high enough, make it air (cave)
        type = 'air';
      }

      tiles[index] = { type, biome };
    }
  }

  // Post-processing for structures (trees)
  ROT.RNG.setSeed(options.seed || Date.now());

  for (let x = 0; x < CHUNK_WIDTH; x++) {
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      const index = y * CHUNK_WIDTH + x;
      const tile = tiles[index];

      // Check for a valid surface tile: ground with air above it
      if (tile && tile.type === 'ground' && y > 0) {
        const aboveIndex = (y - 1) * CHUNK_WIDTH + x;
        const tileAbove = tiles[aboveIndex];

        if (tileAbove && tileAbove.type === 'air') {
          // Randomly decide to place a tree
          if (ROT.RNG.getUniform() < 0.05) { // 5% chance to place a tree
            // Place trunk (wood)
            tiles[aboveIndex] = { type: 'wood', biome: tile.biome };
            if (y - 2 >= 0) tiles[(y - 2) * CHUNK_WIDTH + x] = { type: 'wood', biome: tile.biome };

            // Place leaves (simple 3x3 square above trunk)
            for (let lx = x - 1; lx <= x + 1; lx++) {
              for (let ly = y - 3; ly <= y - 2; ly++) { // Leaves above the trunk
                if (lx >= 0 && lx < CHUNK_WIDTH && ly >= 0 && ly < CHUNK_HEIGHT) {
                  const leafIndex = ly * CHUNK_WIDTH + lx;
                  if (tiles[leafIndex].type === 'air') { // Only place leaves in air
                    tiles[leafIndex] = { type: 'leaf', biome: tile.biome };
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
