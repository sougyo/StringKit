# CLAUDE.md — StringKit Project Guidelines

## Security Policy (Highest Priority)

**This application must never send user data to external servers.**
All text entered by the user — including strings that may contain API keys, passwords, tokens, or other secrets — is processed entirely within the browser and must never leave the user's machine.

### Prohibited implementations

The following are strictly forbidden regardless of the reason or feature request:

- `fetch()` / `XMLHttpRequest` calls that **send** data (POST, PUT, DELETE, PATCH, or any request with a `body` option)
- `WebSocket` connections
- `navigator.sendBeacon()`
- Loading external scripts: `<script src="https://...">` or any CDN
- Loading external stylesheets or fonts: `<link href="https://...">` or `@import url(...)`
- Embedding external iframes or images that phone home
- Hardcoding third-party API endpoints
- Dynamic `import()` from external URLs
- Cookies, fingerprinting, or any user-tracking technique
- `localStorage` or `sessionStorage` that could persist sensitive input beyond the session

> **Rationale:** StringKit is commonly used to process highly sensitive values (API keys, passwords, tokens, private certificates). Any data exfiltration — even accidental or indirect — is unacceptable. Security is non-negotiable.

The GitHub Actions workflow (`.github/workflows/security-check.yml`) enforces these rules automatically via static analysis on every push and pull request. **Do not disable or weaken those checks.**

### Allowed network access

**No network access is permitted.** The application must function entirely offline and must be usable via the `file://` protocol without any outbound connections.

---

## Architecture

- **Single file:** All HTML, CSS, and JavaScript must remain in `index.html`. No build step, no bundler, no external dependencies.
- **Vanilla JS only:** No frameworks (React, Vue, etc.), no npm packages, no CDN libraries.
- **No persistence:** User input is held in memory only. Nothing is written to `localStorage`, `sessionStorage`, cookies, or any server.
- **Offline-first:** The application must work with no network access whatsoever.

## Code Style

- Match the existing indentation and naming conventions in `index.html`.
- Keep all UI strings in the `I18N` object and access them via `t(key)`.
- Use `element.textContent` (not `innerHTML`) for untrusted input to prevent XSS.
- Prefer Web Crypto API for cryptographic operations (hashing, etc.) — do not implement crypto manually.

## Adding New Transformations

When adding a new tab or transformation function:

1. Add the tab button in the tab bar HTML.
2. Add the corresponding panel `<div>` with input/output areas.
3. Implement the transformation function in the `<script>` section.
4. Wire up the button's `onclick` handler.
5. Run the security check to confirm no prohibited patterns were introduced.

## Testing

Run the security check before committing:

```bash
node tests/security-check.js
```

All checks must pass. Never commit code that fails the security check.
