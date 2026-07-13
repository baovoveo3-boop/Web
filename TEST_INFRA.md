# E2E Test Infrastructure & Test Suite Plan

This document details the Next.js Playwright E2E testing architecture, mocking strategy, and the 4-tier E2E testing plan designed to verify requirements **R1: System Settings**, **R2: Product Form Upgrade**, and **R3: Public Download Page**.

---

## 1. Authentication & State Mocking Architecture

Because the testing environment does not connect to a live Firebase instance or Local Emulator, all Firebase services are mocked at the client side using browser-level interceptors.

### Webpack Chunk Override Interceptor
To mock modules like `@firebase/auth`, `@firebase/firestore`, and `@firebase/storage`, Playwright injects an initialization script (`page.addInitScript`) before the Next.js/React application mounts:
- It overrides the global `window.webpackChunk_N_E.push` array.
- When Next.js chunk files register their modules, the interceptor scans exports.
- If a module exports functions such as `getFirestore`, `getAuth`, or `getStorage`, it intercepts all exported functions and wraps them to execute global overrides prefixed with `window.mock_*` if they exist.

### Auth Mocks
- **`mock_getAuth()`**: Returns `{ mock: true }`.
- **`mock_onAuthStateChanged(auth, callback)`**: Keeps track of active callbacks and triggers them asynchronously with the mocked user.
- **`mock_signOut(auth)`**: Resets authentication state to null and notifies callbacks.
- **Client Route Guard Bypass**: Bypasses client-side navigation blocks by modifying `localStorage.setItem('isLoggedIn', 'true')` based on active authentication state.

### Firestore In-Memory Database
- Initial mock database state (`mockDbState`) is seeded from the test suite context.
- CRUD operations are mapped to in-memory modifications:
  - `mock_getDoc` matches collection and document identifier.
  - `mock_getDocs` supports basic query constraints (`mock_where`, `mock_query`).
  - `mock_addDoc`, `mock_updateDoc`, `mock_setDoc`, `mock_deleteDoc` modify `window.mockDbState` state synchronously or asynchronously.

---

## 2. 4-Tier E2E Testing Strategy

We implement a rigorous 4-tier E2E testing approach to guarantee correctness across all edge cases, combinations, and full user journeys.

### Tier 1: Feature Coverage (Happy Paths)
This tier covers standard UI functionality and state changes under normal conditions. It requires at least 5 tests per feature.

#### Feature R1: System Settings Page (`/admin/settings`)
1. **R1-F1: Page Element Rendering**: Access `/admin/settings` as Admin; verify version, download URL, force update switch, and actions are rendered.
2. **R1-F2: Role-based Guard Allowed**: Log in with `role: 'admin'`, navigate to `/admin/settings`, and verify header and route access.
3. **R1-F3: Form Data Binding**: Input text/switches in settings fields and verify fields retain state.
4. **R1-F4: Save Configuration Flow**: Save settings form, verify database mock state updates.
5. **R1-F5: Google Drive Link Auto-Conversion on Save**: Verify conversion from standard Drive share URL (`/file/d/ID/view`) to direct download endpoint (`/uc?export=download&id=ID`).

#### Feature R2: Product Form Upgrade (`/admin/products` Up/Down & Autofill)
1. **R2-F1: Reorder Buttons Render**: Verify Up/Down arrow buttons render alongside each feature/step item.
2. **R2-F2: Reorder Features List (Up/Down)**: Swap feature items and assert visual layout updates and saved database state maintains correct order.
3. **R2-F3: Reorder How to Use List (Up/Down)**: Swap instructional steps and verify reordering.
4. **R2-F4: Product Creation Step 1 Autofill**: Ensure launcher download URL from `settings/general` is used to pre-fill Step 1 when creating a product.
5. **R2-F5: Array Boundary Controls**: First item's "Up" button is disabled/hidden; last item's "Down" button is disabled/hidden.

#### Feature R3: Public Download Page & Navbar Link (`/download`)
1. **R3-F1: Public Access**: Access `/download` as guest; verify HTTP 200 and no login redirects.
2. **R3-F2: Display Version & URL Binding**: Verify page renders version from database and download button points to launcher URL.
3. **R3-F3: Download Action Redirection**: Verify download button opens direct URL in a new tab.
4. **R3-F4: Header Navbar Link presence**: Verify public header navbar contains a link to "Download".
5. **R3-F5: Mobile Menu Link presence**: Verify "Download" link is visible inside the mobile drawer menu.

#### Feature R4: Slash Command Suggestion Menu in Admin Product Form
1. **R4-F1: HowToUse Trigger**: Verify typing `/` at start or after a space in the instruction fields activates the suggestions popup.
2. **R4-F2: FAQ Question Trigger**: Verify typing `/` at start or after a space in the FAQ Question fields activates the suggestions popup.
3. **R4-F3: FAQ Answer Trigger**: Verify typing `/` at start or after a space in the FAQ Answer textarea fields activates the suggestions popup.
4. **R4-F4: Suggestions Rendering**: Verify suggestions list displays label, markdown text, highlights matching items based on prefix query, and shows correct selection style.
5. **R4-F5: Autocomplete & Selection**: Verify selecting a suggestion via click or Enter inserts the markdown replacement and places the cursor right after the replacement.
6. **R4-F6: Popup Dismissal**: Verify the suggestions popup is dismissed correctly on pressing Escape, typing a space, clicking outside, or deleting the slash trigger character.

---

### Tier 2: Boundary & Corner Cases
This tier handles failures, edge inputs, redirects, empty states, and invalid roles.

#### Feature R1: System Settings Page (`/admin/settings`)
1. **R1-B1: Unauthenticated Redirect**: Verify guest accessing `/admin/settings` is sent to login.
2. **R1-B2: Standard User Access Guard**: Verify standard user (`role: 'user'`) accessing `/admin/settings` is sent to home page.
3. **R1-B3: Empty Fields Validation**: Ensure form submission fails HTML5 validation with empty version/URL.
4. **R1-B4: Cancel Modifications**: Verify clicking "Hủy" leaves original database state intact.
5. **R1-B5: Google Drive ID Extraction Edge Cases**: Input alternative share URLs or extra query parameters; verify exact extraction.

#### Feature R2: Product Form Upgrade (`/admin/products` Up/Down & Autofill)
1. **R2-B1: Reordering Array of Size 1**: Verify buttons are hidden/disabled when only one step exists.
2. **R2-B2: Empty settings/general Doc Autofill**: Verify product creation modal loads safely if database contains no settings document.
3. **R2-B3: Post-Autofill Editability**: Verify that the autofilled Step 1 string can be customized or deleted by the user.
4. **R2-B4: Empty Fields Reordering**: Verify blank and filled fields swap properly without losing user focus.
5. **R2-B5: Duplicate Array Deletion Re-indexing**: Verify that deleting intermediate steps triggers proper index re-calculation and boundary button adjustments.

#### Feature R3: Public Download Page & Navbar Link (`/download`)
1. **R3-B1: DB Offline/Missing Document Fallback**: Render fallback text ("Không tìm thấy phiên bản ứng dụng") without crashing if settings collection is empty.
2. **R3-B2: Long Version Styling Layout**: Assert that long version strings wrap without causing layout overflow.
3. **R3-B3: Stale Cache Validation**: Ensure database updates propagate on hard reload.
4. **R3-B4: Navbar Active Styling**: Ensure active navigation link gets proper visual class indicators.
5. **R3-B5: Non-converted URL direct route**: Verify regular direct link works without drive conversion logic.

#### Feature R4: Slash Command Suggestion Menu in Admin Product Form
1. **R4-B1: Trigger Boundaries**: Verify double slashes (`//`) or slashes within words (`abc/def`) do not activate the suggestion menu.
2. **R4-B2: Cursor Position Check**: Verify that typing `/` triggers the popup only when the cursor is positioned immediately after the slash, handling edits and text deletion appropriately.
3. **R4-B3: Query Matching Limits**: Verify that queries with spaces (e.g. `/ down`) dismiss the popup, and that non-existent queries safely hide the popup without throwing runtime errors.
4. **R4-B4: Wrap-around Keyboard Navigation**: Verify that ArrowDown and ArrowUp wrap around correctly when navigating past the top/bottom boundaries of the suggestion list.
5. **R4-B5: Focus Maintenance on Menu Interaction**: Verify that mouse interaction (mousedown) with the suggestion popup menu does not cause the text input field to lose focus.

---

### Tier 3: Cross-Feature Combinations
Tests verifying the interactions of multiple distinct subsystems.

1. **XF-1: Admin Settings update propagates to Public Download**: Admin saves config -> Guest navigates to `/download` -> Verifies instant display update.
2. **XF-2: Admin Settings update propagates to Product Creation Autofill**: Admin saves config -> Admin goes to `/admin/products` -> Verifies Step 1 uses updated link.
3. **XF-3: Products array reordering matches Public Tool Details Guide**: Reorder steps in admin panel -> Save -> Public tool detail page renders in identical order.
4. **XF-4: Auth State toggles Header visibility**: User login/logout states correctly render/hide Admin Panel and Tải App navigation points.
5. **XF-5: Google Drive Conversion Consistency**: Settings page and product forms use identical conversion functions.
6. **XF-6: Cross-Field Suggestion Isolation**: Verify that shifting focus between dynamic fields (HowToUse steps, FAQ questions, FAQ answers) correctly closes the old suggestions menu and opens a new one mapped to the target input element.
7. **XF-7: Dynamic Row Modification**: Verify that adding, reordering, or deleting dynamic rows while suggestions are active does not crash the interface and correctly updates/preserves suggestion states.

---

### Tier 4: Real-world User Flows
Comprehensive, multi-page flows simulating user behavior.

#### Flow 1: Admin System Update & Product Creation Journey
1. Admin logins.
2. Navigates to `/admin/settings`, fills version, updates Google Drive url, enables force update. Saves and confirms.
3. Navigates to `/admin/products`, starts new product wizard.
4. Verifies Step 1 is autofilled.
5. Adds multiple steps/features, tests reordering controls, fills price and details.
6. Saves product and logs out.

#### Flow 2: End-User Download & Guide Verification
1. Guest visits home page, clicks "Download".
2. Navigates to `/download`, verifies version and triggers launcher download.
3. Navigates to the created tool details page.
4. Verifies reordered how-to-use guide items match the exact setup from Flow 1.
5. Verifies reordered features list matches flow setup.

#### Flow 3: E2E Slash Command Formatting Workflow
1. Admin opens the product modal.
2. Uses slash commands (`/down`, `/login`, `/courses`, `/hub`) to rapidly format multiple HowToUse steps and FAQ questions/answers.
3. Mixes text typing, copy-pasting, and keyboard navigation to select and insert markdown.
4. Simulates typing via IME keyboards (Telex/VNI) to verify robust keyboard event processing.
5. Saves the product and verifies that the formatting is correctly updated and stored.
