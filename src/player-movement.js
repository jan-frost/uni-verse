export const handlePlayerMovement = ({ playerX, playerY, currentChunkX, currentChunkY, CHUNK_WIDTH, CHUNK_HEIGHT, getTile, manageChunkMemory, loadedChunks, display, drawGame, eventKey }) => {
    const oldPlayerX = playerX;
    const oldPlayerY = playerY;
    const oldChunkX = currentChunkX;

    let newPlayerX = playerX;
    let newPlayerY = playerY;

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
    const targetTile = getTile(newPlayerX, newPlayerY);
    if (targetTile && targetTile.isWalkable) {
        playerX = newPlayerX;
        playerY = newPlayerY;
    }

    // Clamp playerY to world boundaries
    playerY = Math.max(0, Math.min(playerY, CHUNK_HEIGHT - 1));

    // Update currentChunkX based on playerX
    currentChunkX = Math.floor(playerX / CHUNK_WIDTH);

    // Manage chunk memory if chunk changed
    if (currentChunkX !== oldChunkX) {
        manageChunkMemory(currentChunkX, currentChunkY, loadedChunks, getChunk);
    }

    // Redraw if player moved
    if (playerX !== oldPlayerX || playerY !== oldPlayerY) {
        drawGame(playerX, playerY, currentChunkX, currentChunkY, display);
    }

    return { newPlayerX: playerX, newPlayerY: playerY, newCurrentChunkX: currentChunkX, newCurrentChunkY: currentChunkY };
};
