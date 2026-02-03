/**
 * app.js
 * Main Controller used to Glue Storage and UI together
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme
    window.UI.initTheme();

    let currentNotes = [];
    let filter = 'all'; // all, favorites, archive
    let searchQuery = '';
    let sortBy = 'date'; // date, priority, alpha, dueDate

    // Request notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Load initial notes and start reminder checker
    refreshNotes();
    startReminderChecker();

    // Event Listeners
    
    // 1. Add Note Button
    document.getElementById('add-note-btn').addEventListener('click', () => {
        window.UI.openModal();
    });

    // 2. Close Modal Button
    document.getElementById('close-modal').addEventListener('click', () => {
        window.UI.closeModal();
    });

    // 3. Save Note Button
    document.getElementById('save-note-btn').addEventListener('click', saveNoteHandler);

    // 4. Modal Favorite Toggle
    document.getElementById('toggle-favorite-btn').addEventListener('click', function() {
        this.classList.toggle('active');
    });

    // 5. Search Input
    document.getElementById('search-input').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderFilteredNotes();
    });

    // 6. Navigation Filters
    document.getElementById('nav-all').addEventListener('click', (e) => setFilter(e, 'all'));
    document.getElementById('nav-favorites').addEventListener('click', (e) => setFilter(e, 'favorites'));
    document.getElementById('nav-archive').addEventListener('click', (e) => setFilter(e, 'archive'));

    // 7. Theme Toggle
    document.getElementById('theme-checkbox').addEventListener('change', () => {
        window.UI.toggleTheme();
    });

    // 8. Custom Events (from UI.js interactions)
    document.addEventListener('edit-note', (e) => {
        const note = e.detail;
        window.UI.openModal(note);
    });

    document.addEventListener('delete-note', (e) => {
        const noteId = e.detail;
        const confirmMsg = filter === 'archive' ? 'Delete this note permanently?' : 'Are you sure you want to delete this note?';
        if(confirm(confirmMsg)) {
            window.Storage.deleteNote(noteId);
            window.UI.showToast('Note deleted');
            refreshNotes();
        }
    });

    document.addEventListener('archive-note', (e) => {
        const noteId = e.detail;
        window.Storage.archiveNote(noteId);
        window.UI.showToast('Note archived');
        refreshNotes();
    });

    document.addEventListener('restore-note', (e) => {
        const noteId = e.detail;
        window.Storage.unarchiveNote(noteId);
        window.UI.showToast('Note restored');
        refreshNotes();
    });

    document.addEventListener('duplicate-note', (e) => {
        const noteId = e.detail;
        window.Storage.duplicateNote(noteId);
        window.UI.showToast('Note duplicated');
        refreshNotes();
    });

    // Close modal on outside click
    document.getElementById('note-modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            window.UI.closeModal();
        }
    });

    // --- New Feature Listeners ---

    // 9. Add Image Button
    const fileInput = document.getElementById('file-input');
    document.getElementById('btn-add-image').addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    window.UI.addImage(evt.target.result);
                };
                reader.readAsDataURL(file);
            });
            fileInput.value = ''; 
        }
    });

    // 10. Checklist Toggle
    document.getElementById('btn-checklist').addEventListener('click', () => {
        window.UI.switchMode();
    });

    // 11. Pin Button
    document.getElementById('btn-pin').addEventListener('click', function() {
        window.UI.isPinned = !window.UI.isPinned;
        window.UI.updatePinUI();
    });

    // 12. Color Picker
    document.getElementById('btn-color').addEventListener('click', () => {
        window.UI.toggleColorPalette();
    });

    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const color = e.target.dataset.color;
            window.UI.selectColor(color);
        });
    });

    // 13. Tags Input
    document.getElementById('tag-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = e.target.value.trim();
            if (tag) {
                window.UI.addTag(tag);
                e.target.value = '';
            }
        }
    });

    // 14. Priority Buttons
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const priority = btn.dataset.priority;
            window.UI.setPriority(priority);
        });
    });

    // 15. Reminder Button - Custom Picker
    document.getElementById('reminder-btn').addEventListener('click', () => {
        window.DatePickerInstance.open({
            includeTime: true,
            initialValue: window.UI.currentReminder,
            onSelect: (date) => {
                const formatted = window.DatePickerInstance.formatForStorage(date, true);
                window.UI.setReminder(formatted);
                document.getElementById('reminder-input').value = formatted;
                document.getElementById('reminder-display').textContent = window.DatePickerInstance.formatDate(date, true);
                document.getElementById('reminder-btn').classList.add('has-value');
            }
        });
    });

    document.getElementById('clear-reminder').addEventListener('click', () => {
        window.UI.clearReminder();
        document.getElementById('reminder-display').textContent = 'Set reminder...';
        document.getElementById('reminder-btn').classList.remove('has-value');
    });

    // 16. Due Date Button - Custom Picker
    document.getElementById('duedate-btn').addEventListener('click', () => {
        window.DatePickerInstance.open({
            includeTime: false,
            initialValue: window.UI.currentDueDate,
            onSelect: (date) => {
                const formatted = window.DatePickerInstance.formatForStorage(date, false);
                window.UI.setDueDate(formatted);
                document.getElementById('duedate-input').value = formatted;
                document.getElementById('duedate-display').textContent = window.DatePickerInstance.formatDate(date, false);
                document.getElementById('duedate-btn').classList.add('has-value');
            }
        });
    });

    document.getElementById('clear-duedate').addEventListener('click', () => {
        window.UI.clearDueDate();
        document.getElementById('duedate-display').textContent = 'Set due date...';
        document.getElementById('duedate-btn').classList.remove('has-value');
    });

    // 17. Sort Dropdown
    document.getElementById('sort-btn').addEventListener('click', () => {
        window.UI.toggleSortDropdown();
    });

    document.querySelectorAll('.sort-option').forEach(btn => {
        btn.addEventListener('click', () => {
            sortBy = btn.dataset.sort;
            window.UI.updateSortLabel(sortBy);
            renderFilteredNotes();
        });
    });

    // Close sort dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sort-wrapper')) {
            document.getElementById('sort-dropdown').classList.add('hidden');
        }
        if (!e.target.closest('.color-picker-wrapper')) {
            document.getElementById('color-palette').classList.add('hidden');
        }
    });

    // Functions

    function refreshNotes() {
        if (filter === 'archive') {
            currentNotes = window.Storage.getArchivedNotes();
        } else {
            currentNotes = window.Storage.getNotes();
        }
        renderFilteredNotes();
    }

    function renderFilteredNotes() {
        let filtered = currentNotes;

        // Apply Category Filter (only for non-archive view)
        if (filter === 'favorites') {
            filtered = filtered.filter(n => n.isFavorite);
        }

        // Apply Search
        if (searchQuery) {
            filtered = filtered.filter(n => {
                const inTitle = n.title.toLowerCase().includes(searchQuery);
                const inContent = (n.content || '').toLowerCase().includes(searchQuery);
                const inItems = n.items ? n.items.some(i => i.text.toLowerCase().includes(searchQuery)) : false;
                const inTags = n.tags ? n.tags.some(t => t.toLowerCase().includes(searchQuery)) : false;
                
                return inTitle || inContent || inItems || inTags;
            });
        }
        
        // Apply Sorting
        filtered = sortNotes(filtered, sortBy);

        // Update archive banner and UI mode
        window.UI.setArchiveView(filter === 'archive');
        window.UI.renderArchiveBanner(filter === 'archive');

        window.UI.renderNotes(filtered);
    }

    function sortNotes(notes, sortType) {
        const sorted = [...notes];
        
        switch(sortType) {
            case 'priority':
                const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2, 'none': 3 };
                sorted.sort((a, b) => {
                    const pA = priorityOrder[a.priority || 'none'];
                    const pB = priorityOrder[b.priority || 'none'];
                    if (pA === pB) {
                        return new Date(b.updatedAt) - new Date(a.updatedAt);
                    }
                    return pA - pB;
                });
                break;
            case 'alpha':
                sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'dueDate':
                sorted.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return new Date(b.updatedAt) - new Date(a.updatedAt);
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'date':
            default:
                // Pinned first, then by date
                sorted.sort((a, b) => {
                    if (a.isPinned === b.isPinned) {
                        return new Date(b.updatedAt) - new Date(a.updatedAt);
                    }
                    return a.isPinned ? -1 : 1;
                });
                break;
        }
        
        return sorted;
    }

    function saveNoteHandler() {
        const title = document.getElementById('note-title-input').value.trim();
        const content = document.getElementById('note-content-input').value.trim();
        const isFavorite = document.getElementById('toggle-favorite-btn').classList.contains('active');
        const editingId = document.getElementById('note-modal').dataset.editingId;
        
        // New Data
        const type = window.UI.currentMode;
        const images = window.UI.currentImages;
        const items = window.UI.getChecklistData();
        const isPinned = window.UI.isPinned;
        const color = window.UI.currentColor;
        const tags = window.UI.currentTags;
        const reminder = window.UI.currentReminder;
        const dueDate = window.UI.currentDueDate;
        const priority = window.UI.currentPriority;

        // Validation
        const hasContent = (type === 'text' && content) || (type === 'checklist' && items.length > 0);
        
        if (!title && !hasContent && images.length === 0) {
            window.UI.showToast('Note cannot be empty');
            return;
        }

        const noteData = {
            title,
            content: type === 'text' ? content : '',
            isFavorite,
            type,
            images,
            items,
            isPinned,
            color,
            tags,
            reminder,
            dueDate,
            priority
        };

        if (editingId) {
            // Update existing
            window.Storage.updateNote({
                id: editingId,
                ...noteData
            });
            window.UI.showToast('Note updated');
        } else {
            // Create new
            window.Storage.saveNote(noteData);
            window.UI.showToast('Note created');
        }

        window.UI.closeModal();
        refreshNotes();
    }

    function setFilter(e, type) {
        // Update UI
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Update State
        filter = type;
        refreshNotes();
    }

    // Reminder Notification System
    function startReminderChecker() {
        // Check every minute
        setInterval(checkReminders, 60000);
        // Also check immediately
        checkReminders();
    }

    function checkReminders() {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        const now = new Date();
        const allNotes = window.Storage.getAllNotes();
        
        allNotes.forEach(note => {
            if (note.reminder && !note.reminderShown) {
                const reminderTime = new Date(note.reminder);
                // Check if reminder is due (within the last minute)
                if (reminderTime <= now && reminderTime > new Date(now - 60000)) {
                    showReminderNotification(note);
                    // Mark as shown
                    window.Storage.updateNote({
                        id: note.id,
                        reminderShown: true
                    });
                }
            }
        });
    }

    function showReminderNotification(note) {
        const notification = new Notification('Note Reminder', {
            body: note.title || 'You have a reminder!',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%236366f1" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
            tag: note.id
        });

        notification.onclick = () => {
            window.focus();
            window.UI.openModal(note);
            notification.close();
        };
    }
});
