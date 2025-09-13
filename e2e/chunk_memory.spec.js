import { test, expect } from '@playwright/test';

test('chunk memory management should work correctly on player movement', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  // Get initial screenshot
  const initialScreenshot = await page.screenshot();

  // Move player right to cross a chunk boundary
  // Assuming CHUNK_WIDTH is 50, moving 50 steps right should cross a chunk boundary
  for (let i = 0; i < 55; i++) { // Move a bit more than a chunk width to ensure crossing
    await page.keyboard.press('ArrowRight');
  }

  // Take screenshot after moving
  const afterMoveScreenshot = await page.screenshot();

  // Assert that the screenshot has changed (indicating new chunks are rendered)
  expect(afterMoveScreenshot).not.toEqual(initialScreenshot);

  // Move player left to cross back a chunk boundary
  for (let i = 0; i < 55; i++) {
    await page.keyboard.press('ArrowLeft');
  }

  // Take screenshot after moving back
  const afterMoveBackScreenshot = await page.screenshot();

  // Assert that the screenshot has changed again
  expect(afterMoveBackScreenshot).not.toEqual(afterMoveScreenshot);

  // Optionally, take screenshots for visual inspection
  await page.screenshot({ path: 'e2e/chunk_memory_after_right_move.png' });
  await page.screenshot({ path: 'e2e/chunk_memory_after_left_move.png' });
});