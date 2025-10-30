// Main P5.js sketch - Entry point for the game
import { Desktop } from './js/desktop.js';
import { FileSystem } from './js/filesystem.js';
import { GameState } from './js/gamestate.js';
import { Tutorial } from './js/tutorial.js';

let desktop;
let fileSystem;
let gameState;
let tutorial;

// P5.js setup function
window.setup = function() {
    createCanvas(1024, 768);

    // Initialize file system
    fileSystem = new FileSystem();

    // Initialize game state
    gameState = new GameState(fileSystem);

    // Initialize tutorial
    tutorial = new Tutorial(gameState);

    // Initialize desktop with references to other systems
    desktop = new Desktop(fileSystem, gameState, tutorial);

    // Set text properties
    textFont('Courier New');

    console.log('Command Line Mystery - Game Loaded!');
    console.log('Click the Command Prompt icon to begin...');
}

// P5.js draw function - called every frame
window.draw = function() {
    // Update and render desktop (includes terminals if open)
    desktop.update();
    desktop.render();

    // Render tutorial overlay if active
    tutorial.render();
}

// P5.js mouse pressed event
window.mousePressed = function() {
    desktop.handleMousePressed();
    tutorial.handleMousePressed();
}

// P5.js mouse released event
window.mouseReleased = function() {
    desktop.handleMouseReleased();
}

// P5.js mouse dragged event
window.mouseDragged = function() {
    desktop.handleMouseDragged();
}

// P5.js key pressed event
window.keyPressed = function() {
    desktop.handleKeyPressed();

    // Prevent default browser behavior for certain keys
    if (keyCode === UP_ARROW || keyCode === DOWN_ARROW || keyCode === TAB) {
        return false;
    }
}

// P5.js key typed event
window.keyTyped = function() {
    desktop.handleKeyTyped();

    // Prevent default for Enter key
    if (key === '\n' || key === '\r') {
        return false;
    }
}

// P5.js mouse wheel event
window.mouseWheel = function(event) {
    desktop.handleMouseWheel(event.delta);
    // Prevent page scrolling
    return false;
}
