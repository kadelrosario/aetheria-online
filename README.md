# Aetheria Online – Website

Static site (HTML / CSS / JS only, no build step).

## Structure

```
aetheria-online/
├── index.html              ← Landing page (opens first)
├── pages/
│   └── home.html           ← Homepage: Container 1 (hero + stars), 2 (character),
│                             3 (Aetheria map), 4 (Play for Free), footer
├── css/
│   ├── landing.css
│   └── home.css
├── js/
│   ├── landing.js          ← starfield + "Official Website" warp transition
│   ├── page-transition.js  ← homepage arrival effect (runs in <head>)
│   ├── characters.js       ← character text / image / frame colour
│   └── home.js             ← star clicks + 0.5s fade on image & description
└── assets/images/
    ├── backgrounds/  logo/  characters/  stars/  ui/
```

## Star → character

| Star        | Character |
|-------------|-----------|
| Red         | Warrior   |
| Blue        | Cleric    |
| Gold        | Alchemist |
| Bronze      | Mechanic  |
| Purple      | Mage      |
| Green       | Archer    |
| Dark red    | Assassin  |

## Replacing images

Character art lives in `assets/images/characters` (transparent PNGs, upscaled 2×)
and the logo in `assets/images/logo/logo.png`. To swap one, keep the **same file name**.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository.
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)`.
3. Your site will be at `https://<username>.github.io/<repo>/`.
