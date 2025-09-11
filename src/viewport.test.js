import { test } from 'node:test';
import assert from 'node:assert';
import { calculateViewport, adjustDisplayForZoom, getInitialViewportSettings } from './viewport.js';
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
  await t.test('calculateViewport should center around player and clamp to world boundaries', () => {
    const mockDisplay = new MockDisplay({ width: 20, height: 20 }); // Fixed viewport for this test

    // Player in the middle of the chunk
    let playerX = Math.floor(CHUNK_WIDTH / 2);
    let playerY = Math.floor(CHUNK_HEIGHT / 2);
    let { startX, startY } = calculateViewport(playerX, playerY, mockDisplay);
    assert.strictEqual(startX, playerX - Math.floor(mockDisplay.getOptions().width / 2), 'startX should be centered');
    assert.strictEqual(startY, playerY - Math.floor(mockDisplay.getOptions().height / 2), 'startY should be centered');

    // Player near top-left corner
    playerX = 5;
    playerY = 5;
    ({ startX, startY } = calculateViewport(playerX, playerY, mockDisplay));
    assert.strictEqual(startX, 0, 'startX should be clamped to 0');
    assert.strictEqual(startY, 0, 'startY should be clamped to 0');

    // Player near bottom-right corner
    playerX = CHUNK_WIDTH - 5;
    playerY = CHUNK_HEIGHT - 5;
    ({ startX, startY } = calculateViewport(playerX, playerY, mockDisplay));
    assert.strictEqual(startX, CHUNK_WIDTH - mockDisplay.getOptions().width, 'startX should be clamped to max');
    assert.strictEqual(startY, CHUNK_HEIGHT - mockDisplay.getOptions().height, 'startY should be clamped to max');
  });

  await t.test('adjustDisplayForZoom should modify fontSize and viewport dimensions', () => {
    const mockDisplay = new MockDisplay();

    // Default zoom (zoomLevel 0)
    let { viewportWidth, viewportHeight } = adjustDisplayForZoom(mockDisplay, 0);
    assert.strictEqual(mockDisplay.options.fontSize, 12, 'Default zoom should set font size to 12');
    assert.strictEqual(viewportWidth, 20, 'Default zoom should set viewportWidth to 20');
    assert.strictEqual(viewportHeight, 20, 'Default zoom should set viewportHeight to 20');

    // Zoom in (zoomLevel 1)
    ({ viewportWidth, viewportHeight } = adjustDisplayForZoom(mockDisplay, 1));
    assert.strictEqual(mockDisplay.options.fontSize, 14, 'Zoom in should increase font size');
    assert.strictEqual(viewportWidth, 18, 'Zoom in should decrease viewportWidth');
    assert.strictEqual(viewportHeight, 18, 'Zoom in should decrease viewportHeight');

    // Zoom out (zoomLevel -1)
    ({ viewportWidth, viewportHeight } = adjustDisplayForZoom(mockDisplay, -1));
    assert.strictEqual(mockDisplay.options.fontSize, 10, 'Zoom out should decrease font size');
    assert.strictEqual(viewportWidth, 22, 'Zoom out should increase viewportWidth');
    assert.strictEqual(viewportHeight, 22, 'Zoom out should increase viewportHeight');

    // Max zoom in (zoomLevel 4, fontSize 20)
    ({ viewportWidth, viewportHeight } = adjustDisplayForZoom(mockDisplay, 4));
    assert.strictEqual(mockDisplay.options.fontSize, 20, 'Max zoom in should clamp font size to 20');
    assert.strictEqual(viewportWidth, 12, 'Max zoom in should clamp viewportWidth'); // 20 - (4*2) = 12
    assert.strictEqual(viewportHeight, 12, 'Max zoom in should clamp viewportHeight');

    // Max zoom out (zoomLevel -5, fontSize 8) -> clamped to -2 for visible tiles
    ({ viewportWidth, viewportHeight } = adjustDisplayForZoom(mockDisplay, -5));
    assert.strictEqual(mockDisplay.options.fontSize, 8, 'Max zoom out should clamp font size to 8');
    assert.strictEqual(viewportWidth, 30, 'Max zoom out should clamp viewportWidth'); // 20 - (-5*2) = 30
    assert.strictEqual(viewportHeight, 30, 'Max zoom out should clamp viewportHeight');
  });

  await t.test('getInitialViewportSettings should return initialZoomLevel', () => {
    const settings = getInitialViewportSettings();
    assert.strictEqual(settings.initialZoomLevel, 0, 'Default initialZoomLevel should be 0');
  });
});