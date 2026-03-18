# Testing the Portfolio App

## Setup

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev` (default port 5173, may increment if in use)
3. Open `http://localhost:5173/` in browser

## Key Test Flows

### Upload a Portfolio Work
1. Scroll to the Portfolio section
2. Click the "Upload New Work" dashed area — this opens a native file picker
3. Select an image file (PNG, JPG, etc.)
4. An upload modal appears with: image preview, title input, category dropdown, Upload/Cancel buttons
5. Fill in the title (required) and select a category
6. Click "Upload" — the item appears in the portfolio grid

### Delete a Portfolio Work
1. Hover over a portfolio item to reveal the overlay with title, category, and a trash icon
2. Click the trash icon — a "Delete Work?" confirmation modal appears
3. Click "Delete" to remove, or "Cancel" to keep the item

### Category Filtering
- Click filter buttons (All, Branding, Illustration, UI/UX, Print, Photography) above the portfolio grid
- Items are filtered by category; "All" shows everything
- The active filter button is highlighted in red

### Lightbox
- Click a portfolio item to open the full-screen lightbox
- Use left/right arrow buttons to navigate between items
- Click X or the overlay background to close

### Persistence (localStorage)
- Uploaded works are stored in `localStorage` under key `portfolio_works`
- Refresh the page to verify items persist
- Delete an item, refresh, and verify deletion persists
- To reset: run `localStorage.clear()` in the browser console and refresh

## Lint & Build
- Lint: `npx eslint src/`
- Build: `npm run build` (output in `dist/`)

## Known Limitations
- Images are stored as base64 data URLs in localStorage (~5-10MB limit). Uploading many high-res images may hit this limit silently.
- The contact form is a placeholder — it prevents default submission but doesn't send data anywhere.
- Contact info (email, phone, location) and stats (50+ projects, etc.) are hardcoded placeholders.

## Tech Stack
- React 19, Vite 8, framer-motion, lucide-react
- Dark theme with CSS variables
- Responsive breakpoints at 968px and 600px

## Tips
- The `browser_console` tool may not work if Chrome isn't properly focused. Use F5 to refresh instead of programmatic localStorage operations.
- Create a test image with Python PIL for upload testing: `Image.new('RGB', (800, 600), color='#e63946')`
- The hamburger menu appears at viewport widths below 968px for mobile testing.
