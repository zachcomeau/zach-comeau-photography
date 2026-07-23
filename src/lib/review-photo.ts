export const PHOTO_MAX_BYTES = 3 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"] as const;
export type PhotoContentType = (typeof ALLOWED_PHOTO_TYPES)[number];
