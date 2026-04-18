import Image from "next/image";
import type { CSSProperties } from "react";

import { toCssAspectRatio } from "@/lib/presentation";
import type { GeneratedGalleryCard } from "@/types/app";

type GalleryCardProps = {
  card: GeneratedGalleryCard;
  onDownload: (card: GeneratedGalleryCard) => void;
  onToggleFavorite: (cardId: string) => void;
};

export function GalleryCard({
  card,
  onDownload,
  onToggleFavorite
}: GalleryCardProps) {
  const mediaStyle = {
    aspectRatio: toCssAspectRatio(card.aspectRatio)
  } satisfies CSSProperties;

  const isReady = card.status === "done" && typeof card.imageUrl === "string";
  const readyImageUrl = typeof card.imageUrl === "string" ? card.imageUrl : "";

  return (
    <article className={`gallery-card gallery-card--${card.status}`}>
      <div className="gallery-card__media" style={mediaStyle}>
        {isReady ? (
          <>
            <Image
              alt={`${card.title} animal remix`}
              className="gallery-card__image"
              fill
              sizes="(max-width: 780px) 100vw, (max-width: 1120px) 50vw, 33vw"
              src={readyImageUrl}
              unoptimized
            />
            <div className="gallery-card__shade" />
            <div className="gallery-card__actions">
              <button
                aria-label={
                  card.favorite ? "Remove from favorites" : "Add to favorites"
                }
                aria-pressed={card.favorite}
                className={`icon-button ${card.favorite ? "is-active" : ""}`}
                onClick={() => onToggleFavorite(card.id)}
                type="button"
              >
                {card.favorite ? "Saved" : "Save"}
              </button>
              <button
                className="icon-button"
                onClick={() => onDownload(card)}
                type="button"
              >
                PNG
              </button>
            </div>
          </>
        ) : null}

        {card.status === "idle" ? (
          <div className="gallery-card__placeholder">
            <span className="gallery-card__badge">Storyboard</span>
            <h3>{card.title}</h3>
            <p>{card.vibe}</p>
          </div>
        ) : null}

        {card.status === "loading" ? (
          <div className="gallery-card__placeholder gallery-card__placeholder--loading">
            <span className="gallery-card__badge">Generating</span>
            <div className="gallery-card__shimmer" />
            <h3>{card.title}</h3>
            <p>Building this animal remix from your selfie.</p>
          </div>
        ) : null}

        {card.status === "error" ? (
          <div className="gallery-card__placeholder gallery-card__placeholder--error">
            <span className="gallery-card__badge">Needs another pass</span>
            <h3>{card.title}</h3>
            <p>{card.errorMessage ?? "The model did not return an image."}</p>
          </div>
        ) : null}
      </div>

      <div className="gallery-card__meta">
        <div>
          <p className="gallery-card__animal">{card.animal}</p>
          <h3 className="gallery-card__title">{card.title}</h3>
        </div>
        <p className="gallery-card__vibe">{card.vibe}</p>
      </div>
    </article>
  );
}
