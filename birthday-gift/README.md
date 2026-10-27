# Happy Birthday — Hayati

A responsive animated birthday website built with plain HTML, CSS, and JavaScript.

## Run it

1. Open this folder in VS Code.
2. Start `index.html` with the Live Server extension, or serve this folder with any local web server.
3. Wait for the opening sequence: the background reveals, bunting drops, the title types, the party hat and birthday details appear, then balloons rise.
4. Move the cursor to leave a heart trail. Click **Click here** to open the animated letter.

## Personalize it

Open `script.js` and edit the `settings` object near the top:

```js
const settings = {
  name: "Hayati",
  birthday: "23 May 2005",
  letter: "Your birthday message here..."
};
```

The modal attempts to load two external animated GIFs. If those URLs are unavailable, local illustrated SVG fallbacks are used automatically so the site still works offline.

## Files

- `index.html` — page structure and letter modal
- `style.css` — theme, responsive layout, decorations, and animations
- `script.js` — staged opening, typewriter effects, cursor hearts, and modal behavior
- `assets/` — local character illustrations used as fallback art
