/**
 * storage.js
 * Handles data persistence using localStorage
 */

class Storage {
  constructor() {
    this.STORAGE_KEY = "modern_notes_app_data";
  }

  /**
   * Get all active (non-archived) notes from localStorage
   * @returns {Array} Array of note objects
   */
  getNotes() {
    const notes = localStorage.getItem(this.STORAGE_KEY);
    try {
      const allNotes = notes ? JSON.parse(notes) : [];
      return allNotes.filter(n => !n.isArchived);
    } catch (e) {
      console.error("Error parsing notes from storage", e);
      return [];
    }
  }

  /**
   * Get all archived notes
   * @returns {Array} Array of archived note objects
   */
  getArchivedNotes() {
    const notes = localStorage.getItem(this.STORAGE_KEY);
    try {
      const allNotes = notes ? JSON.parse(notes) : [];
      return allNotes.filter(n => n.isArchived);
    } catch (e) {
      console.error("Error parsing notes from storage", e);
      return [];
    }
  }

  /**
   * Get all notes including archived
   * @returns {Array} Array of all note objects
   */
  getAllNotes() {
    const notes = localStorage.getItem(this.STORAGE_KEY);
    try {
      return notes ? JSON.parse(notes) : [];
    } catch (e) {
      console.error("Error parsing notes from storage", e);
      return [];
    }
  }

  /**
   * Save a new note
   * @param {Object} note - The note object to save
   * @returns {Object} The saved note with ID and timestamp
   */
  saveNote(note) {
    const notes = this.getAllNotes();
    const newNote = {
      id: Date.now().toString(),
      title: note.title || "Untitled Note",
      content: note.content || "",
      images: note.images || [],
      type: note.type || "text",
      items: note.items || [],
      isPinned: note.isPinned || false,
      color: note.color || 'default',
      tags: note.tags || [],
      isFavorite: note.isFavorite || false,
      isArchived: false,
      reminder: note.reminder || null,
      dueDate: note.dueDate || null,
      priority: note.priority || 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notes.unshift(newNote);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
    return newNote;
  }

  /**
   * Update an existing note
   * @param {Object} updatedNote - The note object with updated fields
   */
  updateNote(updatedNote) {
    let notes = this.getAllNotes();
    const index = notes.findIndex((n) => n.id === updatedNote.id);

    if (index !== -1) {
      notes[index] = {
        ...notes[index],
        ...updatedNote,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
      return notes[index];
    }
    return null;
  }

  /**
   * Delete a note by ID
   * @param {string} id - The ID of the note to delete
   */
  deleteNote(id) {
    let notes = this.getAllNotes();
    notes = notes.filter((n) => n.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
  }

  /**
   * Archive a note by ID
   * @param {string} id - The ID of the note to archive
   */
  archiveNote(id) {
    let notes = this.getAllNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index !== -1) {
      notes[index].isArchived = true;
      notes[index].isPinned = false;
      notes[index].updatedAt = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
      return notes[index];
    }
    return null;
  }

  /**
   * Unarchive a note by ID
   * @param {string} id - The ID of the note to unarchive
   */
  unarchiveNote(id) {
    let notes = this.getAllNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index !== -1) {
      notes[index].isArchived = false;
      notes[index].updatedAt = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
      return notes[index];
    }
    return null;
  }

  /**
   * Duplicate a note by ID
   * @param {string} id - The ID of the note to duplicate
   * @returns {Object} The duplicated note
   */
  duplicateNote(id) {
    const notes = this.getAllNotes();
    const original = notes.find((n) => n.id === id);
    if (original) {
      const duplicate = {
        ...original,
        id: Date.now().toString(),
        title: `Copy of ${original.title}`,
        isPinned: false,
        isArchived: false,
        reminder: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      notes.unshift(duplicate);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
      return duplicate;
    }
    return null;
  }

  /**
   * Get a single note by ID
   * @param {string} id - The ID of the note
   * @returns {Object|null} The note or null
   */
  getNoteById(id) {
    const notes = this.getAllNotes();
    return notes.find((n) => n.id === id) || null;
  }
}

// Export a single instance
window.Storage = new Storage();
