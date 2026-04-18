import variantsData from "@/data/animal-variants.json";
import type { AnimalVariant, GeneratedGalleryCard } from "@/types/app";

export const animalVariants = variantsData as AnimalVariant[];

export const animalFilters = [
  "All",
  ...Array.from(new Set(animalVariants.map((variant) => variant.animal)))
];

export function createInitialGalleryCards(): GeneratedGalleryCard[] {
  return animalVariants.map((variant) => ({
    ...variant,
    status: "idle",
    favorite: false
  }));
}

export function findAnimalVariant(variantId: string) {
  return animalVariants.find((variant) => variant.id === variantId);
}
