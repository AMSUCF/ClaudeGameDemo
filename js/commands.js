// Command processor for Windows CMD commands

export class CommandProcessor {
    constructor(fileSystem, gameState) {
        this.fileSystem = fileSystem;
        this.gameState = gameState;

        // Command registry
        this.commands = {
            'dir': this.cmdDir.bind(this),
            'cd': this.cmdCd.bind(this),
            'type': this.cmdType.bind(this),
            'cls': this.cmdCls.bind(this),
            'clear': this.cmdCls.bind(this), // Alias
            'help': this.cmdHelp.bind(this),
            'tree': this.cmdTree.bind(this),
            'echo': this.cmdEcho.bind(this),
            'exit': this.cmdExit.bind(this),
            'ver': this.cmdVer.bind(this),
            'date': this.cmdDate.bind(this),
            'time': this.cmdTime.bind(this)
        };
    }

    // Execute a command
    execute(input) {
        console.log('[CMD] execute called with input:', input);

        if (!input || input.trim() === '') {
            return { output: '', shouldClose: false, shouldClear: false };
        }

        // Parse command and arguments
        const parts = input.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        console.log('[CMD] Parsed command:', command, 'args:', args);

        // Check if command exists
        if (this.commands[command]) {
            console.log('[CMD] Command found, executing:', command);
            const result = this.commands[command](args);
            console.log('[CMD] Command result:', result);
            return result;
        } else {
            console.log('[CMD] Command not recognized:', command);
            return {
                output: `'${parts[0]}' is not recognized as an internal or external command,\noperable program or batch file.\n\nType HELP to see available commands.`,
                shouldClose: false,
                shouldClear: false
            };
        }
    }

    // DIR command - list directory contents
    cmdDir(args) {
        console.log('[CMD] DIR command executing');
        const result = this.fileSystem.listDirectory();
        console.log('[CMD] DIR result:', result);

        if (!result.success) {
            console.log('[CMD] DIR failed:', result.message);
            return { output: result.message, shouldClose: false, shouldClear: false };
        }

        let output = ` Directory of ${this.fileSystem.getCurrentPath()}\n\n`;

        // Count directories and files
        const dirs = result.entries.filter(e => e.type === 'directory');
        const files = result.entries.filter(e => e.type === 'file');

        console.log('[CMD] DIR found', dirs.length, 'directories and', files.length, 'files');

        // List directories first
        if (dirs.length > 0) {
            dirs.forEach(entry => {
                output += `<DIR>          ${entry.name}\n`;
            });
        }

        // List files
        if (files.length > 0) {
            files.forEach(entry => {
                const size = entry.size.toString().padStart(14, ' ');
                output += `     ${size} ${entry.name}\n`;
            });
        }

        if (result.entries.length === 0) {
            output += '(No files or folders)\n';
        }

        output += `\n     ${files.length} File(s)\n`;
        output += `     ${dirs.length} Dir(s)`;

        return { output: output, shouldClose: false, shouldClear: false };
    }

    // CD command - change directory
    cmdCd(args) {
        if (args.length === 0) {
            // No arguments - just show current directory
            return {
                output: this.fileSystem.getCurrentPath(),
                shouldClose: false,
                shouldClear: false
            };
        }

        const path = args.join(' '); // Join in case path has spaces
        const result = this.fileSystem.changeDirectory(path);

        if (!result.success) {
            return { output: result.message, shouldClose: false, shouldClear: false };
        }

        return { output: '', shouldClose: false, shouldClear: false };
    }

    // TYPE command - display file contents
    cmdType(args) {
        if (args.length === 0) {
            return {
                output: 'The syntax of the command is incorrect.\n\nUsage: TYPE [filename]',
                shouldClose: false,
                shouldClear: false
            };
        }

        const filename = args.join(' ');
        const result = this.fileSystem.readFile(filename);

        if (!result.success) {
            return { output: result.content, shouldClose: false, shouldClear: false };
        }

        // Check if this file contains a clue
        console.log('[CMD] Checking for clues in content...');
        console.log('[CMD] Content length:', result.content.length);
        console.log('[CMD] Content includes CLUE #?', result.content.includes('CLUE #'));

        if (result.content.includes('CLUE #')) {
            console.log('[CMD] CLUE DETECTED! Calling gameState.registerClueFound()');
            console.log('[CMD] gameState exists?', !!this.gameState);
            this.gameState.registerClueFound(result.content);
        } else {
            console.log('[CMD] No clue marker found in this file');
        }

        return { output: result.content, shouldClose: false, shouldClear: false };
    }

    // CLS command - clear screen
    cmdCls(args) {
        return { output: '', shouldClose: false, shouldClear: true };
    }

    // HELP command - show available commands
    cmdHelp(args) {
        let output = 'Available Commands:\n';
        output += '==================\n\n';
        output += 'DIR              - Lists files and folders in current directory\n';
        output += 'CD [path]        - Changes to specified directory\n';
        output += 'CD ..            - Goes up one directory level\n';
        output += 'TYPE [file]      - Displays the contents of a text file\n';
        output += 'CLS              - Clears the screen\n';
        output += 'TREE             - Displays directory structure as a tree\n';
        output += 'ECHO [text]      - Displays the specified text\n';
        output += 'HELP             - Shows this help message\n';
        output += 'EXIT             - Closes the command prompt\n';
        output += 'VER              - Shows Windows version\n';
        output += 'DATE             - Shows current date\n';
        output += 'TIME             - Shows current time\n';
        output += '\nFor more help, visit the Desktop folder for quick_commands.txt';

        return { output: output, shouldClose: false, shouldClear: false };
    }

    // TREE command - show directory tree
    cmdTree(args) {
        let output = `Folder PATH listing\n`;
        output += `${this.fileSystem.getCurrentPath()}\n`;

        const tree = this.fileSystem.getDirectoryTree();

        if (tree) {
            output += tree;
        } else {
            output += 'No subfolders exist\n';
        }

        return { output: output, shouldClose: false, shouldClear: false };
    }

    // ECHO command - display text
    cmdEcho(args) {
        if (args.length === 0) {
            return { output: 'ECHO is on.', shouldClose: false, shouldClear: false };
        }

        return { output: args.join(' '), shouldClose: false, shouldClear: false };
    }

    // EXIT command - close terminal
    cmdExit(args) {
        return { output: '', shouldClose: true, shouldClear: false };
    }

    // VER command - show version
    cmdVer(args) {
        return {
            output: 'Command Line Mystery Education Game [Version 1.0]\nPowered by P5.js',
            shouldClose: false,
            shouldClear: false
        };
    }

    // DATE command - show date
    cmdDate(args) {
        const date = new Date().toLocaleDateString();
        return {
            output: `The current date is: ${date}`,
            shouldClose: false,
            shouldClear: false
        };
    }

    // TIME command - show time
    cmdTime(args) {
        const time = new Date().toLocaleTimeString();
        return {
            output: `The current time is: ${time}`,
            shouldClose: false,
            shouldClear: false
        };
    }
}
