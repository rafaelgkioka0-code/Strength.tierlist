// Minecraft items data
const minecraftItems = [
    '⛏️', '⚔️', '🗡️', '🛡️', '🏹', '🪨', '🪵', '🌾',
    '🍎', '🥩', '🍖', '🥕', '🍞', '🧈', '🧀', '🍪',
    '💎', '🔷', '🟦', '🟧', '⬛', '⬜', '🟨', '🟩',
    '🔥', '❄️', '💧', '⚡', '🌪️', '💨', '🌊', '🌋',
    '🐎', '🐑', '🐂', '🐖', '🐔', '🐙', '🦟', '🐈',
    '🧟', '💀', '👻', '🕷️', '🦂', '🐉', '🦎', '🦗',
    '🌲', '🌳', '🌴', '🎋', '🎍', '🌿', '☘️', '🍄',
    '🏠', '🏰', '🏯', '🏛️', '⛩️', '🕌', '📖', '📚'
];

let draggedItem = null;
let draggedFrom = null;
let isOwner = false;

// Owner password (change this to your desired password)
const OWNER_PASSWORD = 'owner123';

// Initialize the tierlist
function init() {
    loadItems();
    setupDragAndDrop();
    loadFromStorage();
    checkOwnerStatus();
}

// Check if user is authenticated as owner
function checkOwnerStatus() {
    const ownerAuth = localStorage.getItem('ownerAuthenticated');
    isOwner = ownerAuth === 'true';
    updateRemovePlayerButtonVisibility();
}

// Update Remove Player button visibility
function updateRemovePlayerButtonVisibility() {
    const removeBtn = document.getElementById('removePlayerBtn');
    if (removeBtn) {
        removeBtn.style.display = isOwner ? 'inline-block' : 'none';
    }
}

// Owner login function
function ownerLogin() {
    const password = prompt('Enter owner password:');
    if (password === OWNER_PASSWORD) {
        isOwner = true;
        localStorage.setItem('ownerAuthenticated', 'true');
        updateRemovePlayerButtonVisibility();
        alert('Owner authenticated! Remove Player button is now visible.');
    } else {
        alert('Incorrect password!');
        isOwner = false;
        localStorage.removeItem('ownerAuthenticated');
        updateRemovePlayerButtonVisibility();
    }
}

// Owner logout function
function ownerLogout() {
    isOwner = false;
    localStorage.removeItem('ownerAuthenticated');
    updateRemovePlayerButtonVisibility();
    alert('Logged out from owner mode.');
}

// Toggle owner mode
function toggleOwnerMode() {
    if (isOwner) {
        ownerLogout();
    } else {
        ownerLogin();
    }
}

// Load items into the pool
function loadItems() {
    const container = document.getElementById('itemsContainer');
    container.innerHTML = '';
    
    minecraftItems.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'item';
        itemEl.textContent = item;
        itemEl.draggable = true;
        itemEl.id = `item-${index}`;
        
        itemEl.addEventListener('dragstart', handleDragStart);
        itemEl.addEventListener('dragend', handleDragEnd);
        
        container.appendChild(itemEl);
    });
}

// Setup drag and drop for tier items
function setupDragAndDrop() {
    document.querySelectorAll('.tier-items').forEach(tier => {
        tier.addEventListener('dragover', handleDragOver);
        tier.addEventListener('drop', handleDrop);
        tier.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    draggedItem = this;
    draggedFrom = this.parentElement;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.tier-items').forEach(tier => {
        tier.style.backgroundColor = '';
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.style.backgroundColor = 'rgba(102, 126, 234, 0.2)';
}

function handleDragLeave(e) {
    if (e.target === this) {
        this.style.backgroundColor = '';
    }
}

function handleDrop(e) {
    e.preventDefault();
    this.style.backgroundColor = '';
    
    if (draggedItem) {
        const newItem = draggedItem.cloneNode(true);
        newItem.classList.remove('dragging');
        newItem.draggable = true;
        newItem.addEventListener('dragstart', handleDragStart);
        newItem.addEventListener('dragend', handleDragEnd);
        
        // Add close button to tier items
        const closeBtn = document.createElement('div');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            newItem.remove();
            saveToStorage();
        };
        newItem.appendChild(closeBtn);
        
        this.appendChild(newItem);
        saveToStorage();
    }
}

// Add player function
document.getElementById('addPlayerBtn')?.addEventListener('click', () => {
    const playerEmoji = prompt('Enter player emoji or text:');
    if (playerEmoji) {
        const itemEl = document.createElement('div');
        itemEl.className = 'item';
        itemEl.textContent = playerEmoji;
        itemEl.draggable = true;
        
        itemEl.addEventListener('dragstart', handleDragStart);
        itemEl.addEventListener('dragend', handleDragEnd);
        
        document.getElementById('itemsContainer').appendChild(itemEl);
    }
});

// Remove player function (Owner only)
document.getElementById('removePlayerBtn')?.addEventListener('click', () => {
    if (!isOwner) {
        alert('Only owner can remove players!');
        return;
    }
    
    const playerToRemove = prompt('Enter the player emoji/text to remove from all tiers:');
    if (playerToRemove) {
        let removed = false;
        document.querySelectorAll('.tier-items').forEach(tier => {
            const items = tier.querySelectorAll('.tier-item');
            items.forEach(item => {
                if (item.textContent.includes(playerToRemove)) {
                    item.remove();
                    removed = true;
                }
            });
        });
        
        if (removed) {
            saveToStorage();
            alert(`Successfully removed "${playerToRemove}" from all tiers.`);
        } else {
            alert(`"${playerToRemove}" not found in any tier.`);
        }
    }
});

// Clear all players from all tiers
function clearAllPlayers() {
    if (confirm('Are you sure you want to remove all players from all tiers?')) {
        document.querySelectorAll('.tier-items').forEach(tier => {
            tier.innerHTML = '';
        });
        localStorage.removeItem('tierlist');
        console.log('All players removed from tiers');
    }
}

// Reset tierlist
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the tierlist?')) {
        document.querySelectorAll('.tier-items').forEach(tier => {
            tier.innerHTML = '';
        });
        localStorage.removeItem('tierlist');
    }
});

// Export as image
document.getElementById('exportBtn').addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;
    
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 24px Arial';
    const title = document.getElementById('tierlistTitle').value || 'My Minecraft Tierlist';
    ctx.fillText(title, 20, 40);
    
    // Draw tiers
    const tierLabels = ['S', 'A', 'B', 'C', 'D', 'F'];
    const tiers = document.querySelectorAll('.tier-items');
    let y = 80;
    
    tiers.forEach((tier, index) => {
        const items = tier.querySelectorAll('.item, .tier-item');
        
        // Draw tier label
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(tierLabels[index], 20, y + 30);
        
        // Draw tier items (simplified)
        let x = 80;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        
        items.forEach(() => {
            ctx.fillRect(x, y, 50, 50);
            ctx.strokeRect(x, y, 50, 50);
            x += 60;
        });
        
        y += 70;
    });
    
    // Download
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'tierlist.png';
    link.click();
});

// Local storage functions
function saveToStorage() {
    const tierlist = {};
    document.querySelectorAll('.tier-items').forEach(tier => {
        const tierName = tier.dataset.tier;
        tierlist[tierName] = Array.from(tier.querySelectorAll('.item, .tier-item'))
            .map(item => item.textContent.replace('×', '').trim());
    });
    localStorage.setItem('tierlist', JSON.stringify(tierlist));
}

function loadFromStorage() {
    const saved = localStorage.getItem('tierlist');
    if (saved) {
        const tierlist = JSON.parse(saved);
        Object.entries(tierlist).forEach(([tierName, items]) => {
            const tierEl = document.querySelector(`[data-tier="${tierName}"]`);
            items.forEach(itemText => {
                const itemEl = document.createElement('div');
                itemEl.className = 'tier-item';
                itemEl.textContent = itemText;
                itemEl.draggable = true;
                itemEl.addEventListener('dragstart', handleDragStart);
                itemEl.addEventListener('dragend', handleDragEnd);
                
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-btn';
                closeBtn.innerHTML = '&times;';
                closeBtn.onclick = (e) => {
                    e.stopPropagation();
                    itemEl.remove();
                    saveToStorage();
                };
                itemEl.appendChild(closeBtn);
                
                tierEl.appendChild(itemEl);
            });
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
