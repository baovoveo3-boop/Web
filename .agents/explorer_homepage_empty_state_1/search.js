const fs = require('fs');
const path = require('path');

const searchDir = 'E:\\Youtube\\Ban Content\\Web';
const excludeDirs = ['node_modules', '.next', '.git', '.agents'];

function searchFiles(dir, term) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (excludeDirs.some(exclude => fullPath.includes(exclude))) continue;
      searchFiles(fullPath, term);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.toLowerCase().includes(term.toLowerCase())) {
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (line.toLowerCase().includes(term.toLowerCase())) {
                console.log(`${fullPath}:${index + 1}: ${line.trim()}`);
              }
            });
          }
        } catch (err) {
          // ignore
        }
      }
    }
  }
}

console.log('Searching for "ra mắt"...');
searchFiles(searchDir, 'ra mắt');
console.log('Searching for "coming soon"...');
searchFiles(searchDir, 'coming soon');
console.log('Done.');
