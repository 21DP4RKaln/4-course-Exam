const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to clean
const cleanupPaths = [
  '.next',
  'node_modules/.cache',
];

// Main build process
try {
  // Delete cache directories
  cleanupPaths.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(fullPath)) {
      console.log(`Removing ${fullPath}...`);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  });

  // Run npm cache clean
  console.log('Cleaning npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  console.log('Cleanup completed! Now run your build command.');
} catch (error) {
  console.error('Cleanup failed:', error);
}
