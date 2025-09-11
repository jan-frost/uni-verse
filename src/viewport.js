import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';

export const calculateViewport = (playerX, playerY, display) => {
  const viewportWidth = display.getOptions().width;
  const viewportHeight = display.getOptions().height;

  let startX = playerX - Math.floor(viewportWidth / 2);
  let startY = playerY - Math.floor(viewportHeight / 2);

  // Clamp viewport to world boundaries
  startX = Math.max(0, startX);
  startY = Math.max(0, startY);
  startX = Math.min(CHUNK_WIDTH - viewportWidth, startX);
  startY = Math.min(CHUNK_HEIGHT - viewportHeight, startY);

  return { startX, startY };
};

export const adjustDisplayForZoom = (display, zoomLevel) => {
  const baseFontSize = 12;
  const baseSpacing = 1;

  // Calculate font size based on zoom level
  const fontSize = baseFontSize + (zoomLevel * 2);
  const clampedFontSize = Math.max(8, Math.min(20, fontSize));

  // Calculate viewport dimensions based on zoom level
  const baseVisibleTilesX = 20;
  const baseVisibleTilesY = 20;

  const calculatedViewportWidth = baseVisibleTilesX - (zoomLevel * 2);
  const calculatedViewportHeight = baseVisibleTilesY - (zoomLevel * 2);

  const clampedViewportWidth = Math.max(10, Math.min(CHUNK_WIDTH, calculatedViewportWidth));
  const clampedViewportHeight = clampedViewportWidth; // Ensure height is always equal to width for square display


  display.setOptions({
    width: clampedViewportWidth,
    height: clampedViewportHeight,
    fontSize: clampedFontSize,
    spacing: baseSpacing,
  });

  return { viewportWidth: clampedViewportWidth, viewportHeight: clampedViewportHeight };
};

export const getInitialViewportSettings = () => {
  return {
    initialZoomLevel: 0, // Corresponds to baseFontSize and baseVisibleTiles
  };
};