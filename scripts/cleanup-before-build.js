const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cleanupPaths = ['.next', 'node_modules/.cache'];

try {
  cleanupPaths.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(fullPath)) {
      console.log(`Removing ${fullPath}...`);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  });

  console.log('Cleaning npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  console.log('Cleanup completed! Now run your build command.');
} catch (error) {
  console.error('Cleanup failed:', error);
}
