import { TILES } from './tiles.js';

let inventoryElement = null;
let isInventoryOpen = false;

function createInventoryElement() {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.top = '50%';
    element.style.left = '50%';
    element.style.transform = 'translate(-50%, -50%)';
    element.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    element.style.border = '2px solid white';
    element.style.color = 'white';
    element.style.padding = '20px';
    element.style.fontFamily = 'monospace';
    element.style.zIndex = '1001';
    element.style.display = 'none';
    document.body.appendChild(element);
    return element;
}

export function toggleInventory(gameState) {
    if (!inventoryElement) {
        inventoryElement = createInventoryElement();
    }

    isInventoryOpen = !isInventoryOpen;
    inventoryElement.style.display = isInventoryOpen ? 'block' : 'none';

    if (isInventoryOpen) {
        updateInventory(gameState);
    }
}

export function updateInventory(gameState) {
    if (!inventoryElement || !isInventoryOpen) {
        return;
    }

    const { playerName, inventory } = gameState;
    let content = `<h2>${playerName}'s Inventory</h2>`;

    if (Object.keys(inventory).length === 0) {
        content += '<p>Inventory is empty.</p>';
    } else {
        content += '<ul>';
        for (const tileType in inventory) {
            const tileInfo = TILES[tileType];
            const count = inventory[tileType];
            if (tileInfo) {
                content += `<li>${tileInfo.symbol} ${tileType}: ${count}</li>`;
            }
        }
        content += '</ul>';
    }

    inventoryElement.innerHTML = content;
}
