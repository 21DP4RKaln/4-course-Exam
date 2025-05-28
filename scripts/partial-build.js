const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Main directories to exclude temporarily (we'll add them back later)
const dirsToTemporarilyRename = [
  'app/(staff)',
  'app/(legal)',
  'app/api/admin',
  'app/api/dashboard',
  'app/api/staff',
];

const rootDir = path.resolve(__dirname, '..');
const tempSuffix = '.temp_build_exclude';

// Function to rename directories
function renameDirs(dirs, action) {
  dirs.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    const tempPath = `${fullPath}${tempSuffix}`;

    if (action === 'exclude' && fs.existsSync(fullPath)) {
      console.log(`Temporarily renaming ${fullPath} to ${tempPath}`);
      fs.renameSync(fullPath, tempPath);
    } else if (action === 'include' && fs.existsSync(tempPath)) {
      console.log(`Restoring ${tempPath} to ${fullPath}`);
      fs.renameSync(tempPath, fullPath);
    }
  });
}

// Main build process
try {
  // Step 1: Temporarily rename directories to exclude them from build
  console.log('Step 1: Excluding directories...');
  renameDirs(dirsToTemporarilyRename, 'exclude');

  // Step 2: Run the build with minimal settings
  console.log('Step 2: Running the partial build...');
  execSync('cross-env NODE_OPTIONS=--max-old-space-size=4096 next build', {
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
} finally {
  // Always restore directories to their original names
  console.log('Restoring excluded directories...');
  renameDirs(dirsToTemporarilyRename, 'include');
}
