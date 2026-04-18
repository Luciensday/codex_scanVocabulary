"use client";
"use client";

import Image from "next/image";
import { useState } from "react";

import { GalleryCard } from "@/components/gallery-card";
import {
  animalFilters,
  animalVariants,
  createInitialGalleryCards
} from "@/lib/animal-variants";
import { exportGalleryAsGif } from "@/lib/gif-export";
import { downloadDataUrl, fileToOptimizedDataUrl } from "@/lib/image-utils";
import { slugify } from "@/lib/presentation";
import type { GeneratedGalleryCard, SharedPackItem } from "@/types/app";

function getSelectedCards(cards: GeneratedGalleryCard[]) {
  const completedCards = cards.filter(
    (card): card is GeneratedGalleryCard & { imageUrl: string } =>
      card.status === "done" && typeof card.imageUrl === "string"
  );

  const favoriteCards = completedCards.filter((card) => card.favorite);

  return favoriteCards.length > 0 ? favoriteCards : completedCards;
}

export function HomePage() {
  const [cards, setCards] = useState(createInitialGalleryCards);
  const [activeAnimal, setActiveAnimal] = useState("All");
  const [selfieDataUrl, setSelfieDataUrl] = useState("");
  const [selfieName, setSelfieName] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [isExportingGif, setIsExportingGif] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Upload a selfie, then generate the full animal board."
  );
  const [generalError, setGeneralError] = useState("");
  const [shareLink, setShareLink] = useState("");

  const completedCards = cards.filter((card) => card.status === "done");
  const failedCards = cards.filter((card) => card.status === "error");
  const selectedCards = getSelectedCards(cards);
  const favoriteCount = cards.filter(
    (card) => card.favorite && card.status === "done"
  ).length;
  const processedCount = completedCards.length + failedCards.length;
  const progressPercent =
    cards.length === 0 ? 0 : Math.round((processedCount / cards.length) * 100);
  const visibleCards = cards.filter(
    (card) => activeAnimal === "All" || card.animal === activeAnimal
  );

  async function loadSelfie(file: File) {
    setGeneralError("");
    setShareLink("");
    setStatusMessage("Optimising your selfie for generation...");

    try {
      const optimizedDataUrl = await fileToOptimizedDataUrl(file);

      setSelfieDataUrl(optimizedDataUrl);
      setSelfieName(file.name.replace(/\.[^.]+$/, ""));
      setCards(createInitialGalleryCards());
      setActiveAnimal("All");
      setStatusMessage("Selfie ready. Generate the board when you want.");
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "The selfie could not be prepared."
      );
      setStatusMessage("Upload a selfie, then generate the full animal board.");
    }
  }

  async function handleGenerateBoard() {
    if (!selfieDataUrl) {
      setGeneralError("Upload a selfie before generating the board.");
      return;
    }

    setGeneralError("");
    setShareLink("");
    setIsGenerating(true);
    setCards(
      animalVariants.map((variant) => ({
        ...variant,
        status: "loading",
        favorite: false
      }))
    );
    setStatusMessage("Generating 18 live animal remixes...");

    const queue = [...animalVariants];
    let completed = 0;
    let failures = 0;

    const worker = async () => {
      while (queue.length > 0) {
        const variant = queue.shift();

        if (!variant) {
          return;
        }

        try {
          const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              selfieDataUrl,
              variantId: variant.id
            })
          });

          const payload = (await response.json()) as {
            error?: string;
            item?: { imageUrl: string; caption?: string };
          };

          if (!response.ok || !payload.item) {
            throw new Error(payload.error ?? "Generation failed for this card.");
          }

          setCards((currentCards) =>
            currentCards.map((card) =>
              card.id === variant.id
                ? {
                    ...card,
                    status: "done",
                    imageUrl: payload.item?.imageUrl,
                    caption: payload.item?.caption,
                    errorMessage: ""
                  }
                : card
            )
          );
        } catch (error) {
          failures += 1;

          setCards((currentCards) =>
            currentCards.map((card) =>
              card.id === variant.id
                ? {
                    ...card,
                    status: "error",
                    errorMessage:
                      error instanceof Error
                        ? error.message
                        : "Generation failed for this card."
                  }
                : card
            )
          );
        } finally {
          completed += 1;
          setStatusMessage(
            `Building the board: ${completed} of ${animalVariants.length} cards processed.`
          );
        }
      }
    };

    await Promise.all([worker(), worker(), worker()]);

    setIsGenerating(false);

    if (failures > 0) {
      setStatusMessage(
        `Board ready with ${animalVariants.length - failures} finished cards. ${failures} cards need another run.`
      );
      return;
    }

    setStatusMessage(
      "Board ready. Favorite the cards you want to turn into a GIF or share pack."
    );
  }

  function handleToggleFavorite(cardId: string) {
    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === cardId ? { ...card, favorite: !card.favorite } : card
      )
    );
  }

  function handleDownloadCard(card: GeneratedGalleryCard) {
    if (!card.imageUrl) {
      return;
    }

    const fileName = `${slugify(card.title)}.png`;
    downloadDataUrl(card.imageUrl, fileName);
  }

  async function handleCreateShareLink() {
    const items = selectedCards.map(
      (card): SharedPackItem => ({
        id: card.id,
        animal: card.animal,
        title: card.title,
        vibe: card.vibe,
        aspectRatio: card.aspectRatio,
        imageUrl: card.imageUrl
      })
    );

    if (items.length === 0) {
      setGeneralError("Generate at least one finished card before sharing.");
      return;
    }

    setGeneralError("");
    setIsCreatingShare(true);

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: selfieName
            ? `${selfieName}'s animal board`
            : "Who Let Me Out animal board",
          items
        })
      });

      const payload = (await response.json()) as {
        error?: string;
        shareUrl?: string;
      };

      if (!response.ok || !payload.shareUrl) {
        throw new Error(payload.error ?? "Could not create a share link.");
      }

      setShareLink(payload.shareUrl);

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload.shareUrl).catch(() => {});
      }

      if (navigator.share) {
        await navigator
          .share({
            title: "Who Let Me Out",
            text: "Animal remix pack",
            url: payload.shareUrl
          })
          .catch(() => {});
      }

      setStatusMessage("Share link ready. It has been copied to your clipboard.");
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : "Could not create a share link."
      );
    } finally {
      setIsCreatingShare(false);
    }
  }

  async function handleExportGif() {
    const exportItems = selectedCards.map((card) => ({
      imageUrl: card.imageUrl,
      title: card.title,
      animal: card.animal
    }));

    if (exportItems.length === 0) {
      setGeneralError("Generate cards before exporting a GIF.");
      return;
    }

    setGeneralError("");
    setIsExportingGif(true);

    try {
      const gifBlob = await exportGalleryAsGif(exportItems);
      const downloadUrl = URL.createObjectURL(gifBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${slugify(selfieName || "animal-board")}.gif`;
      link.click();

      window.setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1_000);

      setStatusMessage("GIF exported.");
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : "GIF export failed."
      );
    } finally {
      setIsExportingGif(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">AI sticker lab</p>
          <h1>Who Let Me Out</h1>
          <p className="hero-text">
            Upload one selfie, then spin it into an editorial moodboard of foxes,
            dogs, cats, elephants, raccoons, llamas, and more. The board fills in
            live, card by card, so the experience feels playful instead of
            waiting-room dull.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-tile">
            <span>Animal cards</span>
            <strong>{animalVariants.length}</strong>
          </div>
          <div className="stat-tile">
            <span>Animals</span>
            <strong>{animalFilters.length - 1}</strong>
          </div>
          <div className="stat-tile">
            <span>Favorites</span>
            <strong>{favoriteCount}</strong>
          </div>
          <div className="stat-tile">
            <span>Finished</span>
            <strong>{completedCards.length}</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <aside className="control-column">
          <div className="panel">
            <div className="panel__header">
              <div>
                <p className="panel__eyebrow">Upload</p>
                <h2>Your face reference</h2>
              </div>
              <span className="panel__pill">Live AI output</span>
            </div>

            <label
              className={`dropzone ${isDragActive ? "is-active" : ""} ${
                selfieDataUrl ? "has-image" : ""
              }`}
              onDragEnter={() => setIsDragActive(true)}
              onDragLeave={() => setIsDragActive(false)}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragActive(false);

                const file = event.dataTransfer.files?.[0];

                if (file) {
                  void loadSelfie(file);
                }
              }}
            >
              <input
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void loadSelfie(file);
                  }

                  event.currentTarget.value = "";
                }}
                type="file"
              />

              {selfieDataUrl ? (
                <>
                  <div className="dropzone__preview-shell">
                    <Image
                      alt="Uploaded selfie preview"
                      className="dropzone__preview"
                      fill
                      sizes="(max-width: 780px) 100vw, 360px"
                      src={selfieDataUrl}
                      unoptimized
                    />
                  </div>
                  <div className="dropzone__footer">
                    <div>
                      <strong>{selfieName || "Selfie loaded"}</strong>
                      <p>Drop another image here to swap the source.</p>
                    </div>
                    <span className="dropzone__badge">Ready</span>
                  </div>
                </>
              ) : (
                <div className="dropzone__empty">
                  <span className="dropzone__badge">PNG or JPG</span>
                  <h3>Drop a selfie here</h3>
                  <p>
                    We compress it client-side, then send it to OpenRouter for 18
                    live animal edits.
                  </p>
                </div>
              )}
            </label>

            <button
              className="primary-button"
              disabled={isGenerating || !selfieDataUrl}
              onClick={() => void handleGenerateBoard()}
              type="button"
            >
              {isGenerating ? "Generating board..." : "Generate 18 animal cards"}
            </button>

            <div className="progress-block">
              <div className="progress-row">
                <span>Status</span>
                <strong>{progressPercent}%</strong>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              <p>{statusMessage}</p>
            </div>
          </div>

          <div className="panel">
            <div className="panel__header">
              <div>
                <p className="panel__eyebrow">Export</p>
                <h2>Shareable outputs</h2>
              </div>
            </div>

            <div className="selection-note">
              <strong>
                {favoriteCount > 0
                  ? `${favoriteCount} favorites selected`
                  : "No favorites selected"}
              </strong>
              <p>
                GIF export and share links use favorites first. If nothing is
                favorited, they use the full finished board.
              </p>
            </div>

            <div className="button-row">
              <button
                className="secondary-button"
                disabled={isExportingGif || completedCards.length === 0}
                onClick={() => void handleExportGif()}
                type="button"
              >
                {isExportingGif ? "Building GIF..." : "Export GIF"}
              </button>
              <button
                className="secondary-button"
                disabled={isCreatingShare || completedCards.length === 0}
                onClick={() => void handleCreateShareLink()}
                type="button"
              >
                {isCreatingShare ? "Creating link..." : "Create share link"}
              </button>
            </div>

            {shareLink ? (
              <div className="share-box">
                <p>Share link</p>
                <a href={shareLink} rel="noreferrer" target="_blank">
                  {shareLink}
                </a>
              </div>
            ) : null}

            {generalError ? <p className="error-copy">{generalError}</p> : null}
          </div>
        </aside>

        <section className="board-column">
          <div className="board-header">
            <div>
              <p className="panel__eyebrow">Results board</p>
              <h2>Editorial masonry gallery</h2>
            </div>
            <div className="filter-row" role="tablist" aria-label="Animal filters">
              {animalFilters.map((filter) => (
                <button
                  aria-pressed={activeAnimal === filter}
                  className={`filter-chip ${
                    activeAnimal === filter ? "is-active" : ""
                  }`}
                  key={filter}
                  onClick={() => setActiveAnimal(filter)}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="gallery-masonry">
            {visibleCards.map((card) => (
              <GalleryCard
                card={card}
                key={card.id}
                onDownload={handleDownloadCard}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
