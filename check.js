const fs = require('fs');
const content = fs.readFileSync('E:/Youtube/Ban Content/Web/app/page.tsx', 'utf8') + fs.readFileSync('E:/Youtube/Ban Content/Web/app/hub/page.tsx', 'utf8');
const matches = [...content.matchAll(/href=[\"']([^\"']+)[\"']/g)];
console.log([...new Set(matches.map(m => m[1]))].join('\n'));
