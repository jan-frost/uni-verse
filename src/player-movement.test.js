import { test } from 'node:test';
import assert from 'node:assert/strict';
import { movePlayer } from './player-movement.js';
import { TILES } from './tiles.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';

// Helper to create a mock initial game state
const createMockGameState = (playerX, playerY, currentChunkX, currentChunkY, chunks = new Map()) => ({
  seed: 123,
  player: { x: playerX, y: playerY },
  currentChunk: { x: currentChunkX, y: currentChunkY },
  chunks: chunks,
  noise: { 
    worldNoise: { get: () => 0.5 }, // Mock noise objects with a get method
    worldCaveNoise: { get: () => 0.5 } 
  }, // Mock noise objects
});

// Helper to create a mock getTileFunction that returns [tile, gameState]
const createMockGetTileFunction = (mockTiles, initialGameState) => (gameState, x, y) => {
  const tileKey = `${x},${y}`;
  const tile = mockTiles[tileKey] || TILES.AIR; // Default to AIR if not specified
  return [tile, gameState]; // For tests, we assume getTile doesn't change the gameState
};

test('player can move into walkable tiles', () => {
  const initialPlayerX = 5;
  const initialPlayerY = 5;
  const initialChunkX = 0;
  const initialChunkY = 0;

  const mockTiles = {
    '6,5': TILES.AIR, // Target tile is walkable
  };

  const initialGameState = createMockGameState(initialPlayerX, initialPlayerY, initialChunkX, initialChunkY);
  const mockGetTile = createMockGetTileFunction(mockTiles, initialGameState);

  const eventKey = 'ArrowRight';

  const newGameState = movePlayer(initialGameState, eventKey, mockGetTile);

  assert.strictEqual(newGameState.player.x, 6, 'Player X should be 6');
  assert.strictEqual(newGameState.player.y, 5, 'Player Y should remain 5');
  assert.strictEqual(newGameState.currentChunk.x, 0, 'Chunk X should remain 0');
});

test('player cannot move into non-walkable tiles', () => {
  const initialPlayerX = 5;
  const initialPlayerY = 5;
  const initialChunkX = 0;
  const initialChunkY = 0;

  const mockTiles = {
    '6,5': TILES.GROUND, // Target tile is non-walkable
  };

  const initialGameState = createMockGameState(initialPlayerX, initialPlayerY, initialChunkX, initialChunkY);
  const mockGetTile = createMockGetTileFunction(mockTiles, initialGameState);

  const eventKey = 'ArrowRight';

  const newGameState = movePlayer(initialGameState, eventKey, mockGetTile);

  assert.strictEqual(newGameState.player.x, 5, 'Player X should remain 5 (blocked)');
  assert.strictEqual(newGameState.player.y, 5, 'Player Y should remain 5');
});

test('player Y position is clamped to world boundaries', () => {
  const initialPlayerX = 5;
  const initialChunkX = 0;
  const initialChunkY = 0;

  const mockTiles = {}; // All tiles are walkable for this test
  const initialGameState = createMockGameState(initialPlayerX, 0, initialChunkX, initialChunkY);
  const mockGetTile = createMockGetTileFunction(mockTiles, initialGameState);

  // Test moving up beyond top boundary
  let newGameState = movePlayer(initialGameState, 'ArrowUp', mockGetTile);
  assert.strictEqual(newGameState.player.y, 0, 'Player Y should be clamped at 0 when moving up');

  // Test moving down beyond bottom boundary
  const gameStateAtBottom = createMockGameState(initialPlayerX, CHUNK_HEIGHT - 1, initialChunkX, initialChunkY);
  newGameState = movePlayer(gameStateAtBottom, 'ArrowDown', mockGetTile);
  assert.strictEqual(newGameState.player.y, CHUNK_HEIGHT - 1, 'Player Y should be clamped at CHUNK_HEIGHT - 1 when moving down');
});

test('player moves across chunk boundary updates currentChunkX', () => {
  const initialPlayerX = CHUNK_WIDTH - 1; // At the right edge of chunk 0
  const initialPlayerY = 5;
  const initialChunkX = 0;
  const initialChunkY = 0;

  const mockTiles = {}; // All tiles are walkable
  const initialGameState = createMockGameState(initialPlayerX, initialPlayerY, initialChunkX, initialChunkY);
  const mockGetTile = createMockGetTileFunction(mockTiles, initialGameState);

  const eventKey = 'ArrowRight';

  const newGameState = movePlayer(initialGameState, eventKey, mockGetTile);

  assert.strictEqual(newGameState.player.x, CHUNK_WIDTH, 'Player X should be CHUNK_WIDTH');
  assert.strictEqual(newGameState.currentChunk.x, 1, 'Chunk X should be 1');
});
