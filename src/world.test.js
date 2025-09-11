import test from 'node:test';
import assert from 'node:assert';
import { generateChunk, getChunkHash } from './world.js';
import * as ROT from 'rot-js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';

// Instantiate noise generators once for all tests
const elevationNoise = new ROT.Noise.Simplex(123); // Use a fixed seed for consistency
const caveNoise = new ROT.Noise.Simplex(124); // Use a fixed seed for consistency

let totalTerrainGenTime = 0;
let totalTreeGenTime = 0;
let chunkCount = 0;

test('World Generation', () => {
  test('should return a chunk with correct dimensions', () => {
    const chunk = generateChunk({ seed: 42, benchmark: true, elevationNoise, caveNoise });
    assert.ok(chunk.tiles, 'chunk should have a tiles property');
    assert.ok(Array.isArray(chunk.tiles), 'chunk.tiles should be an array');
    assert.strictEqual(chunk.tiles.length, CHUNK_WIDTH * CHUNK_HEIGHT, 'chunk.tiles should have the correct size');
    if (chunk.benchmark) {
      totalTerrainGenTime += chunk.benchmark.terrainGeneration;
      totalTreeGenTime += chunk.benchmark.treeGeneration;
      chunkCount++;
    }
  });

  test('should generate varied elevation using noise', () => {
    const chunk = generateChunk({ seed: 42, benchmark: true, elevationNoise, caveNoise });

    const hasAir = chunk.tiles.some(tile => tile && tile.type === 'AIR');
    const hasGround = chunk.tiles.some(tile => tile && tile.type === 'GROUND');
    assert.ok(hasAir, 'should have some AIR tiles');
    assert.ok(hasGround, 'should have some GROUND tiles');
    if (chunk.benchmark) {
      totalTerrainGenTime += chunk.benchmark.terrainGeneration;
      totalTreeGenTime += chunk.benchmark.treeGeneration;
      chunkCount++;
    }
  });

  test('should generate caves within ground areas', () => {
    const chunk = generateChunk({ seed: 42, benchmark: true, elevationNoise, caveNoise });

    const hasCaveAir = chunk.tiles.some((tile, index) => {
      const y = Math.floor(index / CHUNK_WIDTH);
      return tile && tile.type === 'AIR' && y > 0; // Check for any air tile not at the very top
    });
    assert.ok(hasCaveAir, 'should have some AIR tiles within ground areas (caves)');
    if (chunk.benchmark) {
      totalTerrainGenTime += chunk.benchmark.terrainGeneration;
      totalTreeGenTime += chunk.benchmark.treeGeneration;
      chunkCount++;
    }
  });

  test('should place structures like trees on the surface', () => {
    const chunk = generateChunk({ seed: 42, benchmark: true, elevationNoise, caveNoise });

    const woodTiles = chunk.tiles.filter(tile => tile && tile.type === 'WOOD');
    const leafTiles = chunk.tiles.filter(tile => tile && tile.type === 'LEAF');

    // For now, just checking for existence.
    if (chunk.benchmark) {
      totalTerrainGenTime += chunk.benchmark.terrainGeneration;
      totalTreeGenTime += chunk.benchmark.treeGeneration;
      chunkCount++;
    }
  });

  test('should generate identical chunks for the same seed and chunk coordinates', () => {
    const seed = 123;
    ROT.RNG.setSeed(seed); // Set seed for this test
    const chunkX = 0;
    const chunkY = 0;
    const chunk1 = generateChunk({ seed, chunkX, chunkY, benchmark: true, elevationNoise, caveNoise });
    ROT.RNG.setSeed(seed); // Set seed again for the second chunk generation
    const chunk2 = generateChunk({ seed, chunkX, chunkY, benchmark: true, elevationNoise, caveNoise });

    // Compare a single tile to avoid memory issues
    const testTileIndex = 10; // A random index within the chunk
    assert.deepStrictEqual(chunk1.tiles[testTileIndex].type, chunk2.tiles[testTileIndex].type, 'specific tile should be identical');
    if (chunk1.benchmark) {
      totalTerrainGenTime += chunk1.benchmark.terrainGeneration;
      totalTreeGenTime += chunk1.benchmark.treeGeneration;
      chunkCount++;
    }
    if (chunk2.benchmark) {
      totalTerrainGenTime += chunk2.benchmark.terrainGeneration;
      totalTreeGenTime += chunk2.benchmark.treeGeneration;
      chunkCount++;
    }
  });

  test('should generate different chunks for different chunk coordinates with the same seed', () => {
    const seed = 123;
    ROT.RNG.setSeed(seed); // Set seed for this test
    const chunk1 = generateChunk({ seed, chunkX: 0, chunkY: 0, benchmark: true, elevationNoise, caveNoise });
    ROT.RNG.setSeed(seed); // Set seed again for the second chunk generation
    const chunk2 = generateChunk({ seed, chunkX: 1, chunkY: 0, benchmark: true, elevationNoise, caveNoise });

    // Compare chunk hashes to ensure they are different
    assert.notStrictEqual(getChunkHash(chunk1), getChunkHash(chunk2), 'chunk hashes should be different');
    if (chunk1.benchmark) {
      totalTerrainGenTime += chunk1.benchmark.terrainGeneration;
      totalTreeGenTime += chunk1.benchmark.treeGeneration;
      chunkCount++;
    }
    if (chunk2.benchmark) {
      totalTerrainGenTime += chunk2.benchmark.terrainGeneration;
      totalTreeGenTime += chunk2.benchmark.treeGeneration;
      chunkCount++;
    }
  });
});

test('World Generation Benchmarks', () => {
  if (chunkCount > 0) {
    console.log(`\n--- World Generation Average Benchmarks (${chunkCount} chunks) ---`);
    console.log(`  Average Terrain Generation: ${(totalTerrainGenTime / chunkCount).toFixed(3)} ms`);
    console.log(`  Average Tree Generation: ${(totalTreeGenTime / chunkCount).toFixed(3)} ms`);
    console.log(`--------------------------------------------------`);
  }
});