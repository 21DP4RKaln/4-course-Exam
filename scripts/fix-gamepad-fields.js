const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'lib', 'seeder', 'gamepads.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Replace 'rumble: true' with 'vibration: true'
fileContent = fileContent.replace(/rumble: (true|false)/g, 'vibration: $1');

// Replace 'programmableButtons: true' with 'programmable: true'
fileContent = fileContent.replace(/programmableButtons: (true|false)/g, 'programmable: $1');

fs.writeFileSync(filePath, fileContent);

console.log('Fixed gamepad field names in gamepads.ts');
