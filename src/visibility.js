import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';

export const calculateVisibility = ({ tiles }) => {
  const visibility = new Array(tiles.length).fill(false);
  const queue = [];

  // First pass: Mark AIR tiles and their direct neighbors as visible
  // Also, identify initial WOOD/LEAF tiles that are adjacent to AIR
  for (let y = 0; y < CHUNK_HEIGHT; y++) {
    for (let x = 0; x < CHUNK_WIDTH; x++) {
      const index = y * CHUNK_WIDTH + x;
      const tile = tiles[index];

      if (tile && tile.type === 'AIR') {
        if (!visibility[index]) {
          visibility[index] = true;
          queue.push({ x, y, type: 'AIR' }); // Add AIR tiles to queue for propagation
        }

        // Check direct neighbors (up, down, left, right)
        const directNeighbors = [
          { dx: -1, dy: 0 }, // Left
          { dx: 1, dy: 0 },  // Right
          { dx: 0, dy: -1 }, // Top
          { dx: 0, dy: 1 },  // Bottom
        ];

        for (const { dx, dy } of directNeighbors) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < CHUNK_WIDTH && ny >= 0 && ny < CHUNK_HEIGHT) {
            const neighborIndex = ny * CHUNK_WIDTH + nx;
            if (!visibility[neighborIndex]) {
              visibility[neighborIndex] = true;
              // If a neighbor is WOOD or LEAF, add it to the queue for tree propagation
              if (tiles[neighborIndex] && (tiles[neighborIndex].type === 'WOOD' || tiles[neighborIndex].type === 'LEAF')) {
                queue.push({ x: nx, y: ny, type: tiles[neighborIndex].type });
              }
            }
          }
        }
      }
    }
  }

  // Second pass: Propagate visibility for WOOD/LEAF tiles using BFS
  let head = 0;
  while (head < queue.length) {
    const { x, y, type } = queue[head++];
    const index = y * CHUNK_WIDTH + x;

    // Only propagate from WOOD/LEAF tiles for tree visibility
    if (type === 'WOOD' || type === 'LEAF') {
      // Check all 8 neighbors (including diagonals)
      const allNeighbors = [
        { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 }, // Top row
        { dx: -1, dy: 0 },                     { dx: 1, dy: 0 },  // Middle row
        { dx: -1, dy: 1 },  { dx: 0, dy: 1 },  { dx: 1, dy: 1 },  // Bottom row
      ];

      for (const { dx, dy } of allNeighbors) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < CHUNK_WIDTH && ny >= 0 && ny < CHUNK_HEIGHT) {
          const neighborIndex = ny * CHUNK_WIDTH + nx;
          const neighborTile = tiles[neighborIndex];

          if (neighborTile && (neighborTile.type === 'WOOD' || neighborTile.type === 'LEAF') && !visibility[neighborIndex]) {
            visibility[neighborIndex] = true;
            queue.push({ x: nx, y: ny, type: neighborTile.type });
          }
        }
      }
    }
  }

  return visibility;
};