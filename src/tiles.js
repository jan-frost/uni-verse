export const TILES = {
  AIR: { symbol: ' ', fg: '#000000', bg: '#000000', isWalkable: true, isTransparent: true },
  STONE: { symbol: '#', fg: '#808080', bg: '#606060', isWalkable: false, isTransparent: false },
  DIRT: { symbol: '.', fg: '#8B4513', bg: '#5A2D0A', isWalkable: false, isTransparent: false },
  GRASS: { symbol: ', ', fg: '#7CFC00', bg: '#4B8B0B', isWalkable: false, isTransparent: false },
  WATER: { symbol: '~', fg: '#00BFFF', bg: '#0000FF', isWalkable: true, isTransparent: true },
  SAND: { symbol: '.', fg: '#F4A460', bg: '#D2B48C', isWalkable: false, isTransparent: false },
  WOOD: { symbol: '|', fg: '#8B4513', bg: '#5A2D0A', isWalkable: false, isTransparent: false },
  LEAVES: { symbol: '*', fg: '#228B22', bg: '#006400', isWalkable: false, isTransparent: true },
};
