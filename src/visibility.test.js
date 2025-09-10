import { test } from 'node:test';
import assert from 'node:assert';
import { calculateVisibility } from './visibility.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';

test('calculateVisibility', async (t) => {
  await t.test('should make all tiles visible if they are all air', () => {
    const tiles = new Array(CHUNK_WIDTH * CHUNK_HEIGHT).fill({ type: 'AIR' });
    const visibility = calculateVisibility({ tiles });
    assert.ok(visibility.every(v => v === true));
  });

  await t.test('should make no tiles visible if they are all ground', () => {
    const tiles = new Array(CHUNK_WIDTH * CHUNK_HEIGHT).fill({ type: 'GROUND' });
    const visibility = calculateVisibility({ tiles });
    assert.ok(visibility.every(v => v === false));
  });

  await t.test('should make air and its neighbors visible', () => {
    const tiles = new Array(CHUNK_WIDTH * CHUNK_HEIGHT).fill({ type: 'GROUND' });
    const airIndex = CHUNK_WIDTH + 1; // An index not on the edge
    tiles[airIndex] = { type: 'AIR' };
    const visibility = calculateVisibility({ tiles });

    // The air tile itself should be visible
    assert.strictEqual(visibility[airIndex], true);

    // The neighbors of the air tile should be visible
    assert.strictEqual(visibility[airIndex - 1], true, 'left neighbor');
    assert.strictEqual(visibility[airIndex + 1], true, 'right neighbor');
    assert.strictEqual(visibility[airIndex - CHUNK_WIDTH], true, 'top neighbor');
    assert.strictEqual(visibility[airIndex + CHUNK_WIDTH], true, 'bottom neighbor');
  });

  await t.test('should not make diagonal tiles visible', () => {
    const tiles = new Array(CHUNK_WIDTH * CHUNK_HEIGHT).fill({ type: 'GROUND' });
    const airIndex = CHUNK_WIDTH + 1;
    tiles[airIndex] = { type: 'AIR' };
    const visibility = calculateVisibility({ tiles });

    assert.strictEqual(visibility[airIndex - CHUNK_WIDTH - 1], false, 'top-left neighbor');
    assert.strictEqual(visibility[airIndex - CHUNK_WIDTH + 1], false, 'top-right neighbor');
    assert.strictEqual(visibility[airIndex + CHUNK_WIDTH - 1], false, 'bottom-left neighbor');
    assert.strictEqual(visibility[airIndex + CHUNK_WIDTH + 1], false, 'bottom-right neighbor');
  });

  await t.test('should make tree parts visible if touching air', () => {
    // Create a small chunk with a tree and some air
    const tiles = new Array(CHUNK_WIDTH * CHUNK_HEIGHT).fill({ type: 'GROUND' });

    // Place a 3x3 tree (wood and leaves)
    const treeX = 5;
    const treeY = 5;

    // Trunk
    tiles[treeY * CHUNK_WIDTH + treeX] = { type: 'WOOD' };
    tiles[(treeY - 1) * CHUNK_WIDTH + treeX] = { type: 'WOOD' };

    // Leaves
    for (let ly = treeY - 3; ly <= treeY - 2; ly++) {
      for (let lx = treeX - 1; lx <= treeX + 1; lx++) {
        if (lx >= 0 && lx < CHUNK_WIDTH && ly >= 0 && ly < CHUNK_HEIGHT) {
          tiles[ly * CHUNK_WIDTH + lx] = { type: 'LEAF' };
        }
      }
    }

    // Place an air tile next to a leaf
    const airNeighborX = treeX + 2;
    const airNeighborY = treeY - 2; // Next to a leaf
    tiles[airNeighborY * CHUNK_WIDTH + airNeighborX] = { type: 'AIR' };

    const visibility = calculateVisibility({ tiles });

    // Assert that all tree parts are visible
    assert.strictEqual(visibility[treeY * CHUNK_WIDTH + treeX], true, 'trunk part 1 visible');
    assert.strictEqual(visibility[(treeY - 1) * CHUNK_WIDTH + treeX], true, 'trunk part 2 visible');

    for (let ly = treeY - 3; ly <= treeY - 2; ly++) {
      for (let lx = treeX - 1; lx <= treeX + 1; lx++) {
        if (lx >= 0 && lx < CHUNK_WIDTH && ly >= 0 && ly < CHUNK_HEIGHT) {
          assert.strictEqual(visibility[ly * CHUNK_WIDTH + lx], true, `leaf at (${lx},${ly}) visible`);
        }
      }
    }
  });

  });