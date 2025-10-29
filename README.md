# Command Line Mystery

An interactive educational game that teaches Windows command line basics through a detective mystery adventure. Built with P5.js.

![Command Line Mystery](https://img.shields.io/badge/P5.js-Game-ED225D?logo=p5.js)
![Educational](https://img.shields.io/badge/Type-Educational-blue)
![Status](https://img.shields.io/badge/Status-Complete-success)

## Overview

**Command Line Mystery** is an engaging way to learn Windows command prompt skills. You play as a detective investigating the theft of valuable research data. Navigate a simulated computer using real command-line commands to explore directories, read files, and discover clues to solve the case.

### What You'll Learn

- `DIR` - List files and folders
- `CD` - Navigate directories
- `TYPE` - Read file contents
- `TREE` - View directory structure
- `CLS` - Clear the screen
- Path navigation (absolute and relative paths)
- Understanding file system hierarchies

## Features

- **Simulated Windows Desktop** - Authentic-looking desktop environment
- **Interactive Command Prompt** - Real command-line interface with command history
- **Mystery Story** - Engaging detective narrative with 6 clues to discover
- **Tutorial System** - Built-in help for beginners
- **Progress Tracking** - Visual indicators show your investigation progress
- **Authentic Commands** - Learn real Windows CMD commands

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Python 3 (for local development server) or any HTTP server

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AMSUCF/ClaudeGameDemo.git
cd ClaudeGameDemo
```

2. Start a local web server:
```bash
python -m http.server 8000
```

Or use npm:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

### How to Play

1. **Start the Game** - Read the tutorial messages (or click through them)
2. **Open Command Prompt** - Click the "Command Prompt" icon on the desktop
3. **Begin Investigating** - Use `TYPE Desktop\case_notes.txt` to read your first case file
4. **Explore** - Use `DIR` to see files, `CD` to change folders, `TYPE` to read files
5. **Follow the Clues** - Each discovered clue leads you closer to solving the mystery
6. **Solve the Case** - Find all 6 clues to complete the investigation

### Quick Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `DIR` | List directory contents | `DIR` |
| `CD [folder]` | Change directory | `CD Documents` |
| `CD ..` | Go to parent directory | `CD ..` |
| `TYPE [file]` | Display file contents | `TYPE readme.txt` |
| `CLS` | Clear screen | `CLS` |
| `HELP` | Show all commands | `HELP` |
| `TREE` | Show directory tree | `TREE` |
| `EXIT` | Close terminal | `EXIT` |

## Project Structure

```
ClaudeGameDemo/
├── index.html              # Entry point
├── sketch.js               # Main P5.js sketch
├── styles.css              # Styling
├── package.json            # Project metadata
├── js/
│   ├── desktop.js          # Desktop environment
│   ├── terminal.js         # Command prompt window
│   ├── filesystem.js       # Virtual file system
│   ├── commands.js         # Command implementations
│   ├── gamestate.js        # Progress tracking
│   └── tutorial.js         # Help system
├── data/
│   └── mystery-files.json  # Story and file structure
└── README.md
```

## The Mystery

Someone has stolen valuable renewable energy research from Dr. Chen's computer. As a detective, you must:

- Investigate the crime scene (the computer's file system)
- Read emails, notes, and logs
- Follow a trail of clues through various directories
- Identify the culprit and recover the stolen data

The mystery involves exploring user directories, checking hidden folders, and piecing together evidence from multiple files.

## Educational Goals

This game teaches:

1. **Command Line Basics** - Essential commands for file system navigation
2. **Directory Navigation** - Understanding paths, folders, and hierarchies
3. **File Operations** - Reading files and understanding file types
4. **Problem Solving** - Using technical skills to solve real-world problems
5. **Confidence** - Building comfort with the command-line interface

## Technologies Used

- **P5.js** - Graphics and interaction framework
- **JavaScript (ES6)** - Core game logic with modules
- **HTML5/CSS3** - Structure and styling

## Customization

### Adding New Clues

Edit `data/mystery-files.json` to add files and directories. Mark clues with `[CLUE #N FOUND: description]` in the file content.

### Adding New Commands

1. Add command function in `js/commands.js`
2. Register it in the `commands` object
3. Update the help text

### Modifying the Story

Edit the file contents in `mystery-files.json` to create your own mystery narrative.

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Create new mystery scenarios

## License

MIT License - feel free to use this for educational purposes!

## Acknowledgments

- Built with [P5.js](https://p5js.org/)
- Inspired by classic text adventure games
- Designed to make command-line learning fun and accessible

## Future Enhancements

Potential additions:
- [ ] More advanced commands (move, copy, delete)
- [ ] Multiple mystery scenarios
- [ ] Achievement system
- [ ] Time-based challenges
- [ ] Multiplayer investigation mode
- [ ] Mobile-friendly touch interface

## Support

For questions or issues:
- Check the in-game HELP button
- Review the tutorial messages
- Read `Desktop\quick_commands.txt` in-game

---

**Happy Investigating, Detective!** 🔍

Learn the command line, solve the mystery, and become a command prompt pro!
