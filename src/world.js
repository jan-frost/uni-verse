import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';
import * as ROT from 'rot-js';

export const generateChunk = (options) => {
  const startTime = performance.now();

  const chunkWidth = options.width || CHUNK_WIDTH;
  const chunkHeight = options.height || CHUNK_HEIGHT;
  const tiles = new Array(chunkWidth * chunkHeight).fill(null);

  const baseSeed = options.seed || Date.now();
  // A more robust hashing function for seeds
  // Combines baseSeed, chunkX, and chunkY into a unique, well-distributed integer
  let seedHash = baseSeed;
  seedHash = (seedHash * 31 + (options.chunkX || 0)) | 0; // Multiply by a prime and bitwise OR with 0 to ensure integer
  seedHash = (seedHash * 31 + (options.chunkY || 0)) | 0;

  const treeSeed = (seedHash + 2) | 0; // Only treeSeed is needed here

  const elevationNoise = options.elevationNoise; // Use pre-instantiated noise
  const caveNoise = options.caveNoise; // Use pre-instantiated noise

  const terrainGenStartTime = performance.now();
  for (let x = 0; x < chunkWidth; x++) {
    // Calculate worldX for noise sampling
    const worldX = (options.chunkX || 0) * CHUNK_WIDTH + x;
    const height = Math.floor(options.elevationNoise.get(worldX / 10, (options.chunkY || 0) * CHUNK_HEIGHT / 10) * (chunkHeight * 0.2)) + (chunkHeight / 2);
    for (let y = 0; y < chunkHeight; y++) {
      // Calculate worldY for noise sampling
      const worldY = (options.chunkY || 0) * CHUNK_HEIGHT + y;
      const index = y * chunkWidth + x;
      let type = 'AIR';
      if (y >= height) {
        type = 'GROUND';
      }
      const caveValue = options.caveNoise.get(worldX / 15, worldY / 15, worldY / 10); // Use worldX, worldY for 3D noise
      if (type === 'GROUND' && caveValue > 0.3) {
        type = 'AIR';
      }
      tiles[index] = { type };
    }
  }
  const terrainGenEndTime = performance.now();

  const treeGenStartTime = performance.now();
  ROT.RNG.setSeed(treeSeed); // Use the distinct tree seed

  for (let x = 0; x < chunkWidth; x++) {
    for (let y = 0; y < chunkHeight; y++) {
      const index = y * chunkWidth + x;
      const tile = tiles[index];

      if (tile && tile.type === 'GROUND' && y > 0) {
        const aboveIndex = (y - 1) * chunkWidth + x;
        const tileAbove = tiles[aboveIndex];

        if (tileAbove && tileAbove.type === 'AIR') {
          if (ROT.RNG.getUniform() < 0.05) {
            tiles[aboveIndex] = { type: 'WOOD' };
            if (y - 2 >= 0) tiles[(y - 2) * chunkWidth + x] = { type: 'WOOD' };

            for (let lx = x - 1; lx <= x + 1; lx++) {
              for (let ly = y - 3; ly <= ly - 2; ly++) {
                if (lx >= 0 && lx < chunkWidth && ly >= 0 && ly < chunkHeight) {
                  const leafIndex = ly * chunkWidth + lx;
                  if (tiles[leafIndex].type === 'AIR') {
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
  const treeGenEndTime = performance.now();

  const endTime = performance.now();

  if (options.benchmark) {
    console.log(`Chunk (${options.chunkX || 0}, ${options.chunkY || 0}) - Size: ${chunkWidth}x${chunkHeight}`);
    console.log(`  Terrain Generation: ${terrainGenEndTime - terrainGenStartTime} ms`);
    console.log(`  Tree Generation: ${treeGenEndTime - treeGenStartTime} ms`);
    console.log(`  Total Chunk Generation: ${endTime - startTime} ms`);
  }

  return {
    tiles,
    benchmark: options.benchmark ? {
      terrainGeneration: terrainGenEndTime - terrainGenStartTime,
      treeGeneration: treeGenEndTime - treeGenStartTime,
      total: endTime - startTime,
    } : undefined,
  };
};

export const getChunkHash = (chunk) => {
  let hash = 0;
  for (let i = 0; i < chunk.tiles.length; i++) {
    hash = ((hash << 5) - hash) + chunk.tiles[i].type.charCodeAt(0);
    hash |= 0; // Ensure 32-bit integer
  }
  return hash;
};