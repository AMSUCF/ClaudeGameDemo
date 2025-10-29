// Game state and story progression tracker

export class GameState {
    constructor(fileSystem) {
        this.fileSystem = fileSystem;

        // Track found clues
        this.cluesFound = new Set();
        this.totalClues = 6;

        // Game progress
        this.gameStarted = false;
        this.gameSolved = false;

        // Notifications
        this.notifications = [];
    }

    // Register that a clue was found in a file
    registerClueFound(fileContent) {
        console.log('[GAME] registerClueFound called');
        console.log('[GAME] fileContent length:', fileContent.length);
        console.log('[GAME] fileContent first 200 chars:', fileContent.substring(0, 200));

        // Extract clue number from content
        const match = fileContent.match(/\[CLUE #(\d+)/);
        console.log('[GAME] Regex match result:', match);

        if (match) {
            const clueNumber = parseInt(match[1]);
            console.log('[GAME] Clue number parsed:', clueNumber);
            console.log('[GAME] Already found?', this.cluesFound.has(clueNumber));

            if (!this.cluesFound.has(clueNumber)) {
                console.log('[GAME] Adding clue to set...');
                this.cluesFound.add(clueNumber);
                console.log('[GAME] Clues found now:', Array.from(this.cluesFound));

                this.addNotification(`Clue #${clueNumber} discovered!`);
                console.log('[GAME] Notification added');

                // Check if game is solved
                if (clueNumber === this.totalClues) {
                    this.gameSolved = true;
                    this.addNotification('CASE SOLVED! Congratulations, Detective!');
                    console.log('[GAME] GAME SOLVED!');
                }

                console.log(`[GAME] Clue ${clueNumber} found! Total: ${this.cluesFound.size}/${this.totalClues}`);
            } else {
                console.log('[GAME] Clue already found, skipping');
            }
        } else {
            console.log('[GAME] No clue match found in content');
        }
    }

    // Add a notification message
    addNotification(message) {
        this.notifications.push({
            message: message,
            timestamp: Date.now(),
            duration: 5000 // Show for 5 seconds
        });
    }

    // Get active notifications (not expired)
    getActiveNotifications() {
        const now = Date.now();
        this.notifications = this.notifications.filter(n => now - n.timestamp < n.duration);
        return this.notifications;
    }

    // Get clue progress
    getClueProgress() {
        return {
            found: this.cluesFound.size,
            total: this.totalClues,
            percentage: (this.cluesFound.size / this.totalClues) * 100
        };
    }

    // Check if game is solved
    isGameSolved() {
        return this.gameSolved;
    }

    // Get hint based on current progress
    getHint() {
        const progress = this.getClueProgress();

        if (progress.found === 0) {
            return "Start by reading case_notes.txt on your Desktop. Use:\nTYPE Desktop\\case_notes.txt";
        } else if (progress.found === 1) {
            return "Check the Documents folder for more information:\nCD Documents\nDIR";
        } else if (progress.found === 2) {
            return "Look in the Downloads folder for evidence:\nCD ..\\Downloads";
        } else if (progress.found === 3) {
            return "Investigate Alex's files:\nCD ..\\..\\Alex\\Documents";
        } else if (progress.found === 4) {
            return "Check the Public folder's temp subfolder:\nCD ..\\..\\Public\\temp";
        } else if (progress.found === 5) {
            return "Look for Jamie's hidden .backup folder:\nCD ..\\..\\Jamie\\Documents\\.backup";
        } else {
            return "Find the stolen file in the Windows System folder:\nCD ..\\..\\..\\..\\Windows\\System";
        }
    }

    // Reset game state
    reset() {
        this.cluesFound.clear();
        this.gameStarted = false;
        this.gameSolved = false;
        this.notifications = [];
    }

    // Render notifications on screen
    renderNotifications() {
        const notifications = this.getActiveNotifications();

        if (notifications.length === 0) return;

        textAlign(CENTER, TOP);
        textSize(16);

        notifications.forEach((notification, index) => {
            const y = 10 + index * 40;
            const alpha = 255;

            // Draw notification background
            fill(0, 0, 0, 200);
            noStroke();
            rectMode(CENTER);
            rect(width / 2, y + 15, 400, 30, 5);

            // Draw notification text
            fill(255, 255, 100, alpha);
            text(notification.message, width / 2, y + 5);

            rectMode(CORNER);
        });
    }

    // Render progress indicator
    renderProgress(x, y) {
        const progress = this.getClueProgress();

        fill(255);
        textAlign(LEFT, TOP);
        textSize(12);
        text(`Clues Found: ${progress.found}/${progress.total}`, x, y);

        // Progress bar
        const barWidth = 150;
        const barHeight = 10;

        // Background
        fill(50);
        noStroke();
        rect(x, y + 20, barWidth, barHeight, 3);

        // Progress
        fill(100, 200, 100);
        const progressWidth = (progress.found / progress.total) * barWidth;
        rect(x, y + 20, progressWidth, barHeight, 3);
    }
}
