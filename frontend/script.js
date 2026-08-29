const API_BASE = 'http://localhost:8080/api';

// State
let soundEnabled = false;
let notifiedMeds = new Set();
let isAIFetching = false;
let allMedicines = []; // Store all medicines for search

// DOM Elements
const grid = document.getElementById('med-grid');
const addBtn = document.getElementById('add-btn');
const refreshBtn = document.getElementById('refresh-btn');
const soundBtn = document.getElementById('sound-btn');
const liveClock = document.getElementById('live-clock');
const emptyState = document.getElementById('empty-state');
const loadingSpinner = document.getElementById('loading-spinner');
const toast = document.getElementById('notification-toast');
const alertSound = document.getElementById('alert-sound');
const searchInput = document.getElementById('search-input');
const symptomBtn = document.getElementById('symptom-btn');
const symptomInput = document.getElementById('symptom-input');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchMedicines();
    startClock();
});

// --- Core Features ---

async function fetchMedicines() {
    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/medicines`);
        if (!response.ok) throw new Error('Network response was not ok');
        const meds = await response.json();
        allMedicines = meds; // Store for search
        renderMedicines(meds);
    } catch (error) {
        showToast('❌ Error loading medicines');
        console.error(error);
    } finally {
        toggleLoading(false);
    }
}

addBtn.addEventListener('click', async () => {
    const name = document.getElementById('med-name').value.trim();
    const dosage = document.getElementById('med-dosage').value.trim();
    const time = document.getElementById('med-time').value;
    const desc = document.getElementById('med-desc').value.trim();

    if (!name || !time) {
        showToast('⚠️ Please enter name and time');
        return;
    }

    addBtn.disabled = true;
    try {
        const response = await fetch(`${API_BASE}/medicines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, dosage, time, description: desc })
        });
        
        if (response.ok) {
            document.getElementById('med-form').reset();
            showToast('✅ Medicine added');
            fetchMedicines();
        } else {
            throw new Error('Failed to add');
        }
    } catch (error) {
        showToast('❌ Error adding medicine');
    } finally {
        addBtn.disabled = false;
    }
});

async function deleteMedicine(id, btnElement) {
    const card = btnElement.closest('.med-card');
    card.classList.add('deleting'); // Trigger CSS animation

    try {
        const response = await fetch(`${API_BASE}/medicines/${id}`, { method: 'DELETE' });
        if (response.ok) {
            setTimeout(() => {
                card.remove();
                checkEmptyState();
                showToast('🗑️ Medicine removed');
            }, 300); // Wait for animation
        }
    } catch (error) {
        card.classList.remove('deleting');
        showToast('❌ Error deleting medicine');
    }
}

async function markAsTaken(id, name) {
    try {
        showToast(`✅ Marked ${name} as taken`);
        // In a full implementation, this would log the taken time in the database
        // For now, just show a toast notification
    } catch (error) {
        showToast('❌ Error marking as taken');
    }
}

function editMedicine(id) {
    const med = allMedicines.find(m => m.id === id);
    if (!med) return;

    document.getElementById('edit-id').value = id;
    document.getElementById('edit-name').value = med.name;
    document.getElementById('edit-dosage').value = med.dosage || '';
    document.getElementById('edit-time').value = med.time.substring(0, 5);
    document.getElementById('edit-desc').value = med.description || '';
    
    document.getElementById('edit-modal').classList.remove('hidden');
}

async function saveEdit() {
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const dosage = document.getElementById('edit-dosage').value.trim();
    const time = document.getElementById('edit-time').value;
    const description = document.getElementById('edit-desc').value.trim();

    if (!name || !time) {
        showToast('⚠️ Please enter name and time');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/medicines/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, dosage, time, description })
        });
        
        if (response.ok) {
            showToast('✅ Medicine updated');
            document.getElementById('edit-modal').classList.add('hidden');
            fetchMedicines();
        } else {
            showToast('❌ Error updating medicine');
        }
    } catch (error) {
        showToast('❌ Error updating medicine');
    }
}

function cancelEdit() {
    document.getElementById('edit-modal').classList.add('hidden');
}

// --- AI Explainer ---

async function explainMedicine(name) {
    if (isAIFetching) return; // Prevent multiple calls
    
    const modal = document.getElementById('ai-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalSpinner = document.getElementById('modal-spinner');

    modalTitle.textContent = `About ${name}`;
    modalText.innerHTML = '';
    modal.classList.remove('hidden');
    modalSpinner.classList.remove('hidden');
    isAIFetching = true;

    try {
        const response = await fetch(`${API_BASE}/explain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, dosage: '', description: '' })
        });
        const data = await response.json();
        
        if (response.ok) {
            modalText.innerHTML = marked.parse(data.explanation);
        } else {
            modalText.innerHTML = '❌ Failed to generate explanation.';
        }
    } catch (error) {
        modalText.innerHTML = '❌ Connection error. AI unavailable.';
    } finally {
        modalSpinner.classList.add('hidden');
        isAIFetching = false;
    }
}

async function showAlternatives(name) {
    if (isAIFetching) return; // Prevent multiple calls
    
    const modal = document.getElementById('ai-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalSpinner = document.getElementById('modal-spinner');

    modalTitle.textContent = `Alternatives for ${name} (India)`;
    modalText.innerHTML = '';
    modal.classList.remove('hidden');
    modalSpinner.classList.remove('hidden');
    isAIFetching = true;

    try {
        const response = await fetch(`${API_BASE}/alternatives/${encodeURIComponent(name)}`);
        const data = await response.json();
        
        if (response.ok) {
            modalText.innerHTML = marked.parse(data.alternatives);
        } else {
            modalText.innerHTML = '❌ Failed to fetch alternatives.';
        }
    } catch (error) {
        modalText.innerHTML = '❌ Connection error. AI unavailable.';
    } finally {
        modalSpinner.classList.add('hidden');
        isAIFetching = false;
    }
}

async function getSymptomSuggestions() {
    const symptoms = symptomInput.value.trim();
    
    if (!symptoms) {
        showToast('⚠️ Please describe your symptoms');
        return;
    }
    
    if (isAIFetching) return; // Prevent multiple calls
    
    const modal = document.getElementById('ai-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalSpinner = document.getElementById('modal-spinner');

    modalTitle.textContent = 'Medicine Suggestions';
    modalText.innerHTML = '';
    modal.classList.remove('hidden');
    modalSpinner.classList.remove('hidden');
    isAIFetching = true;

    try {
        const response = await fetch(`${API_BASE}/symptom-to-medicine`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms })
        });
        const data = await response.json();
        
        if (response.ok) {
            modalText.innerHTML = marked.parse(data.suggestions);
        } else {
            modalText.innerHTML = '❌ Failed to fetch suggestions.';
        }
    } catch (error) {
        modalText.innerHTML = '❌ Connection error. AI unavailable.';
    } finally {
        modalSpinner.classList.add('hidden');
        isAIFetching = false;
    }
}

async function comparePrice(medicine) {
    if (isAIFetching) return; // Prevent multiple calls
    
    const modal = document.getElementById('ai-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalSpinner = document.getElementById('modal-spinner');

    modalTitle.textContent = `Price Comparison: ${medicine}`;
    modalText.innerHTML = '';
    modal.classList.remove('hidden');
    modalSpinner.classList.remove('hidden');
    isAIFetching = true;

    try {
        const response = await fetch(`${API_BASE}/price-comparison`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ medicine })
        });
        const data = await response.json();
        
        if (response.ok) {
            modalText.innerHTML = marked.parse(data.comparison);
        } else {
            modalText.innerHTML = '❌ Failed to fetch price comparison.';
        }
    } catch (error) {
        modalText.innerHTML = '❌ Connection error. AI unavailable.';
    } finally {
        modalSpinner.classList.add('hidden');
        isAIFetching = false;
    }
}

document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('ai-modal').classList.add('hidden');
});

document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);
document.getElementById('save-edit-btn').addEventListener('click', saveEdit);

// --- Reminder System & Clock ---

function startClock() {
    setInterval(() => {
        const now = new Date();
        liveClock.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        checkReminders(now);
    }, 1000);
}

function checkReminders(now) {
    // Current time in HH:MM format
    const currentTimeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    document.querySelectorAll('.med-card').forEach(card => {
        const medTime = card.dataset.time; // Format: HH:MM
        const medName = card.dataset.name;
        const uniqueKey = `${medName}-${currentTimeStr}`;

        if (medTime === currentTimeStr && !notifiedMeds.has(uniqueKey)) {
            triggerAlarm(medName);
            notifiedMeds.add(uniqueKey);
            
            // Clear memory after a minute to prevent memory leak
            setTimeout(() => notifiedMeds.delete(uniqueKey), 61000);
        }
    });
}

function triggerAlarm(name) {
    showToast(`🔔 Time to take: ${name}!`);
    if (soundEnabled) {
        alertSound.currentTime = 0;
        alertSound.play().catch(e => console.log('Audio play prevented by browser', e));
    }
}

// --- UI Utilities ---

function renderMedicines(meds) {
    grid.innerHTML = '';
    
    if (meds.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    meds.forEach(med => {
        // MySQL returns time as HH:MM:SS, we need HH:MM for HTML and comparison
        const timeFormatted = med.time.substring(0, 5); 

        const card = document.createElement('div');
        card.className = 'med-card glass-panel';
        card.dataset.time = timeFormatted;
        card.dataset.name = med.name;

        card.innerHTML = `
            <div class="med-header">
                <h3>${med.name}</h3>
                <span class="med-time">${timeFormatted}</span>
            </div>
            <div class="med-details">
                <p><strong>Dosage:</strong> ${med.dosage || 'N/A'}</p>
                ${med.description ? `<p><strong>Note:</strong> ${med.description}</p>` : ''}
            </div>
            <div class="card-actions">
                <div class="card-actions-left">
                    <button type="button" class="btn-outline btn-sm" onclick="explainMedicine('${med.name}')">✨ Explain</button>
                    <button type="button" class="btn-outline btn-sm" onclick="showAlternatives('${med.name}')">💊 Alternatives</button>
                    <button type="button" class="btn-outline btn-sm" onclick="comparePrice('${med.name}')">💰 Price Compare</button>
                    <button type="button" class="btn-outline btn-sm" onclick="markAsTaken(${med.id}, '${med.name}')">✓ Taken</button>
                </div>
                <div class="card-actions-right">
                    <button type="button" class="btn-outline btn-sm" onclick="editMedicine(${med.id})">✏️ Edit</button>
                    <button type="button" class="btn-danger btn-sm" onclick="deleteMedicine(${med.id}, this)">🗑️ Delete</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function checkEmptyState() {
    if (grid.children.length === 0) emptyState.classList.remove('hidden');
}

function toggleLoading(show) {
    show ? loadingSpinner.classList.remove('hidden') : loadingSpinner.classList.add('hidden');
}

function showToast(message) {
    document.getElementById('toast-msg').textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 5000);
}

// --- Listeners ---
refreshBtn.addEventListener('click', fetchMedicines);

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredMeds = allMedicines.filter(med => 
        med.name.toLowerCase().includes(searchTerm) ||
        med.dosage.toLowerCase().includes(searchTerm) ||
        (med.description && med.description.toLowerCase().includes(searchTerm))
    );
    renderMedicines(filteredMeds);
});

// Symptom-to-Medicine functionality
symptomBtn.addEventListener('click', getSymptomSuggestions);

soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        soundBtn.textContent = '🔔 Sound On';
        soundBtn.classList.remove('sound-off');
        // Play a silent sound to unlock audio context in browsers
        alertSound.volume = 0;
        alertSound.play().then(() => { alertSound.pause(); alertSound.volume = 1; });
    } else {
        soundBtn.textContent = '🔕 Sound Off';
        soundBtn.classList.add('sound-off');
    }
});
