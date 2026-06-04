import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityClient } from "sanity:client";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const builder = createImageUrlBuilder(sanityClient);

/**
 * Build a Sanity CDN image URL. Chain .width()/.height()/.format() etc.
 * Example: urlForImage(cover).width(1200).format("webp").url()
 */
export function urlForImage(source: SanityImageSource) {
	return builder.image(source);
}
