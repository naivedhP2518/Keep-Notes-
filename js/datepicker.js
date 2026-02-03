/**
 * datepicker.js
 * Custom Date Picker with Modern Rounded UI
 */

class DatePicker {
    constructor() {
        this.overlay = document.getElementById('custom-picker-overlay');
        this.picker = document.getElementById('custom-picker');
        this.monthYearLabel = document.getElementById('picker-month-year');
        this.daysContainer = document.getElementById('picker-days');
        this.timeSection = document.getElementById('picker-time');
        this.timeInput = document.getElementById('picker-time-input');

        this.currentDate = new Date();
        this.selectedDate = null;
        this.viewingMonth = new Date();
        this.includeTime = false;
        this.callback = null;

        this.months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        this.bindEvents();
    }

    bindEvents() {
        // Navigation
        document.getElementById('picker-prev').addEventListener('click', () => {
            this.viewingMonth.setMonth(this.viewingMonth.getMonth() - 1);
            this.render();
        });

        document.getElementById('picker-next').addEventListener('click', () => {
            this.viewingMonth.setMonth(this.viewingMonth.getMonth() + 1);
            this.render();
        });

        // Actions
        document.getElementById('picker-cancel').addEventListener('click', () => {
            this.close();
        });

        document.getElementById('picker-today').addEventListener('click', () => {
            this.viewingMonth = new Date();
            this.selectedDate = new Date();
            this.render();
        });

        document.getElementById('picker-confirm').addEventListener('click', () => {
            this.confirm();
        });

        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.overlay.classList.contains('hidden')) {
                this.close();
            }
        });
    }

    open(options = {}) {
        this.includeTime = options.includeTime || false;
        this.callback = options.onSelect || null;
        this.selectedDate = options.initialValue ? new Date(options.initialValue) : null;
        this.viewingMonth = this.selectedDate ? new Date(this.selectedDate) : new Date();

        // Show/hide time section
        if (this.includeTime) {
            this.timeSection.classList.remove('hidden');
            if (this.selectedDate) {
                const hours = this.selectedDate.getHours().toString().padStart(2, '0');
                const mins = this.selectedDate.getMinutes().toString().padStart(2, '0');
                this.timeInput.value = `${hours}:${mins}`;
            } else {
                this.timeInput.value = '12:00';
            }
        } else {
            this.timeSection.classList.add('hidden');
        }

        this.render();
        this.overlay.classList.remove('hidden');
    }

    close() {
        this.overlay.classList.add('hidden');
    }

    confirm() {
        if (!this.selectedDate) {
            this.selectedDate = new Date();
        }

        if (this.includeTime) {
            const [hours, mins] = this.timeInput.value.split(':');
            this.selectedDate.setHours(parseInt(hours), parseInt(mins), 0, 0);
        }

        if (this.callback) {
            this.callback(this.selectedDate);
        }

        this.close();
    }

    render() {
        // Update header
        this.monthYearLabel.textContent = `${this.months[this.viewingMonth.getMonth()]} ${this.viewingMonth.getFullYear()}`;

        // Clear days
        this.daysContainer.innerHTML = '';

        // Get first day of month and total days
        const firstDay = new Date(this.viewingMonth.getFullYear(), this.viewingMonth.getMonth(), 1);
        const lastDay = new Date(this.viewingMonth.getFullYear(), this.viewingMonth.getMonth() + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        // Previous month days
        const prevMonthLastDay = new Date(this.viewingMonth.getFullYear(), this.viewingMonth.getMonth(), 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const btn = this.createDayButton(day, true);
            this.daysContainer.appendChild(btn);
        }

        // Current month days
        const today = new Date();
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(this.viewingMonth.getFullYear(), this.viewingMonth.getMonth(), day);
            const btn = this.createDayButton(day, false, date, today);
            this.daysContainer.appendChild(btn);
        }

        // Next month days
        const remainingCells = 42 - (startingDay + totalDays);
        for (let day = 1; day <= remainingCells; day++) {
            const btn = this.createDayButton(day, true);
            this.daysContainer.appendChild(btn);
        }
    }

    createDayButton(day, isOtherMonth, date, today) {
        const btn = document.createElement('button');
        btn.className = 'picker-day';
        btn.type = 'button';
        btn.textContent = day;

        if (isOtherMonth) {
            btn.classList.add('other-month');
        } else {
            // Check if today
            if (date && today &&
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()) {
                btn.classList.add('today');
            }

            // Check if selected
            if (this.selectedDate &&
                date.getDate() === this.selectedDate.getDate() &&
                date.getMonth() === this.selectedDate.getMonth() &&
                date.getFullYear() === this.selectedDate.getFullYear()) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', () => {
                this.selectedDate = new Date(date);
                this.render();
            });
        }

        return btn;
    }

    // Format date for display
    formatDate(date, includeTime = false) {
        if (!date) return null;

        const options = {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return date.toLocaleDateString('en-US', options);
    }

    // Format date for storage (ISO format)
    formatForStorage(date, includeTime = false) {
        if (!date) return null;

        if (includeTime) {
            return date.toISOString();
        } else {
            return date.toISOString().split('T')[0];
        }
    }
}

// Initialize Date Picker
window.DatePickerInstance = new DatePicker();
