import test from 'node:test';
import assert from 'node:assert';
import { WorldManager } from './world-manager.js';

let totalTerrainGenTime = 0;
let totalTreeGenTime = 0;
let chunkCount = 0;

test('WorldManager', () => {
  test('should return the same chunk for the same coordinates', () => {
    const worldManager = new WorldManager(123);
    const chunk1 = worldManager.getChunk(0, 0, { benchmark: true });
    const chunk2 = worldManager.getChunk(0, 0, { benchmark: true });
    assert.strictEqual(chunk1, chunk2, 'Chunks should be the same instance');
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

  test('should return different chunks for different coordinates', () => {
    const worldManager = new WorldManager(123);
    const chunk1 = worldManager.getChunk(0, 0, { benchmark: true });
    const chunk2 = worldManager.getChunk(1, 0, { benchmark: true });
    assert.notStrictEqual(chunk1, chunk2, 'Chunks should be different instances');
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

  test('should generate a new chunk if it does not exist', () => {
    const worldManager = new WorldManager(123);
    // Initially, the chunk should not exist in the map
    assert.strictEqual(worldManager.chunks.has('0,0'), false, 'Chunk should not exist initially');
    const chunk = worldManager.getChunk(0, 0, { benchmark: true });
    // After calling getChunk, it should exist
    assert.ok(chunk, 'Chunk should be returned');
    assert.strictEqual(worldManager.chunks.has('0,0'), true, 'Chunk should exist after generation');
    if (chunk.benchmark) {
      totalTerrainGenTime += chunk.benchmark.terrainGeneration;
      totalTreeGenTime += chunk.benchmark.treeGeneration;
      chunkCount++;
    }
  });
});

test('WorldManager Benchmarks', () => {
  if (chunkCount > 0) {
    console.log(`\n--- WorldManager Average Benchmarks (${chunkCount} chunks) ---`);
    console.log(`  Average Terrain Generation: ${(totalTerrainGenTime / chunkCount).toFixed(3)} ms`);
    console.log(`  Average Tree Generation: ${(totalTreeGenTime / chunkCount).toFixed(3)} ms`);
    console.log(`--------------------------------------------------`);
  }
});
