import Image from "next/image";
import type { CSSProperties } from "react";

import { toCssAspectRatio } from "@/lib/presentation";
import type { SharedPackItem } from "@/types/app";

export function ShareGallery({ items }: { items: SharedPackItem[] }) {
  return (
    <div className="gallery-masonry">
      {items.map((item) => {
        const mediaStyle = {
          aspectRatio: toCssAspectRatio(item.aspectRatio)
        } satisfies CSSProperties;

        return (
          <article className="gallery-card gallery-card--done" key={item.id}>
            <div className="gallery-card__media" style={mediaStyle}>
              <Image
                alt={`${item.title} shared animal remix`}
                className="gallery-card__image"
                fill
                sizes="(max-width: 780px) 100vw, 33vw"
                src={item.imageUrl}
                unoptimized
              />
              <div className="gallery-card__shade" />
            </div>
            <div className="gallery-card__meta">
              <div>
                <p className="gallery-card__animal">{item.animal}</p>
                <h3 className="gallery-card__title">{item.title}</h3>
              </div>
              <p className="gallery-card__vibe">{item.vibe}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
