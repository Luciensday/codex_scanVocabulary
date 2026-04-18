import { NextResponse } from "next/server";

import { findAnimalVariant } from "@/lib/animal-variants";
import { generateAnimalPortrait } from "@/lib/openrouter";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const variantId =
    "variantId" in body && typeof body.variantId === "string"
      ? body.variantId
      : "";
  const selfieDataUrl =
    "selfieDataUrl" in body && typeof body.selfieDataUrl === "string"
      ? body.selfieDataUrl
      : "";

  if (!selfieDataUrl.startsWith("data:image/")) {
    return NextResponse.json(
      { error: "Upload a valid image before generating." },
      { status: 400 }
    );
  }

  if (selfieDataUrl.length > 8_000_000) {
    return NextResponse.json(
      { error: "The uploaded selfie is too large. Try a smaller image." },
      { status: 400 }
    );
  }

  const variant = findAnimalVariant(variantId);

  if (!variant) {
    return NextResponse.json(
      { error: "That animal variant does not exist." },
      { status: 404 }
    );
  }

  try {
    const origin = new URL(request.url).origin;
    const generated = await generateAnimalPortrait({
      origin,
      selfieDataUrl,
      variant
    });

    return NextResponse.json({
      item: {
        imageUrl: generated.imageUrl,
        caption: generated.caption
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The image could not be generated."
      },
      { status: 502 }
    );
  }
}
