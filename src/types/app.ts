export type AspectRatio = "1:1" | "3:4" | "4:5" | "5:4" | "9:16" | "16:9";

export type AnimalVariant = {
  id: string;
  animal: string;
  title: string;
  vibe: string;
  aspectRatio: AspectRatio;
  prompt: string;
};

export type GeneratedGalleryCard = AnimalVariant & {
  status: "idle" | "loading" | "done" | "error";
  favorite: boolean;
  imageUrl?: string;
  caption?: string;
  errorMessage?: string;
};

export type SharedPackItem = {
  id: string;
  animal: string;
  title: string;
  vibe: string;
  aspectRatio: AspectRatio;
  imageUrl: string;
};

export type SharedPack = {
  id: string;
  title: string;
  createdAt: string;
  items: SharedPackItem[];
};
