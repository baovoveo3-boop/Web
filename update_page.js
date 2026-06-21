const fs = require('fs');
let code = fs.readFileSync('E:/Youtube/Ban Content/Web/app/page.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { COMBOS, TOOLS, COURSES, FREE_RESOURCES } from '@/data/store';",
  "import { COMBOS, TOOLS, COURSES, FREE_RESOURCES } from '@/data/store';\nimport { useCart } from '@/app/context/CartContext';\nimport CheckoutModal from '@/components/CheckoutModal';\nimport { ShoppingCart } from 'lucide-react';"
);

// 2. Add state
code = code.replace(
  "const [currentSlide, setCurrentSlide] = useState(0);",
  "const [currentSlide, setCurrentSlide] = useState(0);\n  const { addToCart } = useCart();\n  const [checkoutItem, setCheckoutItem] = useState<any>(null);"
);

// 3. Replace buttons without w-full
code = code.replace(/<button className={`bg-\[#3A2266\] \${([^.]+)\.themeClasses\.bgHover} \${[^}]+\.themeClasses\.textHoverWhite \? 'hover:text-white' : 'hover:text-zinc-950'} text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition`}>\s*\{[^}]+\.actionText\}\s*<\/button>/g, (match, varName) => {
  return `<div className="flex gap-2">
                              <button 
                                onClick={() => setCheckoutItem(${varName})}
                                className={\`flex-1 bg-[#3A2266] \${${varName}.themeClasses.bgHover} \${${varName}.themeClasses.textHoverWhite ? 'hover:text-white' : 'hover:text-zinc-950'} text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition\`}
                              >
                                {${varName}.actionText}
                              </button>
                              <button 
                                onClick={() => { addToCart(${varName}); alert('Đã thêm vào giỏ hàng!'); }}
                                className={\`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white hover:border-white/50 transition\`}
                                title="Thêm vào giỏ"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                            </div>`;
});

// 4. Replace buttons with w-full
code = code.replace(/<button className={`w-full bg-\[#3A2266\] \${([^.]+)\.themeClasses\.bgHover} \${[^}]+\.themeClasses\.textHoverWhite \? 'hover:text-white' : 'hover:text-zinc-950'} text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition`}>\s*\{[^}]+\.actionText\}\s*<\/button>/g, (match, varName) => {
  return `<div className="flex gap-2 w-full mt-auto">
                              <button 
                                onClick={() => setCheckoutItem(${varName})}
                                className={\`flex-1 bg-[#3A2266] \${${varName}.themeClasses.bgHover} \${${varName}.themeClasses.textHoverWhite ? 'hover:text-white' : 'hover:text-zinc-950'} text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition\`}
                              >
                                {${varName}.actionText}
                              </button>
                              <button 
                                onClick={() => { addToCart(${varName}); alert('Đã thêm vào giỏ hàng!'); }}
                                className={\`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white hover:border-white/50 transition\`}
                                title="Thêm vào giỏ"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                            </div>`;
});

// 5. Add CheckoutModal at the end of main
code = code.replace(
  "</main>",
  `  {/* Checkout Modal for Direct Buy */}
        <CheckoutModal 
          isOpen={!!checkoutItem} 
          onClose={() => setCheckoutItem(null)} 
          items={checkoutItem ? [checkoutItem] : []}
          onSuccess={() => setCheckoutItem(null)}
        />\n      </main>`
);

// 6. Fix Hero section buttons (there's a hardcoded one possibly)
fs.writeFileSync('E:/Youtube/Ban Content/Web/app/page.tsx', code);
console.log('Replaced successfully');
