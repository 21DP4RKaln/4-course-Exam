const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dirsToTemporarilyRename = [
  'app/(staff)',
  'app/(legal)',
  'app/api/admin',
  'app/api/dashboard',
  'app/api/staff',
];

const rootDir = path.resolve(__dirname, '..');
const tempSuffix = '.temp_build_exclude';

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

try {
  console.log('Step 1: Excluding directories...');
  renameDirs(dirsToTemporarilyRename, 'exclude');

  console.log('Step 2: Running the partial build...');
  execSync('cross-env NODE_OPTIONS=--max-old-space-size=4096 next build', {
    stdio: 'inherit',
    cwd: rootDir,
  });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
} finally {
  console.log('Restoring excluded directories...');
  renameDirs(dirsToTemporarilyRename, 'include');
}
