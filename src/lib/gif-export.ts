import { GIFEncoder, applyPalette, quantize } from "gifenc";

import { loadImageSource } from "@/lib/image-utils";

type GifFrame = {
  imageUrl: string;
  title: string;
  animal: string;
};

const FRAME_WIDTH = 720;
const FRAME_HEIGHT = 920;
const IMAGE_X = 48;
const IMAGE_Y = 48;
const IMAGE_WIDTH = 624;
const IMAGE_HEIGHT = 700;

function drawRoundedRectangle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = x + (width - drawWidth) / 2;
  const offsetY = y + (height - drawHeight) / 2;

  context.save();
  drawRoundedRectangle(context, x, y, width, height, 32);
  context.clip();
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  context.restore();
}

function renderFrame(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  frame: GifFrame,
  index: number,
  total: number
) {
  context.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);

  const background = context.createLinearGradient(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
  background.addColorStop(0, "#fff0d8");
  background.addColorStop(0.5, "#ffdbc5");
  background.addColorStop(1, "#d7f7f0");
  context.fillStyle = background;
  context.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);

  context.fillStyle = "rgba(255, 255, 255, 0.78)";
  drawRoundedRectangle(context, 24, 24, FRAME_WIDTH - 48, FRAME_HEIGHT - 48, 44);
  context.fill();

  drawCoverImage(context, image, IMAGE_X, IMAGE_Y, IMAGE_WIDTH, IMAGE_HEIGHT);

  context.fillStyle = "#132129";
  context.font = "700 22px Arial";
  context.fillText("Who Let Me Out", 56, 805);

  context.font = "700 40px Arial";
  context.fillText(frame.title, 56, 852);

  context.fillStyle = "#42515a";
  context.font = "600 20px Arial";
  context.fillText(`${frame.animal} remix`, 56, 885);
  context.fillText(`${index + 1} / ${total}`, 610, 885);
}

export async function exportGalleryAsGif(frames: GifFrame[]) {
  if (frames.length === 0) {
    throw new Error("Choose at least one card before exporting a GIF.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = FRAME_WIDTH;
  canvas.height = FRAME_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("The browser could not prepare the GIF export.");
  }

  const gif = GIFEncoder();

  for (const [index, frame] of frames.entries()) {
    const image = await loadImageSource(frame.imageUrl);
    renderFrame(context, image, frame, index, frames.length);

    const imageData = context.getImageData(0, 0, FRAME_WIDTH, FRAME_HEIGHT).data;
    const palette = quantize(imageData, 256);
    const indexedFrame = applyPalette(imageData, palette);

    gif.writeFrame(indexedFrame, FRAME_WIDTH, FRAME_HEIGHT, {
      palette,
      delay: 850,
      repeat: 0
    });
  }

  gif.finish();

  const output = new Uint8Array(gif.bytes());

  return new Blob([output.buffer], { type: "image/gif" });
}
