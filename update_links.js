const fs = require('fs');

let code = fs.readFileSync('E:/Youtube/Ban Content/Web/app/page.tsx', 'utf8');

// The strategy is to wrap the top part of the card (image and text) in a Link.
// This is easier than messing with z-index.

// For COMBOS
code = code.replace(
  /<div className="h-48 bg-gradient-to-br from-\[#5A3399\]\/40 to-transparent relative overflow-hidden flex items-center justify-center">[\s\S]*?<div className="p-6 flex flex-col flex-grow">[\s\S]*?<div className="flex items-center justify-between mt-auto">/g,
  (match) => {
    // We will extract everything before `<div className="flex items-center justify-between mt-auto">`
    const parts = match.split('<div className="flex items-center justify-between mt-auto">');
    const content = parts[0];
    
    // Determine type by looking at the variable used.
    // It could be combo, tool, course, item
    let typePath = 'combos';
    let varName = 'combo';
    if (content.includes('{tool.')) { typePath = 'tools'; varName = 'tool'; }
    else if (content.includes('{course.')) { typePath = 'courses'; varName = 'course'; }
    else if (content.includes('{item.')) { typePath = 'free'; varName = 'item'; }
    else if (content.includes('{combo.')) { typePath = 'combos'; varName = 'combo'; }

    return `<Link href={\`/${typePath}/\${${varName}.id}\`} className="flex flex-col flex-grow cursor-pointer">
${content}
</Link>
<div className="flex items-center justify-between mt-auto px-6 pb-6">`;
  }
);

// We need to fix the padding because we split the `p-6` block.
// Wait, the `p-6` is inside the first part `content`.
// `<div className="p-6 flex flex-col flex-grow">`
// Let's replace `<div className="p-6 flex flex-col flex-grow">` with `<div className="p-6 flex flex-col flex-grow pb-0">` in the content.
code = code.replace(/<div className="p-6 flex flex-col flex-grow">/g, '<div className="p-6 flex flex-col flex-grow pb-0">');

// Now we need to update the onClick handlers for buttons to prevent default.
code = code.replace(/onClick=\{\(\) => setCheckoutItem\(([^)]+)\)\}/g, "onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCheckoutItem($1); }}");
code = code.replace(/onClick=\{\(\) => \{ addToCart\(([^)]+)\); alert\('Đã thêm vào giỏ hàng!'\); \}\}/g, "onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart($1); alert('Đã thêm vào giỏ hàng!'); }}");

fs.writeFileSync('E:/Youtube/Ban Content/Web/app/page.tsx', code);
console.log('Links updated');
