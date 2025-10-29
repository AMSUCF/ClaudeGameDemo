// Virtual File System for simulating Windows directory structure

export class FileSystem {
    constructor() {
        this.currentPath = 'C:\\Users\\Detective';
        this.root = null;
        this.loadFileSystem();
    }

    async loadFileSystem() {
        try {
            const response = await fetch('data/mystery-files.json');
            this.root = await response.json();
            console.log('File system loaded successfully');
        } catch (error) {
            console.error('Failed to load file system:', error);
            // Create a minimal fallback file system
            this.root = this.createFallbackFileSystem();
        }
    }

    createFallbackFileSystem() {
        return {
            'C:': {
                type: 'directory',
                contents: {
                    'Users': {
                        type: 'directory',
                        contents: {
                            'Detective': {
                                type: 'directory',
                                contents: {
                                    'welcome.txt': {
                                        type: 'file',
                                        content: 'Welcome to Command Line Mystery!\n\nUse DIR to see files and folders.\nUse CD to change directories.\nUse TYPE to read files.\n\nGood luck, Detective!'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
    }

    getCurrentPath() {
        return this.currentPath;
    }

    setCurrentPath(path) {
        this.currentPath = path;
    }

    // Navigate to a directory (returns true if successful)
    changeDirectory(path) {
        if (!path || path === '') {
            return { success: false, message: 'Path cannot be empty' };
        }

        let targetPath;

        // Handle special cases
        if (path === '..') {
            targetPath = this.getParentPath(this.currentPath);
        } else if (path === '.' || path === '.\\') {
            return { success: true, message: '' };
        } else if (path.includes(':')) {
            // Absolute path
            targetPath = path;
        } else {
            // Relative path
            targetPath = this.joinPaths(this.currentPath, path);
        }

        // Normalize path
        targetPath = this.normalizePath(targetPath);

        // Check if directory exists
        const item = this.getItemAtPath(targetPath);

        if (!item) {
            return { success: false, message: `The system cannot find the path specified.` };
        }

        if (item.type !== 'directory') {
            return { success: false, message: `The directory name is invalid.` };
        }

        this.currentPath = targetPath;
        return { success: true, message: '' };
    }

    // Get directory listing
    listDirectory(path = null) {
        const targetPath = path || this.currentPath;
        const item = this.getItemAtPath(targetPath);

        if (!item) {
            return { success: false, message: `File Not Found`, entries: [] };
        }

        if (item.type !== 'directory') {
            return { success: false, message: `${targetPath} is not a directory`, entries: [] };
        }

        const entries = [];

        for (const [name, content] of Object.entries(item.contents || {})) {
            entries.push({
                name: name,
                type: content.type,
                size: content.type === 'file' ? content.content.length : 0
            });
        }

        return { success: true, message: '', entries: entries };
    }

    // Read file contents
    readFile(filename) {
        let targetPath;

        if (filename.includes(':') || filename.includes('\\')) {
            // Path included
            targetPath = this.normalizePath(filename);
        } else {
            // Just filename
            targetPath = this.joinPaths(this.currentPath, filename);
        }

        const item = this.getItemAtPath(targetPath);

        if (!item) {
            return { success: false, content: `The system cannot find the file specified.` };
        }

        if (item.type !== 'file') {
            return { success: false, content: `Access is denied.` };
        }

        return { success: true, content: item.content };
    }

    // Get item at specific path
    getItemAtPath(path) {
        if (!this.root) return null;

        const normalizedPath = this.normalizePath(path);
        const parts = normalizedPath.split('\\').filter(p => p.length > 0);

        let current = this.root;

        for (const part of parts) {
            if (!current || !current.contents) {
                return null;
            }

            current = current.contents[part];

            if (!current) {
                return null;
            }
        }

        return current;
    }

    // Normalize path (handle .. and .)
    normalizePath(path) {
        let parts = path.split('\\').filter(p => p.length > 0 && p !== '.');
        let normalized = [];

        for (const part of parts) {
            if (part === '..') {
                if (normalized.length > 1) { // Keep at least the drive letter
                    normalized.pop();
                }
            } else {
                normalized.push(part);
            }
        }

        return normalized.join('\\');
    }

    // Join paths
    joinPaths(basePath, relativePath) {
        // Remove trailing backslash from base if present
        if (basePath.endsWith('\\')) {
            basePath = basePath.slice(0, -1);
        }

        // Remove leading backslash from relative if present
        if (relativePath.startsWith('\\')) {
            relativePath = relativePath.slice(1);
        }

        return `${basePath}\\${relativePath}`;
    }

    // Get parent directory path
    getParentPath(path) {
        const parts = path.split('\\').filter(p => p.length > 0);

        if (parts.length <= 1) {
            return parts[0] + '\\'; // Return drive root
        }

        parts.pop();
        return parts.join('\\');
    }

    // Get directory tree (for tree command)
    getDirectoryTree(path = null, prefix = '', isLast = true) {
        const targetPath = path || this.currentPath;
        const item = this.getItemAtPath(targetPath);

        if (!item || item.type !== 'directory') {
            return '';
        }

        let output = '';
        const entries = Object.entries(item.contents || {});
        const directories = entries.filter(([_, v]) => v.type === 'directory');
        const files = entries.filter(([_, v]) => v.type === 'file');

        // List directories first
        directories.forEach(([name, content], index) => {
            const isLastEntry = index === directories.length - 1 && files.length === 0;
            const connector = isLastEntry ? '└── ' : '├── ';
            const nextPrefix = prefix + (isLastEntry ? '    ' : '│   ');

            output += prefix + connector + name + '\n';

            // Recursively add subdirectories
            const subPath = this.joinPaths(targetPath, name);
            output += this.getDirectoryTree(subPath, nextPrefix, isLastEntry);
        });

        // List files
        files.forEach(([name, _], index) => {
            const isLastEntry = index === files.length - 1;
            const connector = isLastEntry ? '└── ' : '├── ';
            output += prefix + connector + name + '\n';
        });

        return output;
    }
}
