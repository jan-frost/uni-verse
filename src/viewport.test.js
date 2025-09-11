import { test } from 'node:test';
import assert from 'node:assert';
import { adjustDisplayForZoom, getInitialViewportSettings } from './viewport.js';

// Mock ROT.Display for testing adjustDisplayForZoom
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