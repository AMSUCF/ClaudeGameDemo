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

        // Resize state
        this.isResizing = false;
        this.minWidth = 400;
        this.minHeight = 300;
        this.maxWidth = 1000;
        this.maxHeight = 700;
        this.resizeHandleSize = 16;

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

        // Draw resize handle (bottom-right corner)
        const isOverResize = this.isMouseOverResizeHandle();
        fill(isOverResize ? 150 : 100);
        stroke(isOverResize ? 200 : 150);
        strokeWeight(1);
        const resizeX = this.x + this.width - this.resizeHandleSize;
        const resizeY = this.y + this.height - this.resizeHandleSize;

        // Draw three diagonal lines for resize grip
        for (let i = 0; i < 3; i++) {
            const offset = i * 5 + 4;
            line(resizeX + offset, resizeY + this.resizeHandleSize - 2,
                 resizeX + this.resizeHandleSize - 2, resizeY + offset);
        }
    }

    renderText() {
        fill(200, 255, 200); // Green text
        textSize(this.fontSize);
        textAlign(LEFT, TOP);
        textFont('Courier New');

        const contentY = this.y + this.titleBarHeight + this.padding;
        const contentX = this.x + this.padding;

        // Recalculate max visible lines based on current height
        this.maxVisibleLines = Math.floor((this.height - this.titleBarHeight - this.padding * 2) / this.lineHeight);

        // Reserve one line for the input prompt
        const maxOutputLines = Math.max(1, this.maxVisibleLines - 1);

        // Calculate scroll range (accounting for reserved input line)
        const totalLines = this.outputLines.length;
        const maxScrollOffset = Math.max(0, totalLines - maxOutputLines);

        // Clamp scroll offset
        this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, maxScrollOffset));

        // Calculate which output lines to show based on scroll offset
        const startLine = this.scrollOffset;
        const endLine = Math.min(this.outputLines.length, startLine + maxOutputLines);

        // Render visible output lines
        for (let i = startLine; i < endLine; i++) {
            const lineY = contentY + (i - startLine) * this.lineHeight;
            text(this.outputLines[i], contentX, lineY);
        }

        // Always render current input line with cursor at the bottom
        const inputLineIndex = endLine - startLine; // Position after last output line
        const inputLineY = contentY + inputLineIndex * this.lineHeight;
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
            // Auto-scroll to bottom when user types
            this.scrollToBottom();
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
            this.scrollToBottom();
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
            this.scrollToBottom();
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
            this.scrollToBottom();
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

        // Show new prompt (no empty line needed)
        this.showPrompt();

        // Auto-scroll to bottom
        this.scrollToBottom();
    }

    scrollToBottom() {
        // Scroll to show the most recent output lines (reserving one line for input)
        const maxOutputLines = Math.max(1, this.maxVisibleLines - 1);
        this.scrollOffset = Math.max(0, this.outputLines.length - maxOutputLines);
    }

    handleMouseWheel(delta) {
        if (!this.isMouseInside(mouseX, mouseY)) return false;

        // Scroll speed: 3 lines per wheel tick
        const scrollAmount = 3;

        // Calculate max scroll offset (reserving one line for input)
        const maxOutputLines = Math.max(1, this.maxVisibleLines - 1);
        const maxScrollOffset = Math.max(0, this.outputLines.length - maxOutputLines);

        if (delta > 0) {
            // Scroll down
            this.scrollOffset = Math.min(maxScrollOffset, this.scrollOffset + scrollAmount);
        } else {
            // Scroll up
            this.scrollOffset = Math.max(0, this.scrollOffset - scrollAmount);
        }

        return true; // Consumed the event
    }

    handleMousePressed(mx, my) {
        // Check if clicking resize handle
        if (this.isMouseOverResizeHandle()) {
            this.isResizing = true;
            this.focus();
            return true;
        }

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
        this.isResizing = false;
    }

    handleMouseDragged(mx, my) {
        if (this.isResizing) {
            // Calculate new dimensions
            const newWidth = mx - this.x;
            const newHeight = my - this.y;

            // Apply constraints
            this.width = Math.max(this.minWidth, Math.min(this.maxWidth, newWidth));
            this.height = Math.max(this.minHeight, Math.min(this.maxHeight, newHeight));

            // Recalculate max visible lines
            this.maxVisibleLines = Math.floor((this.height - this.titleBarHeight - this.padding * 2) / this.lineHeight);

            // Adjust scroll if needed
            this.scrollToBottom();
        } else if (this.isDragging) {
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

    isMouseOverResizeHandle() {
        const resizeX = this.x + this.width - this.resizeHandleSize;
        const resizeY = this.y + this.height - this.resizeHandleSize;
        return mouseX >= resizeX && mouseX <= this.x + this.width &&
               mouseY >= resizeY && mouseY <= this.y + this.height;
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
