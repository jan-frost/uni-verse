import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';
import * as ROT from 'rot-js';

export const generateChunk = (options) => {
  const chunkWidth = options.width || CHUNK_WIDTH;
  const chunkHeight = options.height || CHUNK_HEIGHT;
  const tiles = new Array(chunkWidth * chunkHeight).fill(null);

  const { chunkX, chunkY, worldNoise, worldCaveNoise } = options;

  console.log(`Generating chunk: chunkX=${chunkX}, chunkY=${chunkY}`);

  for (let x = 0; x < chunkWidth; x++) {
    const worldX = chunkX * CHUNK_WIDTH + x; // Calculate world X coordinate

    const height = Math.floor(worldNoise.get(worldX / 10, 0) * (chunkHeight * 0.2)) + (chunkHeight / 2);
    for (let y = 0; y < chunkHeight; y++) {
      const worldY = chunkY * CHUNK_HEIGHT + y; // Calculate world Y coordinate

      const index = y * chunkWidth + x;

      let type = 'AIR';
      if (y >= height) {
        type = 'GROUND';
      }

      const caveValue = worldCaveNoise.get(worldX / 15, worldY / 15, worldY / 10); // Use world coordinates for cave noise

      if (type === 'GROUND' && caveValue > 0.3) {
        type = 'AIR';
      }

      tiles[index] = { type };
    }
  }

  // Post-processing for structures (trees)

  for (let x = 0; x < chunkWidth; x++) {
    const worldX = chunkX * CHUNK_WIDTH + x; // Calculate world X coordinate for tree placement
    for (let y = 0; y < chunkHeight; y++) {
      const worldY = chunkY * CHUNK_HEIGHT + y; // Calculate world Y coordinate for tree placement

      const index = y * chunkWidth + x;
      const tile = tiles[index];

      // Check for a valid surface tile: ground with air above it
      if (tile && tile.type === 'GROUND' && y > 0) {
        const aboveIndex = (y - 1) * chunkWidth + x;
        const tileAbove = tiles[aboveIndex];

        if (tileAbove && tileAbove.type === 'AIR') {
          // Deterministically decide to place a tree using noise
          const treeNoiseValue = worldNoise.get(worldX / 5, worldY / 5); // Sample noise at a different frequency
          if (treeNoiseValue < -0.4) { // Place tree if noise value is below a threshold
            // Place trunk (wood)
            tiles[aboveIndex] = { type: 'WOOD' };
            if (y - 2 >= 0) tiles[(y - 2) * chunkWidth + x] = { type: 'WOOD' };

            // Place leaves (simple 3x3 square above trunk)
            for (let lx = x - 1; lx <= x + 1; lx++) {
              for (let ly = y - 3; ly <= y - 2; ly++) { // Leaves above the trunk
                if (lx >= 0 && lx < chunkWidth && ly >= 0 && ly < chunkHeight) {
                  const leafIndex = ly * chunkWidth + lx;
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

export const getAdjacentChunkCoordinates = (currentChunkX, currentChunkY) => {
  return [
    { chunkX: currentChunkX - 1, chunkY: currentChunkY }, // Left chunk
    { chunkX: currentChunkX + 1, chunkY: currentChunkY }, // Right chunk
  ];
};

export const manageChunkMemory = (currentChunkX, currentChunkY, loadedChunks, getChunk) => {
  const chunksToKeep = new Set();
  // Current chunk
  chunksToKeep.add(`${currentChunkX},${currentChunkY}`);
  // Left adjacent chunk
  chunksToKeep.add(`${currentChunkX - 1},${currentChunkY}`);
  // Right adjacent chunk
  chunksToKeep.add(`${currentChunkX + 1},${currentChunkY}`);

  // Remove chunks not in the "keep" set
  for (const chunkKey of loadedChunks.keys()) {
    if (!chunksToKeep.has(chunkKey)) {
      loadedChunks.delete(chunkKey);
    }
  }

  // Ensure current and adjacent chunks are loaded (getChunk handles generation)
  getChunk(currentChunkX, currentChunkY);
  getChunk(currentChunkX - 1, currentChunkY);
  getChunk(currentChunkX + 1, currentChunkY);
};