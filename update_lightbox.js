const fs = require('fs');

const files = [
  'E:/Youtube/Ban Content/Web/components/ToolDetailClient.tsx',
  'E:/Youtube/Ban Content/Web/components/CourseDetailClient.tsx',
  'E:/Youtube/Ban Content/Web/components/ComboDetailClient.tsx'
];

files.forEach(path => {
  let code = fs.readFileSync(path, 'utf8');

  // 1. Import ImageModal
  if (!code.includes("import ImageModal")) {
    code = code.replace(
      "import ElasticCarousel from '@/components/ElasticCarousel';",
      "import ElasticCarousel from '@/components/ElasticCarousel';\nimport ImageModal from '@/components/ImageModal';"
    );
  }

  // 2. Add state
  if (!code.includes("const [selectedImage, setSelectedImage]")) {
    // find the first useState
    code = code.replace(
      /const \[openIndices, setOpenIndices\] = useState<number\[\]>\(\[\]\);/g,
      "const [openIndices, setOpenIndices] = useState<number[]>([]);\n  const [selectedImage, setSelectedImage] = useState<string | null>(null);"
    );
  }

  // 3. Update gallery widths and add onClick
  // The current structure: className="min-w-[85%] sm:min-w-[60%] lg:min-w-[45%] snap-center shrink-0"
  code = code.replace(
    /className="min-w-\[85%\] sm:min-w-\[60%\] lg:min-w-\[45%\] snap-center shrink-0"/g,
    'className="w-[240px] md:w-[280px] snap-center shrink-0 cursor-pointer"'
  );

  // Add onClick to the image container
  code = code.replace(
    /<div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800\/80 shadow-\[0_4px_20px_rgba\(0,0,0,0\.5\)\] group\/gallery">/g,
    '<div onClick={() => setSelectedImage(imgSrc)} className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group/gallery hover:border-neonPurple/50 transition-colors">'
  );

  // Add a zoom icon overlay to indicate it's clickable
  code = code.replace(
    /<img src=\{imgSrc\} alt=\{`\$\{.*\}\.name\} screenshot \$\{idx \+ 1\}`\} className="w-full h-full object-cover transform group-hover\/gallery:scale-105 transition duration-500" \/>/g,
    `$&
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/gallery:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-zinc-900/80 text-white p-2 rounded-full backdrop-blur-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/><path d="M11 8v6"/></svg>
                              </span>
                            </div>`
  );

  // 4. Inject the ImageModal component before closing </main>
  if (!code.includes("<ImageModal")) {
    code = code.replace(
      /<\/main>/g,
      `  <ImageModal 
          isOpen={!!selectedImage} 
          onClose={() => setSelectedImage(null)} 
          imageSrc={selectedImage || ''} 
          altText="Screenshot zoom" 
        />
      </main>`
    );
  }

  fs.writeFileSync(path, code);
});
console.log('Added ImageModal to all detail clients');
