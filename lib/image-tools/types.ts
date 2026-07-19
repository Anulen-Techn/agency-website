export type ImageToolTab = "compress" | "background";

export type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

export type BackgroundRemovalMode = "ai" | "plain";

export type PlainRemovalScope = "connected" | "global";

export type ReplacementMode = "transparent" | "white" | "black" | "custom" | "image";

export type ImageDimensions = {
  width: number;
  height: number;
};

export type ProcessedImageResult = ImageDimensions & {
  blob: Blob;
  url: string;
  filename: string;
  type: OutputFormat;
  size: number;
};

export type CompressionSettings = {
  quality: number;
  preserveDimensions: boolean;
  width: number;
  height: number;
  lockAspectRatio: boolean;
  resizePercent: number;
  outputFormat: OutputFormat;
  removeMetadata: boolean;
};

export type BackgroundSettings = {
  mode: BackgroundRemovalMode;
  scope: PlainRemovalScope;
  selectedColor: string;
  tolerance: number;
  softness: number;
  smoothEdges: boolean;
  reduceHalo: boolean;
  replacementMode: ReplacementMode;
  replacementColor: string;
  outputFormat: OutputFormat;
  quality: number;
};

export type ImageToolPreferences = {
  compression: CompressionSettings;
  background: Pick<BackgroundSettings, "scope" | "selectedColor" | "tolerance" | "softness" | "smoothEdges" | "reduceHalo" | "replacementMode" | "replacementColor" | "outputFormat" | "quality">;
};
