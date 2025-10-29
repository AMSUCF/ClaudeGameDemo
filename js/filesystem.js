// Virtual File System for simulating Windows directory structure

export class FileSystem {
    constructor() {
        this.currentPath = 'C:\\Users\\Detective';
        // Initialize with fallback immediately to prevent null errors
        this.root = this.createFallbackFileSystem();
        console.log('[FS] FileSystem initialized with fallback');
        console.log('[FS] Current path:', this.currentPath);
        // Load the full file system asynchronously
        this.loadFileSystem();
    }

    async loadFileSystem() {
        try {
            console.log('[FS] Attempting to load mystery-files.json...');
            const response = await fetch('data/mystery-files.json');
            this.root = await response.json();
            console.log('[FS] File system loaded successfully from JSON');
            console.log('[FS] Root structure:', Object.keys(this.root));
        } catch (error) {
            console.error('[FS] Failed to load file system:', error);
            console.log('[FS] Using fallback file system');
            // Fallback is already set in constructor
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
        console.log('[FS] changeDirectory called with:', path);
        console.log('[FS] Current path before change:', this.currentPath);

        if (!path || path === '') {
            return { success: false, message: 'Path cannot be empty' };
        }

        let targetPath;

        // Handle special cases
        if (path === '..') {
            targetPath = this.getParentPath(this.currentPath);
            console.log('[FS] CD ..: parent path calculated as:', targetPath);
        } else if (path === '.' || path === '.\\') {
            return { success: true, message: '' };
        } else if (path.includes(':')) {
            // Absolute path
            targetPath = path;
            console.log('[FS] Absolute path detected:', targetPath);
        } else {
            // Relative path
            targetPath = this.joinPaths(this.currentPath, path);
            console.log('[FS] Relative path joined to:', targetPath);
        }

        // Normalize path
        targetPath = this.normalizePath(targetPath);
        console.log('[FS] After normalization:', targetPath);

        // Check if directory exists
        const item = this.getItemAtPath(targetPath);

        if (!item) {
            console.log('[FS] changeDirectory: target path not found');
            return { success: false, message: `The system cannot find the path specified.` };
        }

        if (item.type !== 'directory') {
            console.log('[FS] changeDirectory: target is not a directory');
            return { success: false, message: `The directory name is invalid.` };
        }

        this.currentPath = targetPath;
        console.log('[FS] changeDirectory: success, new path:', this.currentPath);
        return { success: true, message: '' };
    }

    // Get directory listing
    listDirectory(path = null) {
        const targetPath = path || this.currentPath;
        console.log('[FS] listDirectory called for path:', targetPath);
        const item = this.getItemAtPath(targetPath);

        if (!item) {
            console.log('[FS] listDirectory: item not found at path:', targetPath);
            return { success: false, message: `File Not Found`, entries: [] };
        }

        if (item.type !== 'directory') {
            console.log('[FS] listDirectory: item is not a directory:', item.type);
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

        console.log('[FS] listDirectory: found', entries.length, 'entries');
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
        console.log('[FS] getItemAtPath called with:', path);
        if (!this.root) {
            console.log('[FS] getItemAtPath: root is null!');
            return null;
        }

        const normalizedPath = this.normalizePath(path);
        console.log('[FS] getItemAtPath normalized to:', normalizedPath);
        const parts = normalizedPath.split('\\').filter(p => p.length > 0);
        console.log('[FS] getItemAtPath parts:', parts);

        let current = this.root;

        for (const part of parts) {
            if (!current || !current.contents) {
                console.log('[FS] getItemAtPath: no contents at part:', part);
                return null;
            }

            current = current.contents[part];

            if (!current) {
                console.log('[FS] getItemAtPath: part not found:', part);
                return null;
            }
            console.log('[FS] getItemAtPath: found part:', part);
        }

        console.log('[FS] getItemAtPath: success, returning item');
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
        console.log('[FS] getParentPath called with:', path);
        const parts = path.split('\\').filter(p => p.length > 0);
        console.log('[FS] getParentPath parts:', parts);

        // If at root (e.g., "C:"), return the root itself (can't go higher)
        if (parts.length <= 1) {
            const rootPath = parts[0]; // Just "C:" without backslash
            console.log('[FS] getParentPath: at root, returning:', rootPath);
            return rootPath; // Return drive root without trailing backslash
        }

        // Remove last part to go up one level
        parts.pop();
        const parentPath = parts.join('\\');
        console.log('[FS] getParentPath: returning:', parentPath);
        return parentPath;
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
