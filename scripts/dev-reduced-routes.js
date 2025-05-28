const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Main directories to temporarily exclude (to reduce memory usage)
const dirsToTemporarilyRename = [
  'app/(staff)',
  'app/(legal)',
  'app/api/admin',
  'app/api/dashboard',
  'app/api/staff',
  // You can add or remove directories based on what parts of the app you're actively working on
];

const rootDir = path.resolve(__dirname, '..');
const tempSuffix = '.temp_dev_exclude';
let renamedDirs = [];

// Function to rename directories
function renameDirs(dirs, action) {
  dirs.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    const tempPath = `${fullPath}${tempSuffix}`;

    if (action === 'exclude' && fs.existsSync(fullPath)) {
      console.log(`Temporarily renaming ${fullPath} to ${tempPath}`);
      fs.renameSync(fullPath, tempPath);
      renamedDirs.push(dir); // Keep track of successfully renamed dirs
    } else if (action === 'include' && fs.existsSync(tempPath)) {
      console.log(`Restoring ${tempPath} to ${fullPath}`);
      fs.renameSync(tempPath, fullPath);
    }
  });
}

// Handle cleanup before exiting
function cleanup() {
  console.log('\nCleaning up...');
  renameDirs(renamedDirs, 'include');
  process.exit();
}

// Handle various exit signals
process.on('SIGINT', cleanup);  // Ctrl+C
process.on('SIGTERM', cleanup); // kill command
process.on('exit', cleanup);    // Normal exit
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  cleanup();
});

// Main execution
try {
  // Step 1: Temporarily rename directories
  console.log('Excluding non-essential directories to reduce memory usage...');
  renameDirs(dirsToTemporarilyRename, 'exclude');

  // Step 2: Run Next.js dev server with memory options
  console.log('Starting Next.js dev server with optimized memory settings...');
  const child = exec('cross-env NODE_OPTIONS=--max-old-space-size=4096 NEXT_DEV_SIMPLE=true next dev', {
    cwd: rootDir
  });

  // Forward stdout/stderr
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on('close', (code) => {
    console.log(`Next.js dev server exited with code ${code}`);
    cleanup();
  });

  console.log('\nDevelopment server running with reduced routes.');
  console.log('Press Ctrl+C to stop the server and restore all routes.\n');
  
} catch (error) {
  console.error('Error:', error);
  cleanup();
}
