// Utilitaires
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function getFileIcon(mimeType) {
    // Icônes par type MIME
    const icons = {
        'text': '📝',
        'text/plain': '📝',
        'text/html': '🌐',
        'text/css': '🎨',
        'text/javascript': '⚡',
        'text/markdown': '📄',
        'image': '🖼️',
        'image/jpeg': '🖼️',
        'image/png': '🖼️',
        'image/gif': '🎭',
        'image/svg+xml': '🔷',
        'image/webp': '🖼️',
        'audio': '🎵',
        'audio/mpeg': '🎵',
        'audio/wav': '🎵',
        'audio/ogg': '🎵',
        'video': '🎬',
        'video/mp4': '🎬',
        'video/webm': '🎬',
        'application/pdf': '📕',
        'application/json': '📋',
        'application/xml': '📋',
        'application/zip': '📦',
        'application/gzip': '📦',
        'application/x-tar': '📦',
        'application/x-rar-compressed': '📦',
        'application/x-7z-compressed': '📦',
        'application/msword': '📘',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
        'application/vnd.ms-excel': '📊',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
        'application/vnd.ms-powerpoint': '📽️',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
        'application/javascript': '⚡',
        'application/typescript': '⚡',
        'application/wasm': '🔧',
        'application/octet-stream': '📎',
        'directory': '📁',
        'folder': '📁',
    };

    // Vérification exacte du type MIME
    if (icons[mimeType]) {
        return icons[mimeType];
    }

    // Vérification par catégorie (première partie du type MIME)
    const category = mimeType.split('/')[0];
    if (icons[category]) {
        return icons[category];
    }

    // Extension du fichier (fallback)
    const extensionIcons = {
        'js': '⚡',
        'ts': '⚡',
        'jsx': '⚛️',
        'tsx': '⚛️',
        'py': '🐍',
        'java': '☕',
        'cpp': '🔧',
        'c': '🔧',
        'h': '🔧',
        'rs': '🦀',
        'sh': '💻',
        'bash': '💻',
        'bat': '💻',
        'ps1': '💻',
        'yaml': '📋',
        'yml': '📋',
        'toml': '📋',
        'conf': '⚙️',
        'env': '🔐',
        'gitignore': '🙈',
        'dockerfile': '🐳',
        'makefile': '🔨',
        'md': '📄',
        'txt': '📝',
        'svg': '🔷',
        'ico': '🔶',
    };

    // Essayer de trouver par extension
    if (fileName) {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (extension && extensionIcons[extension]) {
            return extensionIcons[extension];
        }
    }

    // Icône par défaut si rien n'est trouvé
    return '📄';
}
