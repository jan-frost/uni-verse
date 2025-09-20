import * as ROT from 'rot-js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';

/**
 * Represents the immutable state of the game.
 * @typedef {Object} GameState
 * @property {number} seed - The world generation seed.
 * @property {string} playerName - The player's name.
 * @property {object} inventory - The player's inventory.
 * @property {string | null} selectedItem - The tile type of the selected item.
 * @property {{x: number, y: number}} player - The player's world coordinates.
 * @property {{x: number, y: number}} currentChunk - The chunk coordinates the player is currently in.
 * @property {Map<string, Object>} chunks - A map of loaded chunks, keyed by "chunkX,chunkY".
 * @property {Object} noise - Noise instances for world generation.
 * @property {ROT.Noise.Simplex} noise.worldNoise - Simplex noise for terrain.
 * @property {ROT.Noise.Simplex} noise.worldCaveNoise - Simplex noise for caves.
 */

/**
 * Creates the initial game state.
 * @param {URLSearchParams} urlParams - URL parameters for initial state.
 * @returns {GameState} The initial immutable game state.
 */
export function createInitialState(urlParams, playerName, inventory) {
    let seed = urlParams.has('seed') ? parseInt(urlParams.get('seed')) : Date.now();
    seed = (seed % 65536) + 1; // Ensure seed is within range and not 0

    ROT.RNG.setSeed(seed);

    const worldNoise = new ROT.Noise.Simplex(seed);
    const worldCaveNoise = new ROT.Noise.Simplex(seed + 2);

    const initialChunkX = parseInt(urlParams.get('chunkx')) || 0;
    const initialChunkY = 0; // Fixed for horizontal scrolling

    // Player position will be set relative to the initial chunk later in main.js
    // For now, we'll initialize it to 0,0 and let the display calculation adjust it.
    const initialPlayerX = (initialChunkX * CHUNK_WIDTH);
    const initialPlayerY = Math.floor(CHUNK_HEIGHT / 2);

    return {
        seed,
        playerName,
        inventory,
        selectedItem: null,
        player: { x: initialPlayerX, y: initialPlayerY },
        currentChunk: { x: initialChunkX, y: initialChunkY },
        chunks: new Map(),
        noise: {
            worldNoise,
            worldCaveNoise
        }
    };
}
