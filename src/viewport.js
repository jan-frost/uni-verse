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

  const clampedViewportWidth = Math.max(10, calculatedViewportWidth);
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