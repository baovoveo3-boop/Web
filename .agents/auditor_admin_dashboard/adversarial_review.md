## Challenge Summary

**Overall risk assessment**: LOW

## Challenges

### [Low] Challenge 1: Absence of Firestore Collection Indices
- **Assumption challenged**: Assumes all collection queries will run smoothly without requiring custom composite indexes in Firebase Console.
- **Attack scenario**: If the system expands to filter orders or transactions by status AND sort them by date in the query level, Firebase will fail the query until a composite index is manually created in the Firebase console.
- **Blast radius**: The statistics dashboard or orders panel could fail to load data, showing console errors.
- **Mitigation**: The code currently fetches the whole collection and performs sorting in memory (`ordersList.sort(...)`), which avoids requiring composite indexes but could hit memory/performance bottlenecks on very large datasets.

### [Low] Challenge 2: Lack of Error UI States for Statistics Fetch Failures
- **Assumption challenged**: Assumes Firestore fetches will always succeed.
- **Attack scenario**: If database connection times out or if user permissions are revoked mid-session, the `fetchStats` function catches the error (`console.error`), but does not set an error state. The dashboard remains indefinitely in the loading spinner state.
- **Blast radius**: User is left with an infinite loading screen without feedback.
- **Mitigation**: Introduce an `error` state in `AdminDashboard` and display a clear error alert with a "Retry" button.

### [Low] Challenge 3: Direct Overwrite Race Conditions on Product Edits
- **Assumption challenged**: Assumes single admin edits without simultaneous updates.
- **Attack scenario**: If two admins attempt to edit the same product at the same time, the admin who clicks "Save" last will overwrite the edits of the first admin without conflict warning.
- **Blast radius**: Loss of edited data.
- **Mitigation**: For a simple dashboard, this is standard, but in production, Firestore transactions or field-level updates could prevent complete document overwrites.

## Stress Test Results

- **Empty Database collections** → Code initializes `stats` state with `0` → Dashboard displays `0đ` and `0` users without crashing → **PASS**
- **Malformed / Missing fields in Firestore documents** → `Number(data.totalAmount || 0)` and `data.name || ""` fallbacks are triggered → UI renders blank/zero fields without crash → **PASS**
- **XSS payloads in products fields** → Inputs are rendered inside standard React JSX text nodes → React sanitizes outputs automatically, preventing script injection → **PASS**

## Unchallenged Areas

- **Security Rules on Firebase Storage / Firestore** — Reason not challenged: Security rules configurations are hosted on Firebase Console and are not present in the local codebase repository.
