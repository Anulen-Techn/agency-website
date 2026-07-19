import type { ImageDimensions, OutputFormat, PlainRemovalScope, ReplacementMode } from "./types";

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 28_000_000;
export const MAX_IMAGE_EDGE = 9000;

const supportedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

type Rgb = {
  r: number;
  g: number;
  b: number;
};

export function validateImageFile(file: File | null) {
  if (!file) return "Choose an image before processing.";
  if (!supportedTypes.has(file.type)) return "Use a PNG, JPG, JPEG, or WebP image.";
  if (file.size > MAX_IMAGE_BYTES) return "The image is larger than 15 MB. Please choose a smaller file.";
  if (file.size === 0) return "The selected image is empty.";
  return "";
}

export function validateDimensions(dimensions: ImageDimensions) {
  if (!dimensions.width || !dimensions.height) return "The image dimensions could not be read.";
  if (dimensions.width * dimensions.height > MAX_IMAGE_PIXELS) return "This image is extremely large. Please use an image under 28 megapixels.";
  if (dimensions.width > MAX_IMAGE_EDGE || dimensions.height > MAX_IMAGE_EDGE) return "This image edge is too large to process safely in the browser.";
  return "";
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.max(0, value).toFixed(0)}%`;
}

export function extensionForFormat(format: OutputFormat) {
  if (format === "image/jpeg") return "jpg";
  if (format === "image/webp") return "webp";
  return "png";
}

export function safeFileBase(filename: string) {
  const withoutExtension = filename.replace(/\.[^.]+$/, "");
  return withoutExtension.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "image";
}

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb) {
  return `#${[r, g, b].map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0")).join("")}`;
}

export async function loadImageElement(source: Blob | string) {
  const url = typeof source === "string" ? source : URL.createObjectURL(source);
  try {
    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("The image could not be read. Try another file."));
      image.src = url;
    });
    return { image, url };
  } catch (error) {
    if (typeof source !== "string") URL.revokeObjectURL(url);
    throw error;
  }
}

export async function readImageDimensions(file: File): Promise<ImageDimensions> {
  const { image, url } = await loadImageElement(file);
  URL.revokeObjectURL(url);
  return { width: image.naturalWidth, height: image.naturalHeight };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: OutputFormat, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The browser could not export this image."));
      },
      type,
      type === "image/png" ? undefined : quality,
    );
  });
}

function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

export async function compressImage(
  source: Blob,
  options: {
    width: number;
    height: number;
    outputFormat: OutputFormat;
    quality: number;
  },
) {
  const { image, url } = await loadImageElement(source);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser.");

    if (options.outputFormat === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await canvasToBlob(canvas, options.outputFormat, options.quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function getPixelColor(source: Blob, point: { x: number; y: number }) {
  const { image, url } = await loadImageElement(source);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas is not available in this browser.");
    ctx.drawImage(image, 0, 0);
    const x = Math.max(0, Math.min(canvas.width - 1, Math.round(point.x)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.round(point.y)));
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return rgbToHex({ r: pixel[0], g: pixel[1], b: pixel[2] });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function colorDistance(data: Uint8ClampedArray, index: number, target: Rgb) {
  const red = data[index] - target.r;
  const green = data[index + 1] - target.g;
  const blue = data[index + 2] - target.b;
  return Math.sqrt(red * red + green * green + blue * blue);
}

function matchesBackground(data: Uint8ClampedArray, pixelIndex: number, target: Rgb, tolerance: number, softness: number) {
  return colorDistance(data, pixelIndex * 4, target) <= tolerance + softness;
}

function applyTransparentAlpha(data: Uint8ClampedArray, pixelIndex: number, target: Rgb, tolerance: number, softness: number) {
  const index = pixelIndex * 4;
  const distance = colorDistance(data, index, target);
  if (distance <= tolerance) {
    data[index + 3] = 0;
    return;
  }

  const edge = Math.max(1, softness);
  const alphaScale = Math.min(1, Math.max(0, (distance - tolerance) / edge));
  data[index + 3] = Math.round(data[index + 3] * alphaScale);
}

function buildConnectedMask(data: Uint8ClampedArray, width: number, height: number, target: Rgb, tolerance: number, softness: number) {
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const add = (pixel: number) => {
    if (visited[pixel]) return;
    if (!matchesBackground(data, pixel, target, tolerance, softness)) return;
    visited[pixel] = 1;
    queue[tail] = pixel;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    add(x);
    add((height - 1) * width + x);
  }

  for (let y = 1; y < height - 1; y += 1) {
    add(y * width);
    add(y * width + width - 1);
  }

  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) add(pixel - 1);
    if (x < width - 1) add(pixel + 1);
    if (y > 0) add(pixel - width);
    if (y < height - 1) add(pixel + width);
  }

  return visited;
}

function softenMask(data: Uint8ClampedArray, mask: Uint8Array, width: number, height: number) {
  const alpha = new Uint8ClampedArray(width * height);
  for (let index = 0; index < mask.length; index += 1) alpha[index] = data[index * 4 + 3];

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      if (!mask[pixel]) continue;
      const touchingSubject =
        !mask[pixel - 1] ||
        !mask[pixel + 1] ||
        !mask[pixel - width] ||
        !mask[pixel + width] ||
        !mask[pixel - width - 1] ||
        !mask[pixel - width + 1] ||
        !mask[pixel + width - 1] ||
        !mask[pixel + width + 1];
      if (touchingSubject) alpha[pixel] = Math.max(alpha[pixel], 22);
    }
  }

  for (let index = 0; index < alpha.length; index += 1) data[index * 4 + 3] = alpha[index];
}

async function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, mode: ReplacementMode, color: string, backgroundFile?: Blob | null) {
  if (mode === "transparent") return;
  if (mode === "image" && backgroundFile) {
    const { image, url } = await loadImageElement(backgroundFile);
    try {
      drawCover(ctx, image, width, height);
      return;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  ctx.fillStyle = mode === "black" ? "#000000" : mode === "custom" ? color : "#ffffff";
  ctx.fillRect(0, 0, width, height);
}

export async function removePlainBackground(
  source: Blob,
  options: {
    selectedColor: string;
    tolerance: number;
    softness: number;
    scope: PlainRemovalScope;
    smoothEdges: boolean;
    reduceHalo: boolean;
    replacementMode: ReplacementMode;
    replacementColor: string;
    backgroundFile?: Blob | null;
    outputFormat: OutputFormat;
    quality: number;
  },
) {
  const { image, url } = await loadImageElement(source);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas is not available in this browser.");
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const target = hexToRgb(options.selectedColor);
    const total = canvas.width * canvas.height;
    const mask = options.scope === "connected" ? buildConnectedMask(imageData.data, canvas.width, canvas.height, target, options.tolerance, options.softness) : null;

    if (mask) {
      for (let pixel = 0; pixel < total; pixel += 1) {
        if (mask[pixel]) applyTransparentAlpha(imageData.data, pixel, target, options.tolerance, options.softness);
      }
      if (options.smoothEdges) softenMask(imageData.data, mask, canvas.width, canvas.height);
    } else {
      for (let pixel = 0; pixel < total; pixel += 1) {
        if (matchesBackground(imageData.data, pixel, target, options.tolerance, options.softness)) {
          applyTransparentAlpha(imageData.data, pixel, target, options.tolerance, options.softness);
        }
      }
    }

    if (options.reduceHalo) {
      for (let index = 0; index < imageData.data.length; index += 4) {
        if (imageData.data[index + 3] > 0 && colorDistance(imageData.data, index, target) < options.tolerance + options.softness * 1.7) {
          imageData.data[index] = Math.round((imageData.data[index] + target.r) / 2);
          imageData.data[index + 1] = Math.round((imageData.data[index + 1] + target.g) / 2);
          imageData.data[index + 2] = Math.round((imageData.data[index + 2] + target.b) / 2);
        }
      }
    }

    const subjectCanvas = document.createElement("canvas");
    subjectCanvas.width = canvas.width;
    subjectCanvas.height = canvas.height;
    const subjectCtx = subjectCanvas.getContext("2d");
    if (!subjectCtx) throw new Error("Canvas is not available in this browser.");
    subjectCtx.putImageData(imageData, 0, 0);

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) throw new Error("Canvas is not available in this browser.");
    await drawBackground(exportCtx, canvas.width, canvas.height, options.replacementMode, options.replacementColor, options.backgroundFile);
    exportCtx.drawImage(subjectCanvas, 0, 0);

    const finalFormat = options.replacementMode === "transparent" && options.outputFormat === "image/jpeg" ? "image/png" : options.outputFormat;
    return await canvasToBlob(exportCanvas, finalFormat, options.quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function removeBackgroundWithOptionalAi(source: Blob) {
  const dynamicImport = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<{
    removeBackground?: (image: Blob) => Promise<Blob>;
  }>;
  const module = await dynamicImport("@imgly/background-removal");
  if (!module.removeBackground) throw new Error("The local AI background-removal module is unavailable.");
  return module.removeBackground(source);
}
