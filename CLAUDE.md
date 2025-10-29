# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClaudeGameDemo is an educational game built with P5.js that teaches users the basics of the Windows command line through an interactive mystery adventure. Players navigate a simulated Windows desktop, open a command prompt, and use real command-line commands to explore a virtual file system searching for clues to solve a mystery.

## Technology Stack

- **P5.js**: Graphics rendering and UI framework
- **Vanilla JavaScript (ES6)**: Core game logic with ES6 modules
- **HTTP Server**: Simple development server (no build step required)

## Commands

### Development
```bash
# Install dependencies (if any)
npm install

# Start development server
npm start
# Or use Python's built-in server:
python -m http.server 8000

# Open in browser
# Navigate to http://localhost:8000
```

### Testing
- Open index.html in a browser to test
- Use browser developer console for debugging
- Check console for P5.js errors or game state issues

## Architecture

### Core Systems

The game is organized into modular components that handle distinct responsibilities:

#### 1. Desktop Environment (`js/desktop.js`)
- Renders simulated Windows desktop (background, taskbar, icons)
- Manages window creation, dragging, minimizing, and closing
- Handles click events for launching Command Prompt
- Draws desktop icons (Command Prompt, folders, etc.)

#### 2. Command Prompt Interface (`js/terminal.js`)
- Renders terminal window with title bar and borders
- Manages text input/output buffer
- Implements command history (up/down arrow navigation)
- Handles text rendering with monospace font
- Cursor blinking animation
- Scrolling for long output

#### 3. Virtual File System (`js/filesystem.js`)
- Tree-based directory structure stored as nested objects
- Files contain text content (clues, hints, documents)
- Tracks current working directory
- Path resolution (absolute and relative paths)
- Directory traversal methods

#### 4. Command Processor (`js/commands.js`)
- Parses user input and routes to appropriate command handlers
- Implements Windows commands:
  - `dir` - list directory contents
  - `cd` - change directory
  - `type` - display file contents
  - `cls` - clear screen
  - `help` - show available commands
  - `tree` - show directory tree
  - `echo` - print text
  - `exit` - close terminal
- Returns appropriate error messages for invalid commands/paths
- Case-insensitive command matching

#### 5. Game State & Story (`js/gamestate.js`)
- Tracks mystery storyline progression
- Records which clues have been discovered
- Manages victory conditions
- Provides hints when player is stuck
- Tracks player progress through the mystery

#### 6. Tutorial System (`js/tutorial.js`)
- Contextual help overlay system
- Introduces commands progressively as needed
- Optional "getting started" guide
- Hint system for stuck players

### Data Structure

#### File System (`data/mystery-files.json`)
The virtual file system is stored as a JSON structure:
```json
{
  "C:": {
    "type": "directory",
    "contents": {
      "Users": {
        "type": "directory",
        "contents": {
          "Detective": {
            "type": "directory",
            "contents": {
              "note.txt": {
                "type": "file",
                "content": "Clue content here..."
              }
            }
          }
        }
      }
    }
  }
}
```

### Game Flow

1. **Desktop Launch**: Player sees simulated Windows desktop
2. **Open Command Prompt**: Player clicks Command Prompt icon
3. **Introduction**: Initial message explains the mystery
4. **Exploration**: Player uses `dir`, `cd`, `type` to navigate and read files
5. **Clue Discovery**: Finding clues updates game state
6. **Victory**: Discovering final clue or solving puzzle wins the game

### File Organization

```
/
├── index.html           # Entry point, loads P5.js and modules
├── styles.css           # UI styling for desktop/terminal
├── sketch.js            # Main P5.js sketch (setup/draw)
├── js/
│   ├── desktop.js       # Desktop environment manager
│   ├── terminal.js      # Command prompt window
│   ├── filesystem.js    # Virtual file system
│   ├── commands.js      # Command implementations
│   ├── gamestate.js     # Story progression tracker
│   └── tutorial.js      # Tutorial and help system
├── data/
│   └── mystery-files.json  # File system with clues
├── assets/
│   └── icons/           # Desktop icons (optional)
├── package.json         # Project metadata
└── README.md           # User-facing documentation
```

## Adding New Commands

To add a new command:
1. Add command handler function in `js/commands.js`
2. Register command in the command dispatcher
3. Update help text to include new command
4. Test with various inputs and edge cases

## Adding New Clues

To extend the mystery:
1. Edit `data/mystery-files.json` to add new files/directories
2. Update `js/gamestate.js` to track new clue discovery
3. Ensure clues lead logically to next steps
4. Test navigation paths work correctly
