import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';

export const calculateViewport = (playerX, playerY, display) => {
  const viewportWidth = display.getOptions().width;
  const viewportHeight = display.getOptions().height;

  let startX = playerX - Math.floor(viewportWidth / 2);
  let startY = playerY - Math.floor(viewportHeight / 2);

  // No clamping for startY here, as playerY is already clamped

  return { startX, startY };
};

export const adjustDisplayForZoom = (display) => {
  const fixedWidth = 17;
  const fixedHeight = 17;
  const baseSpacing = 1;

  // Calculate the maximum possible font size to fit 17x17 tiles within the window
  const availableWidth = window.innerWidth;
  const availableHeight = window.innerHeight;

  // Determine the smaller dimension to maintain a square aspect ratio for the overall canvas
  const smallerDimension = Math.min(availableWidth, availableHeight);

  // Calculate font size such that 17 tiles fit within the smaller dimension
  // Each tile will have a width and height equal to the fontSize
  const calculatedFontSize = Math.floor(smallerDimension / fixedWidth);

  // Ensure a minimum font size for readability
  const finalFontSize = Math.max(8, calculatedFontSize);

  display.setOptions({
    width: fixedWidth,
    height: fixedHeight,
    fontSize: finalFontSize,
    spacing: baseSpacing,
  });

  return { viewportWidth: fixedWidth, viewportHeight: fixedHeight };
};