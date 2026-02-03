/**
 * ui.js
 * Handles DOM manipulation and UI rendering
 */

class UI {
    constructor() {
        this.notesGrid = document.getElementById('notes-grid');
        this.emptyState = document.getElementById('empty-state');
        this.modal = document.getElementById('note-modal');
        
        // Modal Inputs
        this.titleInput = document.getElementById('note-title-input');
        this.contentInput = document.getElementById('note-content-input');
        this.checklistContainer = document.getElementById('checklist-container');
        this.imagePreviewContainer = document.getElementById('image-preview-container');
        
        this.favBtn = document.getElementById('toggle-favorite-btn');
        this.modalTitle = document.getElementById('modal-title');

        // New Inputs
        this.pinBtn = document.getElementById('btn-pin');
        this.colorBtn = document.getElementById('btn-color');
        this.colorPalette = document.getElementById('color-palette');
        this.colorIndicator = document.getElementById('current-color-indicator');
        this.tagInput = document.getElementById('tag-input');
        this.tagsList = document.getElementById('tags-list');

        // New Feature Inputs
        this.reminderInput = document.getElementById('reminder-input');
        this.dueDateInput = document.getElementById('duedate-input');
        this.priorityBtns = document.querySelectorAll('.priority-btn');
        this.sortBtn = document.getElementById('sort-btn');
        this.sortDropdown = document.getElementById('sort-dropdown');
        this.sortLabel = document.getElementById('sort-label');

        this.toastEl = document.getElementById('toast');
        
        // State
        this.currentMode = 'text'; 
        this.currentImages = []; 
        this.currentTags = [];
        this.currentColor = 'default';
        this.isPinned = false;
        this.currentReminder = null;
        this.currentDueDate = null;
        this.currentPriority = 'none';
        this.isArchiveView = false;
    }

    /**
     * Render the list of notes
     * @param {Array} notes 
     */
    renderNotes(notes) {
        this.notesGrid.innerHTML = '';

        if (notes.length === 0) {
            this.emptyState.classList.remove('hidden');
        } else {
            this.emptyState.classList.add('hidden');
            
            // Separate Pinned vs Others
            const pinnedNotes = notes.filter(n => n.isPinned);
            const otherNotes = notes.filter(n => !n.isPinned);

            if (pinnedNotes.length > 0) {
                this.renderSectionTitle('Pinned');
                pinnedNotes.forEach(note => this.notesGrid.appendChild(this.createNoteCard(note)));
                
                if (otherNotes.length > 0) {
                    this.renderSectionTitle('Others');
                }
            }

            otherNotes.forEach(note => {
                const noteCard = this.createNoteCard(note);
                this.notesGrid.appendChild(noteCard);
            });
        }
    }

    renderSectionTitle(title) {
        const el = document.createElement('div');
        el.className = 'grid-section-title';
        el.textContent = title;
        this.notesGrid.appendChild(el);
    }

    createNoteCard(note) {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.dataset.id = note.id;
        
        // Apply Color
        if (note.color && note.color !== 'default') {
             card.style.backgroundColor = `var(--color-${note.color})`;
             card.style.borderColor = 'transparent';
        }
        
        const date = new Date(note.updatedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
        });

        // Pinned Icon
        let pinnedHtml = '';
        if (note.isPinned) {
            pinnedHtml = `<div class="pin-icon-card"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg></div>`;
        }

        // Reminder Icon
        let reminderIconHtml = '';
        if (note.reminder && new Date(note.reminder) > new Date()) {
            reminderIconHtml = `<div class="reminder-icon-card"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></div>`;
        }

        // 1. Cover Image
        let mediaHtml = '';
        if (note.images && note.images.length > 0) {
            mediaHtml = `<img src="${note.images[0]}" class="note-media-cover" alt="Note Attachment">`;
        }

        // Indicators (Priority, Due Date, etc.)
        let indicatorsHtml = '';
        const hasIndicators = note.priority !== 'none' || note.dueDate || note.reminder;
        
        if (hasIndicators) {
            card.classList.add('has-indicators');
            indicatorsHtml = '<div class="card-indicators">';
            
            // Priority Badge
            if (note.priority && note.priority !== 'none') {
                indicatorsHtml += `<span class="priority-badge ${note.priority}">${note.priority}</span>`;
            }
            
            // Due Date Status
            if (note.dueDate) {
                const dueDate = new Date(note.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                if (dueDate < today) {
                    indicatorsHtml += `<span class="indicator-badge overdue"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>Overdue</span>`;
                } else if (dueDate.toDateString() === today.toDateString()) {
                    indicatorsHtml += `<span class="indicator-badge due-today"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>Due Today</span>`;
                }
            }
            
            indicatorsHtml += '</div>';
        }

        // 2. Content Preview
        let contentHtml = '';
        if (note.type === 'checklist' && note.items && note.items.length > 0) {
            const itemsToShow = note.items.slice(0, 3);
            const remaining = note.items.length - itemsToShow.length;
            
            contentHtml = `<div class="card-checklist-preview">`;
            itemsToShow.forEach(item => {
                contentHtml += `
                    <div class="card-checklist-item">
                        <div class="card-check-icon ${item.done ? 'checked' : ''}"></div>
                        <span style="${item.done ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${this.escapeHtml(item.text)}</span>
                    </div>
                `;
            });
            if (remaining > 0) {
                contentHtml += `<div class="card-checklist-item" style="opacity: 0.7;">+ ${remaining} more items</div>`;
            }
            contentHtml += `</div>`;
        } else {
            contentHtml = `<p>${this.escapeHtml(note.content || '')}</p>`;
        }

        // 3. Tags
        let tagsHtml = '';
        if (note.tags && note.tags.length > 0) {
            tagsHtml = `<div class="card-tags">`;
            note.tags.slice(0, 3).forEach(tag => {
                tagsHtml += `<span class="card-tag">#${this.escapeHtml(tag)}</span>`;
            });
            if (note.tags.length > 3) tagsHtml += `<span class="card-tag">+${note.tags.length - 3}</span>`;
            tagsHtml += `</div>`;
        }

        // 4. Action Buttons (different for archive view)
        let actionsHtml = '';
        if (this.isArchiveView) {
            actionsHtml = `
                <button class="action-btn restore" data-type="restore" title="Restore">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                </button>
                <button class="action-btn delete" data-type="delete" title="Delete Forever">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
        } else {
            actionsHtml = `
                <button class="action-btn duplicate" data-type="duplicate" title="Duplicate">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
                <button class="action-btn archive" data-type="archive" title="Archive">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect></svg>
                </button>
                <button class="action-btn delete" data-type="delete" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                ${note.isFavorite ? `
                <button class="action-btn favorite active" data-type="favorite" title="Unfavorite">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-primary);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </button>` 
                : ''}
            `;
        }

        card.innerHTML = `
            ${pinnedHtml}
            ${reminderIconHtml}
            ${mediaHtml}
            ${indicatorsHtml}
            <h3>${this.escapeHtml(note.title)}</h3>
            ${contentHtml}
            ${tagsHtml}
            <div class="note-footer">
                <span>${date}</span>
                <div class="card-actions">
                    ${actionsHtml}
                </div>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn')) {
                const event = new CustomEvent('edit-note', { detail: note });
                document.dispatchEvent(event);
            }
        });

        // Action Button Events
        card.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = btn.dataset.type;
                if (type === 'delete') {
                    document.dispatchEvent(new CustomEvent('delete-note', { detail: note.id }));
                } else if (type === 'archive') {
                    document.dispatchEvent(new CustomEvent('archive-note', { detail: note.id }));
                } else if (type === 'restore') {
                    document.dispatchEvent(new CustomEvent('restore-note', { detail: note.id }));
                } else if (type === 'duplicate') {
                    document.dispatchEvent(new CustomEvent('duplicate-note', { detail: note.id }));
                }
            });
        });

        return card;
    }

    openModal(note = null) {
        this.modal.classList.add('active');
        this.currentImages = []; 
        this.currentMode = 'text';
        this.currentTags = [];
        this.currentColor = 'default';
        this.isPinned = false;
        this.currentReminder = null;
        this.currentDueDate = null;
        this.currentPriority = 'none';
        
        // Reset Inputs
        this.colorPalette.classList.add('hidden');

        if (note) {
            this.modalTitle.textContent = 'Edit Note';
            this.titleInput.value = note.title;
            this.modal.dataset.editingId = note.id;
            
            // Set fields
            this.currentMode = note.type || 'text';
            this.isPinned = note.isPinned || false;
            this.currentColor = note.color || 'default';
            this.currentTags = note.tags || [];
            this.currentImages = note.images || [];
            this.currentReminder = note.reminder || null;
            this.currentDueDate = note.dueDate || null;
            this.currentPriority = note.priority || 'none';

            // Set Content
            if (this.currentMode === 'text') {
                this.contentInput.value = note.content || '';
                this.renderChecklist([]); 
            } else {
                this.contentInput.value = '';
                this.renderChecklist(note.items || []);
            }
            
            // Favorite Button
            if (note.isFavorite) this.favBtn.classList.add('active');
            else this.favBtn.classList.remove('active');

        } else {
            // New Note
            this.modalTitle.textContent = 'Create Note';
            this.titleInput.value = '';
            this.contentInput.value = '';
            delete this.modal.dataset.editingId;
            this.favBtn.classList.remove('active');
            
            this.renderChecklist([]);
        }
        
        // UI Updates based on state
        this.renderImages();
        this.renderTags();
        this.updateColorUI();
        this.updatePinUI();
        this.updatePriorityUI();
        this.updateDateInputs();
        this.toggleViewMode();
        
        this.titleInput.focus();
    }

    // --- New UI Logic ---

    updateColorUI() {
        this.colorIndicator.style.backgroundColor = 
            this.currentColor === 'default' ? 'var(--bg-card)' : `var(--color-${this.currentColor})`;
        
        // Update modal background for preview (optional nice touch)
        const modalContainer = this.modal.querySelector('.modal-container');
        if (this.currentColor === 'default') {
             modalContainer.style.backgroundColor = 'var(--bg-card)';
        } else {
             modalContainer.style.backgroundColor = `var(--color-${this.currentColor})`;
        }
    }

    updatePinUI() {
        if (this.isPinned) this.pinBtn.classList.add('active');
        else this.pinBtn.classList.remove('active');
    }

    renderTags() {
        this.tagsList.innerHTML = '';
        this.currentTags.forEach((tag, index) => {
            const pill = document.createElement('div');
            pill.className = 'tag-pill';
            pill.innerHTML = `
                #${this.escapeHtml(tag)}
                <span class="tag-remove" data-index="${index}">&times;</span>
            `;
            pill.querySelector('.tag-remove').addEventListener('click', () => {
                this.removeTag(index);
            });
            this.tagsList.appendChild(pill);
        });
    }

    addTag(tagName) {
        if (tagName && !this.currentTags.includes(tagName)) {
            this.currentTags.push(tagName);
            this.renderTags();
        }
    }

    removeTag(index) {
        this.currentTags.splice(index, 1);
        this.renderTags();
    }

    toggleColorPalette() {
        this.colorPalette.classList.toggle('hidden');
    }
    
    selectColor(color) {
        this.currentColor = color;
        this.updateColorUI();
        this.colorPalette.classList.add('hidden');
    }

    // Toggle between Textarea and Checklist UI
    toggleViewMode() {
        if (this.currentMode === 'text') {
            this.contentInput.classList.remove('hidden');
            this.checklistContainer.classList.add('hidden');
        } else {
            this.contentInput.classList.add('hidden');
            this.checklistContainer.classList.remove('hidden');
            if (this.checklistContainer.children.length === 0) {
                this.addChecklistItem();
            }
        }
    }

    switchMode() {
        this.currentMode = this.currentMode === 'text' ? 'checklist' : 'text';
        this.toggleViewMode();
    }

    // --- Checklist Logic ---
    renderChecklist(items) {
        this.checklistContainer.innerHTML = '';
        items.forEach(item => this.addChecklistItem(item.text, item.done));
    }

    addChecklistItem(text = '', done = false) {
        const itemEl = document.createElement('div');
        itemEl.className = `checklist-item ${done ? 'checked' : ''}`;
        
        const uniqueId = 'cbx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        itemEl.innerHTML = `
            <label class="cbx">
                <input type="checkbox" class="checklist-checkbox" id="${uniqueId}" ${done ? 'checked' : ''}>
                <div class="flip">
                    <div class="front"></div>
                    <div class="back">
                        <svg viewBox="0 0 16 14" height="14" width="16">
                            <path d="M2 8.5L6 12.5L14 1.5"></path>
                        </svg>
                    </div>
                </div>
            </label>
            <input type="text" class="checklist-input" placeholder="List item" value="${this.escapeHtml(text)}">
        `;

        const checkbox = itemEl.querySelector('.checklist-checkbox');
        const input = itemEl.querySelector('.checklist-input');

        checkbox.addEventListener('change', () => {
            itemEl.classList.toggle('checked', checkbox.checked);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addChecklistItem().querySelector('.checklist-input').focus();
            } else if (e.key === 'Backspace' && input.value === '') {
                if (this.checklistContainer.children.length > 1) {
                    e.preventDefault();
                    const prev = itemEl.previousElementSibling;
                    itemEl.remove();
                    if (prev) prev.querySelector('.checklist-input').focus();
                }
            }
        });

        this.checklistContainer.appendChild(itemEl);
        return itemEl;
    }

    getChecklistData() {
        if (this.currentMode !== 'checklist') return [];
        const items = [];
        this.checklistContainer.querySelectorAll('.checklist-item').forEach(el => {
            const text = el.querySelector('.checklist-input').value.trim();
            const done = el.querySelector('.checklist-checkbox').checked;
            if (text) items.push({ text, done });
        });
        return items;
    }

    // --- Image Logic ---
    addImage(base64) {
        this.currentImages.push(base64);
        this.renderImages();
    }

    renderImages() {
        this.imagePreviewContainer.innerHTML = '';
        this.currentImages.forEach((src, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'image-preview-item';
            wrapper.innerHTML = `
                <img src="${src}">
                <button class="remove-image-btn" data-index="${index}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            `;
            
            wrapper.querySelector('.remove-image-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeImage(index);
            });

            this.imagePreviewContainer.appendChild(wrapper);
        });
    }

    removeImage(index) {
        this.currentImages.splice(index, 1);
        this.renderImages();
    }

    closeModal() {
        this.modal.classList.remove('active');
    }

    showToast(message) {
        this.toastEl.textContent = message;
        this.toastEl.classList.add('show');
        setTimeout(() => {
            this.toastEl.classList.remove('show');
        }, 3000);
    }

    toggleTheme() {
        const checkbox = document.getElementById('theme-checkbox');
        const newTheme = checkbox && checkbox.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        // Sync checkbox state on load
        const checkbox = document.getElementById('theme-checkbox');
        if (checkbox) checkbox.checked = (savedTheme === 'dark');
    }

    escapeHtml(unsafe) {
        return (unsafe || '')
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- Priority Methods ---
    updatePriorityUI() {
        this.priorityBtns.forEach(btn => {
            if (btn.dataset.priority === this.currentPriority) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    setPriority(priority) {
        this.currentPriority = priority;
        this.updatePriorityUI();
    }

    // --- Date/Time Methods ---
    updateDateInputs() {
        const reminderDisplay = document.getElementById('reminder-display');
        const reminderBtn = document.getElementById('reminder-btn');
        const dueDateDisplay = document.getElementById('duedate-display');
        const dueDateBtn = document.getElementById('duedate-btn');

        // Reminder
        if (this.currentReminder) {
            this.reminderInput.value = this.currentReminder;
            const date = new Date(this.currentReminder);
            reminderDisplay.textContent = date.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            reminderBtn.classList.add('has-value');
        } else {
            this.reminderInput.value = '';
            reminderDisplay.textContent = 'Set reminder...';
            reminderBtn.classList.remove('has-value');
        }

        // Due Date
        if (this.currentDueDate) {
            this.dueDateInput.value = this.currentDueDate;
            const date = new Date(this.currentDueDate);
            dueDateDisplay.textContent = date.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
            dueDateBtn.classList.add('has-value');
        } else {
            this.dueDateInput.value = '';
            dueDateDisplay.textContent = 'Set due date...';
            dueDateBtn.classList.remove('has-value');
        }
    }

    setReminder(value) {
        this.currentReminder = value || null;
    }

    setDueDate(value) {
        this.currentDueDate = value || null;
    }

    clearReminder() {
        this.currentReminder = null;
        this.reminderInput.value = '';
    }

    clearDueDate() {
        this.currentDueDate = null;
        this.dueDateInput.value = '';
    }

    // --- Sort Methods ---
    toggleSortDropdown() {
        this.sortDropdown.classList.toggle('hidden');
    }

    updateSortLabel(sortType) {
        const labels = {
            'date': 'Date',
            'priority': 'Priority',
            'alpha': 'A-Z',
            'dueDate': 'Due Date'
        };
        this.sortLabel.textContent = labels[sortType] || 'Date';
        
        // Update active state
        this.sortDropdown.querySelectorAll('.sort-option').forEach(btn => {
            if (btn.dataset.sort === sortType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        this.sortDropdown.classList.add('hidden');
    }

    // --- Archive Banner ---
    renderArchiveBanner(show) {
        // Remove existing banner
        const existingBanner = document.querySelector('.archive-banner');
        if (existingBanner) existingBanner.remove();

        if (show) {
            const banner = document.createElement('div');
            banner.className = 'archive-banner';
            banner.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="21 8 21 21 3 21 3 8"></polyline>
                    <rect x="1" y="3" width="22" height="5"></rect>
                    <line x1="10" y1="12" x2="14" y2="12"></line>
                </svg>
                <span>Archived Notes - These notes are hidden from your main view</span>
            `;
            const wrapper = document.querySelector('.content-wrapper');
            wrapper.insertBefore(banner, wrapper.querySelector('.notes-grid'));
        }
    }

    setArchiveView(isArchive) {
        this.isArchiveView = isArchive;
    }
}

// Export instance
window.UI = new UI();
