// Desktop environment manager

import { Terminal } from './terminal.js';

export class Desktop {
    constructor(fileSystem, gameState, tutorial) {
        this.fileSystem = fileSystem;
        this.gameState = gameState;
        this.tutorial = tutorial;

        // Desktop state
        this.terminals = [];

        // Desktop icons
        this.icons = [
            {
                x: 30,
                y: 30,
                width: 80,
                height: 80,
                label: 'Command\nPrompt',
                type: 'terminal'
            },
            {
                x: 30,
                y: 130,
                width: 80,
                height: 80,
                label: 'Help',
                type: 'help'
            }
        ];

        this.hoveredIcon = null;
    }

    update() {
        // Update all active terminals
        this.terminals.forEach(terminal => {
            if (terminal.isActive()) {
                terminal.update();
            }
        });
    }

    render() {
        // Draw desktop background
        this.renderBackground();

        // Draw desktop icons
        this.renderIcons();

        // Draw taskbar
        this.renderTaskbar();

        // Render all active terminals
        this.terminals.forEach(terminal => {
            if (terminal.isActive()) {
                terminal.render();
            }
        });

        // Render game notifications
        this.gameState.renderNotifications();

        // Render progress indicator on desktop (top-right corner) - always visible
        this.gameState.renderProgress(width - 180, 10);
    }

    renderBackground() {
        // Windows-style blue gradient background
        for (let y = 0; y < height; y++) {
            const t = y / height;
            const c = lerpColor(color(58, 110, 165), color(137, 196, 244), t);
            stroke(c);
            strokeWeight(1);
            line(0, y, width, y);
        }
    }

    renderIcons() {
        this.hoveredIcon = null;

        this.icons.forEach((icon, index) => {
            const isHovered = this.isMouseOverIcon(icon);

            if (isHovered) {
                this.hoveredIcon = index;
            }

            // Icon background (highlight if hovered)
            if (isHovered) {
                fill(255, 255, 255, 50);
                noStroke();
                rect(icon.x - 5, icon.y - 5, icon.width + 10, icon.height + 10, 5);
            }

            // Icon body
            if (icon.type === 'terminal') {
                this.drawTerminalIcon(icon.x, icon.y, icon.width, icon.height);
            } else if (icon.type === 'help') {
                this.drawHelpIcon(icon.x, icon.y, icon.width, icon.height);
            }

            // Icon label
            fill(255);
            stroke(0);
            strokeWeight(3);
            textSize(12);
            textAlign(CENTER, TOP);
            text(icon.label, icon.x + icon.width / 2, icon.y + icon.height + 5);

            // Remove stroke for other elements
            noStroke();
        });
    }

    drawTerminalIcon(x, y, w, h) {
        // Black terminal window
        fill(0);
        stroke(200);
        strokeWeight(2);
        rect(x + 10, y + 10, w - 20, h - 20, 3);

        // Green prompt symbol
        fill(0, 255, 0);
        noStroke();
        textSize(20);
        textAlign(CENTER, CENTER);
        text('C:\\>', x + w / 2, y + h / 2);
    }

    drawHelpIcon(x, y, w, h) {
        // Question mark icon
        fill(255, 200, 0);
        stroke(200);
        strokeWeight(2);
        ellipse(x + w / 2, y + h / 2, w - 20, h - 20);

        fill(0);
        noStroke();
        textSize(36);
        textAlign(CENTER, CENTER);
        text('?', x + w / 2, y + h / 2 - 2);
    }

    renderTaskbar() {
        // Windows-style taskbar at bottom
        const taskbarHeight = 40;

        // Taskbar background
        fill(30, 30, 30);
        noStroke();
        rect(0, height - taskbarHeight, width, taskbarHeight);

        // Start button area with hover effect
        const isStartHovered = this.isMouseOverStartButton();
        fill(isStartHovered ? 70 : 50, isStartHovered ? 70 : 50, isStartHovered ? 70 : 50);
        rect(0, height - taskbarHeight, 100, taskbarHeight);

        fill(255);
        textSize(14);
        textAlign(CENTER, CENTER);
        text('Start', 50, height - taskbarHeight / 2);

        // Taskbar items for open terminals
        let taskbarX = 120;
        this.terminals.forEach((terminal, index) => {
            if (terminal.isActive()) {
                fill(terminal.isFocused ? 80 : 50);
                stroke(100);
                strokeWeight(1);
                rect(taskbarX, height - taskbarHeight + 5, 150, taskbarHeight - 10, 3);

                fill(255);
                noStroke();
                textSize(12);
                textAlign(LEFT, CENTER);
                text('Command Prompt', taskbarX + 10, height - taskbarHeight / 2);

                taskbarX += 160;
            }
        });

        // Clock (decorative)
        fill(255);
        textSize(12);
        textAlign(RIGHT, CENTER);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        text(timeStr, width - 20, height - taskbarHeight / 2);
    }

    isMouseOverIcon(icon) {
        return mouseX >= icon.x && mouseX <= icon.x + icon.width &&
               mouseY >= icon.y && mouseY <= icon.y + icon.height;
    }

    isMouseOverStartButton() {
        const taskbarHeight = 40;
        return mouseX >= 0 && mouseX <= 100 &&
               mouseY >= height - taskbarHeight && mouseY <= height;
    }

    handleMousePressed() {
        // Check if clicking Start button
        if (this.isMouseOverStartButton()) {
            this.gameState.addNotification('This feature is not available. Use Command Prompt to complete your mission.');
            return;
        }

        // Check if clicking on an icon
        this.icons.forEach((icon, index) => {
            if (this.isMouseOverIcon(icon)) {
                this.handleIconClick(icon);
                return;
            }
        });

        // Check if clicking on a terminal
        let handled = false;
        for (let i = this.terminals.length - 1; i >= 0; i--) {
            const terminal = this.terminals[i];
            if (terminal.isActive() && terminal.handleMousePressed(mouseX, mouseY)) {
                // Bring to front
                this.bringTerminalToFront(i);
                handled = true;
                break;
            }
        }

        // Unfocus all terminals if clicking on desktop
        if (!handled) {
            this.terminals.forEach(t => t.unfocus());
        }
    }

    handleIconClick(icon) {
        if (icon.type === 'terminal') {
            this.openTerminal();
        } else if (icon.type === 'help') {
            this.tutorial.showHintPanel = true;
        }
    }

    openTerminal() {
        // Create new terminal window
        const offsetX = this.terminals.length * 30;
        const offsetY = this.terminals.length * 30;

        const terminal = new Terminal(
            100 + offsetX,
            100 + offsetY,
            this.fileSystem,
            this.gameState
        );

        // Unfocus other terminals
        this.terminals.forEach(t => t.unfocus());

        this.terminals.push(terminal);
    }

    bringTerminalToFront(index) {
        if (index < 0 || index >= this.terminals.length) return;

        const terminal = this.terminals.splice(index, 1)[0];
        this.terminals.push(terminal);

        // Focus this terminal, unfocus others
        this.terminals.forEach((t, i) => {
            if (i === this.terminals.length - 1) {
                t.focus();
            } else {
                t.unfocus();
            }
        });
    }

    handleMouseReleased() {
        this.terminals.forEach(terminal => {
            if (terminal.isActive()) {
                terminal.handleMouseReleased();
            }
        });
    }

    handleMouseDragged() {
        this.terminals.forEach(terminal => {
            if (terminal.isActive()) {
                terminal.handleMouseDragged(mouseX, mouseY);
            }
        });
    }

    handleKeyPressed() {
        // Send key event to focused terminal
        const focusedTerminal = this.terminals.find(t => t.isActive() && t.isFocused);

        if (focusedTerminal) {
            focusedTerminal.handleKeyPressed(keyCode, key);
        }
    }

    handleKeyTyped() {
        // Send typed character to focused terminal
        const focusedTerminal = this.terminals.find(t => t.isActive() && t.isFocused);

        if (focusedTerminal) {
            focusedTerminal.handleInput(key);
        }
    }
}
