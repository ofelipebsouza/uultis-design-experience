# Uultis — Expressions of life

A digital experience concept for Uultis, with an editorial presentation, an interactive product catalog, a Branding page and a Style Guide. Products, descriptions, images and contact destinations were collected from the brand’s official sources on October 20, 2026. English is the primary language throughout the published experience, including complete translations of all 213 product descriptions.

**Source code:** [ofelipebsouza/uultis-design-experience](https://github.com/ofelipebsouza/uultis-design-experience).

**Published pages:**

- [Main experience](https://uultis-design-experience.vercel.app/)
- [Branding](https://uultis-design-experience.vercel.app/branding/)
- [Style Guide](https://uultis-design-experience.vercel.app/style-guide/)

Production uses the `uultis-design-experience.vercel.app` domain and the `main` branch of the GitHub repository.

The project uses static HTML, CSS and JavaScript, published on Vercel. Authoring files live in `dist/`. Running `npm run build` with Node.js 22 or later copies them to `public/`, the directory served by Vercel. The build has no external package dependencies.

## Pages

| Path | Content |
| --- | --- |
| `/` | Editorial experience, materials, designers, interiors and the complete product catalog. |
| `/branding/` | Creative direction: essence, positioning, voice, applications and reference sources. |
| `/style-guide/` | Visual system: palette, typography, spacing, components, product presentation, motion and accessibility. |

Branding and Style Guide have their own page structures and share the project’s assets. Both are linked from the main footer. The former `/guia-de-estilo/` address redirects permanently to `/style-guide/` on Vercel.

## Catalog and experience

- 213 products in 21 categories, with complete English translations of the official product descriptions.
- Product and designer names remain unchanged, including accents and proper collection names such as Simbiose 2026.
- Search by product, designer, category and description terms, with filters and sorting.
- Product details and photo galleries, with official product videos when available.
- 356 official technical sheets: 141 English, 214 Portuguese and 1 Spanish. Every product has at least one Portuguese sheet. English sheets appear first when available; original documents remain accessible with their language clearly labeled.
- 203 products with access to official 3D and modeling resources: 195 direct SketchUp 3D Warehouse model links, 7 searches within the Uultis organization and 92 Casoca links. Some products are available through more than one provider.
- Favorites saved on the visitor’s device through `localStorage`.
- 38 products in Simbiose 2026, selected using the exact official collection tag.
- Native scrolling, material chapters and motion that respects the system’s reduced-motion preference.
- Official projects Casa D|A / Niva ARQ and Dafne Beauty House / Paula Ambrósio.
- Stores, contact options, designers and institutional content connected to official Uultis channels.

The 3D resources open the official SketchUp 3D Warehouse and Casoca destinations in a new tab. Viewing and downloads are provided by those services according to what is available at each destination. A product without a published 3D resource does not display an empty 3D tab.

Catalog navigation uses English URL fragments such as `/#collection`, `/#favorites` and `/#product/274`. Previous Portuguese fragments remain supported and resolve to the equivalent English fragment. Presentation pages use real directories and do not depend on a catch-all rewrite to the homepage.

## Run locally

Requirements: Node.js 22 or later with npm to prepare the publication package; Python 3 to serve it locally over HTTP.

```bash
git clone https://github.com/ofelipebsouza/uultis-design-experience.git
cd uultis-design-experience
npm run build
python3 -m http.server 8080 --directory public
```

Open:

- [Main experience](http://localhost:8080/)
- [Branding](http://localhost:8080/branding/)
- [Style Guide](http://localhost:8080/style-guide/)

After editing files in `dist/`, run `npm run build` again to refresh `public/`. No dependency installation is needed. Stop the server with `Ctrl+C` in the terminal. Vercel’s configured redirects are applied in deployment; Python’s simple HTTP server only serves the generated files.

## Structure

| File or directory | Responsibility |
| --- | --- |
| `dist/index.html` | Structure and content of the main experience. |
| `dist/styles.css` | Layout, responsive behavior and motion for the main page. |
| `dist/app.js` | Navigation, search, catalog, favorites and dialogs. |
| `dist/branding/index.html` | Branding direction presentation. |
| `dist/style-guide/index.html` | Style Guide and interactive component examples. |
| `dist/assets/catalog.json` | Structured product data in English. |
| `dist/assets/catalog.js` | The same product data exposed to the browser as `window.UULTIS_PRODUCTS`. |
| `dist/assets/editorial.js` | Featured project images, credits, alternative text and links. |
| `dist/assets/` | Wordmarks, openly licensed fonts and their licenses, product images and editorial photographs. |
| `package.json` | Build command and Node.js requirement. |
| `scripts/build.mjs` | Copies `dist/` into `public/`. |
| `public/` | Generated publication output; make source changes in `dist/`. |
| `vercel.json` | Vercel build, deployment and legacy URL redirect configuration. |
| `.gitignore` and `.vercelignore` | Local file exclusions and deployment file selection. |

## Vercel publication

The Vercel project `uultis-design-experience` is connected to the GitHub repository `ofelipebsouza/uultis-design-experience`. The production branch is `main`, and Root Directory is the repository root. Through the Git integration, commits pushed to `main` trigger production deployments. Check each deployment’s result in Vercel to confirm that a change has been published successfully.

`vercel.json` defines:

- Framework: Other (`null`).
- Build Command: `npm run build`.
- Install Command: empty; there are no external dependencies.
- Output Directory: `public`.
- Trailing slashes on page URLs (`trailingSlash: true`).
- A permanent redirect from `/guia-de-estilo/:path*` to `/style-guide/:path*`.

Vercel runs `scripts/build.mjs` through `npm run build`, using Node.js 22 or later. This step prepares publication output by copying static files from `dist/` into `public/`; it requires neither framework compilation nor dependency installation. The `/`, `/branding/` and `/style-guide/` routes are served from that directory structure.

The configured origin is `https://uultis-design-experience.vercel.app`. All three pages use this domain in their canonical, `og:url` and `og:image` metadata, with a distinct canonical URL for each route. English is declared in document language and social metadata. The concept retains `noindex, nofollow`.

## Maintenance

### Products and language

Keep `catalog.json` and `catalog.js` synchronized whenever a product changes. Keep IDs as strings and preserve official names, the complete meaning of descriptions, and the exact correspondence between a product and its photographs.

- `description`, `category`, tag labels, resource labels and availability notes are presented in English.
- `thumbnail` and `image` point to local images.
- `display_images` contains the local gallery used by the interface.
- `url`, `designer_url`, tag URLs and `specs` preserve official destinations.
- `specs[].language` identifies the actual language of the original document. Translating the interface must not relabel a Portuguese PDF as English.
- Every technical sheet remains available, including multiple versions in the same language.
- `availability_note`, when present, remains visible in the product details.

The original external websites, video audio and PDF contents are provided by their respective publishers. Product translations do not imply that those third-party destinations are English-only.

### Assets and editorial content

Publication uses optimized WebP versions of the photographs and product imagery. Published copies were prepared without EXIF metadata; unused original JPGs were excluded from this publication repository. Original files and their provenance records remain in the separately delivered extraction package.

When replacing an image, generate an optimized version, preserve the product’s visual identity and update the paths that reference it. Update credits, alternative text and links in `editorial.js` when changing featured projects.

### Identity

When changing colors, fonts, components or motion, update the Style Guide as well. The Branding page records the creative intent and should reflect changes to the concept’s positioning.

The Uultis wordmark is preserved as a reference to the brand. Athelas Regular and SuisseIntl Light/Medium are typographic references observed on the original website; their font files are not redistributed in this repository. The public version uses Inter for the interface and Libre Baskerville for editorial emphasis. Warm neutral backgrounds, composition and the public typography belong to this digital concept. This material is not an official brand manual approved by Uultis.

### Public typography and licenses

Inter and Libre Baskerville are distributed under the SIL Open Font License (OFL). The public version includes the font files and their license texts:

| File | Use |
| --- | --- |
| `dist/assets/Inter-Variable.ttf` | Interface, navigation, body copy and sans-serif hierarchy. |
| `dist/assets/LibreBaskerville-Variable.ttf` | Serif editorial headings. |
| `dist/assets/LibreBaskerville-Italic.ttf` | Italic editorial emphasis. |
| `dist/assets/OFL-Inter.txt` | Inter font license. |
| `dist/assets/OFL-LibreBaskerville.txt` | Libre Baskerville font license. |

Keep the license texts with the font files when redistributing this version. References to Athelas and SuisseIntl document the original identity research; the public implementation uses only the openly licensed families listed above.

### Checks before publishing

Check the homepage, both presentation pages, search, filters, favorites, product details and official resource links. Verify desktop and mobile navigation, the reduced-motion preference, English technical-sheet ordering, legacy URL compatibility and the existence of catalog assets.

## Scope and sources

This is a product presentation and discovery concept. Commercial and contact links lead to official channels; the brand film opens an external player after the visitor acts. The project does not include checkout, customer registration or order processing.

Primary sources: [Uultis](https://www.uultis.com/) and [Uultis USA](https://usa.uultis.com/). The brand, photographs, designs, descriptions and products belong to their respective owners.


## Native Room Studio

`/room-studio/` is a self-hosted, interactive WebGL interior for **Star (290)** and **Talha (291)**. Direct selection: `/room-studio/?product=290` or `?product=291`. Entry points appear in the main navigation, homepage, footer and both product detail dialogs.

- Mouse/touch orbit, wheel/pinch zoom, keyboard arrows and +/-; explicit Detail, Room and Reset views.
- Star: 1.40 or 1.60 m diameter, 0.745 m overall height. Talha: 0.30 m diameter, 0.465 or 0.565 m overall height. Dimensions transcribed from the official MH-9153 and MH-9137/MH-9138 technical sheets.
- Parametric meshes approximate the original silhouettes; these are **design studies, not manufacturer CAD models**. Three illustrative wood studies and two room palettes do not assert commercial availability. Generic contextual furniture is not part of the product catalog.
- Local Three.js r180 / 0.180.0 and OrbitControls, MIT license included in `dist/assets/vendor/THREE-LICENSE.txt`. No runtime CDN or modeling-service login required. Render-on-demand, capped pixel ratio and context-loss fallback keep the demo lightweight.
- Geometry is authored in `dist/room-studio/studio.js`. No Blender or SketchUp runtime is needed. Official SketchUp/Casoca links and all technical sheets remain in the catalog.
- Model and library imports are isolated to the studio page, so the homepage does not load the 3D renderer.
