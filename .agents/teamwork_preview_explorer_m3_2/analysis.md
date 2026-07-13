# Analysis Report: R2 - Product Form Upgrade

## Executive Summary
This analysis details how to implement the Product Form Upgrade (R2) in `app/admin/products/page.tsx`. It provides a concrete plan for adding reordering capabilities to the "Features" and "How to Use" lists without losing input focus/characters, and for prefilling the first step of the "How to Use" guide with the general launcher download link fetched from Firestore.

---

## 1. Reordering "Features" and "How to Use" Lists
To reorder items reactively without losing input characters or focus, we must replace array-index keys with stable, unique IDs.

### State Structure Update
Modify component states in `app/admin/products/page.tsx` (around lines 124–125):
```tsx
const [features, setFeatures] = useState<{ id: string; bold: string; text: string }[]>([]);
const [howToUse, setHowToUse] = useState<{ id: string; text: string }[]>([]);
```

### Initializing/Editing Form State
Ensure that elements receive unique IDs when initialized in `openAddModal`, `openEditModal`, or when adding new items.
- **In `openEditModal` (lines 233–234)**:
  ```tsx
  const rawFeatures = product.features?.length > 0 ? product.features : (staticData?.features || []);
  setFeatures(rawFeatures.map((f: any) => ({ ...f, id: Math.random().toString() })));
  
  const rawHowToUse = product.howToUse?.length > 0 ? product.howToUse : (staticData?.howToUse || []);
  setHowToUse(rawHowToUse.map((step: string) => ({ id: Math.random().toString(), text: step })));
  ```
- **In "Add Feature" button click handler**:
  ```tsx
  onClick={() => setFeatures([...features, { id: Math.random().toString(), bold: "", text: "" }])}
  ```
- **In "Add Step" button click handler**:
  ```tsx
  onClick={() => setHowToUse([...howToUse, { id: Math.random().toString(), text: "" }])}
  ```

### Reorder Helper Functions
Implement helper functions for shifting items inside the arrays:
```tsx
const moveFeatureUp = (index: number) => {
  if (index === 0) return;
  setFeatures((prev) => {
    const updated = [...prev];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    return updated;
  });
};

const moveFeatureDown = (index: number) => {
  if (index === features.length - 1) return;
  setFeatures((prev) => {
    const updated = [...prev];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    return updated;
  });
};

const moveHowToUseUp = (index: number) => {
  if (index === 0) return;
  setHowToUse((prev) => {
    const updated = [...prev];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    return updated;
  });
};

const moveHowToUseDown = (index: number) => {
  if (index === howToUse.length - 1) return;
  setHowToUse((prev) => {
    const updated = [...prev];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    return updated;
  });
};
```

### Sanitizing Data on Save
Before saving the document in `handleSave` (lines 388–389), strip the temporary `id` keys:
```tsx
features: features.map(({ bold, text }) => ({ bold, text })),
howToUse: howToUse.map(({ text }) => text),
```

### UI Integration & Boundary Controls
Replace the current index keys with the stable object IDs and insert Up/Down reordering buttons. Disabled conditions automatically cover single-item lists because both `index === 0` and `index === list.length - 1` evaluate to true.

- **Features List UI (lines 1079–1112)**:
  ```tsx
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
          placeholder="Tiêu đề (VD: Tích hợp All-in-one:)"
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
          disabled={idx === 0}
          onClick={() => moveFeatureUp(idx)}
          className="p-2 text-zinc-500 hover:text-white bg-zinc-950 rounded border border-zinc-800 hover:border-zinc-700 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-zinc-500 disabled:hover:border-zinc-800"
          title="Di chuyển lên"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={idx === features.length - 1}
          onClick={() => moveFeatureDown(idx)}
          className="p-2 text-zinc-500 hover:text-white bg-zinc-950 rounded border border-zinc-800 hover:border-zinc-700 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-zinc-500 disabled:hover:border-zinc-800"
          title="Di chuyển xuống"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
          className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-950 rounded border border-zinc-800 hover:border-red-500 transition"
          title="Xóa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  ))}
  ```

- **How To Use List UI (lines 1136–1159)**:
  ```tsx
  {howToUse.map((step, idx) => (
    <div key={step.id} className="flex gap-3 items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
        {idx + 1}
      </div>
      <input
        type="text"
        value={step.text}
        onChange={(e) => {
          const newSteps = [...howToUse];
          newSteps[idx] = { ...newSteps[idx], text: e.target.value };
          setHowToUse(newSteps);
        }}
        placeholder={`Bước ${idx + 1}...`}
        className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple"
      />
      <div className="flex gap-1 shrink-0">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => moveHowToUseUp(idx)}
          className="p-2 text-zinc-500 hover:text-white bg-zinc-950 rounded border border-zinc-800 hover:border-zinc-700 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-zinc-500 disabled:hover:border-zinc-800"
          title="Di chuyển lên"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={idx === howToUse.length - 1}
          onClick={() => moveHowToUseDown(idx)}
          className="p-2 text-zinc-500 hover:text-white bg-zinc-950 rounded border border-zinc-800 hover:border-zinc-700 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-zinc-500 disabled:hover:border-zinc-800"
          title="Di chuyển xuống"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => setHowToUse(howToUse.filter((_, i) => i !== idx))}
          className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-950 rounded border border-zinc-800 hover:border-red-500 transition"
          title="Xóa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  ))}
  ```

---

## 2. Prefill "How to Use" with Launcher Download Link
To fetch the download link from `settings/general` and handle missing or empty documents gracefully, we can cache the general launcher download link state on component mount.

### Load Link on Mount
Add state variable in the component:
```tsx
const [launcherDownloadLink, setLauncherDownloadLink] = useState("");
```

Inside the page's main `useEffect` (lines 183–185), fetch settings:
```tsx
useEffect(() => {
  fetchProducts();
  
  const fetchGeneralSettings = async () => {
    try {
      const docRef = doc(db, "settings", "general");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLauncherDownloadLink(data?.download_url || "");
      }
    } catch (error) {
      console.error("Lỗi khi tải download link từ settings/general:", error);
    }
  };
  fetchGeneralSettings();
}, []);
```

### Prefill step 1 of `howToUse`
Update `openAddModal` (around lines 201–202) to set the first step using the retrieved link:
```tsx
    setFeatures([]);
    
    // Prefill first step of howToUse from settings/general
    const initialHowToUse = launcherDownloadLink
      ? [{ id: Math.random().toString(), text: `Cài đặt App Launcher để tải và quản lý các tool. Link tải: ${launcherDownloadLink}` }]
      : [];
    setHowToUse(initialHowToUse);
```

### Robust Graceful Fallback Handling
- **If the document `settings/general` is missing**: `docSnap.exists()` is false, `launcherDownloadLink` defaults to `""`. `initialHowToUse` defaults to `[]` (empty list), allowing the user to create howToUse steps manually.
- **If `download_url` is missing or empty**: `data?.download_url` falls back to `""` using `|| ""`, avoiding setting undefined. `initialHowToUse` defaults to `[]`.
- **If the network/Firestore request fails**: The `try-catch` block logs the error and gracefully falls back to `""`, leaving the `howToUse` list empty rather than crashing the page.
