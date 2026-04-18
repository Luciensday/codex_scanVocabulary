import type { AnimalVariant } from "@/types/app";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "google/gemini-3.1-flash-image-preview";

function extractCaption(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (
          part &&
          typeof part === "object" &&
          "type" in part &&
          part.type === "text" &&
          "text" in part &&
          typeof part.text === "string"
        ) {
          return part.text;
        }

        return "";
      })
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  return "";
}

function extractImageUrl(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("choices" in payload)) {
    return null;
  }

  const choices = payload.choices;

  if (!Array.isArray(choices) || choices.length === 0) {
    return null;
  }

  const message = choices[0]?.message;
  const images = message?.images;

  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  const firstImage = images[0];

  const snakeCaseUrl =
    firstImage &&
    typeof firstImage === "object" &&
    "image_url" in firstImage &&
    firstImage.image_url &&
    typeof firstImage.image_url === "object" &&
    "url" in firstImage.image_url
      ? firstImage.image_url.url
      : null;

  if (typeof snakeCaseUrl === "string") {
    return snakeCaseUrl;
  }

  const camelCaseUrl =
    firstImage &&
    typeof firstImage === "object" &&
    "imageUrl" in firstImage &&
    firstImage.imageUrl &&
    typeof firstImage.imageUrl === "object" &&
    "url" in firstImage.imageUrl
      ? firstImage.imageUrl.url
      : null;

  return typeof camelCaseUrl === "string" ? camelCaseUrl : null;
}

export async function generateAnimalPortrait(options: {
  origin: string;
  selfieDataUrl: string;
  variant: AnimalVariant;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing. Add it in .env.local.");
  }

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": options.origin,
      "X-OpenRouter-Title": "Who Let Me Out"
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      stream: false,
      modalities: ["image", "text"],
      image_config: {
        aspect_ratio: options.variant.aspectRatio
      },
      messages: [
        {
          role: "system",
          content:
            "You create a single polished animal remix from a selfie. Always keep the person's identity recognisable. Return one image and only a short caption. Do not add text inside the image."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${options.variant.prompt} Use the uploaded selfie as the identity reference. Keep the face readable, flattering, and playful. Produce one final image only.`
            },
            {
              type: "image_url",
              image_url: {
                url: options.selfieDataUrl
              }
            }
          ]
        }
      ]
    })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      payload.error &&
      typeof payload.error === "object" &&
      "message" in payload.error &&
      typeof payload.error.message === "string"
        ? payload.error.message
        : `OpenRouter request failed with status ${response.status}.`;

    throw new Error(errorMessage);
  }

  const imageUrl = extractImageUrl(payload);

  if (!imageUrl) {
    throw new Error("The model returned no image for this card.");
  }

  const firstChoice =
    payload &&
    typeof payload === "object" &&
    "choices" in payload &&
    Array.isArray(payload.choices)
      ? payload.choices[0]
      : null;

  const caption = extractCaption(firstChoice?.message?.content);

  return {
    imageUrl,
    caption
  };
}
