import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { SharedPack } from "@/types/app";

const shareDirectory = path.join(process.cwd(), ".data", "shares");

async function ensureShareDirectory() {
  await mkdir(shareDirectory, { recursive: true });
}

function getSharePath(id: string) {
  return path.join(shareDirectory, `${id}.json`);
}

export async function createSharePack(
  packInput: Omit<SharedPack, "id">
): Promise<SharedPack> {
  await ensureShareDirectory();

  const id = randomBytes(6).toString("base64url");
  const pack: SharedPack = {
    id,
    ...packInput
  };

  await writeFile(getSharePath(id), JSON.stringify(pack, null, 2), "utf8");

  return pack;
}

export async function readSharePack(id: string): Promise<SharedPack | null> {
  try {
    const raw = await readFile(getSharePath(id), "utf8");
    return JSON.parse(raw) as SharedPack;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}
