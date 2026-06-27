# Zach Comeau Photography

Landscape and wildlife photography portfolio and print shop, built with Next.js.

## Run locally

```powershell
cd C:\Users\Zachj\Projects\photography-site
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
data/
  photoLogCsv.csv   # Source of truth for photo metadata (edit here first)
src/
  app/              # Pages (each folder = a URL)
  components/       # Header, GalleryGrid, Lightbox, etc.
  data/
    gallery.ts      # Photo metadata synced from photoLogCsv.csv
    site.ts         # Site name, email, social links
public/
  gallery/
    landscapes/     # Landscape JPEGs
    wildlife/       # Wildlife JPEGs
```

## CSV flags (gallery, store, featured)

**Source of truth:** [`data/photoLogCsv.csv`](data/photoLogCsv.csv) — edit metadata and flags here, then sync into [`src/data/gallery.ts`](src/data/gallery.ts).

Each image uses three flags:

| CSV column | `gallery.ts` field | Meaning |
|------------|------------------|---------|
| `featured` | `featured` | Show on homepage (gallery and/or store section) |
| `store` | `inStore` | Show in `/prints` and homepage print store section |
| `gallery` | `inGallery` | Show in `/gallery` and homepage gallery section |

Use `y` or `n` for flag columns. The CSV header may include `categroy` (typo) — category is the first tag in that column (`wildlife` or `landscape`; if the first tag is `nature`, use the second tag).

**Homepage previews (max 8 images, no duplicates):**

- Up to **4** images in the Print Store section (`featured` + `inStore`, CSV row order)
- Up to **4** images in the Gallery section (`featured` + `inGallery`, excluding any already in the store section)
- **Print Store picks first** when an image qualifies for both sections
- Reorder rows in `gallery.ts` to change which images appear on the homepage

**Full pages:**

- `/gallery` — all `inGallery` images
- `/prints` — all `inStore` images

**CSV headers:**

```csv
filename,title,categroy,location,,caption,alt_text,keywords,featured ,store,gallery,sku,date_taken
```

**Sync workflow:** After editing `data/photoLogCsv.csv`, update matching rows in `src/data/gallery.ts` (title, location, caption, altText, category). Keep `slug`, `imageSrc`, flags, and row order aligned with the CSV. Filename `fall-foliage-hancock- trail-nh.jpg` maps to slug `fall-foliage-hancock-trail-nh`.

## Add your photos

### 1. Export from Lightroom

- **Long edge:** 2500 px
- **Format:** JPEG
- **Quality:** 75–80

### 2. Save files

```
public/gallery/landscapes/your-slug.jpg
public/gallery/wildlife/your-slug.jpg
```

### 3. Update gallery data

```ts
{
  id: "20",
  title: "Your Photo Title",
  slug: "your-photo-title",
  category: "landscape",
  location: "White Mountains, NH",
  altText: "Description for SEO and accessibility",
  imageSrc: "/gallery/landscapes/your-photo-title.jpg",
  featured: false,
  inGallery: true,
  inStore: true,
}
```

## Routes

| Page | URL |
|------|-----|
| Home | `/` |
| Gallery | `/gallery` |
| Prints | `/prints` |
| About | `/about` |
| Contact | `/contact` |

Old `/shop`, `/galleries`, `/wildlife`, and `/landscapes` URLs redirect automatically.

## Next steps

1. Edit `data/photoLogCsv.csv`, then sync changes into `gallery.ts`
2. Push to GitHub — Vercel rebuilds production automatically
3. Add Stripe checkout
4. Connect Printful for print fulfillment
