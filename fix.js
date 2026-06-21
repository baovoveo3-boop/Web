const fs = require('fs');
let code = fs.readFileSync('E:/Youtube/Ban Content/Web/app/page.tsx', 'utf8');

const regex = /<\/Link>(\r?\n)<div className="flex items-center justify-between mt-auto px-6 pb-6">/g;
code = code.replace(regex, '</div>$1</Link>$1<div className="w-full">$1<div className="flex items-center justify-between mt-auto px-6 pb-6">');

fs.writeFileSync('E:/Youtube/Ban Content/Web/app/page.tsx', code);
console.log('Fixed syntax');
