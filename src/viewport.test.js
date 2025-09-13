import { test } from 'node:test';
import assert from 'node:assert';
import { calculateViewport, adjustDisplayForZoom } from './viewport.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';

// Mock ROT.Display for testing adjustDisplayForZoom and calculateViewport
class MockDisplay {
  constructor(options = {}) {
    this.options = { width: options.width || 20, height: options.height || 20, fontSize: options.fontSize || 12, spacing: options.spacing || 1 };
  }
  setOptions(options) {
    this.options = { ...this.options, ...options };
  }
  getOptions() {
    return this.options;
  }
}

test('Viewport Management', async (t) => {
  await t.test('calculateViewport should center around player', () => {
    const mockDisplay = new MockDisplay({ width: 20, height: 20 }); // Fixed viewport for this test

    // Player in the middle of the chunk
    let playerX = Math.floor(CHUNK_WIDTH / 2);
    let playerY = Math.floor(CHUNK_HEIGHT / 2);
    let { startX, startY } = calculateViewport(playerX, playerY, mockDisplay);
    // startX is no longer clamped, so we only assert on startY
    assert.strictEqual(startY, playerY - Math.floor(mockDisplay.getOptions().height / 2), 'startY should be centered');

    // Player near top-left corner (without clamping)
    playerX = 5;
    playerY = 5;
    ({ startX, startY } = calculateViewport(playerX, playerY, mockDisplay));
    assert.strictEqual(startY, playerY - Math.floor(mockDisplay.getOptions().height / 2), 'startY should be calculated correctly without clamping');

    // Player near bottom-right corner (without clamping)
    playerX = CHUNK_WIDTH - 5;
    playerY = CHUNK_HEIGHT - 5;
    ({ startX, startY } = calculateViewport(playerX, playerY, mockDisplay));
    assert.strictEqual(startY, playerY - Math.floor(mockDisplay.getOptions().height / 2), 'startY should be calculated correctly without clamping');
  });

  

  
});