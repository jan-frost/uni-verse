import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { toggleInventory, updateInventory, getIsInventoryOpen, __test__resetInventory } from './inventory.js';
import { movePlayer } from './player-movement.js';
import { TILES } from './tiles.js';
import { FakeStorage } from './storage.js';

let dom;

beforeEach(() => {
  dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.document = dom.window.document;
  global.window = dom.window;
  __test__resetInventory();
});

afterEach(() => {
  dom.window.close();
});

// Helper to create a mock initial game state
const createMockGameState = (playerX, playerY, currentChunkX, currentChunkY, chunks = new Map(), inventory = {}) => ({
  seed: 123,
  playerName: 'Tester',
  player: { x: playerX, y: playerY },
  currentChunk: { x: currentChunkX, y: currentChunkY },
  chunks: chunks,
  inventory: inventory,
  noise: {
    worldNoise: { get: () => 0.5 }, // Mock noise objects with a get method
    worldCaveNoise: { get: () => 0.5 }
  }, // Mock noise objects
});

// Helper to create a mock getTileFunction that returns [tile, gameState]
const createMockGetTileFunction = (mockTiles) => (gameState, x, y) => {
  const tileKey = `${x},${y}`;
  const tile = mockTiles[tileKey] || TILES.AIR; // Default to AIR if not specified
  return [tile, gameState]; // For tests, we assume getTile doesn't change the gameState
};

test('toggleInventory creates and shows inventory element', () => {
  const gameState = {
    playerName: 'Tester',
    inventory: { DIRT: 10, GRASS: 5 },
  };

  // Initially, no inventory element
  assert.strictEqual(document.querySelector('div'), null, 'No inventory div should exist initially');

  // First toggle: create and show
  toggleInventory(gameState);
  const inventoryElement = document.querySelector('div');
  assert.ok(inventoryElement, 'Inventory div should be created');
  assert.strictEqual(inventoryElement.style.display, 'block', 'Inventory should be displayed');
  assert.ok(inventoryElement.innerHTML.includes('Tester\'s Inventory'), 'Should show player name');
  assert.ok(inventoryElement.innerHTML.includes('DIRT: 10'), 'Should show DIRT count');
  assert.ok(inventoryElement.innerHTML.includes('GRASS: 5'), 'Should show GRASS count');

  // Second toggle: hide
  toggleInventory(gameState);
  assert.strictEqual(inventoryElement.style.display, 'none', 'Inventory should be hidden');
});

test('updateInventory handles empty inventory', () => {
  const gameState = {
    playerName: 'Tester',
    inventory: {},
  };

  toggleInventory(gameState);
  updateInventory(gameState);

  const inventoryElement = document.querySelector('div');
  assert.ok(inventoryElement.innerHTML.includes('Inventory is empty.'), 'Should show empty message');
});

test('updateInventory correctly displays tile symbols and colors', () => {
  const gameState = {
    playerName: 'Tester',
    inventory: { DIRT: 1 },
  };

  toggleInventory(gameState);
  updateInventory(gameState);

  const inventoryElement = document.querySelector('div');
  const dirtTileInfo = TILES.DIRT;
  const expectedSymbolHtml = `<span style="color: ${dirtTileInfo.fg}; background-color: ${dirtTileInfo.bg};">${dirtTileInfo.symbol}</span>`;

  assert.ok(inventoryElement.innerHTML.includes(expectedSymbolHtml), 'Should display tile symbol with correct styling');
});

test('movement closes inventory', async () => {
    const initialPlayerX = 5;
    const initialPlayerY = 5;
    const initialChunkX = 0;
    const initialChunkY = 0;

    const mockTiles = {
        '6,5': TILES.AIR, // Target tile is walkable
    };

    const initialGameState = createMockGameState(initialPlayerX, initialPlayerY, initialChunkX, initialChunkY, new Map(), { DIRT: 1});
    const mockGetTile = createMockGetTileFunction(mockTiles, initialGameState);

    const eventKey = 'ArrowRight';

    // Open inventory
    toggleInventory(initialGameState);
    assert.strictEqual(getIsInventoryOpen(), true, 'Inventory should be open initially');

    // Move player
    await movePlayer(initialGameState, eventKey, mockGetTile, new FakeStorage());

    // Check if inventory is closed
    assert.strictEqual(getIsInventoryOpen(), false, 'Inventory should be closed after movement');
});