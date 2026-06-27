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
src/
  app/              # Pages (each folder = a URL)
  components/       # Header, GalleryGrid, Lightbox, etc.
  data/
    gallery.ts      # Photo metadata and visibility flags
    site.ts         # Site name, email, social links
public/
  gallery/
    landscapes/     # Landscape JPEGs
    wildlife/       # Wildlife JPEGs
```

## CSV flags (gallery, store, featured)

Each image in `src/data/gallery.ts` uses three flags:

| Flag | Meaning |
|------|---------|
| `featured` | Show on homepage (in gallery and/or store section) |
| `inGallery` | Show in `/gallery` and eligible for homepage gallery section |
| `inStore` | Show in `/prints` and eligible for homepage print store section |

**Homepage previews (max 8 images, no duplicates):**

- Up to **4** images in the Print Store section (`featured` + `inStore`, CSV row order)
- Up to **4** images in the Gallery section (`featured` + `inGallery`, excluding any already in the store section)
- **Print Store picks first** when an image qualifies for both sections
- Reorder rows in `gallery.ts` to change which images appear on the homepage

**Full pages:**

- `/gallery` — all `inGallery` images
- `/prints` — all `inStore` images

**CSV headers for import:**

```csv
filename,title,category,location,caption,alt_text,featured,store,gallery
```

Use `y` or `n` for the three flag columns.

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

1. Update flags in `gallery.ts` or re-import from CSV
2. Push to GitHub and deploy on Vercel
3. Add Stripe checkout
4. Connect Printful for print fulfillment
