# Slash Command Suggestions Menu Analysis & Implementation Strategy
**Target File**: `app/admin/products/page.tsx`

---

## 1. Codebase Structure & Form State Analysis

In `app/admin/products/page.tsx`, we analyzed the input structures for **Cách sử dụng (How to Use)** and **FAQ (Q&A)**. Below is a detailed breakdown of where these fields are defined, how their state is managed, and how dynamic updates are structured.

### 1.1 Field Definitions & Render Locations

#### A. "Cách sử dụng" (How to Use)
- **Code Block**: Lines 1211 to 1294
- **Input Type**: A dynamic list of `<input type="text" />` fields.
- **Render Details**:
  - Elements are rendered inside a container mapped from the `howToUse` array:
    ```tsx
    {howToUse.map((step, idx) => (
      <div key={step.id} className="flex gap-3 items-center ...">
        <div className="...">{idx + 1}</div>
        <input
          type="text"
          value={step.value}
          onChange={(e) => {
            const newSteps = [...howToUse];
            newSteps[idx] = { ...newSteps[idx], value: e.target.value };
            setHowToUse(newSteps);
          }}
          placeholder="Nhập bước hướng dẫn..."
          className="..."
        />
        {/* Reordering and deletion buttons */}
      </div>
    ))}
    ```

#### B. FAQ "Câu hỏi" (Question) and FAQ "Câu trả lời" (Answer)
- **Code Block**: Lines 1296 to 1351
- **Input Type**: A dynamic list of groups containing:
  1. `<input type="text" />` for the Question.
  2. `<textarea rows={...} />` for the Answer.
- **Render Details**:
  - Elements are mapped using the `faqs` state array index:
    ```tsx
    {faqs.map((faq, idx) => (
      <div key={idx} className="flex gap-3 items-start ...">
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={faq.question}
            onChange={(e) => {
              const newFaqs = [...faqs];
              newFaqs[idx].question = e.target.value;
              setFaqs(newFaqs);
            }}
            placeholder="Câu hỏi ..."
            className="..."
          />
          <textarea
            value={faq.answer}
            onChange={(e) => {
              const newFaqs = [...faqs];
              newFaqs[idx].answer = e.target.value;
              setFaqs(newFaqs);
            }}
            placeholder="Câu trả lời..."
            className="... h-16 resize-none"
          />
        </div>
        {/* Delete button */}
      </div>
    ))}
    ```

---

### 1.2 Form State Management

#### A. State Initialization
- **`howToUse`**: Defined as an array of objects containing a unique `id` and a `value` string.
  ```typescript
  const [howToUse, setHowToUse] = useState<{ id: string; value: string }[]>([]);
  ```
- **`faqs`**: Defined as an array of objects containing `question` and `answer` strings.
  ```typescript
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);
  ```

#### B. State Hydration (Modals)
- **On Add Product (`openAddModal`)**:
  - `howToUse` is initialized empty `[]` (later auto-filled with App Launcher download info if category is `"tool"`).
  - `faqs` is pre-populated with three default placeholder Q&As:
    ```typescript
    setFaqs([
      { question: "Sản phẩm này có dùng được vĩnh viễn không?", answer: "Có..." },
      { question: "Tôi có được hỗ trợ nếu gặp lỗi không?", answer: "Có..." },
      { question: "Cách kích hoạt và sử dụng như thế nào?", answer: "Sau khi..." }
    ]);
    ```
- **On Edit Product (`openEditModal`)**:
  - `howToUse`: Maps raw string or object steps from Firestore to structured `{ id, value }` representations using unique keys:
    ```typescript
    const rawHowToUse = (product.howToUse && product.howToUse.length > 0) ? product.howToUse : (staticData?.howToUse || []);
    setHowToUse(rawHowToUse.map((step: any, idx: number) => ({
      id: step.id || `step-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
      value: typeof step === 'string' ? step : (step.value || "")
    })));
    ```
  - `faqs`: Set directly using array from Firestore or fallback from static mock details:
    ```typescript
    setFaqs((product.faqs && product.faqs.length > 0) ? product.faqs : (staticData?.faq || []));
    ```

#### C. State Dehydration (Submission)
- Inside the form submit handler (`handleSave`):
  - `howToUse` is flattened back to an array of raw strings for database compatibility:
    ```typescript
    const sanitizedHowToUse = howToUse.map(step => step.value || "");
    ```
  - `faqs` is preserved as a nested array of objects and uploaded as-is.

---

### 1.3 Dynamic List Manipulation (Adding, Removing, and Reordering)

| Field | Add Item Mechanism | Remove Item Mechanism | Reorder Mechanism |
| :--- | :--- | :--- | :--- |
| **howToUse** | Appends `{ id: \`step-[timestamp]\`, value: "" }` to the end of the array. | Filters out the element by checking index inequality: `howToUse.filter((_, i) => i !== idx)`. | **Up / Down Buttons:** Swaps elements at index `idx` and `idx - 1` (or `idx + 1`) via a temporary variable. |
| **faqs** | Appends `{ question: "", answer: "" }` to the end of the array. | Filters out the element by checking index inequality: `faqs.filter((_, i) => i !== idx)`. | **None** (FAQ ordering is static in the current UI). |

---

## 2. Slash Command Suggestions Popup Strategy

The objective is to implement a slash-command autocomplete system. When an administrator types `/` followed by characters in any howToUse or FAQ fields, a context-aware popup menu displays Markdown links (such as product links, tool downloads, or contact details) that can be instantly injected at the cursor.

### 2.1 Trigger Capture Strategy
We need to monitor typing inside target inputs without interrupting normal typing flow:
1. **Regular Check during Change**: Create a helper function `checkSlashCommand` and invoke it in the `onChange` event handlers.
2. **Detection Logic**:
   - Extract the substring from the beginning of the text field to the current cursor position: `const textBeforeCursor = value.slice(0, selectionStart);`.
   - Find the index of the last slash character in this segment: `const lastSlashIndex = textBeforeCursor.lastIndexOf('/');`.
   - Validate if this `/` qualifies as a trigger:
     1. It must not be followed by any whitespace or another slash: `!/\s/.test(textBeforeCursor.slice(lastSlashIndex + 1))`.
     2. It must be at the very start of the field OR preceded by a whitespace character (preventing triggers on standard URLs like `https://...`): `lastSlashIndex === 0 || /\s/.test(textBeforeCursor[lastSlashIndex - 1])`.
   - If valid, set the active slash command context, using the text after the `/` as the **search query** to filter suggestion lists.

### 2.2 Active Field Context Tracking
Because the inputs are dynamically generated list items, the system must retain exact context to update the correct state. We can store this in a React state:

```typescript
interface SlashCommandContext {
  fieldType: 'howToUse' | 'faq-question' | 'faq-answer';
  index: number;         // List array index
  triggerIndex: number;  // Character position of the active '/' in the input
  query: string;         // Search query typed after the '/'
}

const [activeContext, setActiveContext] = useState<SlashCommandContext | null>(null);
const [selectedIndex, setSelectedIndex] = useState<number>(0); // Keyboard navigation pointer
```

To easily target the active input DOM node when applying replacements, we can assign a deterministic `id` to each input:
- `id={`input-howToUse-${idx}`}`
- `id={`input-faq-question-${idx}`}`
- `id={`input-faq-answer-${idx}`}`

### 2.3 Popup Position Calculation
To avoid complex coordinate tracking and handling window scrolling, we can wrap each `<input>` and `<textarea>` in a `relative` container. The popup is then rendered inline, directly positioned absolute to the parent container.

**HTML Layout Wrapper**:
```tsx
<div className="relative w-full">
  <input 
    id={`input-howToUse-${idx}`}
    {...inputProps}
  />
  {activeContext && 
   activeContext.fieldType === 'howToUse' && 
   activeContext.index === idx && (
     <SlashCommandDropdown 
       query={activeContext.query}
       onSelect={handleSelectSuggestion}
       selectedIndex={selectedIndex}
     />
  )}
</div>
```
**Tailwind Positioning Classes for the Dropdown**:
`absolute left-0 top-full z-50 mt-1 w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl flex flex-col`

---

### 2.4 Popup Closure and Blur Coordination
A common bug with custom dropdowns is the input's `blur` event firing before the dropdown's item click registers, causing the dropdown to unmount silently.
- **Coordination Solution**:
  - Instead of standard `onClick` events on suggestion items, attach `onMouseDown` handlers. Inside `onMouseDown`, call `e.preventDefault()`. This blocks the input focus loss, keeping the menu mounted, and allows the selection callback to complete successfully.
  - On the input's `onBlur` event, use a small delay via `setTimeout` to allow any pending actions to resolve:
    ```typescript
    onBlur={() => {
      setTimeout(() => setActiveContext(null), 150);
    }}
    ```
  - **Keyboard Esc**: Catching `Escape` in `onKeyDown` will dismiss the popup immediately:
    ```typescript
    if (e.key === 'Escape') {
      e.preventDefault();
      setActiveContext(null);
    }
    ```
  - **Deleting Trigger `/`**: If a backspace deletes the `/`, `checkSlashCommand` fails its validation and sets `activeContext` to `null`.

---

### 2.5 Text Injection & State Synchronization
When a user selects a suggestion:
1. **Locate DOM Node**: Retrieve the input element using the unique ID:
   ```typescript
   const inputEl = document.getElementById(`input-${fieldType}-${index}`) as HTMLInputElement | HTMLTextAreaElement;
   ```
2. **Perform Replacement**:
   - Value before trigger: `originalVal.slice(0, triggerIndex)`
   - Value after cursor: `originalVal.slice(cursorPosition)`
   - Inserted text: `[Link Name](url)`
   - New value: `const newVal = valueBefore + link + valueAfter;`
3. **Update React State**: Apply `newVal` to the corresponding array index (`howToUse` or `faqs`) depending on the `fieldType`.
4. **Refocus & Set Cursor**:
   - Because state updates in React are asynchronous, updating selection range synchronously will fail as the DOM hasn't rendered the new text yet.
   - **Fix**: Use a `setTimeout` or `requestAnimationFrame` to wait for the next render loop, then trigger:
     ```typescript
     const targetCursorPos = triggerIndex + markdownLink.length;
     setActiveContext(null);
     setTimeout(() => {
       inputEl.focus();
       inputEl.setSelectionRange(targetCursorPos, targetCursorPos);
     }, 0);
     ```

---

## 3. Implementation Code Blueprint

Below is the concrete code design ready to be integrated into `app/admin/products/page.tsx`.

### 3.1 Suggestion Item Definition
```typescript
interface SuggestionItem {
  label: string;
  markdown: string;
  category: string;
}

// Can be dynamically derived from the components loaded products + settings list
const getSuggestions = (products: Product[], generalDownloadUrl: string): SuggestionItem[] => {
  const list: SuggestionItem[] = [
    { label: "Link Tải App Launcher", markdown: `[Tải App Launcher](${generalDownloadUrl || '#'})`, category: "Hệ thống" },
    { label: "Kênh Youtube chính thức", markdown: "[Youtube Ban Content](https://youtube.com/c/...)", category: "Liên kết" },
    { label: "Hỗ trợ kỹ thuật Zalo", markdown: "[Hỗ trợ kỹ thuật (Zalo)](https://zalo.me/...)", category: "Hỗ trợ" }
  ];

  products.forEach(p => {
    list.push({
      label: `Sản phẩm: ${p.name}`,
      markdown: `[${p.name}](/tools/${p.id})`,
      category: "Sản phẩm"
    });
  });

  return list;
};
```

### 3.2 Detection and Selection Logic Helpers
Add these functions directly within `AdminProducts`:

```typescript
// 1. Trigger verification and query updates
const checkSlashCommand = (
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
    const isValidTriggerPrefix = lastSlashIndex === 0 || /\s/.test(textBeforeCursor[lastSlashIndex - 1]);

    if (!hasSpace && isValidTriggerPrefix) {
      setActiveContext({
        fieldType,
        index,
        triggerIndex: lastSlashIndex,
        query
      });
      setSelectedIndex(0); // Reset dropdown selector index
      return;
    }
  }

  // Dismiss if query is cleared or invalidated
  if (activeContext?.fieldType === fieldType && activeContext?.index === index) {
    setActiveContext(null);
  }
};

// 2. Suggestion Application handler
const handleSelectSuggestion = (markdownLink: string) => {
  if (!activeContext) return;
  const { fieldType, index, triggerIndex } = activeContext;
  
  const inputId = `input-${fieldType}-${index}`;
  const inputElement = document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement;
  if (!inputElement) return;

  const originalValue = inputElement.value;
  const cursorPosition = inputElement.selectionStart || 0;
  const newValue = originalValue.slice(0, triggerIndex) + markdownLink + originalValue.slice(cursorPosition);

  // Update states safely
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

  // Clear Context & Reposition Cursor on next render tick
  setActiveContext(null);
  const nextCursorPos = triggerIndex + markdownLink.length;
  setTimeout(() => {
    inputElement.focus();
    inputElement.setSelectionRange(nextCursorPos, nextCursorPos);
  }, 0);
};
```

### 3.3 Keyboard Navigation Handler
```typescript
const handleKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  fieldType: 'howToUse' | 'faq-question' | 'faq-answer',
  index: number,
  filteredCount: number,
  filteredSuggestions: SuggestionItem[]
) => {
  if (!activeContext || activeContext.fieldType !== fieldType || activeContext.index !== index) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setSelectedIndex(prev => (prev + 1) % filteredCount);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setSelectedIndex(prev => (prev - 1 + filteredCount) % filteredCount);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (filteredSuggestions[selectedIndex]) {
      handleSelectSuggestion(filteredSuggestions[selectedIndex].markdown);
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    setActiveContext(null);
  }
};
```

### 3.4 Suggestion Dropdown UI Component
A simple, fast-loading floating suggestions box:

```tsx
interface DropdownProps {
  suggestions: SuggestionItem[];
  selectedIndex: number;
  onSelect: (markdown: string) => void;
}

function SlashCommandDropdown({ suggestions, selectedIndex, onSelect }: DropdownProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
      <div className="p-2 border-b border-zinc-800 bg-zinc-900/50 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
        Gợi ý liên kết (Slash Command)
      </div>
      <div className="p-1 space-y-0.5">
        {suggestions.map((item, idx) => (
          <div
            key={idx}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevents input blur
              onSelect(item.markdown);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition text-sm ${
              idx === selectedIndex 
                ? 'bg-neonPurple text-white' 
                : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <span className="font-medium">{item.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
              idx === selectedIndex ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {item.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```
