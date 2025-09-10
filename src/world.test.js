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

    // Check for some air tiles below the mid-point (indicating a varied ground level)
    const airBelowMidpoint = chunk.tiles.filter((tile, index) => {
      const y = Math.floor(index / CHUNK_WIDTH);
      return y >= CHUNK_HEIGHT / 2 && tile && tile.type === 'air';
    });
    assert.ok(airBelowMidpoint.length > 0, 'should have some air tiles below midpoint');

    // Check for some ground tiles above the mid-point (indicating a varied ground level)
    const groundAboveMidpoint = chunk.tiles.filter((tile, index) => {
      const y = Math.floor(index / CHUNK_WIDTH);
      return y < CHUNK_HEIGHT / 2 && tile && tile.type === 'ground';
    });
    assert.ok(groundAboveMidpoint.length > 0, 'should have some ground tiles above midpoint');
  });

  test('should generate different biomes based on noise', () => {
    const chunk = generateChunk({ seed: 42 });

    const forestTiles = chunk.tiles.filter(tile => tile && tile.biome === 'forest');
    const desertTiles = chunk.tiles.filter(tile => tile && tile.biome === 'desert');

    assert.ok(forestTiles.length > 0, 'should have some forest tiles');
    assert.ok(desertTiles.length > 0, 'should have some desert tiles');
  });

  test('should generate caves within ground areas', () => {
    const chunk = generateChunk({ seed: 42 });

    // Check for air tiles that are below the surface and not part of the main sky
    const caveAirTiles = chunk.tiles.filter((tile, index) => {
      const x = index % CHUNK_WIDTH;
      const y = Math.floor(index / CHUNK_WIDTH);

      // Get the surface height for this column
      let surfaceHeight = CHUNK_HEIGHT; // Default to bottom if no ground found
      for (let i = 0; i < CHUNK_HEIGHT; i++) {
        const currentTile = chunk.tiles[i * CHUNK_WIDTH + x];
        if (currentTile && currentTile.type === 'ground') {
          surfaceHeight = i;
          break;
        }
      }

      // If the tile is air and its y-coordinate is below the surface height, it's a potential cave air tile
      return tile && tile.type === 'air' && y > surfaceHeight;
    });

    assert.ok(caveAirTiles.length > 0, 'should have some air tiles within ground areas (caves)');
  });

  test('should place structures like trees on the surface', () => {
    const chunk = generateChunk({ seed: 42 });

    const woodTiles = chunk.tiles.filter(tile => tile && tile.type === 'wood');
    const leafTiles = chunk.tiles.filter(tile => tile && tile.type === 'leaf');

    assert.ok(woodTiles.length > 0, 'should have some wood tiles');
    assert.ok(leafTiles.length > 0, 'should have some leaf tiles');

    // Further checks could include: are they on the surface? are they in a tree-like shape?
    // For now, just checking for existence.
  });
});