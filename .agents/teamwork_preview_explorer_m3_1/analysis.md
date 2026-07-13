# Analysis Report: Product Form Upgrade (R2)

This analysis outlines the plan for implementing Milestone 3: Product Form Upgrade (R2) in `app/admin/products/page.tsx` of the Ban Content web application.

---

## 1. Core Objectives & Key Findings

1. **Reactive Reordering without losing input characters/focus:**
   - **Problem:** If the `features` or `howToUse` arrays use array index (`idx`) as their React `key`, swapping elements changes the values bound to the same DOM inputs while the cursor/focus remains locked to the same index. This creates a disjointed UX where the user suddenly types into the wrong item's inputs (simulating character/focus loss).
   - **Solution:** Introduce stable `id` fields to list items.
     - `features` state changes from `{ bold: string, text: string }[]` to `{ id: string, bold: string, text: string }[]`.
     - `howToUse` state changes from `string[]` to `{ id: string, value: string }[]`.
     - Elements are mapped to these representations when loading, and sanitized back when saving. React uses `key={feature.id}` and `key={step.id}`, preserving focus during swaps.

2. **Reordering & Boundary Controls:**
   - **Reordering buttons:** Next to each list item, Up (`↑`) and Down (`↓`) buttons will trigger index swapping in the array.
   - **Boundary checks:**
     - Disable the Up button if `index === 0`.
     - Disable the Down button if `index === array.length - 1`.
     - If the list size is 1, both buttons are disabled.

3. **Google Drive settings/general Retrieval & Autofill:**
   - **Retrieval:** Fetch `settings/general` on mount using Firestore's `getDoc` and store `download_url` in a component state `launcherDownloadUrl`.
   - **Trigger:** When creating a new product (`!editingProduct`) and the product category becomes `"tool"`, if we haven't already autofilled (`!hasPrefilled`), we prefill Step 1 with:
     `Cài đặt App Launcher để tải và quản lý các tool. Link tải: [LINK]`
   - **Fallback/Graceful Handling:** If `settings/general` is missing or empty, `launcherDownloadUrl` will be empty (`""`), and the first step's value will be empty (`""`), preventing crashes and rendering an empty input as verified by E2E test `R2-B2`.

4. **E2E Test Specifications Compliance:**
   - Playwright E2E tests (`e2e/settings.spec.ts`) rely on exact strings for query selectors:
     - Features input placeholder: `"Nhập tính năng..."`
     - How to Use input placeholder: `"Nhập bước hướng dẫn..."`
     - How to Use add button text: `"Thêm hướng dẫn"`
     - How to Use delete button title: `"Xóa bước"`
     - Reorder buttons: `button[title="Di chuyển lên"]` / `button[title="Di chuyển xuống"]` and text `↑` / `↓`.

---

## 2. Code Structure Analysis

In `app/admin/products/page.tsx`:

- **Form States (Lines 124-125):**
  ```typescript
  const [features, setFeatures] = useState<{bold: string, text: string}[]>([]);
  const [howToUse, setHowToUse] = useState<string[]>([]);
  ```
- **New States Needed:**
  ```typescript
  const [launcherDownloadUrl, setLauncherDownloadUrl] = useState("");
  const [hasPrefilled, setHasPrefilled] = useState(false);
  ```

- **Fetching Settings (Lines 183-185):**
  Modify mount `useEffect` to fetch both products and the general settings document:
  ```typescript
  useEffect(() => {
    fetchProducts();
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "general"));
        if (docSnap.exists()) {
          setLauncherDownloadUrl(docSnap.data()?.download_url || "");
        }
      } catch (error) {
        console.error("Lỗi khi tải cấu hình general:", error);
      }
    };
    fetchSettings();
  }, []);
  ```

- **Autofill Hook:**
  Add a new `useEffect` hook to handle prefilling when the category changes:
  ```typescript
  useEffect(() => {
    if (!editingProduct && category === "tool" && !hasPrefilled) {
      const message = launcherDownloadUrl 
        ? `Cài đặt App Launcher để tải và quản lý các tool. Link tải: ${launcherDownloadUrl}` 
        : "";
      setHowToUse([{ id: `step-0-${Date.now()}`, value: message }]);
      setHasPrefilled(true);
    }
  }, [category, editingProduct, hasPrefilled, launcherDownloadUrl]);
  ```

- **Open Add/Edit Modal (Lines 187-243):**
  - Reset states on Add:
    ```typescript
    setFeatures([]);
    setHowToUse([]);
    setHasPrefilled(false);
    ```
  - Map states on Edit:
    ```typescript
    const initialFeatures = product.features?.length > 0 ? product.features : (staticData?.features || []);
    setFeatures(initialFeatures.map((f, idx) => ({ id: `feat-${idx}-${Date.now()}-${Math.random()}`, bold: f.bold || "", text: f.text || "" })));
    
    const initialHowToUse = product.howToUse?.length > 0 ? product.howToUse : (staticData?.howToUse || []);
    setHowToUse(initialHowToUse.map((step, idx) => ({ id: `step-${idx}-${Date.now()}-${Math.random()}`, value: step || "" })));
    setHasPrefilled(true);
    ```

- **Data Sanitization during Save (Lines 377-395):**
  Convert the local component representation back to the database format:
  ```typescript
  const productData = {
    ...
    features: features.map(({ bold, text }) => ({ bold, text })),
    howToUse: howToUse.map(step => step.value),
    ...
  };
  ```

---

## 3. Concrete Implementation Plan

### Step 1: Component State Updates
Change the state definitions and add new helpers:
```typescript
  // Form states
  const [features, setFeatures] = useState<{ id: string; bold: string; text: string }[]>([]);
  const [howToUse, setHowToUse] = useState<{ id: string; value: string }[]>([]);
  
  // Settings & Autofill states
  const [launcherDownloadUrl, setLauncherDownloadUrl] = useState("");
  const [hasPrefilled, setHasPrefilled] = useState(false);
```

### Step 2: Open Modal Data Handlers
Update `openAddModal` and `openEditModal` to initialize and map states correctly:
- In `openAddModal`:
  ```typescript
  setFeatures([]);
  setHowToUse([]);
  setHasPrefilled(false);
  ```
- In `openEditModal`:
  ```typescript
  const staticData = TOOLS.find(t => t.id === product.id);
  const initialFeatures = product.features?.length > 0 ? product.features : (staticData?.features || []);
  setFeatures(initialFeatures.map((f, idx) => ({
    id: `feat-${idx}-${Date.now()}-${Math.random()}`,
    bold: f.bold || "",
    text: f.text || ""
  })));
  
  const initialHowToUse = product.howToUse?.length > 0 ? product.howToUse : (staticData?.howToUse || []);
  setHowToUse(initialHowToUse.map((step, idx) => ({
    id: `step-${idx}-${Date.now()}-${Math.random()}`,
    value: step || ""
  })));
  setHasPrefilled(true);
  ```

### Step 3: Implement Reordering Handlers in UI
Implement swapping handlers for both features and howToUse in the JSX:
- For `features` swap:
  ```typescript
  const newFeatures = [...features];
  const temp = newFeatures[idx];
  newFeatures[idx] = newFeatures[idx - 1]; // or idx + 1 for down
  newFeatures[idx - 1] = temp;
  setFeatures(newFeatures);
  ```
- For `howToUse` swap:
  ```typescript
  const newSteps = [...howToUse];
  const temp = newSteps[idx];
  newSteps[idx] = newSteps[idx - 1]; // or idx + 1 for down
  newSteps[idx - 1] = temp;
  setHowToUse(newSteps);
  ```

### Step 4: UI Changes for Features (Lines 1079-1112)
Replace key and inputs, and add Up/Down buttons:
```tsx
                <div className="space-y-3">
                  {features.map((feature, idx) => (
                    <div key={feature.id} className="flex gap-3 items-start bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={feature.bold}
                          onChange={(e) => {
                            const newFeatures = [...features];
                            newFeatures[idx].bold = e.target.value;
                            setFeatures(newFeatures);
                          }}
                          placeholder="Nhập tính năng..."
                          className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple font-bold"
                        />
                        <textarea
                          value={feature.text}
                          onChange={(e) => {
                            const newFeatures = [...features];
                            newFeatures[idx].text = e.target.value;
                            setFeatures(newFeatures);
                          }}
                          placeholder="Mô tả chi tiết..."
                          className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple h-16 resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (idx === 0) return;
                            const newFeatures = [...features];
                            const temp = newFeatures[idx];
                            newFeatures[idx] = newFeatures[idx - 1];
                            newFeatures[idx - 1] = temp;
                            setFeatures(newFeatures);
                          }}
                          disabled={idx === 0}
                          className="p-1 text-zinc-500 hover:text-neonPurple bg-zinc-950 rounded border border-zinc-800 disabled:opacity-30 disabled:hover:text-zinc-500 disabled:cursor-not-allowed transition"
                          title="Di chuyển lên"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (idx === features.length - 1) return;
                            const newFeatures = [...features];
                            const temp = newFeatures[idx];
                            newFeatures[idx] = newFeatures[idx + 1];
                            newFeatures[idx + 1] = temp;
                            setFeatures(newFeatures);
                          }}
                          disabled={idx === features.length - 1}
                          className="p-1 text-zinc-500 hover:text-neonPurple bg-zinc-950 rounded border border-zinc-800 disabled:opacity-30 disabled:hover:text-zinc-500 disabled:cursor-not-allowed transition"
                          title="Di chuyển xuống"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                        className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-950 rounded border border-zinc-800 hover:border-red-500 transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
```

### Step 5: UI Changes for How to Use (Lines 1135-1166)
Change button text to "Thêm hướng dẫn", replace key and inputs, and add Up/Down buttons:
```tsx
              <div className="col-span-1 md:col-span-2 pt-6 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Cách sử dụng (How to Use)
                  </label>
                  <button
                    type="button"
                    onClick={() => setHowToUse([...howToUse, { id: `step-${Date.now()}-${Math.random()}`, value: "" }])}
                    className="text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Thêm hướng dẫn
                  </button>
                </div>
                <div className="space-y-3">
                  {howToUse.map((step, idx) => (
                    <div key={step.id} className="flex gap-3 items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                        {idx + 1}
                      </div>
                      <input
                        type="text"
                        value={step.value}
                        onChange={(e) => {
                          const newSteps = [...howToUse];
                          newSteps[idx].value = e.target.value;
                          setHowToUse(newSteps);
                        }}
                        placeholder="Nhập bước hướng dẫn..."
                        className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple"
                      />
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (idx === 0) return;
                            const newSteps = [...howToUse];
                            const temp = newSteps[idx];
                            newSteps[idx] = newSteps[idx - 1];
                            newSteps[idx - 1] = temp;
                            setHowToUse(newSteps);
                          }}
                          disabled={idx === 0}
                          className="p-1 text-zinc-500 hover:text-neonPurple bg-zinc-950 rounded border border-zinc-800 disabled:opacity-30 disabled:hover:text-zinc-500 disabled:cursor-not-allowed transition"
                          title="Di chuyển lên"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (idx === howToUse.length - 1) return;
                            const newSteps = [...howToUse];
                            const temp = newSteps[idx];
                            newSteps[idx] = newSteps[idx + 1];
                            newSteps[idx + 1] = temp;
                            setHowToUse(newSteps);
                          }}
                          disabled={idx === howToUse.length - 1}
                          className="p-1 text-zinc-500 hover:text-neonPurple bg-zinc-950 rounded border border-zinc-800 disabled:opacity-30 disabled:hover:text-zinc-500 disabled:cursor-not-allowed transition"
                          title="Di chuyển xuống"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHowToUse(howToUse.filter((_, i) => i !== idx))}
                        className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-950 rounded border border-zinc-800 hover:border-red-500 transition shrink-0"
                        title="Xóa bước"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {howToUse.length === 0 && (
                    <div className="text-center py-6 text-sm text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                      Chưa có hướng dẫn nào. Nhấn "Thêm hướng dẫn" để bắt đầu.
                    </div>
                  )}
                </div>
              </div>
```
