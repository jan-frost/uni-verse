
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handlePlayerMovement } from './player-movement.js';
import { TILES } from './tiles.js';

test('player can move into walkable tiles', () => {
  const playerX = 5;
  const playerY = 5;
  const currentChunkX = 0;
  const currentChunkY = 0;
  const CHUNK_WIDTH = 16;
  const CHUNK_HEIGHT = 64;
  const loadedChunks = new Map();

  const getTile = (x, y) => {
    if (x === 6 && y === 5) {
      return TILES.WATER;
    }
    return TILES.AIR;
  };

  const manageChunkMemory = () => {};
  const drawGame = () => {};

  const eventKey = 'ArrowRight';

  const { playerX: newPlayerX } = handlePlayerMovement({
    playerX,
    playerY,
    currentChunkX,
    currentChunkY,
    CHUNK_WIDTH,
    CHUNK_HEIGHT,
    getTile,
    manageChunkMemory,
    loadedChunks,
    display: null,
    drawGame,
    eventKey,
  });

  assert.strictEqual(newPlayerX, 6);
});
