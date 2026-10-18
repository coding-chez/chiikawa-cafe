# Chiikawa Café

-- yet to be filled and edited later on

## Project structure

- src/pages: route pages
- src/components/layout: shared site layout and navigation
- src/components/common: reusable placeholder page
- src/components/food and src/components/cart: reserved for future components
- src/data/siteContent.js: visible page text and navigation labels
- src/models, src/context, src/hooks, src/utils: reserved for future milestones
- public/assets/characters, food, decorations, backgrounds: future static assets
- docs/uml and docs/figma: future diagrams and design references

Empty reserved folders contain .gitkeep files so version control retains them.

## Styling and text

Tailwind CSS v4 uses @tailwindcss/vite in vite.config.js and
@import "tailwindcss" in src/index.css. No Tailwind v3 configuration is needed.
The @theme block defines the café colors and Nunito font.

| Token | Color |
| --- | --- |
| beige | #E8DFB3 |
| white | #FFFDF9 |
| ink | #1E1B1A |
| muted | #5C5652 |
| pink | #E8B8CC |
| yellow | #F4E68A |
| blue | #B7D8F1 |
| lavender | #CDAFDE |
| cream | #F8F2E8 |

Use utilities such as bg-beige, text-ink, and font-sans.
Nunito loads from Google Fonts through index.html; sans-serif is the fallback
when the font cannot load. Keep React page copy in src/data/siteContent.js.
The browser document title is defined separately in index.html.

References: [Tailwind Vite setup](https://tailwindcss.com/docs/installation/using-vite)
and [React Router declarative setup](https://reactrouter.com/start/declarative/installation).

