import { CHUNK_WIDTH, CHUNK_HEIGHT } from './config.js';
import { manageChunkMemory } from './world.js';

/**
 * Calculates the new game state after a player movement.
 * @param {GameState} currentGameState - The current immutable game state.
 * @param {string} eventKey - The key pressed (e.g., 'ArrowLeft').
 * @param {function(GameState, number, number): [Object, GameState]} getTileFunction - Function to get tile information, returning [tile, newGameState].
 * @returns {GameState} A new immutable game state after the movement.
 */
export const movePlayer = (currentGameState, eventKey, getTileFunction) => {
    let { player, currentChunk } = currentGameState;
    let newPlayerX = player.x;
    let newPlayerY = player.y;

    switch (eventKey) {
        case 'ArrowLeft':
            newPlayerX--;
            break;
        case 'ArrowRight':
            newPlayerX++;
            break;
        case 'ArrowUp':
            newPlayerY--;
            break;
            case 'ArrowDown':
            newPlayerY++;
            break;
    }

    // Collision detection
    let [targetTile, updatedGameStateFromGetTile] = getTileFunction(currentGameState, newPlayerX, newPlayerY);
    // Use the updatedGameStateFromGetTile for subsequent calculations in this function
    // This ensures that if getTile generated a chunk, we are working with the most up-to-date state.
    let tempGameState = updatedGameStateFromGetTile;

    let finalPlayer = { ...player }; // Start with current player position
    if (targetTile && targetTile.isWalkable) {
        finalPlayer = { x: newPlayerX, y: newPlayerY };
    }

    // Clamp playerY to world boundaries
    finalPlayer = { ...finalPlayer, y: Math.max(0, Math.min(finalPlayer.y, CHUNK_HEIGHT - 1)) };

    // Update currentChunkX based on playerX
    const newCurrentChunkX = Math.floor(finalPlayer.x / CHUNK_WIDTH);
    const newCurrentChunkY = currentChunk.y; // Y remains fixed for now

    let nextGameState = { ...tempGameState, player: finalPlayer, currentChunk: { x: newCurrentChunkX, y: newCurrentChunkY } };

    // If chunk changed, manage chunk memory
    if (newCurrentChunkX !== currentChunk.x) {
        nextGameState = manageChunkMemory(nextGameState);
    }

    return nextGameState;
};
