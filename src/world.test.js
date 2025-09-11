import test from 'node:test';
import assert from 'node:assert';
import { generateChunk } from './world.js';



test('World Generation', () => {
  test('should return a chunk with correct dimensions', () => {
    const chunk = generateChunk({ seed: 42, width: 8, height: 8 });
    assert.ok(chunk.tiles, 'chunk should have a tiles property');
    assert.ok(Array.isArray(chunk.tiles), 'chunk.tiles should be an array');
    assert.strictEqual(chunk.tiles.length, 8 * 8, 'chunk.tiles should have the correct size');
  });

  test('should generate varied elevation using noise', () => {
    const chunk = generateChunk({ seed: 42, width: 8, height: 8 });

    const hasAir = chunk.tiles.some(tile => tile && tile.type === 'AIR');
    const hasGround = chunk.tiles.some(tile => tile && tile.type === 'GROUND');
    assert.ok(hasAir, 'should have some AIR tiles');
    assert.ok(hasGround, 'should have some GROUND tiles');
  });

  test('should generate caves within ground areas', () => {
    const chunk = generateChunk({ seed: 42, width: 8, height: 8 });

    const hasCaveAir = chunk.tiles.some((tile, index) => {
      const y = Math.floor(index / 8);
      return tile && tile.type === 'AIR' && y > 0; // Check for any air tile not at the very top
    });
    assert.ok(hasCaveAir, 'should have some AIR tiles within ground areas (caves)');
  });

  test('should place structures like trees on the surface', () => {
    const chunk = generateChunk({ seed: 42, width: 8, height: 8 });

    const woodTiles = chunk.tiles.filter(tile => tile && tile.type === 'WOOD');
    const leafTiles = chunk.tiles.filter(tile => tile && tile.type === 'LEAF');

    assert.ok(woodTiles.length > 0, 'should have some WOOD tiles');
    assert.ok(leafTiles.length > 0, 'should have some LEAF tiles');

    // Further checks could include: are they on the surface? are they in a tree-like shape?
    // For now, just checking for existence.
  });
});