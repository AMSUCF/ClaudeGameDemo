// Tutorial and help system

export class Tutorial {
    constructor(gameState) {
        this.gameState = gameState;

        this.showTutorial = true;
        this.tutorialStep = 0;
        this.tutorialMessages = [
            {
                title: 'Welcome, Detective!',
                text: 'You are investigating a case of stolen research data.\nUse the Windows Command Prompt to navigate the computer\nand find clues.\n\nClick anywhere to continue...'
            },
            {
                title: 'Getting Started',
                text: 'Click the Command Prompt icon on the desktop to begin.\nThe black window with green text is your command line interface.\n\nClick anywhere to continue...'
            },
            {
                title: 'Basic Commands',
                text: 'Essential commands:\n\nDIR - Lists all files and folders\nCD [folder] - Changes to a folder\nCD .. - Goes up one folder\nTYPE [file] - Reads a file\n\nClick anywhere to start investigating!'
            }
        ];

        this.showHelpButton = true;
        this.helpButtonX = 10;
        this.helpButtonY = 10;
        this.helpButtonWidth = 80;
        this.helpButtonHeight = 30;

        this.showHintPanel = false;
    }

    render() {
        // Show tutorial overlay if active
        if (this.showTutorial && this.tutorialStep < this.tutorialMessages.length) {
            this.renderTutorialOverlay();
        }

        // Show help button
        if (this.showHelpButton && !this.showTutorial) {
            this.renderHelpButton();
        }

        // Show hint panel if active
        if (this.showHintPanel) {
            this.renderHintPanel();
        }
    }

    renderTutorialOverlay() {
        const message = this.tutorialMessages[this.tutorialStep];

        // Semi-transparent background
        fill(0, 0, 0, 200);
        noStroke();
        rect(0, 0, width, height);

        // Tutorial panel
        const panelWidth = 600;
        const panelHeight = 300;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;

        // Panel background
        fill(40, 40, 60);
        stroke(100, 150, 255);
        strokeWeight(3);
        rect(panelX, panelY, panelWidth, panelHeight, 10);

        // Title
        fill(100, 150, 255);
        textSize(24);
        textAlign(CENTER, TOP);
        text(message.title, width / 2, panelY + 30);

        // Message text
        fill(255);
        textSize(16);
        textAlign(CENTER, TOP);
        text(message.text, width / 2, panelY + 80);

        // Progress indicator
        fill(150);
        textSize(14);
        text(`Step ${this.tutorialStep + 1} of ${this.tutorialMessages.length}`, width / 2, panelY + panelHeight - 40);
    }

    renderHelpButton() {
        // Help button background
        const isHover = this.isMouseOverHelpButton();
        fill(isHover ? 80 : 60);
        stroke(isHover ? 150 : 100);
        strokeWeight(2);
        rect(this.helpButtonX, this.helpButtonY, this.helpButtonWidth, this.helpButtonHeight, 5);

        // Help button text
        fill(255);
        textSize(14);
        textAlign(CENTER, CENTER);
        text('HELP', this.helpButtonX + this.helpButtonWidth / 2, this.helpButtonY + this.helpButtonHeight / 2);
    }

    renderHintPanel() {
        // Hint panel
        const panelWidth = 500;
        const panelHeight = 350;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;

        // Panel background
        fill(30, 30, 40);
        stroke(100, 150, 255);
        strokeWeight(3);
        rect(panelX, panelY, panelWidth, panelHeight, 10);

        // Title
        fill(100, 150, 255);
        textSize(20);
        textAlign(CENTER, TOP);
        text('Help & Hints', width / 2, panelY + 20);

        // Progress
        const progress = this.gameState.getClueProgress();
        fill(255);
        textSize(16);
        text(`Progress: ${progress.found} / ${progress.total} clues found`, width / 2, panelY + 60);

        // Hint
        fill(200);
        textSize(14);
        textAlign(LEFT, TOP);
        const hint = this.gameState.getHint();
        text('Current Hint:\n' + hint, panelX + 30, panelY + 100);

        // Commands reminder
        fill(150);
        textSize(12);
        text('Available Commands:\nDIR  CD  TYPE  CLS  HELP  TREE  EXIT', panelX + 30, panelY + 200);

        // Close button
        fill(200, 50, 50);
        stroke(255);
        strokeWeight(2);
        rect(panelX + panelWidth - 100, panelY + panelHeight - 50, 80, 30, 5);

        fill(255);
        textSize(14);
        textAlign(CENTER, CENTER);
        text('CLOSE', panelX + panelWidth - 60, panelY + panelHeight - 35);
    }

    handleMousePressed() {
        // Handle tutorial progression
        if (this.showTutorial && this.tutorialStep < this.tutorialMessages.length) {
            this.tutorialStep++;

            if (this.tutorialStep >= this.tutorialMessages.length) {
                this.showTutorial = false;
            }
            return true;
        }

        // Handle help button
        if (this.isMouseOverHelpButton() && !this.showTutorial) {
            this.showHintPanel = !this.showHintPanel;
            return true;
        }

        // Handle hint panel close button
        if (this.showHintPanel && this.isMouseOverCloseButton()) {
            this.showHintPanel = false;
            return true;
        }

        // Close hint panel if clicking outside
        if (this.showHintPanel && !this.isMouseInsideHintPanel()) {
            this.showHintPanel = false;
            return true;
        }

        return false;
    }

    isMouseOverHelpButton() {
        return mouseX >= this.helpButtonX &&
               mouseX <= this.helpButtonX + this.helpButtonWidth &&
               mouseY >= this.helpButtonY &&
               mouseY <= this.helpButtonY + this.helpButtonHeight;
    }

    isMouseOverCloseButton() {
        const panelWidth = 500;
        const panelHeight = 350;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;

        const closeX = panelX + panelWidth - 100;
        const closeY = panelY + panelHeight - 50;

        return mouseX >= closeX && mouseX <= closeX + 80 &&
               mouseY >= closeY && mouseY <= closeY + 30;
    }

    isMouseInsideHintPanel() {
        const panelWidth = 500;
        const panelHeight = 350;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;

        return mouseX >= panelX && mouseX <= panelX + panelWidth &&
               mouseY >= panelY && mouseY <= panelY + panelHeight;
    }

    skipTutorial() {
        this.showTutorial = false;
        this.tutorialStep = this.tutorialMessages.length;
    }
}
