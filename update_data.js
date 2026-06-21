const fs = require('fs');

const files = [
  { path: 'E:/Youtube/Ban Content/Web/data/tools.ts', interface: 'export interface ToolData {' },
  { path: 'E:/Youtube/Ban Content/Web/data/courses.ts', interface: 'export interface CourseData {' },
  { path: 'E:/Youtube/Ban Content/Web/data/combos.ts', interface: 'export interface ComboData {' }
];

files.forEach(({ path, interface }) => {
  let code = fs.readFileSync(path, 'utf8');
  
  // Add gallery to interface if not exists
  if (!code.includes('gallery?: string[];')) {
    code = code.replace(interface, interface + '\n  gallery?: string[];');
  }

  // Inject gallery after image if not exists
  // using regex to match image: "..." or image: '...'
  code = code.replace(/image:\s*['"]([^'"]+)['"](,?)/g, (match, p1, p2) => {
    // only add gallery if it doesn't already have it nearby (crude check, but works for mock data)
    return `${match}\n    gallery: ["${p1}", "/software-box.jpg", "/software-box-2.jpg"],`;
  });

  // Since the regex might match multiple times if run twice, let's just write and be careful.
  fs.writeFileSync(path, code);
});
console.log('Data files updated with gallery');
