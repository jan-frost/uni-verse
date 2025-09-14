import test from 'node:test';
import assert from 'node:assert';
import { generateChunk, getAdjacentChunkCoordinates, manageChunkMemory } from './world.js';
import * as ROT from 'rot-js';

// Global World Seed for tests
const WORLD_TEST_SEED = 12345;
const worldNoise = new ROT.Noise.Simplex(WORLD_TEST_SEED);
const worldCaveNoise = new ROT.Noise.Simplex(WORLD_TEST_SEED + 2);



const createMockGameStateForWorld = (currentChunkX, currentChunkY, chunks = new Map()) => ({
  seed: WORLD_TEST_SEED,
  player: { x: 0, y: 0 }, // Player position not relevant for chunk memory management tests
  currentChunk: { x: currentChunkX, y: currentChunkY },
  chunks: chunks,
  noise: { worldNoise, worldCaveNoise },
});

test('World Generation', () => {
  ROT.RNG.setSeed(WORLD_TEST_SEED); // Reset RNG for consistent world generation tests
  test('should return a chunk with correct dimensions', () => {
    const chunk = generateChunk({ chunkX: 0, chunkY: 0, width: 8, height: 8, worldNoise, worldCaveNoise });
    assert.ok(chunk.tiles, 'chunk should have a tiles property');
    assert.ok(Array.isArray(chunk.tiles), 'chunk.tiles should be an array');
    assert.strictEqual(chunk.tiles.length, 8 * 8, 'chunk.tiles should have the correct size');
  });

  test('should generate varied elevation using noise', () => {
    const chunk = generateChunk({ chunkX: 0, chunkY: 0, width: 8, height: 8, worldNoise, worldCaveNoise });

    const hasAir = chunk.tiles.some(tile => tile && tile.type === 'AIR');
    const hasGround = chunk.tiles.some(tile => tile && tile.type === 'GROUND');
    assert.ok(hasAir, 'should have some AIR tiles');
    assert.ok(hasGround, 'should have some GROUND tiles');
  });

  test('should generate caves within ground areas', () => {
    const chunk = generateChunk({ chunkX: 0, chunkY: 0, width: 8, height: 8, worldNoise, worldCaveNoise });

    const hasCaveAir = chunk.tiles.some((tile, index) => {
      const y = Math.floor(index / 8);
      return tile && tile.type === 'AIR' && y > 0; // Check for any air tile not at the very top
    });
    assert.ok(hasCaveAir, 'should have some AIR tiles within ground areas (caves)');
  });

  test('should place structures like trees on the surface', () => {
    const chunk = generateChunk({ chunkX: 0, chunkY: 0, width: 32, height: 32, worldNoise, worldCaveNoise });

    const woodTiles = chunk.tiles.filter(tile => tile && tile.type === 'WOOD');
    const leafTiles = chunk.tiles.filter(tile => tile && tile.type === 'LEAF');

    assert.ok(woodTiles.length > 0, 'should have some WOOD tiles');
    assert.ok(leafTiles.length > 0, 'should have some LEAF tiles');

    // Further checks could include: are they on the surface? are they in a tree-like shape?
    // For now, just checking for existence.
  });
});

test('Chunk Management', () => {
  ROT.RNG.setSeed(WORLD_TEST_SEED); // Reset RNG for consistent chunk management tests
  test('generateChunk should produce consistent results for same coordinates', () => {
    const chunk1 = generateChunk({ chunkX: 0, chunkY: 0, width: 8, height: 8, worldNoise, worldCaveNoise });
    const chunk2 = generateChunk({ chunkX: 0, chunkY: 0, width: 8, height: 8, worldNoise, worldCaveNoise });
    assert.deepStrictEqual(chunk1.tiles, chunk2.tiles, 'Chunks with same coordinates should be identical');
  });

  test('generateChunk should produce different results for different coordinates', () => {
    const chunk1 = generateChunk({ chunkX: 0, chunkY: 0, width: 8, height: 8, worldNoise, worldCaveNoise });
    const chunk3 = generateChunk({ chunkX: 1, chunkY: 0, width: 8, height: 8, worldNoise, worldCaveNoise });
    assert.notDeepStrictEqual(chunk1.tiles, chunk3.tiles, 'Chunks with different coordinates should be different');
  });

  test('getAdjacentChunkCoordinates should return correct left and right chunks', () => {
    const currentChunkX = 5;
    const currentChunkY = 10;
    const adjacent = getAdjacentChunkCoordinates(currentChunkX, currentChunkY);

    assert.strictEqual(adjacent.length, 2, 'Should return 2 adjacent chunks');
    assert.deepStrictEqual(adjacent[0], { chunkX: 4, chunkY: 10 }, 'First adjacent chunk should be the left one');
    assert.deepStrictEqual(adjacent[1], { chunkX: 6, chunkY: 10 }, 'Second adjacent chunk should be the right one');
  });
});

test('Chunk Memory Management', () => {
  test('should correctly manage chunks when loadedChunks is empty', () => {
    let initialGameState = createMockGameStateForWorld(0, 0);
    let newGameState = manageChunkMemory(initialGameState);

    assert.strictEqual(newGameState.chunks.size, 3, 'newGameState.chunks should contain 3 chunks');
    assert.ok(newGameState.chunks.has('0,0'), 'newGameState.chunks should contain 0,0');
    assert.ok(newGameState.chunks.has('-1,0'), 'newGameState.chunks should contain -1,0');
    assert.ok(newGameState.chunks.has('1,0'), 'newGameState.chunks should contain 1,0');
  });

  test('should remove old chunks and load new ones when player moves to a new chunk', () => {
    const initialChunks = new Map();
    initialChunks.set('-2,0', generateChunk({ chunkX: -2, chunkY: 0, worldNoise, worldCaveNoise }));
    initialChunks.set('-1,0', generateChunk({ chunkX: -1, chunkY: 0, worldNoise, worldCaveNoise }));
    initialChunks.set('0,0', generateChunk({ chunkX: 0, chunkY: 0, worldNoise, worldCaveNoise }));
    initialChunks.set('1,0', generateChunk({ chunkX: 1, chunkY: 0, worldNoise, worldCaveNoise }));
    initialChunks.set('2,0', generateChunk({ chunkX: 2, chunkY: 0, worldNoise, worldCaveNoise }));

    let initialGameState = createMockGameStateForWorld(0, 0, initialChunks);
    // Simulate player moving to chunk 1
    initialGameState = { ...initialGameState, currentChunk: { x: 1, y: 0 } };

    let newGameState = manageChunkMemory(initialGameState);

    assert.strictEqual(newGameState.chunks.size, 3, 'newGameState.chunks should contain 3 chunks');
    assert.ok(newGameState.chunks.has('0,0'), 'newGameState.chunks should contain 0,0');
    assert.ok(newGameState.chunks.has('1,0'), 'newGameState.chunks should contain 1,0');
    assert.ok(newGameState.chunks.has('2,0'), 'newGameState.chunks should contain 2,0');
    assert.ok(!newGameState.chunks.has('-2,0'), 'newGameState.chunks should not contain -2,0');
    assert.ok(!newGameState.chunks.has('-1,0'), 'newGameState.chunks should not contain -1,0');
  });

  test('should not remove or load chunks when player moves within the same chunk', () => {
    const initialChunks = new Map();
    initialChunks.set('-1,0', generateChunk({ chunkX: -1, chunkY: 0, worldNoise, worldCaveNoise }));
    initialChunks.set('0,0', generateChunk({ chunkX: 0, chunkY: 0, worldNoise, worldCaveNoise }));
    initialChunks.set('1,0', generateChunk({ chunkX: 1, chunkY: 0, worldNoise, worldCaveNoise }));

    let initialGameState = createMockGameStateForWorld(0, 0, initialChunks);
    let newGameState = manageChunkMemory(initialGameState);

    assert.strictEqual(newGameState.chunks.size, 3, 'newGameState.chunks should still contain 3 chunks');
    assert.ok(newGameState.chunks.has('0,0'), 'newGameState.chunks should contain 0,0');
    assert.ok(newGameState.chunks.has('-1,0'), 'newGameState.chunks should contain -1,0');
    assert.ok(newGameState.chunks.has('1,0'), 'newGameState.chunks should contain 1,0');
    assert.deepStrictEqual(newGameState.chunks, initialGameState.chunks, 'Chunks should be the same if no movement across chunk boundaries');
  });
});