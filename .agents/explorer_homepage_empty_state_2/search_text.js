const fs = require('fs');
const path = require('path');

const searchDir = 'E:/Youtube/Ban Content/Web';
const excludeDirs = ['node_modules', '.git', '.next'];

const results = [];

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        search(fullPath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (['.ts', '.tsx', '.js', '.json', '.md'].includes(ext)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('Sắp ra mắt') || content.includes('sắp ra mắt') || content.includes('Coming Soon') || content.includes('coming soon')) {
          results.push(fullPath);
        }
      }
    }
  }
}

search(searchDir);

fs.writeFileSync('E:/Youtube/Ban Content/Web/.agents/explorer_homepage_empty_state_2/search_results.json', JSON.stringify(results, null, 2));
console.log('Search finished. Found:', results.length);
