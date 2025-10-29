// Terminal / Command Prompt window

import { CommandProcessor } from './commands.js';

export class Terminal {
    constructor(x, y, fileSystem, gameState) {
        this.x = x;
        this.y = y;
        this.width = 800;
        this.height = 500;
        this.titleBarHeight = 30;

        this.fileSystem = fileSystem;
        this.gameState = gameState;
        this.commandProcessor = new CommandProcessor(fileSystem, gameState);

        // Terminal state
        this.isOpen = true;
        this.isFocused = true;
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        // Text buffer
        this.outputLines = [];
        this.currentInput = '';
        this.commandHistory = [];
        this.historyIndex = -1;

        // Display settings
        this.fontSize = 14;
        this.lineHeight = 18;
        this.padding = 10;
        this.scrollOffset = 0;
        this.maxVisibleLines = Math.floor((this.height - this.titleBarHeight - this.padding * 2) / this.lineHeight);

        // Cursor
        this.cursorVisible = true;
        this.cursorBlinkTime = 0;
        this.cursorBlinkInterval = 30; // frames

        // Welcome message
        this.addWelcomeMessage();
    }

    addWelcomeMessage() {
        this.outputLines.push('Command Line Mystery - Detective Terminal');
        this.outputLines.push('Type HELP for available commands');
        this.outputLines.push('');
        this.showPrompt();
    }

    showPrompt() {
        const prompt = `${this.fileSystem.getCurrentPath()}>`;
        this.outputLines.push(prompt);
    }

    update() {
        // Update cursor blink
        this.cursorBlinkTime++;
        if (this.cursorBlinkTime >= this.cursorBlinkInterval) {
            this.cursorVisible = !this.cursorVisible;
            this.cursorBlinkTime = 0;
        }
    }

    render() {
        if (!this.isOpen) return;

        // Draw window shadow
        fill(0, 0, 0, 50);
        noStroke();
        rect(this.x + 5, this.y + 5, this.width, this.height, 5);

        // Draw window background
        fill(255);
        stroke(100);
        strokeWeight(1);
        rect(this.x, this.y, this.width, this.height, 5);

        // Draw title bar
        fill(this.isFocused ? 40 : 100);
        noStroke();
        rect(this.x, this.y, this.width, this.titleBarHeight, 5, 5, 0, 0);

        // Draw title text
        fill(255);
        textSize(14);
        textAlign(LEFT, CENTER);
        text('Command Prompt', this.x + 10, this.y + this.titleBarHeight / 2);

        // Draw close button
        fill(this.isMouseOverCloseButton() ? 220 : 200);
        stroke(100);
        strokeWeight(1);
        const closeX = this.x + this.width - 25;
        const closeY = this.y + 7;
        rect(closeX, closeY, 16, 16);

        // Draw X
        fill(0);
        textSize(12);
        textAlign(CENTER, CENTER);
        text('X', closeX + 8, closeY + 8);

        // Draw terminal content area
        fill(0); // Black background
        noStroke();
        rect(this.x, this.y + this.titleBarHeight, this.width, this.height - this.titleBarHeight);

        // Draw text content
        this.renderText();
    }

    renderText() {
        fill(200, 255, 200); // Green text
        textSize(this.fontSize);
        textAlign(LEFT, TOP);
        textFont('Courier New');

        const contentY = this.y + this.titleBarHeight + this.padding;
        const contentX = this.x + this.padding;

        // Calculate which lines to show based on scroll
        const totalLines = this.outputLines.length + 1; // +1 for current input line
        const startLine = Math.max(0, totalLines - this.maxVisibleLines);

        // Render visible lines
        for (let i = startLine; i < this.outputLines.length; i++) {
            const lineY = contentY + (i - startLine) * this.lineHeight;
            text(this.outputLines[i], contentX, lineY);
        }

        // Render current input line with cursor
        const inputLineY = contentY + (this.outputLines.length - startLine) * this.lineHeight;
        const inputText = this.currentInput;
        text(inputText, contentX, inputLineY);

        // Draw cursor
        if (this.cursorVisible && this.isFocused) {
            const cursorX = contentX + textWidth(inputText);
            fill(200, 255, 200);
            rect(cursorX, inputLineY, 8, this.fontSize);
        }
    }

    handleInput(key) {
        if (!this.isFocused) return;

        // Handle regular character input
        if (key.length === 1 && key !== '\n' && key !== '\r') {
            this.currentInput += key;
        }
    }

    handleKeyPressed(keyCode, key) {
        if (!this.isFocused) return;

        // Enter key - execute command
        if (keyCode === 13) { // ENTER
            this.executeCommand();
        }
        // Backspace
        else if (keyCode === 8) { // BACKSPACE
            if (this.currentInput.length > 0) {
                this.currentInput = this.currentInput.slice(0, -1);
            }
        }
        // Up arrow - previous command
        else if (keyCode === 38) { // UP ARROW
            if (this.commandHistory.length > 0) {
                if (this.historyIndex === -1) {
                    this.historyIndex = this.commandHistory.length - 1;
                } else if (this.historyIndex > 0) {
                    this.historyIndex--;
                }
                this.currentInput = this.commandHistory[this.historyIndex];
            }
        }
        // Down arrow - next command
        else if (keyCode === 40) { // DOWN ARROW
            if (this.historyIndex !== -1) {
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex++;
                    this.currentInput = this.commandHistory[this.historyIndex];
                } else {
                    this.historyIndex = -1;
                    this.currentInput = '';
                }
            }
        }
    }

    executeCommand() {
        if (!this.currentInput.trim()) {
            this.showPrompt();
            return;
        }

        // Add input to output
        const lastLine = this.outputLines[this.outputLines.length - 1];
        this.outputLines[this.outputLines.length - 1] = lastLine + this.currentInput;

        // Add to command history
        this.commandHistory.push(this.currentInput);
        this.historyIndex = -1;

        // Execute command
        const result = this.commandProcessor.execute(this.currentInput);

        // Clear input
        this.currentInput = '';

        // Handle command result
        if (result.shouldClear) {
            this.outputLines = [];
        } else if (result.output) {
            // Split output into lines and add to buffer
            const lines = result.output.split('\n');
            this.outputLines.push(...lines);
        }

        if (result.shouldClose) {
            this.close();
            return;
        }

        // Show new prompt
        this.outputLines.push('');
        this.showPrompt();

        // Auto-scroll to bottom
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.scrollOffset = Math.max(0, this.outputLines.length - this.maxVisibleLines);
    }

    handleMousePressed(mx, my) {
        // Check if clicking on title bar (for dragging)
        if (mx >= this.x && mx <= this.x + this.width &&
            my >= this.y && my <= this.y + this.titleBarHeight) {

            // Check if clicking close button
            if (this.isMouseOverCloseButton()) {
                this.close();
                return true;
            }

            // Start dragging
            this.isDragging = true;
            this.dragOffsetX = mx - this.x;
            this.dragOffsetY = my - this.y;
            this.focus();
            return true;
        }

        // Check if clicking inside window (for focus)
        if (this.isMouseInside(mx, my)) {
            this.focus();
            return true;
        }

        return false;
    }

    handleMouseReleased() {
        this.isDragging = false;
    }

    handleMouseDragged(mx, my) {
        if (this.isDragging) {
            this.x = mx - this.dragOffsetX;
            this.y = my - this.dragOffsetY;

            // Keep window on screen
            this.x = Math.max(0, Math.min(this.x, width - this.width));
            this.y = Math.max(0, Math.min(this.y, height - 50));
        }
    }

    isMouseInside(mx, my) {
        return mx >= this.x && mx <= this.x + this.width &&
               my >= this.y && my <= this.y + this.height;
    }

    isMouseOverCloseButton() {
        const closeX = this.x + this.width - 25;
        const closeY = this.y + 7;
        return mouseX >= closeX && mouseX <= closeX + 16 &&
               mouseY >= closeY && mouseY <= closeY + 16;
    }

    focus() {
        this.isFocused = true;
    }

    unfocus() {
        this.isFocused = false;
    }

    close() {
        this.isOpen = false;
    }

    isActive() {
        return this.isOpen;
    }
}
