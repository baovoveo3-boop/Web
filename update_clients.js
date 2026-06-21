const fs = require('fs');

const files = [
  { 
    path: 'E:/Youtube/Ban Content/Web/components/ToolDetailClient.tsx', 
    itemVar: 'tool', 
    breadcrumbTarget: 'Tools', 
    breadcrumbHref: '/#tools' 
  },
  { 
    path: 'E:/Youtube/Ban Content/Web/components/CourseDetailClient.tsx', 
    itemVar: 'course', 
    breadcrumbTarget: 'Courses', 
    breadcrumbHref: '/#courses' 
  },
  { 
    path: 'E:/Youtube/Ban Content/Web/components/ComboDetailClient.tsx', 
    itemVar: 'combo', 
    breadcrumbTarget: 'Combos', 
    breadcrumbHref: '/#combos' 
  }
];

files.forEach(({ path, itemVar, breadcrumbTarget, breadcrumbHref }) => {
  let code = fs.readFileSync(path, 'utf8');

  // 1. Add ElasticCarousel import if not exists
  if (!code.includes("import ElasticCarousel")) {
    code = code.replace(
      "import Header from '@/components/Header';",
      "import Header from '@/components/Header';\nimport ElasticCarousel from '@/components/ElasticCarousel';"
    );
  }

  // 2. Fix Breadcrumb (replace the span with a Link)
  // Search for something like:
  // <span data-testid="breadcrumb-tools" className="text-zinc-400">
  //   Tools
  // </span>
  const spanRegex = new RegExp(`<span[^>]*>\\s*${breadcrumbTarget}\\s*<\\/span>`, 'g');
  code = code.replace(spanRegex, `<Link href="${breadcrumbHref}" className="text-zinc-400 hover:text-white transition">\n            ${breadcrumbTarget}\n          </Link>`);

  // 3. Replace the Media Showcase block
  // Finding: <div data-testid="tool-media-container" ... > <img ... /> </div>
  const mediaRegex = /\{\/\* Media Showcase \*\/\}([\s\S]*?)<\/div>\s*\{\/\* How to Use Guide|\{\/\* Course Syllabus/g;
  
  const replacement = `{/* Media Showcase & Gallery */}
              <div className="flex flex-col gap-6">
                {/* Khung kính Glassmorphism (Product Box) */}
                <div className="w-full flex justify-center items-center">
                  <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border border-zinc-700/80 bg-[#050505] shadow-[0_0_40px_rgba(168,85,247,0.25)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(168,85,247,0.4)] hover:border-neonPurple/50 group">
                    <div className={\`absolute inset-0 bg-gradient-to-tr \${${itemVar}.glow} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none\`}></div>
                    <img 
                      src={${itemVar}.image} 
                      alt={${itemVar}.name} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-out relative z-0" 
                    />
                  </div>
                </div>

                {/* Trượt hình màn hình thực tế (Gallery) */}
                {${itemVar}.gallery && ${itemVar}.gallery.length > 0 && (
                  <div className="w-full mt-4 border-t border-zinc-800/50 pt-6">
                    <h4 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neonPurple"></span>
                      Hình Ảnh Thực Tế
                    </h4>
                    <ElasticCarousel className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
                      {${itemVar}.gallery.map((imgSrc, idx) => (
                        <div key={idx} className="min-w-[85%] sm:min-w-[60%] lg:min-w-[45%] snap-center shrink-0">
                          <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group/gallery">
                            <img src={imgSrc} alt={\`\${${itemVar}.name} screenshot \${idx + 1}\`} className="w-full h-full object-cover transform group-hover/gallery:scale-105 transition duration-500" />
                          </div>
                        </div>
                      ))}
                    </ElasticCarousel>
                  </div>
                )}
              </div>

              {/* Next Section `;

  code = code.replace(mediaRegex, (match) => {
    // Determine the next section comment to keep the structure valid
    const nextSectionComment = match.includes('How to Use Guide') ? '{/* How to Use Guide' : '{/* Course Syllabus';
    // Remove the trailing next section comment from replacement to stitch it properly
    return replacement.replace('{/* Next Section ', nextSectionComment);
  });

  fs.writeFileSync(path, code);
});
console.log('Client files updated successfully');
