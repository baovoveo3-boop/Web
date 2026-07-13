# E2E Slash Command Test Suite Ready (Milestone 5)

This test suite covers the new **Slash Command Suggestion Menu in Admin Product Form** features, verifying trigger conditions, suggestions rendering, keyboard navigation, autocomplete selection, boundary behaviors, cross-feature combinations, and real-world formatting workflows.

---

## 1. How to Run the Tests

To run the slash command E2E tests specifically:

```bash
npx playwright test e2e/slash_command.spec.ts
```

---

## 2. Coverage Summary

The test file `e2e/slash_command.spec.ts` covers 4 Tiers of E2E verification, detailing 71 tests in total:

| Tier | Focus | Test Count | Description |
| :--- | :--- | :---: | :--- |
| **Tier 1** | Feature Coverage | 30 | Verifies standard triggering, rendering, click/enter selection, and dismissal happy paths. |
| **Tier 2** | Boundary & Corner Cases | 30 | Verifies consecutive slashes, slash inside word, cursor offsets, long queries, and menu overflow/nav wrap-around. |
| **Tier 3** | Cross-Feature Combinations | 6 | Verifies focus switches, index changes when dynamic rows are deleted, and autocomplete substitution consistency. |
| **Tier 4** | Real-world User Flows | 5 | Simulates full product creation, editing, copy-pasting, error handling, and Telex/VNI IME keyboard emulation. |
| **Total** | **All Scenarios** | **71** | **Comprehensive end-to-end coverage of the Slash Command feature set.** |

---

## 3. Feature Checklist

The following table tracks the feature readiness for each requirement:

| Req | Feature Name | Description | Status |
| :--- | :--- | :--- | :---: |
| **R4** | **Slash Command Suggestion Menu** | Autocomplete popup for dynamic fields in the Admin Product Form | |
| R4-F1 | HowToUse Trigger | Typing `/` in the HowToUse steps activates the suggestions popup | [x] Ready |
| R4-F2 | FAQ Question Trigger | Typing `/` in the FAQ question fields activates the suggestions popup | [x] Ready |
| R4-F3 | FAQ Answer Trigger | Typing `/` in the FAQ answer fields activates the suggestions popup | [x] Ready |
| R4-F4 | Suggestions Rendering | Lists label/markdown options, filters dynamically, and highlights selected items | [x] Ready |
| R4-F5 | Autocomplete & Selection | Inserts chosen markdown text replacing `/query` and updates cursor position | [x] Ready |
| R4-F6 | Popup Dismissal | Closes correctly on Escape, space, blur/focus-shift, or delete of trigger | [x] Ready |

---

## 4. Detailed List of Test Cases

Below is the complete list of all 71 tests implemented in `e2e/slash_command.spec.ts`:

### Tier 1: Feature Coverage (30 tests)

#### HowToUse Trigger
1. **Tier 1 - HowToUse trigger with slash at start**
2. **Tier 1 - HowToUse trigger with slash after space**
3. **Tier 1 - HowToUse trigger with query**
4. **Tier 1 - HowToUse trigger casing**
5. **Tier 1 - HowToUse trigger multiple spaces**

#### FAQ Question Trigger
6. **Tier 1 - FAQ Question trigger with slash at start**
7. **Tier 1 - FAQ Question trigger with slash after space**
8. **Tier 1 - FAQ Question trigger with query**
9. **Tier 1 - FAQ Question trigger casing**
10. **Tier 1 - FAQ Question trigger multiple spaces**

#### FAQ Answer Trigger
11. **Tier 1 - FAQ Answer trigger with slash at start**
12. **Tier 1 - FAQ Answer trigger with slash after space**
13. **Tier 1 - FAQ Answer trigger with query**
14. **Tier 1 - FAQ Answer trigger casing**
15. **Tier 1 - FAQ Answer trigger multiple spaces**

#### Suggestions Rendering
16. **Tier 1 - Suggestions rendering shows all items on bare slash**
17. **Tier 1 - Suggestions rendering labels and markdowns**
18. **Tier 1 - Suggestions rendering filters matching items**
19. **Tier 1 - Suggestions rendering no items found**
20. **Tier 1 - Suggestions rendering active selection class**

#### Autocomplete & Selection
21. **Tier 1 - Autocomplete click selection**
22. **Tier 1 - Autocomplete enter selection**
23. **Tier 1 - Autocomplete arrow down and enter**
24. **Tier 1 - Autocomplete arrow up wrap around and enter**
25. **Tier 1 - Autocomplete cursor positioning**

#### Popup Dismissal
26. **Tier 1 - Popup dismissal on escape**
27. **Tier 1 - Popup dismissal on space**
28. **Tier 1 - Popup dismissal on blur**
29. **Tier 1 - Popup dismissal on backspace of slash**
30. **Tier 1 - Popup dismissal on empty query deletion**

---

### Tier 2: Boundary & Corner Cases (30 tests)

#### HowToUse Boundary
31. **Tier 2 - HowToUse boundary consecutive slashes**
32. **Tier 2 - HowToUse boundary slash in word**
33. **Tier 2 - HowToUse boundary cursor not at end**
34. **Tier 2 - HowToUse boundary maximum length**
35. **Tier 2 - HowToUse boundary special characters**

#### FAQ Question Boundary
36. **Tier 2 - FAQ Question boundary consecutive slashes**
37. **Tier 2 - FAQ Question boundary slash in word**
38. **Tier 2 - FAQ Question boundary cursor not at end**
39. **Tier 2 - FAQ Question boundary maximum length**
40. **Tier 2 - FAQ Question boundary special characters**

#### FAQ Answer Boundary
41. **Tier 2 - FAQ Answer boundary consecutive slashes**
42. **Tier 2 - FAQ Answer boundary slash in word**
43. **Tier 2 - FAQ Answer boundary cursor not at end**
44. **Tier 2 - FAQ Answer boundary maximum length**
45. **Tier 2 - FAQ Answer boundary special characters**

#### Suggestions Rendering Boundary
46. **Tier 2 - Suggestions rendering boundary list overflow**
47. **Tier 2 - Suggestions rendering boundary exact match case**
48. **Tier 2 - Suggestions rendering boundary spaces in query**
49. **Tier 2 - Suggestions rendering boundary unicode search**
50. **Tier 2 - Suggestions rendering boundary DOM node cleanup**

#### Autocomplete Boundary
51. **Tier 2 - Autocomplete boundary select empty query**
52. **Tier 2 - Autocomplete boundary select when query has no match**
53. **Tier 2 - Autocomplete boundary selection with existing text around**
54. **Tier 2 - Autocomplete boundary keyboard navigation boundary wrapping**
55. **Tier 2 - Autocomplete boundary multiple quick selections**

#### Dismissal Boundary
56. **Tier 2 - Dismissal boundary click popup does not lose focus**
57. **Tier 2 - Dismissal boundary switch tabs**
58. **Tier 2 - Dismissal boundary fast typing and escape**
59. **Tier 2 - Dismissal boundary backdrop click**
60. **Tier 2 - Dismissal boundary clear input field**

---

### Tier 3: Cross-Feature Combinations (6 tests)

61. **Tier 3 - cross-feature combination 1: multiple fields active in sequence**
    - *Description*: Activates suggestions in HowToUse field, then shifts focus directly to FAQ question field and triggers there, verifying old menu closes and new menu shows correctly.
62. **Tier 3 - cross-feature combination 2: focus shifts and suggestion menu lifecycle**
    - *Description*: Focuses a dynamic field, types `/` to trigger menu, then clicks an unrelated text field (e.g. name), verifying suggestion menu is immediately removed.
63. **Tier 3 - cross-feature combination 3: delete and add items preserving trigger state**
    - *Description*: Dynamically deletes intermediate dynamic steps while triggers are active or after active selection, verifying correct indices re-mapping and trigger activation.
64. **Tier 3 - cross-feature combination 4: type and replace /down to Trang Download**
    - *Description*: Simulates exact input sequence `/down` followed by Enter, asserting the replacement results in `[Trang Download](/download)`.
65. **Tier 3 - cross-feature combination 5: fast alternating triggers across fields**
    - *Description*: Alternates typing `/` triggers between HowToUse, FAQ Question, and FAQ Answer in fast succession, confirming only one context is ever active.
66. **Tier 3 - cross-feature combination 6: slash menu behavior during field additions and deletions**
    - *Description*: Appends steps and FAQ rows while a suggestion popup is active on another field to ensure stable menu tracking.

---

### Tier 4: Real-world User Flows (5 tests)

67. **Tier 4 - real-world workflow 1: product creation E2E walkthrough using slash commands**
    - *Description*: Full journey of creating a product where slash commands are used to write instructions and FAQ items, and the product is successfully saved.
68. **Tier 4 - real-world workflow 2: product editing and formatting update using slash commands**
    - *Description*: Opens an existing product for editing, appends a step using autocomplete command, saves product, and verifies database updates.
69. **Tier 4 - real-world workflow 3: copy-paste text combined with slash triggers**
    - *Description*: Simulates copy-pasting a paragraph of text into a dynamic field and then immediately typing a slash to open and use the menu.
70. **Tier 4 - real-world workflow 4: validation errors and error boundary checks during active suggestions**
    - *Description*: Submits form while suggestions menu is open, causing validation errors to show without crashing or forcibly hiding the active dropdown incorrectly.
71. **Tier 4 - real-world workflow 5: IME keyboard input handling**
    - *Description*: Emulates typing with Telex/VNI IME keyboard shortcuts, verifying standard trigger matching works under accented and combined characters.
