import { TILES } from './tiles.js';

export let inventoryElement = null;
export let isInventoryOpen = false;

export function __test__resetInventory() {
    inventoryElement = null;
    isInventoryOpen = false;
    const inventoryDiv = document.querySelector('div');
    if (inventoryDiv) {
        inventoryDiv.remove();
    }
}

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

export function toggleInventory(gameState, selectItemCallback) {
    if (!inventoryElement) {
        inventoryElement = createInventoryElement();
    }

    isInventoryOpen = !isInventoryOpen;
    inventoryElement.style.display = isInventoryOpen ? 'block' : 'none';

    if (isInventoryOpen) {
        updateInventory(gameState, selectItemCallback);
    }
}

export function updateInventory(gameState, selectItemCallback) {
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
                content += `<li><button class="inventory-item" data-tile-type="${tileType}"><span style="color: ${tileInfo.fg}; background-color: ${tileInfo.bg};">${tileInfo.symbol}</span> ${tileType}: ${count}</button></li>`;
            }
        }
        content += '</ul>';
    }

    inventoryElement.innerHTML = content;

    inventoryElement.querySelectorAll('.inventory-item').forEach(button => {
        button.addEventListener('click', (event) => {
            const tileType = event.currentTarget.dataset.tileType;
            selectItemCallback(tileType);
            closeInventory();
        });
    });
}

export function closeInventory() {
    if (inventoryElement) {
        inventoryElement.style.display = 'none';
    }
    isInventoryOpen = false;
}

export function getIsInventoryOpen() {
    return isInventoryOpen;
}

