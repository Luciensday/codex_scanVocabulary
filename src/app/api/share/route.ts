import { NextResponse } from "next/server";

import { createSharePack } from "@/lib/share-store";
import type { SharedPackItem } from "@/types/app";

export const runtime = "nodejs";

function isSharedPackItem(value: unknown): value is SharedPackItem {
  return (
    !!value &&
    typeof value === "object" &&
    "id" in value &&
    typeof value.id === "string" &&
    "animal" in value &&
    typeof value.animal === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "vibe" in value &&
    typeof value.vibe === "string" &&
    "aspectRatio" in value &&
    typeof value.aspectRatio === "string" &&
    "imageUrl" in value &&
    typeof value.imageUrl === "string" &&
    value.imageUrl.startsWith("data:image/")
  );
}

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

  const title =
    "title" in body && typeof body.title === "string"
      ? body.title.slice(0, 80)
      : "Who Let Me Out animal board";
  const items =
    "items" in body && Array.isArray(body.items)
      ? body.items.filter(isSharedPackItem)
      : [];

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Share at least one generated card." },
      { status: 400 }
    );
  }

  const pack = await createSharePack({
    title,
    createdAt: new Date().toISOString(),
    items
  });

  const shareUrl = `${new URL(request.url).origin}/share/${pack.id}`;

  return NextResponse.json({
    id: pack.id,
    shareUrl
  });
}
