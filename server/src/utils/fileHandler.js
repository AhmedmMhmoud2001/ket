const fs = require('fs');
const path = require('path');

/**
 * Delete a file from the filesystem
 * @param {string} filePath - Path to the file (e.g., 'uploads/restaurants/logos/logo-123.jpg')
 */
exports.deleteFile = (filePath) => {
    try {
        if (!filePath) return;

        const fullPath = path.join(__dirname, '../../', filePath);
        
        // Check if file exists
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log('✅ Deleted file:', filePath);
            return true;
        } else {
            console.log('⚠️  File not found:', filePath);
            return false;
        }
    } catch (error) {
        console.error('❌ Error deleting file:', error);
        return false;
    }
};

/**
 * Delete multiple files
 * @param {string[]} filePaths - Array of file paths
 */
exports.deleteFiles = (filePaths) => {
    if (!Array.isArray(filePaths)) return;
    
    filePaths.forEach(filePath => {
        if (filePath) {
            this.deleteFile(filePath);
        }
    });
};

/**
 * Get file URL from path
 * @param {Object} req - Express request object
 * @param {string} filePath - Relative file path
 */
exports.getFileUrl = (req, filePath) => {
    if (!filePath) return null;
    
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/${filePath}`;
};

/**
 * Delete old image when updating
 * @param {string} oldPath - Old image path
 * @param {string} newPath - New image path
 */
exports.replaceImage = (oldPath, newPath) => {
    if (oldPath && oldPath !== newPath) {
        this.deleteFile(oldPath);
    }
};

