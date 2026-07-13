## 2026-06-26T03:59:35Z
You are a teamwork_preview_worker.
Your working directory is: E:\Youtube\Ban Content\Web\.agents\worker_implementation_slash_cmd
Your task is to implement the Slash Command suggestions popup feature in `app/admin/products/page.tsx`.

## Background & Requirements
Add a Slash Command popup suggestions menu when typing `/` inside:
1. "Cách sử dụng" (howToUse) dynamic input fields.
2. FAQ "Câu hỏi" (question) dynamic input fields.
3. FAQ "Câu trả lời" (answer) dynamic textarea fields.
The menu suggests internal links formatted in Markdown:
- Trang Download: `[Trang Download](/download)`
- Trang Khóa học: `[Khóa Học](/courses)`
- Trang Đăng nhập: `[Đăng Nhập](/login)`
- Khám phá Hub: `[Khám Phá Hub](/hub)`
Selecting a suggestion replaces the text from the last `/` with the Markdown link, closes the menu immediately, and updates the input value.
The popup must close on suggestion click, blur (clicking outside the input/menu), or deleting the trigger `/`.

Design requirements:
- The popup suggestions box should float absolute-positioned right below the active input field.
- Styled in line with the site's dark mode (dark background, border-zinc-800, hover states, etc.).
- Ensure no TypeScript errors.
- Ensure rendering is optimized so that update operations do not lag the dynamic list items.

## Step-by-Step Implementation Details
1. Add the state variables for tracking active input field slash command context and selected index in `AdminProducts`:
   ```typescript
   const [slashCommandContext, setSlashCommandContext] = useState<{
     fieldType: 'howToUse' | 'faq-question' | 'faq-answer';
     index: number;
     triggerIndex: number;
     query: string;
   } | null>(null);
   const [slashCommandSelectedIndex, setSlashCommandSelectedIndex] = useState(0);
   ```
2. Define the static suggestion items:
   ```typescript
   const SUGGESTIONS = [
     { label: "Trang Download", markdown: "[Trang Download](/download)" },
     { label: "Trang Khóa học", markdown: "[Khóa Học](/courses)" },
     { label: "Trang Đăng nhập", markdown: "[Đăng Nhập](/login)" },
     { label: "Khám phá Hub", markdown: "[Khám Phá Hub](/hub)" },
   ];
   ```
3. Add the helper function to check for the `/` trigger (taking care of spaces and starting characters):
   ```typescript
   const checkSlashCommandTrigger = (
     value: string,
     selectionStart: number,
     fieldType: 'howToUse' | 'faq-question' | 'faq-answer',
     index: number
   ) => {
     const textBeforeCursor = value.slice(0, selectionStart);
     const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

     if (lastSlashIndex !== -1) {
       const query = textBeforeCursor.slice(lastSlashIndex + 1);
       const hasSpace = /\s/.test(query);
       const isStartOrPrecededBySpace = lastSlashIndex === 0 || /\s/.test(textBeforeCursor[lastSlashIndex - 1]);

       if (!hasSpace && isStartOrPrecededBySpace) {
         setSlashCommandContext({
           fieldType,
           index,
           triggerIndex: lastSlashIndex,
           query,
         });
         setSlashCommandSelectedIndex(0);
         return;
       }
     }
     setSlashCommandContext(null);
   };
   ```
4. Add the helper function to insert the selected suggestion and restore focus:
   ```typescript
   const handleSelectSlashSuggestion = (markdown: string) => {
     if (!slashCommandContext) return;
     const { fieldType, index, triggerIndex } = slashCommandContext;

     const inputId = `input-${fieldType}-${index}`;
     const inputElement = document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement;
     if (!inputElement) return;

     const originalValue = inputElement.value;
     const cursorPosition = inputElement.selectionStart || 0;
     const newValue = originalValue.slice(0, triggerIndex) + markdown + originalValue.slice(cursorPosition);

     if (fieldType === 'howToUse') {
       const newSteps = [...howToUse];
       newSteps[index] = { ...newSteps[index], value: newValue };
       setHowToUse(newSteps);
     } else {
       const newFaqs = [...faqs];
       if (fieldType === 'faq-question') {
         newFaqs[index] = { ...newFaqs[index], question: newValue };
       } else {
         newFaqs[index] = { ...newFaqs[index], answer: newValue };
       }
       setFaqs(newFaqs);
     }

     setSlashCommandContext(null);
     setSlashCommandSelectedIndex(0);

     const newCursorPosition = triggerIndex + markdown.length;
     setTimeout(() => {
       inputElement.focus();
       inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
     }, 0);
   };
   ```
5. Add the keyboard navigation helper:
   ```typescript
   const handleSlashCommandKeyDown = (
     e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
     fieldType: 'howToUse' | 'faq-question' | 'faq-answer',
     index: number,
     filteredCount: number,
     filteredSuggestions: typeof SUGGESTIONS
   ) => {
     if (!slashCommandContext || slashCommandContext.fieldType !== fieldType || slashCommandContext.index !== index) return;

     if (e.key === 'ArrowDown') {
       e.preventDefault();
       setSlashCommandSelectedIndex(prev => (prev + 1) % filteredCount);
     } else if (e.key === 'ArrowUp') {
       e.preventDefault();
       setSlashCommandSelectedIndex(prev => (prev - 1 + filteredCount) % filteredCount);
     } else if (e.key === 'Enter') {
       e.preventDefault();
       const selected = filteredSuggestions[slashCommandSelectedIndex];
       if (selected) {
         handleSelectSlashSuggestion(selected.markdown);
       }
     } else if (e.key === 'Escape') {
       e.preventDefault();
       setSlashCommandContext(null);
     }
   };
   ```
6. In the JSX render structure of `app/admin/products/page.tsx`:
   - Locate the `<input>` for "Cách sử dụng" (around line 1231). Wrap it in a `relative w-full` container. Assign `id={\`input-howToUse-\${idx}\`}`. Connect the `onChange`, `onKeyDown`, and `onBlur` handlers, and map the filtered suggestions popup to float absolute-positioned right below the input.
   - Locate the FAQ `<input>` for "Câu hỏi" (around line 1314). Wrap it in a `relative w-full` container. Assign `id={\`input-faq-question-\${idx}\`}`. Connect handlers and map the absolute popup.
   - Locate the FAQ `<textarea>` for "Câu trả lời" (around line 1325). Wrap it in a `relative w-full` container. Assign `id={\`input-faq-answer-\${idx}\`}`. Connect handlers and map the absolute popup.
7. Verify compilation and structure. Do not introduce any TypeScript compilation errors.
