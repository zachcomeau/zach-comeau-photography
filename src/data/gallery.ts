export type GalleryCategory = "wildlife" | "landscape";

export type GalleryItem = {
  id: string;
  title: string;
  slug: string;
  category: GalleryCategory;
  location?: string;
  caption?: string;
  altText?: string;
  keywords?: string[];
  imageSrc: string;
  featured: boolean;
  inGallery: boolean;
  inStore: boolean;
  dateTaken?: string;
};

export const HOMEPAGE_PREVIEW_LIMIT = 4;

export const galleryItems: GalleryItem[] = [
  {
    id: "1",
    title: "New York 8 Pointer",
    slug: "8-point-buck-upstate-ny",
    category: "wildlife",
    location: "Upstae NY",
    caption: "Whitetail Buck",
    altText: "White tail buck with 8 point rack staring down range in upstate NY",
    imageSrc: "/gallery/wildlife/8-point-buck-upstate-ny.jpg",
    featured: true,
    inGallery: true,
    inStore: true,
  },
  {
    id: "2",
    title: "Barred Owl",
    slug: "barred-owl-wachusett-reservation",
    category: "wildlife",
    location: "Princeton MA",
    caption: "Barred Owl",
    altText:
      "A barred owl perched on a broken tree at Wachusett Mountain reservation in Princeton MA",
    imageSrc: "/gallery/wildlife/barred-owl-wachusett-reservation.jpg",
    featured: true,
    inGallery: true,
    inStore: true,
  },
  {
    id: "3",
    title: "Bondcliff Ridge",
    slug: "bondcliff-sunset-white-mountains-pemi-loop",
    category: "landscape",
    location: "pemigiwasett wilderness",
    altText:
      "Bondcliff trail and cliffs during golden hour in the Pemigiwasset Wildernes White mountain national forest NH",
    imageSrc: "/gallery/landscapes/bondcliff-sunset-white-mountains-pemi-loop.jpg",
    featured: false,
    inGallery: true,
    inStore: true,
  },
  {
    id: "4",
    title: "Plumage",
    slug: "common-loon-wing-spread-massachusetts",
    category: "wildlife",
    location: "Ashburnham MA",
    caption: "Common Loon",
    altText:
      "Common Loon spreading its wings phtographed from the rear showing its plumage on a massachusetts lake",
    imageSrc: "/gallery/wildlife/common-loon-wing-spread-massachusetts.jpg",
    featured: true,
    inGallery: true,
    inStore: true,
  },
  {
    id: "5",
    title: "11/19/25 - Auora Borealis, MA",
    slug: "cowee-pond-northern-lights-massachusetts",
    category: "landscape",
    location: "Gardner MA",
    altText: "November 2025 Northern Lights as seen over Cowee Pond in Gardner MA",
    imageSrc: "/gallery/landscapes/cowee-pond-northern-lights-massachusetts.jpg",
    featured: false,
    inGallery: true,
    inStore: false,
  },
  {
    id: "6",
    title: "Drab Foliage Fall 2025",
    slug: "drought-foliage-white-mountain-forest",
    category: "landscape",
    location: "Woodstock NH",
    altText: "Drab foliage seen in Kinsman Notch during the dry fall of 2025.",
    imageSrc: "/gallery/landscapes/drought-foliage-white-mountain-forest.jpg",
    featured: false,
    inGallery: true,
    inStore: false,
  },
  {
    id: "7",
    title: "Trees and Leaves",
    slug: "fall-foliage-hancock-trail-nh",
    category: "landscape",
    location: "Lincolnd NH",
    altText: "white mounting hiking trail during peak fall foliage in new hampshire",
    imageSrc: "/gallery/landscapes/fall-foliage-hancock-trail-nh.jpg",
    featured: true,
    inGallery: true,
    inStore: true,
  },
  {
    id: "8",
    title: "Frog on pad",
    slug: "frog-sitting-on-lillypad-wachusett-meadow",
    category: "wildlife",
    location: "Princeton MA",
    caption: "Toad",
    altText: "Frog sitting on a lilly pad at wachusett meadow wildlife sanctuary in princeton ma",
    imageSrc: "/gallery/wildlife/frog-sitting-on-lillypad-wachusett-meadow.jpg",
    featured: false,
    inGallery: true,
    inStore: true,
  },
  {
    id: "9",
    title: "Hummingbird in Flight",
    slug: "hummingbird-flying-ashburnham-ma",
    category: "wildlife",
    location: "Ashburnham MA",
    caption: "Humming bird",
    altText: "hummingbird flying flapping wings in action",
    imageSrc: "/gallery/wildlife/hummingbird-flying-ashburnham-ma.jpg",
    featured: true,
    inGallery: true,
    inStore: true,
  },
  {
    id: "10",
    title: "Sunrise in the Notch",
    slug: "kinsman-notch-sunrise-woodstock-nh",
    category: "landscape",
    location: "Kinsman Notch",
    altText:
      "the sun rises over the mountains and fills the valley with soft morning light in woodstock nh",
    imageSrc: "/gallery/landscapes/kinsman-notch-sunrise-woodstock-nh.jpg",
    featured: false,
    inGallery: true,
    inStore: true,
  },
  {
    id: "11",
    title: "Calm River",
    slug: "millers-river-sunrise-massachusetts",
    category: "landscape",
    location: "Lake Dennison",
    caption: "Beaver",
    altText: "a calm morning by the millers river",
    imageSrc: "/gallery/landscapes/millers-river-sunrise-massachusetts.jpg",
    featured: true,
    inGallery: true,
    inStore: true,
  },
  {
    id: "12",
    title: "Tiny Saw Whet",
    slug: "northern-saw-whet-owl-portrait",
    category: "wildlife",
    location: "Winchendon MA",
    caption: "Northern Saw Whet Owl",
    altText: "A tiny northen saw whet owl perched on a pine during a wind storm",
    imageSrc: "/gallery/wildlife/northern-saw-whet-owl-portrait.jpg",
    featured: false,
    inGallery: true,
    inStore: false,
  },
  {
    id: "13",
    title: "Otter Candid",
    slug: "river-otter-fishing-ma",
    category: "wildlife",
    location: "Royalston MA",
    caption: "Otter",
    altText: "a river otter at eagle preserve in royalston ma eats its latest catch",
    imageSrc: "/gallery/wildlife/river-otter-fishing-ma.jpg",
    featured: false,
    inGallery: true,
    inStore: false,
  },
  {
    id: "14",
    title: "Golden Sunrise",
    slug: "sunrise-fitchburg-central-ma",
    category: "landscape",
    location: "Fitchburg MA",
    altText: "a glowing yellow sunrise over a lake in fitchburg ma",
    imageSrc: "/gallery/landscapes/sunrise-fitchburg-central-ma.jpg",
    featured: false,
    inGallery: true,
    inStore: true,
  },
  {
    id: "15",
    title: "Misty Morning",
    slug: "sunrise-wachusett-meadow-mass-audobon",
    category: "landscape",
    location: "Princeton MA",
    altText: "a spider web is made visible by the morning dew and the sunrsie in princeton ma",
    imageSrc: "/gallery/landscapes/sunrise-wachusett-meadow-mass-audobon.jpg",
    featured: true,
    inGallery: true,
    inStore: true,
  },
  {
    id: "16",
    title: "View from West Bond",
    slug: "view-of-bondcliff-from-west-bond-nh",
    category: "landscape",
    location: "Pemigiwasset Wilderness",
    altText:
      "the view of bondlciff mountain and the pemi loop from west bond in the white mountains of new hampshire",
    imageSrc: "/gallery/landscapes/view-of-bondcliff-from-west-bond-nh.jpg",
    featured: true,
    inGallery: true,
    inStore: true,
  },
  {
    id: "17",
    title: "Stick Season",
    slug: "wild-wasp-nest-ma-dcr",
    category: "wildlife",
    location: "Barre MA",
    caption: "Wasp",
    altText:
      "a large wild wasp nest that was exposed during the fall and the lack of leaves on the trees",
    imageSrc: "/gallery/wildlife/wild-wasp-nest-ma-dcr.jpg",
    featured: false,
    inGallery: true,
    inStore: true,
  },
  {
    id: "18",
    title: "Morning View",
    slug: "winnekeag-sunrise-ashburnham-ma",
    category: "landscape",
    location: "Ashburnham MA",
    altText: "a summer sunrise over a steamy massachusetss lake",
    imageSrc: "/gallery/landscapes/winnekeag-sunrise-ashburnham-ma.jpg",
    featured: false,
    inGallery: true,
    inStore: true,
  },
  {
    id: "19",
    title: "Fall Falls",
    slug: "zealand-falls-wmnf-new-hampshire",
    category: "landscape",
    location: "Zealand Hut",
    altText:
      "looking down zealand falls near zealand falls hut in the white mountains of new hampshire",
    imageSrc: "/gallery/landscapes/zealand-falls-wmnf-new-hampshire.jpg",
    featured: true,
    inGallery: true,
    inStore: true,
  },
];

export function getByCategory(category: GalleryCategory): GalleryItem[] {
  return galleryItems.filter((item) => item.category === category);
}

export function getGalleryItems(): GalleryItem[] {
  return galleryItems.filter((item) => item.inGallery);
}

export function getStoreItems(): GalleryItem[] {
  return galleryItems.filter((item) => item.inStore);
}

export function getHomepagePreviews(): {
  gallery: GalleryItem[];
  store: GalleryItem[];
} {
  const usedSlugs = new Set<string>();

  const store = galleryItems
    .filter((item) => item.featured && item.inStore)
    .slice(0, HOMEPAGE_PREVIEW_LIMIT);
  store.forEach((item) => usedSlugs.add(item.slug));

  const gallery = galleryItems
    .filter((item) => item.featured && item.inGallery && !usedSlugs.has(item.slug))
    .slice(0, HOMEPAGE_PREVIEW_LIMIT);

  return { gallery, store };
}

export function getFeaturedGallery(): GalleryItem[] {
  return galleryItems.filter((item) => item.featured && item.inGallery);
}

export function getFeaturedStore(): GalleryItem[] {
  return galleryItems.filter((item) => item.featured && item.inStore);
}

/** @deprecated Use getFeaturedGallery or getFeaturedStore */
export function getFeatured(): GalleryItem[] {
  return galleryItems.filter((item) => item.featured);
}

/** @deprecated Use getStoreItems */
export function getPrints(): GalleryItem[] {
  return getStoreItems();
}

export function getBySlug(slug: string): GalleryItem | undefined {
  return galleryItems.find((item) => item.slug === slug);
}

/** @deprecated Use galleryItems */
export const featuredGallery = galleryItems;
