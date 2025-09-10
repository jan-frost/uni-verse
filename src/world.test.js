import test from 'node:test';
import assert from 'node:assert';
import { generateChunk } from './world.js';

import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';

test('World Generation', () => {
  test('should return a chunk with correct dimensions', () => {
    const chunk = generateChunk({ seed: 42 });
    assert.ok(chunk.tiles, 'chunk should have a tiles property');
    assert.ok(Array.isArray(chunk.tiles), 'chunk.tiles should be an array');
    assert.strictEqual(chunk.tiles.length, CHUNK_WIDTH * CHUNK_HEIGHT, 'chunk.tiles should have the correct size');
  });

  test('should generate varied elevation using noise', () => {
    const chunk = generateChunk({ seed: 42 });

    // Check for some AIR tiles below the mid-point (indicating a varied ground level)
    const airBelowMidpoint = chunk.tiles.filter((tile, index) => {
      const y = Math.floor(index / CHUNK_WIDTH);
      return y >= CHUNK_HEIGHT / 2 && tile && tile.type === 'AIR';
    });
    assert.ok(airBelowMidpoint.length > 0, 'should have some AIR tiles below midpoint');

    // Check for some GROUND tiles above the mid-point (indicating a varied ground level)
    const groundAboveMidpoint = chunk.tiles.filter((tile, index) => {
      const y = Math.floor(index / CHUNK_WIDTH);
      return y < CHUNK_HEIGHT / 2 && tile && tile.type === 'GROUND';
    });
    assert.ok(groundAboveMidpoint.length > 0, 'should have some GROUND tiles above midpoint');
  });

  test('should generate caves within ground areas', () => {
    const chunk = generateChunk({ seed: 42 });

    // Check for AIR tiles that are below the surface and not part of the main sky
    const caveAirTiles = chunk.tiles.filter((tile, index) => {
      const x = index % CHUNK_WIDTH;
      const y = Math.floor(index / CHUNK_WIDTH);

      // Get the surface height for this column
      let surfaceHeight = CHUNK_HEIGHT; // Default to bottom if no ground found
      for (let i = 0; i < CHUNK_HEIGHT; i++) {
        const currentTile = chunk.tiles[i * CHUNK_WIDTH + x];
        if (currentTile && currentTile.type === 'GROUND') {
          surfaceHeight = i;
          break;
        }
      }

      // If the tile is AIR and its y-coordinate is below the surface height, it's a potential cave AIR tile
      return tile && tile.type === 'AIR' && y > surfaceHeight;
    });

    assert.ok(caveAirTiles.length > 0, 'should have some AIR tiles within ground areas (caves)');
  });

  test('should place structures like trees on the surface', () => {
    const chunk = generateChunk({ seed: 42 });

    const woodTiles = chunk.tiles.filter(tile => tile && tile.type === 'WOOD');
    const leafTiles = chunk.tiles.filter(tile => tile && tile.type === 'LEAF');

    assert.ok(woodTiles.length > 0, 'should have some WOOD tiles');
    assert.ok(leafTiles.length > 0, 'should have some LEAF tiles');

    // Further checks could include: are they on the surface? are they in a tree-like shape?
    // For now, just checking for existence.
  });
});