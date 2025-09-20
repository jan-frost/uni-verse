import { test, expect } from '@playwright/test';

test('map should render correctly', async ({ page }) => {
  await page.goto('/');

  // The main canvas is replaced by the rot.js canvas, which doesn't have an id
  const canvas = page.locator('canvas').first();
  await expect(canvas).toBeVisible();

  // Check that the canvas has a size
  const boundingBox = await canvas.boundingBox();
  expect(boundingBox.width).toBeGreaterThan(0);
  expect(boundingBox.height).toBeGreaterThan(0);

  // Take a screenshot for visual inspection
  await page.screenshot({ path: 'e2e/map_screenshot.png' });
});
