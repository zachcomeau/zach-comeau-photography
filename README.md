# Zach Comeau Photography

Landscape and wildlife photography portfolio and print shop, built with Next.js.

## Run locally

```powershell
cd C:\Users\Zachj\Projects\photography-site
cp .env.example .env.local   # add your Stripe keys
npm install
npm run sync:data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
data/
  photoLogCsv.csv      # Photos, gallery/store flags
  printOfferings.csv   # One row per image × size (Stripe Product ID + label + description)
  storeConfig.csv      # Shipping product, checkout toggle
scripts/
  sync-data.mjs        # Regenerates gallery.ts and products.ts
src/
  app/prints/[slug]/   # Product page + size picker + checkout
  app/api/checkout/    # Stripe Checkout sessions
  data/gallery.ts      # @generated
  data/products.ts     # @generated offerings
  lib/stripe-catalog.ts
public/gallery/
```

## Data workflow (two sheets)

Edit CSVs in Excel, then:

```powershell
npm run sync:data
```

Commit the CSVs and generated TS files.

### 1. `data/photoLogCsv.csv` — photos

| Column | Meaning |
|--------|---------|
| `filename` | Join key (e.g. `franconia-ridge-sunrise-mt-lafayette-wmnf.jpg`) |
| `featured` | Homepage |
| `store` | Show in `/prints` and product pages |
| `gallery` | Show in `/gallery` |

Offerings are **not** listed on this sheet — they live in `printOfferings.csv`.

### 2. `data/printOfferings.csv` — shop options

One row = one buyable option = one Stripe Product.

```csv
filename,Label,description,id,active
franconia-ridge-sunrise-mt-lafayette-wmnf,Franconia Ridge Sunrise - 20x30 Print,Fine Art Prints...,prod_xxx,y
```

| Column | Meaning |
|--------|---------|
| `filename` | Matches photo (with or without `.jpg`) |
| `Label` | Size option text on the product page (e.g. `8x12 Print`) |
| `description` | Materials copy when that option is selected |
| `id` | Stripe Product ID (`prod_...`) — **price comes from Stripe** |
| `active` | `y` / `n` |
| `medium` | `print` or `canvas` — groups options after the customer picks a medium |

Same filename on multiple rows → multiple options on that product page.

### 3. `data/storeConfig.csv`

```csv
key,value
stripe_shipping_product_id,prod_shipping
checkout_enabled,n
ships_to,US
turnaround_days,7-14
```

Shipping Product in Stripe should be **$8.99** with a default price. Set `checkout_enabled` to `y` when ready.

## Stripe setup

1. Create one **Product per image × size** (e.g. `Franconia Ridge Sunrise - 20x30 Canvas`) with a default one-time Price.
2. Paste each `prod_...` into `printOfferings.csv`.
3. Create one **Shipping** Product at $8.99 → `storeConfig.csv`.
4. Env vars (see `.env.example`):
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`

### Change prices

Stripe Dashboard → Product → new default Price. Site picks it up within ~5 minutes (cached). No CSV price column.

## Routes

| Page | URL |
|------|-----|
| Home | `/` |
| Gallery | `/gallery` |
| Prints | `/prints` |
| Product | `/prints/[slug]` |
| Order confirmed | `/prints/success` |
| Checkout cancelled | `/prints/cancelled` |
| About | `/about` |
| Contact | `/contact` |

## Fulfillment (v1)

1. Stripe emails you when payment succeeds (receipt shows Product name = image + size).
2. Order from your print lab (drop-ship or QC then ship).
3. Email the customer at `hello@zachcomeau.com` with tracking if needed.

## Go-live checklist

- [ ] Offerings rows + real `prod_...` IDs for each shop image
- [ ] Shipping Product at $8.99 in `storeConfig.csv`
- [ ] `npm run sync:data` and deploy
- [ ] Env vars on Vercel
- [ ] Test order
- [ ] `checkout_enabled=y`
