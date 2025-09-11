import { generateChunk } from './world.js';
import * as ROT from 'rot-js'; // Import ROT

export class WorldManager {
  constructor(seed) {
    this.seed = seed;
    this.chunks = new Map(); // Stores chunks, keyed by a string like "chunkX,chunkY"

    // Instantiate noise generators once
    this.elevationNoise = new ROT.Noise.Simplex(this.seed);
    this.caveNoise = new ROT.Noise.Simplex(this.seed + 1); // Use a slightly different seed for cave noise
  }

  getChunk(chunkX, chunkY, options = {}) {
    const key = `${chunkX},${chunkY}`;
    if (!this.chunks.has(key)) {
      // Generate the chunk if it doesn't exist
      const newChunk = generateChunk({
        seed: this.seed,
        chunkX,
        chunkY,
        elevationNoise: this.elevationNoise, // Pass pre-instantiated noise
        caveNoise: this.caveNoise,         // Pass pre-instantiated noise
        ...options
      });
      this.chunks.set(key, newChunk);
    }
    return this.chunks.get(key);
  }

  // Potentially add methods for unloading chunks, etc. later
}
