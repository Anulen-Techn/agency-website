"use client";

import { ChangeEvent, DragEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, Image as ImageIcon, Loader2, RotateCcw, Send, SlidersHorizontal, Upload, X } from "lucide-react";
import {
  compressImage,
  extensionForFormat,
  formatBytes,
  formatPercent,
  getPixelColor,
  MAX_IMAGE_BYTES,
  readImageDimensions,
  removeBackgroundWithOptionalAi,
  removePlainBackground,
  safeFileBase,
  validateDimensions,
  validateImageFile,
} from "@/lib/image-tools/processing";
import { loadImageToolPreferences, saveImageToolPreferences } from "@/lib/image-tools/storage";
import type { BackgroundSettings, CompressionSettings, ImageDimensions, ImageToolTab, OutputFormat, PlainRemovalScope, ProcessedImageResult, ReplacementMode } from "@/lib/image-tools/types";
import AdSenseAd from "@/components/ads/AdSenseAd";
import { ADSENSE_SLOTS } from "@/lib/adsense";

const defaultCompression: CompressionSettings = {
  quality: 0.78,
  preserveDimensions: true,
  width: 1200,
  height: 800,
  lockAspectRatio: true,
  resizePercent: 100,
  outputFormat: "image/webp",
  removeMetadata: true,
};

const defaultBackground: BackgroundSettings = {
  mode: "plain",
  scope: "connected",
  selectedColor: "#ffffff",
  tolerance: 34,
  softness: 18,
  smoothEdges: true,
  reduceHalo: false,
  replacementMode: "transparent",
  replacementColor: "#f7f7f4",
  outputFormat: "image/png",
  quality: 0.9,
};

const outputFormats: Array<{ value: OutputFormat; label: string }> = [
  { value: "image/webp", label: "WebP" },
  { value: "image/png", label: "PNG" },
  { value: "image/jpeg", label: "JPG" },
];

const replacementModes: Array<{ value: ReplacementMode; label: string }> = [
  { value: "transparent", label: "Transparent" },
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
  { value: "custom", label: "Custom colour" },
  { value: "image", label: "Image background" },
];

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

type ImageToolsProps = {
  mode?: ImageToolTab;
  title?: string;
  description?: string;
  showTabs?: boolean;
};

function resultFromBlob(blob: Blob, sourceName: string, prefix: string, type: OutputFormat, dimensions: ImageDimensions): ProcessedImageResult {
  const filename = `${prefix}-${safeFileBase(sourceName)}.${extensionForFormat(type)}`;
  return {
    blob,
    url: URL.createObjectURL(blob),
    filename,
    type,
    size: blob.size,
    width: dimensions.width,
    height: dimensions.height,
  };
}

export default function ImageTools({
  mode = "compress",
  title = "Free Image Compressor and Background Remover",
  description = "Compress images, resize photos, remove plain backgrounds, replace backgrounds, and download optimised JPG, PNG, or WebP files directly in your browser.",
  showTabs = true,
}: ImageToolsProps) {
  const [activeTab, setActiveTab] = useState<ImageToolTab>(mode);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [compression, setCompression] = useState(defaultCompression);
  const [background, setBackground] = useState(defaultBackground);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundImageName, setBackgroundImageName] = useState("");
  const [compressedResult, setCompressedResult] = useState<ProcessedImageResult | null>(null);
  const [backgroundResult, setBackgroundResult] = useState<ProcessedImageResult | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [progress, setProgress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadedCompress, setDownloadedCompress] = useState(false);
  const [downloadedBackground, setDownloadedBackground] = useState(false);
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const hasUndownloadedResult = Boolean((compressedResult && !downloadedCompress) || (backgroundResult && !downloadedBackground));

  useEffect(() => {
    if (!showTabs) setActiveTab(mode);
  }, [mode, showTabs]);

  useEffect(() => {
    const preferences = loadImageToolPreferences();
    if (preferences?.compression) setCompression((current) => ({ ...current, ...preferences.compression }));
    if (preferences?.background) setBackground((current) => ({ ...current, ...preferences.background }));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveImageToolPreferences({
        compression,
        background: {
          scope: background.scope,
          selectedColor: background.selectedColor,
          tolerance: background.tolerance,
          softness: background.softness,
          smoothEdges: background.smoothEdges,
          reduceHalo: background.reduceHalo,
          replacementMode: background.replacementMode,
          replacementColor: background.replacementColor,
          outputFormat: background.outputFormat,
          quality: background.quality,
        },
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [compression, background]);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  useEffect(() => {
    return () => {
      if (compressedResult?.url) URL.revokeObjectURL(compressedResult.url);
    };
  }, [compressedResult]);

  useEffect(() => {
    return () => {
      if (backgroundResult?.url) URL.revokeObjectURL(backgroundResult.url);
    };
  }, [backgroundResult]);

  const originalStats = useMemo(() => {
    if (!file || !dimensions) return null;
    return [
      { label: "Original filename", value: file.name },
      { label: "Original size", value: formatBytes(file.size) },
      { label: "Original dimensions", value: `${dimensions.width} x ${dimensions.height}px` },
      { label: "Format", value: file.type.replace("image/", "").toUpperCase() },
    ];
  }, [file, dimensions]);

  const compressedStats = useMemo(() => {
    if (!file || !compressedResult) return null;
    const saved = file.size - compressedResult.size;
    return [
      { label: "Compressed size", value: formatBytes(compressedResult.size) },
      { label: "Compressed dimensions", value: `${compressedResult.width} x ${compressedResult.height}px` },
      { label: "Size reduced by", value: saved > 0 ? formatPercent((saved / file.size) * 100) : "0%" },
      { label: "Storage saved", value: saved > 0 ? formatBytes(saved) : "0 B" },
      { label: "Selected format", value: extensionForFormat(compressedResult.type).toUpperCase() },
    ];
  }, [compressedResult, file]);

  const targetCompressionDimensions = useMemo(() => {
    if (!dimensions) return { width: compression.width, height: compression.height };
    if (compression.preserveDimensions) return dimensions;
    return {
      width: clamp(Math.round(dimensions.width * (compression.resizePercent / 100)), 1, dimensions.width),
      height: clamp(Math.round(dimensions.height * (compression.resizePercent / 100)), 1, dimensions.height),
    };
  }, [compression.preserveDimensions, compression.resizePercent, compression.width, compression.height, dimensions]);

  const uploadFile = async (nextFile: File, options?: { skipConfirm?: boolean; sourceTab?: ImageToolTab }) => {
    if (!options?.skipConfirm && hasUndownloadedResult && !window.confirm("Discard the processed result and upload another image?")) return;
    setError("");
    setNotice("");
    setProgress("Reading image...");

    const fileError = validateImageFile(nextFile);
    if (fileError) {
      setProgress("");
      setError(fileError);
      return;
    }

    try {
      const nextDimensions = await readImageDimensions(nextFile);
      const dimensionError = validateDimensions(nextDimensions);
      if (dimensionError) {
        setProgress("");
        setError(dimensionError);
        return;
      }

      setFile(nextFile);
      setOriginalUrl(URL.createObjectURL(nextFile));
      setDimensions(nextDimensions);
      setCompression((current) => ({
        ...current,
        preserveDimensions: options?.sourceTab === "background" ? false : current.preserveDimensions,
        width: nextDimensions.width,
        height: nextDimensions.height,
        resizePercent: options?.sourceTab === "background" ? Math.min(100, current.resizePercent) : current.resizePercent,
        outputFormat: nextFile.type === "image/png" ? "image/png" : current.outputFormat,
      }));
      setCompressedResult(null);
      setBackgroundResult(null);
      setDownloadedCompress(false);
      setDownloadedBackground(false);
      setProgress("");
      setNotice(nextDimensions.width * nextDimensions.height > 12_000_000 ? "Large images may take longer and use significant device memory." : "Image loaded.");
    } catch {
      setProgress("");
      setError("This image could not be opened. It may be corrupted or unsupported.");
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    event.target.value = "";
    if (nextFile) void uploadFile(nextFile);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) void uploadFile(nextFile);
  };

  const runCompression = async () => {
    if (!file || !dimensions) {
      setError("Upload an image before compressing.");
      return;
    }
    setIsProcessing(true);
    setError("");
    setNotice("");
    setProgress("Compressing image...");

    try {
      const target = compression.preserveDimensions
        ? dimensions
        : {
            width: compression.width || targetCompressionDimensions.width,
            height: compression.height || targetCompressionDimensions.height,
          };
      const safeTarget = {
        width: clamp(Math.round(target.width), 1, dimensions.width),
        height: clamp(Math.round(target.height), 1, dimensions.height),
      };
      const blob = await compressImage(file, {
        width: safeTarget.width,
        height: safeTarget.height,
        outputFormat: compression.outputFormat,
        quality: compression.quality,
      });
      setCompressedResult(resultFromBlob(blob, file.name, "compressed", compression.outputFormat, safeTarget));
      setDownloadedCompress(false);
      setProgress("");
      setNotice("Compressed image generated.");
    } catch (compressionError) {
      setProgress("");
      setError(compressionError instanceof Error ? compressionError.message : "Compression failed. Try a smaller image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const runBackgroundRemoval = async () => {
    if (!file || !dimensions) {
      setError("Upload an image before removing the background.");
      return;
    }
    setIsProcessing(true);
    setError("");
    setNotice("");
    setProgress(background.mode === "ai" ? "Loading local AI model..." : "Building background mask...");

    try {
      const blob =
        background.mode === "ai"
          ? await removeBackgroundWithOptionalAi(file)
          : await removePlainBackground(file, {
              selectedColor: background.selectedColor,
              tolerance: background.tolerance,
              softness: background.softness,
              scope: background.scope,
              smoothEdges: background.smoothEdges,
              reduceHalo: background.reduceHalo,
              replacementMode: background.replacementMode,
              replacementColor: background.replacementColor,
              backgroundFile: background.replacementMode === "image" ? backgroundImage : null,
              outputFormat: background.outputFormat,
              quality: background.quality,
            });
      const effectiveFormat: OutputFormat = background.mode === "ai" || (background.replacementMode === "transparent" && background.outputFormat === "image/jpeg") ? "image/png" : background.outputFormat;
      setBackgroundResult(resultFromBlob(blob, file.name, background.replacementMode === "transparent" ? "background-removed" : "background-replaced", effectiveFormat, dimensions));
      setDownloadedBackground(false);
      setProgress("");
      setNotice(background.mode === "ai" ? "AI background removal finished." : "Background removal finished.");
    } catch {
      setProgress("");
      setError(
        background.mode === "ai"
          ? "The local AI model package is not available in this build. Use Plain Background Removal for now, or install the model dependency later."
          : "Background removal failed. Try a lower tolerance or a smaller image.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCurrentTool = () => {
    if (activeTab === "compress") {
      setCompression((current) => ({ ...defaultCompression, outputFormat: current.outputFormat }));
      setCompressedResult(null);
      setDownloadedCompress(false);
      return;
    }
    setBackground(defaultBackground);
    setBackgroundResult(null);
    setBackgroundImage(null);
    setBackgroundImageName("");
    setDownloadedBackground(false);
  };

  const clearImage = () => {
    if (hasUndownloadedResult && !window.confirm("Clear the image and discard the processed result?")) return;
    setFile(null);
    setOriginalUrl("");
    setDimensions(null);
    setCompressedResult(null);
    setBackgroundResult(null);
    setBackgroundImage(null);
    setBackgroundImageName("");
    setError("");
    setNotice("");
    setProgress("");
  };

  const transferBackgroundToCompressor = async () => {
    if (!backgroundResult) return;
    const nextFile = new File([backgroundResult.blob], backgroundResult.filename, { type: backgroundResult.blob.type || "image/png" });
    setActiveTab("compress");
    await uploadFile(nextFile, { skipConfirm: true, sourceTab: "background" });
    setCompression((current) => ({ ...current, outputFormat: backgroundResult.type === "image/jpeg" ? "image/jpeg" : "image/png" }));
    setNotice("Transparent result sent to the compressor.");
  };

  const transferCompressedToBackground = async () => {
    setActiveTab("background");
    if (!compressedResult) return;
    const nextFile = new File([compressedResult.blob], compressedResult.filename, { type: compressedResult.blob.type || compressedResult.type });
    await uploadFile(nextFile, { skipConfirm: true, sourceTab: "compress" });
    setNotice("Compressed image sent to the background remover.");
  };

  const pickBackgroundColor = async (event: MouseEvent<HTMLImageElement>) => {
    if (!file || !dimensions) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * dimensions.width;
    const y = ((event.clientY - rect.top) / rect.height) * dimensions.height;
    try {
      const color = await getPixelColor(file, { x, y });
      setColorHistory((history) => [background.selectedColor, ...history].slice(0, 5));
      setBackground((current) => ({ ...current, selectedColor: color }));
      setNotice(`Selected background colour ${color}.`);
    } catch {
      setError("Could not sample that colour. Try choosing it manually.");
    }
  };

  const onBackgroundImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    event.target.value = "";
    if (!nextFile) return;
    const validation = validateImageFile(nextFile);
    if (validation) {
      setError(validation);
      return;
    }
    setBackgroundImage(nextFile);
    setBackgroundImageName(nextFile.name);
    setBackground((current) => ({ ...current, replacementMode: "image", outputFormat: "image/jpeg" }));
  };

  return (
    <>
      <section className="image-tools-no-print px-6 pb-8 pt-8 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-bold text-[#589037]">Free Tool</p>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">{title}</h1>
              <p className="mt-7 max-w-3xl text-base leading-8 text-neutral-500 dark:text-neutral-300">{description}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/10 bg-[#f7f7f4] p-5 text-sm leading-7 text-neutral-600 dark:border-white/10 dark:bg-white/10 dark:text-neutral-300">
              <p className="font-bold text-black dark:text-white">Privacy notice</p>
              <p className="mt-2">Your images are processed in your browser and are not uploaded to Anulen&apos;s servers.</p>
            </div>
          </div>
        </div>
      </section>

      <AdSenseAd slot={ADSENSE_SLOTS.top} />

      <section className="px-3 pb-16 dark:bg-black">
        <div className="mx-auto max-w-7xl">
          {showTabs && (
            <div className="image-tools-no-print mb-5 flex flex-wrap gap-3" role="tablist" aria-label="Image tools">
              <TabButton active={activeTab === "compress"} onClick={() => setActiveTab("compress")}>
                Compress Image
              </TabButton>
              <TabButton active={activeTab === "background"} onClick={() => setActiveTab("background")}>
                Remove Background
              </TabButton>
            </div>
          )}

          {(error || notice || progress) && (
            <div className="image-tools-no-print mb-5 grid gap-3" aria-live="polite">
              {error && <StatusMessage tone="error">{error}</StatusMessage>}
              {notice && <StatusMessage tone="success">{notice}</StatusMessage>}
              {progress && <StatusMessage tone="neutral">{progress}</StatusMessage>}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="image-tools-no-print grid gap-5 rounded-[2rem] bg-white p-4 shadow-sm dark:bg-black md:p-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={onDrop}
                className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-black/25 bg-[#f7f7f4] p-6 text-center transition hover:border-[#589037] dark:border-white/20 dark:bg-white/10"
              >
                <Upload size={30} className="text-[#589037]" />
                <span className="mt-4 text-lg font-black tracking-[-0.03em]">Upload an image</span>
                <span className="mt-2 max-w-md text-sm leading-6 text-neutral-500 dark:text-neutral-300">PNG, JPG, JPEG, or WebP up to {formatBytes(MAX_IMAGE_BYTES)}. Drag and drop works here too.</span>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onFileChange} />
              </label>

              {originalStats && (
                <Panel title="Image details">
                  <div className="grid gap-3">
                    {originalStats.map((item) => (
                      <StatRow key={item.label} label={item.label} value={item.value} />
                    ))}
                  </div>
                </Panel>
              )}

              {activeTab === "compress" ? (
                <CompressionControls
                  settings={compression}
                  dimensions={dimensions}
                  isProcessing={isProcessing}
                  onChange={setCompression}
                  onCompress={runCompression}
                  onReset={resetCurrentTool}
                  onClear={clearImage}
                />
              ) : (
                <BackgroundControls
                  settings={background}
                  backgroundImageName={backgroundImageName}
                  isProcessing={isProcessing}
                  colorHistory={colorHistory}
                  onChange={setBackground}
                  onUndoColor={() => {
                    const [previous, ...rest] = colorHistory;
                    if (!previous) return;
                    setBackground((current) => ({ ...current, selectedColor: previous }));
                    setColorHistory(rest);
                  }}
                  onPickBackgroundImage={() => backgroundInputRef.current?.click()}
                  onRemoveBackground={runBackgroundRemoval}
                  onReset={resetCurrentTool}
                  onClear={clearImage}
                />
              )}

              <input ref={backgroundInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onBackgroundImageChange} />
            </div>

            <div className="image-tools-preview-scroll lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
              <div className="rounded-[2rem] bg-[#f7f7f4] p-4 dark:bg-white/10 md:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#589037]">{activeTab === "compress" ? "Compression preview" : "Background preview"}</p>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">Preview and download</h2>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 px-4 py-3 text-sm font-bold dark:border-white/20">
                    <Upload size={16} />
                    Upload another
                  </button>
                </div>

                {!file || !originalUrl ? (
                  <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-black/15 bg-white text-center dark:border-white/15 dark:bg-black">
                    <ImageIcon size={40} className="text-[#589037]" />
                    <p className="mt-4 text-lg font-black">No image selected</p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500 dark:text-neutral-300">Choose an image to preview the original and processed result.</p>
                  </div>
                ) : activeTab === "compress" ? (
                  <PreviewArea
                    originalUrl={originalUrl}
                    originalAlt={`Original ${file.name}`}
                    processedUrl={compressedResult?.url}
                    processedAlt={compressedResult ? `Compressed ${file.name}` : "Compressed image preview"}
                    checkerboard={false}
                    onOriginalClick={undefined}
                  >
                    {compressedStats && (
                      <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-white p-5 dark:bg-black">
                        {compressedStats.map((item) => (
                          <StatRow key={item.label} label={item.label} value={item.value} />
                        ))}
                      </div>
                    )}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        disabled={!compressedResult}
                        onClick={() => {
                          if (!compressedResult) return;
                          downloadBlob(compressedResult.blob, compressedResult.filename);
                          setDownloadedCompress(true);
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-black px-5 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
                      >
                        <Download size={18} />
                        Download Compressed Image
                      </button>
                      {showTabs && (
                        <button onClick={transferCompressedToBackground} className="inline-flex flex-1 items-center justify-center gap-3 rounded-full border border-black/15 px-5 py-4 text-sm font-bold dark:border-white/20">
                          <Send size={18} />
                          Remove Background From This Image
                        </button>
                      )}
                    </div>
                  </PreviewArea>
                ) : (
                  <PreviewArea
                    originalUrl={originalUrl}
                    originalAlt={`Original ${file.name}`}
                    processedUrl={backgroundResult?.url}
                    processedAlt={backgroundResult ? `Background removed from ${file.name}` : "Background removed preview"}
                    checkerboard
                    onOriginalClick={pickBackgroundColor}
                  >
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        disabled={!backgroundResult}
                        onClick={() => {
                          if (!backgroundResult) return;
                          downloadBlob(backgroundResult.blob, backgroundResult.filename);
                          setDownloadedBackground(true);
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-black px-5 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
                      >
                        <Download size={18} />
                        Download Transparent PNG
                      </button>
                      {showTabs && (
                        <button disabled={!backgroundResult} onClick={transferBackgroundToCompressor} className="inline-flex flex-1 items-center justify-center gap-3 rounded-full border border-black/15 px-5 py-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20">
                          <Send size={18} />
                          Compress This Result
                        </button>
                      )}
                    </div>
                  </PreviewArea>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdSenseAd slot={ADSENSE_SLOTS.middle} />
    </>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full border px-5 py-3 text-sm font-bold transition ${
        active ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-black/15 bg-white text-black hover:border-[#589037] dark:border-white/20 dark:bg-black dark:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StatusMessage({ tone, children }: { tone: "error" | "success" | "neutral"; children: React.ReactNode }) {
  const icon = tone === "neutral" ? <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin text-[#589037]" /> : tone === "error" ? <X size={18} className="mt-0.5 shrink-0 text-red-600" /> : <Check size={18} className="mt-0.5 shrink-0 text-[#589037]" />;
  return (
    <div className="flex max-w-3xl items-start gap-3 rounded-2xl border border-black/10 bg-[#f7f7f4] p-4 text-sm dark:border-white/10 dark:bg-white/10" role={tone === "error" ? "alert" : "status"}>
      {icon}
      <p>{children}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-black/10 bg-[#f7f7f4] p-5 dark:border-white/10 dark:bg-white/10">
      <h3 className="mb-4 text-xl font-black tracking-[-0.03em]">{title}</h3>
      {children}
    </section>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-3 last:border-0 last:pb-0 dark:border-white/10">
      <span className="text-sm text-neutral-500 dark:text-neutral-300">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-bold">{value}</span>
    </div>
  );
}

function CompressionControls({
  settings,
  dimensions,
  isProcessing,
  onChange,
  onCompress,
  onReset,
  onClear,
}: {
  settings: CompressionSettings;
  dimensions: ImageDimensions | null;
  isProcessing: boolean;
  onChange: (settings: CompressionSettings) => void;
  onCompress: () => void;
  onReset: () => void;
  onClear: () => void;
}) {
  const aspectRatio = dimensions ? dimensions.width / dimensions.height : 1;
  const update = <K extends keyof CompressionSettings>(key: K, value: CompressionSettings[K]) => onChange({ ...settings, [key]: value });
  const updateWidth = (value: number) => {
    const width = clamp(Math.round(value), 1, dimensions?.width || 9000);
    onChange({ ...settings, preserveDimensions: false, width, height: settings.lockAspectRatio ? Math.max(1, Math.round(width / aspectRatio)) : settings.height });
  };
  const updateHeight = (value: number) => {
    const height = clamp(Math.round(value), 1, dimensions?.height || 9000);
    onChange({ ...settings, preserveDimensions: false, height, width: settings.lockAspectRatio ? Math.max(1, Math.round(height * aspectRatio)) : settings.width });
  };

  return (
    <>
      <Panel title="Compression settings">
        <div className="grid gap-4">
          <RangeField id="quality" label="Quality" min={20} max={100} value={Math.round(settings.quality * 100)} suffix="%" onChange={(value) => update("quality", value / 100)} />
          <RangeField
            id="resizePercent"
            label="Resize percentage"
            min={10}
            max={100}
            value={settings.resizePercent}
            suffix="%"
            onChange={(value) =>
              onChange({
                ...settings,
                preserveDimensions: false,
                resizePercent: value,
                width: dimensions ? Math.max(1, Math.round(dimensions.width * (value / 100))) : settings.width,
                height: dimensions ? Math.max(1, Math.round(dimensions.height * (value / 100))) : settings.height,
              })
            }
          />

          <CheckboxField id="preserveDimensions" label="Preserve original dimensions" checked={settings.preserveDimensions} onChange={(checked) => update("preserveDimensions", checked)} />
          <CheckboxField id="lockAspectRatio" label="Lock aspect ratio" checked={settings.lockAspectRatio} onChange={(checked) => update("lockAspectRatio", checked)} />
          <CheckboxField id="removeMetadata" label="Remove metadata" checked={settings.removeMetadata} onChange={(checked) => update("removeMetadata", checked)} />

          <div className="grid gap-4 md:grid-cols-2">
            <NumberField id="compressWidth" label="Custom width" value={settings.width} disabled={settings.preserveDimensions} onChange={updateWidth} />
            <NumberField id="compressHeight" label="Custom height" value={settings.height} disabled={settings.preserveDimensions} onChange={updateHeight} />
          </div>

          <SelectField id="compressFormat" label="Output format" value={settings.outputFormat} onChange={(value) => update("outputFormat", value as OutputFormat)} options={outputFormats} />
          <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-300">PNG and WebP can preserve transparency. JPG uses a white background when transparency is present.</p>
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-3">
        <ActionButton disabled={isProcessing} onClick={onCompress} primary>
          <SlidersHorizontal size={18} />
          Compress Image
        </ActionButton>
        <ActionButton disabled={isProcessing} onClick={onReset}>
          <RotateCcw size={18} />
          Reset Current Tool
        </ActionButton>
        <ActionButton disabled={isProcessing} onClick={onClear}>
          <X size={18} />
          Clear Image
        </ActionButton>
      </div>
    </>
  );
}

function BackgroundControls({
  settings,
  backgroundImageName,
  isProcessing,
  colorHistory,
  onChange,
  onUndoColor,
  onPickBackgroundImage,
  onRemoveBackground,
  onReset,
  onClear,
}: {
  settings: BackgroundSettings;
  backgroundImageName: string;
  isProcessing: boolean;
  colorHistory: string[];
  onChange: (settings: BackgroundSettings) => void;
  onUndoColor: () => void;
  onPickBackgroundImage: () => void;
  onRemoveBackground: () => void;
  onReset: () => void;
  onClear: () => void;
}) {
  const update = <K extends keyof BackgroundSettings>(key: K, value: BackgroundSettings[K]) => onChange({ ...settings, [key]: value });
  const transparentOutput = settings.replacementMode === "transparent";

  return (
    <>
      <Panel title="Background removal">
        <div className="grid gap-4">
          <div>
            <label htmlFor="removalMode" className="mb-2 block text-sm font-bold">
              Removal mode
            </label>
            <select id="removalMode" value={settings.mode} onChange={(event) => update("mode", event.target.value as BackgroundSettings["mode"])} className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#589037] dark:border-white/15 dark:bg-black">
              <option value="plain">Plain Background Removal</option>
              <option value="ai">AI Background Removal</option>
            </select>
          </div>

          {settings.mode === "ai" ? (
            <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-neutral-500 dark:border-white/10 dark:bg-black dark:text-neutral-300">
              The AI remover is lazy-loaded only when used. If the local model package is unavailable, the tool will show a clear fallback message and keep your image in the browser.
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <label htmlFor="backgroundColor" className="mb-2 block text-sm font-bold">
                    Background colour
                  </label>
                  <div className="flex gap-3">
                    <input id="backgroundColor" type="color" value={settings.selectedColor} onChange={(event) => update("selectedColor", event.target.value)} className="h-12 w-16 rounded-xl border border-black/10 bg-white p-1 dark:border-white/20 dark:bg-black" />
                    <input value={settings.selectedColor} onChange={(event) => update("selectedColor", event.target.value)} className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#589037] dark:border-white/15 dark:bg-black" />
                  </div>
                </div>
                <button type="button" disabled={!colorHistory.length} onClick={onUndoColor} className="rounded-full border border-black/15 px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20">
                  Undo colour
                </button>
              </div>

              <SelectField
                id="backgroundScope"
                label="Removal scope"
                value={settings.scope}
                onChange={(value) => update("scope", value as PlainRemovalScope)}
                options={[
                  { value: "connected", label: "Connected background only" },
                  { value: "global", label: "Matching colour globally" },
                ]}
              />
              <RangeField id="tolerance" label="Colour tolerance" min={1} max={120} value={settings.tolerance} onChange={(value) => update("tolerance", value)} />
              <RangeField id="softness" label="Edge softness" min={0} max={80} value={settings.softness} onChange={(value) => update("softness", value)} />
              <CheckboxField id="smoothEdges" label="Smooth edges" checked={settings.smoothEdges} onChange={(checked) => update("smoothEdges", checked)} />
              <CheckboxField id="reduceHalo" label="Reduce edge halo" checked={settings.reduceHalo} onChange={(checked) => update("reduceHalo", checked)} />
            </>
          )}
        </div>
      </Panel>

      <Panel title="Background replacement">
        <div className="grid gap-4">
          <SelectField id="replacementMode" label="Replacement" value={settings.replacementMode} onChange={(value) => update("replacementMode", value as ReplacementMode)} options={replacementModes} />
          {settings.replacementMode === "custom" && (
            <div>
              <label htmlFor="replacementColor" className="mb-2 block text-sm font-bold">
                Replacement colour
              </label>
              <input id="replacementColor" type="color" value={settings.replacementColor} onChange={(event) => update("replacementColor", event.target.value)} className="h-12 w-20 rounded-xl border border-black/10 bg-white p-1 dark:border-white/20 dark:bg-black" />
            </div>
          )}
          {settings.replacementMode === "image" && (
            <button type="button" onClick={onPickBackgroundImage} className="inline-flex items-center justify-center gap-3 rounded-full border border-black/15 px-5 py-3 text-sm font-bold dark:border-white/20">
              <Upload size={17} />
              {backgroundImageName || "Upload background image"}
            </button>
          )}
          <SelectField id="backgroundFormat" label="Download format" value={transparentOutput ? "image/png" : settings.outputFormat} disabled={transparentOutput} onChange={(value) => update("outputFormat", value as OutputFormat)} options={outputFormats} />
          {!transparentOutput && <RangeField id="backgroundQuality" label="Export quality" min={20} max={100} value={Math.round(settings.quality * 100)} suffix="%" onChange={(value) => update("quality", value / 100)} />}
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-3">
        <ActionButton disabled={isProcessing} onClick={onRemoveBackground} primary>
          <SlidersHorizontal size={18} />
          Remove Background
        </ActionButton>
        <ActionButton disabled={isProcessing} onClick={onReset}>
          <RotateCcw size={18} />
          Reset Current Tool
        </ActionButton>
        <ActionButton disabled={isProcessing} onClick={onClear}>
          <X size={18} />
          Clear Image
        </ActionButton>
      </div>
    </>
  );
}

function PreviewArea({
  originalUrl,
  originalAlt,
  processedUrl,
  processedAlt,
  checkerboard,
  onOriginalClick,
  children,
}: {
  originalUrl: string;
  originalAlt: string;
  processedUrl?: string;
  processedAlt: string;
  checkerboard: boolean;
  onOriginalClick?: (event: MouseEvent<HTMLImageElement>) => void;
  children: React.ReactNode;
}) {
  const [zoom, setZoom] = useState(100);
  const imageClass = "max-h-[520px] w-full object-contain";
  const previewStyle = checkerboard
    ? {
        backgroundImage: "linear-gradient(45deg, #d4d4d4 25%, transparent 25%), linear-gradient(-45deg, #d4d4d4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d4 75%), linear-gradient(-45deg, transparent 75%, #d4d4d4 75%)",
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
      }
    : undefined;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <RangeField id="previewZoom" label="Preview zoom" min={50} max={180} value={zoom} suffix="%" onChange={setZoom} compact />
        <button type="button" onClick={() => setZoom(100)} className="rounded-full border border-black/15 px-4 py-2 text-sm font-bold dark:border-white/20">
          Fit image
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <figure className="rounded-[1.5rem] bg-white p-3 dark:bg-black">
          <figcaption className="mb-3 text-sm font-bold">Original</figcaption>
          <div className="flex min-h-[280px] items-center justify-center overflow-auto rounded-[1.25rem] bg-[#f7f7f4] p-3 dark:bg-white/10">
            <img src={originalUrl} alt={originalAlt} onClick={onOriginalClick} className={`${imageClass} ${onOriginalClick ? "cursor-crosshair" : ""}`} style={{ maxWidth: `${zoom}%` }} />
          </div>
        </figure>
        <figure className="rounded-[1.5rem] bg-white p-3 dark:bg-black">
          <figcaption className="mb-3 text-sm font-bold">Processed</figcaption>
          <div className="flex min-h-[280px] items-center justify-center overflow-auto rounded-[1.25rem] p-3" style={previewStyle}>
            {processedUrl ? <img src={processedUrl} alt={processedAlt} className={imageClass} style={{ maxWidth: `${zoom}%` }} /> : <p className="px-6 text-center text-sm leading-6 text-neutral-500 dark:text-neutral-300">Run the selected tool to generate this preview.</p>}
          </div>
        </figure>
      </div>
      {children}
    </div>
  );
}

function ActionButton({ children, disabled, onClick, primary }: { children: React.ReactNode; disabled?: boolean; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        primary ? "bg-black text-white hover:bg-[#589037] dark:bg-white dark:text-black dark:hover:bg-[#589037] dark:hover:text-white" : "border border-black/15 text-black hover:border-[#589037] dark:border-white/20 dark:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function RangeField({ id, label, value, min, max, suffix = "", compact, onChange }: { id: string; label: string; value: number; min: number; max: number; suffix?: string; compact?: boolean; onChange: (value: number) => void }) {
  return (
    <div className={compact ? "min-w-[220px] flex-1" : ""}>
      <label htmlFor={id} className="mb-2 flex items-center justify-between gap-3 text-sm font-bold">
        <span>{label}</span>
        <span>{value}{suffix}</span>
      </label>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[#589037]" />
    </div>
  );
}

function NumberField({ id, label, value, disabled, onChange }: { id: string; label: string; value: number; disabled?: boolean; onChange: (value: number) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold">
        {label}
      </label>
      <input id={id} type="number" min="1" value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#589037] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-black" />
    </div>
  );
}

function CheckboxField({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 text-sm font-bold">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-[#589037]" />
      {label}
    </label>
  );
}

function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold">
        {label}
      </label>
      <select id={id} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value as T)} className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#589037] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-black">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
